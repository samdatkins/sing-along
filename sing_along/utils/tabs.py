import json
import time
from enum import Enum

import requests
from backoff import expo, on_exception
from bs4 import BeautifulSoup
from django.conf import settings

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
}


class TabType(Enum):
    CHORDS = "Chords"
    OFFICIAL = "Official"


class ServerNotAvailable(Exception):
    pass


@on_exception(expo, requests.exceptions.RequestException, max_tries=30)
def retry_request(url, headers=None, params=None):
    print(f"Making web request to {url}")
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response


class TabJSReader:
    @staticmethod
    def _load_js_store(response):
        if response.status_code == 404:
            return None
        elif response.status_code != 200:
            raise ServerNotAvailable(
                f"Server responded with status code {response.status_code}"
            )

        soup = BeautifulSoup(response.content, "html.parser")
        js_store = soup.find_all("div", {"class": "js-store"})

        return json.loads(js_store[0]["data-content"])


class TabIndexReader(TabJSReader):
    @staticmethod
    def _build_results_dict(results):
        return {
            "artist": results["artist_name"],
            "title": results["song_name"],
            "url": results["tab_url"],
            "rating": float(results["rating"]),
            "votes": int(results["votes"]),
            "type": results["type"],
        }


class TabSearcher(TabIndexReader):
    def __init__(self, search_url: str, filter_types: TabType):
        self.search_url = search_url
        self.filter_types = [filter_type.value.lower() for filter_type in filter_types]

    @staticmethod
    def _calculate_weighted_rating(result, max_votes):
        return (result["votes"] / max(max_votes, 1)) * result["rating"]

    def _get_search_results(self, query):
        payload = {"search_type": "title", "value": query}
        return requests.get(
            self.search_url,
            headers=HEADERS,
            params=payload,
        )

    def _get_parsed_search_results(self, search_results):
        data = self._load_js_store(search_results)
        if data is None:
            return None
        results = data["store"]["page"]["data"]["results"]
        return [
            self._build_results_dict(result)
            for result in results
            if "marketing_type" not in result
            and result["type"].lower() in self.filter_types
        ]

    def get_best_tab_entry(self, query: str):
        search_results = self._get_search_results(query)
        parsed_search_results = self._get_parsed_search_results(search_results)
        if parsed_search_results is None or len(parsed_search_results) == 0:
            return None

        max_votes = max(tab["votes"] for tab in parsed_search_results)
        return max(
            parsed_search_results,
            key=lambda tab: self._calculate_weighted_rating(tab, max_votes),
        )


class TabIndexer(TabIndexReader):
    def __init__(self, filter_types: TabType):
        self.filter_types = [filter_type.value.lower() for filter_type in filter_types]

    def _get_song_list_results(self, artist_url, page_num):

        return retry_request(
            settings.TAB_ARTIST_SONGS_INDEX.replace("{artist_url}", artist_url).replace(
                "{page_num}", str(page_num)
            ),
            HEADERS,
        )

    def _get_band_results(self, band_index, page_num):
        return retry_request(
            settings.TAB_BAND_INDEX.replace("{band_index}", band_index).replace(
                "{page_num}", str(page_num)
            ),
            HEADERS,
        )

    def _get_parsed_band_list_results(self, search_results):
        data = self._load_js_store(search_results)
        if data is None:
            return None
        results = data["store"]["page"]["data"]["artists"]
        return [
            {
                "name": result["name"],
                "artist_url": result["artist_url"],
                "id": result["id"],
            }
            for result in results
        ]

    def _get_parsed_count_for_band_series(self, search_results) -> int:
        data = self._load_js_store(search_results)
        if data is None:
            return None
        return data["store"]["page"]["data"]["page_count"]

    def get_count_for_band_series(self, band_index: str) -> int:
        list_results = self._get_band_results(band_index, 1)
        return self._get_parsed_count_for_band_series(list_results)

    def get_one_page_of_band_results(self, band_index: str, page_num: int):
        list_results = self._get_band_results(band_index, page_num)
        parsed_list_results = self._get_parsed_band_list_results(list_results)

        if parsed_list_results is None or len(parsed_list_results) == 0:
            return None

        return parsed_list_results

    def _get_parsed_song_list_results(self, search_results):
        data = self._load_js_store(search_results)
        if data is None:
            return None
        results = data["store"]["page"]["data"]["album_tabs"]
        results.extend(data["store"]["page"]["data"]["other_tabs"])
        return [
            self._build_results_dict(result)
            for result in results
            if "marketing_type" not in result
            and result["type"].lower() in self.filter_types
        ]

    def _is_another_page_available(self, search_results):
        data = self._load_js_store(search_results)
        if data is None:
            return None
        pages = data["store"]["page"]["data"]["pagination"]["pages"]
        cur_page = data["store"]["page"]["data"]["current_page"]
        if len(pages) == 0:
            return False
        return cur_page < pages[-1]["page"]

    def get_one_page_of_song_results(self, artist_url: str, page_num: int):
        song_results = self._get_song_list_results(artist_url, page_num)
        parsed_results = self._get_parsed_song_list_results(song_results)
        can_continue = self._is_another_page_available(song_results)
        if parsed_results is None or len(parsed_results) == 0:
            return can_continue, None

        return can_continue, parsed_results


class TabScraper(TabJSReader):
    @staticmethod
    def _build_single_tab_dict(results):
        tab_dict = {
            "artist": results["tab"]["artist_name"],
            "title": results["tab"]["song_name"],
            "url": results["tab"]["tab_url"],
            "rating": results["tab"]["rating"],
            "votes": results["tab"]["votes"],
            "type": results["tab"]["type"],
            "difficulty": results["tab"].get("difficulty", None),
            "content": results["tab_view"]["wiki_tab"]["content"],
        }
        if "meta" in results["tab_view"] and type(results["tab_view"]["meta"]) is dict:
            tab_dict.update(
                {
                    "capo": results["tab_view"]["meta"].get("capo", None),
                    "key": results["tab_view"]["meta"].get("tonality", None),
                    "tuning": results["tab_view"]["meta"]
                    .get("tuning", {})
                    .get("value", None),
                }
            )

        return tab_dict

    def load_tab_from_url(self, tab_url):
        response = requests.get(
            tab_url,
            headers=HEADERS,
        )
        data = self._load_js_store(response)
        if data is None:
            return None

        results = data["store"]["page"]["data"]

        return self._build_single_tab_dict(results)


class TabFetcher:
    def __init__(self, search_url: str, filter_types: list[TabType]):

        self.search_url = search_url
        self.filter_types = filter_types

    def search_for_best_tab(self, query: str):
        tab_searcher = TabSearcher(self.search_url, self.filter_types)
        tab_scraper = TabScraper()

        best_tab_entry = tab_searcher.get_best_tab_entry(query)
        if best_tab_entry is None:
            return None

        return tab_scraper.load_tab_from_url(best_tab_entry["url"])
