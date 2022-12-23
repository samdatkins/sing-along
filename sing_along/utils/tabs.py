import json
from enum import Enum

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
}


class TabType(Enum):
    CHORDS = "Chords"


class ServerNotAvailable(Exception):
    pass


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


class TabSearcher:
    def __init__(self, search_url, filter_type):
        self.search_url = search_url
        self.filter_type = filter_type

    @staticmethod
    def _calculate_weighted_rating(result, max_votes):
        return (result["votes"] / max(max_votes, 1)) * result["rating"]

    @staticmethod
    def _build_search_results_dict(results):
        return {
            "artist": results["artist_name"],
            "title": results["song_name"],
            "url": results["tab_url"],
            "rating": float(results["rating"]),
            "votes": int(results["votes"]),
            "type": results["type"],
        }

    def _get_parsed_search_results(self, query):
        payload = {"search_type": "title", "value": query}
        response = requests.get(
            self.search_url,
            headers=HEADERS,
            params=payload,
        )

        data = _load_js_store(response)
        if data is None:
            return None
        results = data["store"]["page"]["data"]["results"]
        return [
            self._build_search_results_dict(result)
            for result in results
            if "marketing_type" not in result
            and result["type"].lower() == self.filter_type.value.lower()
        ]

    def get_best_tab_entry(self, query: str):
        parsed_search_results = self._get_parsed_search_results(query)
        if parsed_search_results is None or len(parsed_search_results) == 0:
            return None

        max_votes = max(tab["votes"] for tab in parsed_search_results)
        return max(
            parsed_search_results,
            key=lambda tab: self._calculate_weighted_rating(tab, max_votes),
        )


class TabScraper:
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
        data = _load_js_store(response)
        if data is None:
            return None

        results = data["store"]["page"]["data"]

        return self._build_single_tab_dict(results)


class TabFetcher:
    def __init__(self, search_url: str, filter_type: TabType):
        if filter_type != TabType.CHORDS:
            raise NotImplementedError

        self.search_url = search_url
        self.filter_type = filter_type

    def search_for_best_tab(self, query: str):
        tab_searcher = TabSearcher(self.search_url, self.filter_type)
        tab_scraper = TabScraper()

        best_tab_entry = tab_searcher.get_best_tab_entry(query)
        if best_tab_entry is None:
            return None

        return tab_scraper.load_tab_from_url(best_tab_entry["url"])
