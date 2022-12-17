from unittest.mock import Mock, PropertyMock, patch

from django.test import TestCase

from sing_along.utils.tabs import TabSearcher, TabType


class TestTabSearcher(TestCase):
    @patch("sing_along.utils.tabs.requests")
    def test_tab_searcher_respects_404(self, mock_requests):
        # Arrange
        status_code_mock = PropertyMock(return_value=404)
        type(mock_requests.get.return_value).status_code = status_code_mock
        tab_searcher = TabSearcher("my_url", TabType.CHORDS)

        # Act
        tab = tab_searcher.get_best_tab_entry("my song")

        # Assert
        self.assertEqual(tab, None)

    @patch("sing_along.utils.tabs.TabSearcher._get_parsed_search_results")
    def test_best_tab_is_chosen(self, mock_searcher):
        # Arrange
        mock_searcher.return_value = [
            {"votes": 10, "rating": 5},
            {"votes": 100, "rating": 4.5},
        ]

        # Act
        fake_tab = TabSearcher("my_url", TabType.CHORDS).get_best_tab_entry("my song")

        # Assert
        self.assertEqual(fake_tab["rating"], 4.5)  # type: ignore
