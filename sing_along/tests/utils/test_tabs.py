import html
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

    def test_load_tab_from_html_with_entity_encoded_json(self):
        """Simulates real UG page source where data-content is HTML-entity-encoded."""
        js_data = {
            "store": {
                "page": {
                    "data": {
                        "tab": {
                            "artist_name": "Smashing Pumpkins",
                            "song_name": "Today",
                            "tab_url": "http://tabs.example.com/tab/today?ver=2&type=chords",
                            "rating": 4.8,
                            "votes": 500,
                            "type": "Chords",
                            "difficulty": "novice",
                        },
                        "tab_view": {
                            "wiki_tab": {
                                "content": "[ch]E[/ch] [ch]B[/ch]\nToday is the greatest\n[ch]A[/ch]\nDay I've ever known",
                            },
                            "meta": {
                                "capo": 0,
                                "tonality": "E",
                                "tuning": {"value": "E A D G B E"},
                            },
                        },
                    }
                }
            }
        }
        # Simulate how it appears in raw page source: JSON is HTML-entity-encoded
        raw_json = json.dumps(js_data)
        entity_encoded = html.escape(raw_json, quote=True)
        page_html = (
            '<!DOCTYPE html><html><head><title>Test</title></head><body>'
            f'<div class="js-store" data-content="{entity_encoded}"></div>'
            '</body></html>'
        )

        tab_scraper = TabScraper()
        tab = tab_scraper.load_tab_from_html(page_html)

        self.assertEqual(tab["artist"], "Smashing Pumpkins")
        self.assertEqual(tab["title"], "Today")
        self.assertIn("&type=chords", tab["url"])
        self.assertIn("[ch]E[/ch]", tab["content"])
        self.assertIn("Day I've ever known", tab["content"])

    def test_load_tab_from_html_with_ampersands_in_content(self):
        """Verifies JSON with & characters in values survives entity encoding/decoding."""
        js_data = {
            "store": {
                "page": {
                    "data": {
                        "tab": {
                            "artist_name": "Simon & Garfunkel",
                            "song_name": "Sound of Silence",
                            "tab_url": "http://tabs.example.com/tab/123?foo=1&bar=2",
                            "rating": 4.9,
                            "votes": 1000,
                            "type": "Chords",
                        },
                        "tab_view": {
                            "wiki_tab": {
                                "content": "[ch]Am[/ch] Hello darkness & my old friend",
                            },
                        },
                    }
                }
            }
        }
        raw_json = json.dumps(js_data)
        entity_encoded = html.escape(raw_json, quote=True)
        page_html = f'<div class="js-store" data-content="{entity_encoded}"></div>'

        tab_scraper = TabScraper()
        tab = tab_scraper.load_tab_from_html(page_html)

        self.assertEqual(tab["artist"], "Simon & Garfunkel")
        self.assertIn("darkness & my old friend", tab["content"])
        self.assertIn("&bar=2", tab["url"])

    def test_load_tab_from_html_with_qquot_typo(self):
        """UG has a known typo where &qquot; appears instead of &quot; in their HTML."""
        js_data = {
            "store": {
                "page": {
                    "data": {
                        "tab": {
                            "artist_name": "The Smashing Pumpkins",
                            "song_name": "Here Is No Why",
                            "tab_url": "http://tabs.example.com/tab/123",
                            "rating": 4.8,
                            "votes": 25,
                            "type": "Chords",
                            "difficulty": "intermediate",
                        },
                        "tab_view": {
                            "wiki_tab": {
                                "content": "[ch]Am[/ch] Test",
                            },
                            "meta": {
                                "tonality": "Eb",
                                "tuning": {"value": "E A D G B E"},
                            },
                        },
                    }
                }
            }
        }
        raw_json = json.dumps(js_data)
        # Simulate UG's encoding with the &qquot; typo
        entity_encoded = html.escape(raw_json, quote=True)
        # Introduce the typo: replace one &quot; with &qquot;
        entity_encoded = entity_encoded.replace("&quot;Chords&quot;", "&qquot;Chords&quot;", 1)
        page_html = f'<div class="js-store" data-content="{entity_encoded}"></div>'

        tab_scraper = TabScraper()
        tab = tab_scraper.load_tab_from_html(page_html)

        self.assertEqual(tab["artist"], "The Smashing Pumpkins")
        self.assertEqual(tab["type"], "Chords")

    def test_load_tab_from_html_raises_on_missing_js_store(self):
        page_html = "<html><body><div>No tab here</div></body></html>"
        tab_scraper = TabScraper()

        with self.assertRaises(ServerNotAvailable):
            tab_scraper.load_tab_from_html(page_html)
