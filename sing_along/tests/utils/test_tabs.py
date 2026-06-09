import json
from unittest.mock import Mock, PropertyMock, patch

from django.test import TestCase

from sing_along.utils.tabs import ServerNotAvailable, TabScraper, TabSearcher, TabType


class TestTabSearcher(TestCase):
    @patch("sing_along.utils.tabs.requests")
    def test_tab_searcher_respects_404(self, mock_requests):
        # Arrange
        status_code_mock = PropertyMock(return_value=404)
        type(mock_requests.get.return_value).status_code = status_code_mock
        tab_searcher = TabSearcher("http://fake.com", [TabType.CHORDS])

        # Act
        tab = tab_searcher.get_best_tab_entry("my song")

        # Assert
        self.assertEqual(tab, None)

    def test_best_tab_is_chosen(self):
        # Arrange
        ts = TabSearcher("http://fake.com", [TabType.CHORDS])
        ts._get_parsed_search_results = Mock(
            return_value=[
                {"votes": 10, "rating": 5},
                {"votes": 100, "rating": 4.5},
            ]
        )
        ts._get_search_results = Mock()

        # Act
        fake_tab = ts.get_best_tab_entry("my song")

        # Assert
        self.assertEqual(fake_tab["rating"], 4.5)  # type: ignore


class TestTabScraper(TestCase):
    @patch("sing_along.utils.tabs.requests")
    def test_tab_scraper_raises_on_403(self, mock_requests):
        # Arrange
        status_code_mock = PropertyMock(return_value=403)
        type(mock_requests.get.return_value).status_code = status_code_mock
        tab_scraper = TabScraper()

        # Act & Assert
        with self.assertRaises(ServerNotAvailable):
            tab_scraper.load_tab_from_url("http://fake.com/tab/123")

    @patch("sing_along.utils.tabs.requests")
    def test_tab_scraper_returns_none_on_404(self, mock_requests):
        # Arrange
        status_code_mock = PropertyMock(return_value=404)
        type(mock_requests.get.return_value).status_code = status_code_mock
        tab_scraper = TabScraper()

        # Act
        tab = tab_scraper.load_tab_from_url("http://fake.com/tab/123")

        # Assert
        self.assertIsNone(tab)

    def test_load_tab_from_html_parses_content(self):
        js_data = {
            "store": {
                "page": {
                    "data": {
                        "tab": {
                            "artist_name": "Test Artist",
                            "song_name": "Test Song",
                            "tab_url": "http://example.com/tab/1",
                            "rating": 4.5,
                            "votes": 100,
                            "type": "Chords",
                            "difficulty": "intermediate",
                        },
                        "tab_view": {
                            "wiki_tab": {
                                "content": "[ch]Am[/ch] Hello [ch]G[/ch] World",
                            },
                            "meta": {
                                "capo": 2,
                                "tonality": "Am",
                                "tuning": {"value": "Standard"},
                            },
                        },
                    }
                }
            }
        }
        encoded = json.dumps(js_data).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
        html = f'<html><body><div class="js-store" data-content="{encoded}"></div></body></html>'

        tab_scraper = TabScraper()
        tab = tab_scraper.load_tab_from_html(html)

        self.assertEqual(tab["content"], "[ch]Am[/ch] Hello [ch]G[/ch] World")
        self.assertEqual(tab["artist"], "Test Artist")
        self.assertEqual(tab["title"], "Test Song")
        self.assertEqual(tab["url"], "http://example.com/tab/1")
        self.assertEqual(tab["capo"], 2)
        self.assertEqual(tab["key"], "Am")
        self.assertEqual(tab["tuning"], "Standard")

    def test_load_tab_from_html_raises_on_missing_js_store(self):
        html = "<html><body><div>No tab here</div></body></html>"
        tab_scraper = TabScraper()

        with self.assertRaises(ServerNotAvailable):
            tab_scraper.load_tab_from_html(html)
