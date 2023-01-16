from unittest.mock import Mock, PropertyMock, patch

from django.test import TestCase

from sing_along.utils.tabs import TabSearcher, TabType


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
