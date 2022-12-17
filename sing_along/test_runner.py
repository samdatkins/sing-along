# common/test_runner.py

import httpretty
from django.test.runner import DiscoverRunner


class CustomTestRunner(DiscoverRunner):
    def run_tests(self, *args, **kwargs):
        with httpretty.enabled(allow_net_connect=False):
            return super().run_tests(*args, **kwargs)