# common/test_runner.py

"""
HTTPretty was used to block accidental outbound HTTP during tests, but it breaks
PostgreSQL (psycopg 3) and slows tests when combined with allow_net_connect=True.

Tests rely on Django's DB; Spotify/HTTP is exercised via registered mocks where
needed or via fast-failing network in CI — do not wrap the suite in HTTPretty.
"""

from django.test.runner import DiscoverRunner


class CustomTestRunner(DiscoverRunner):
    pass
