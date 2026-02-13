from django.core.management.base import BaseCommand

from sing_along.utils.tabs import ServerNotAvailable, TabScraper

DEFAULT_TAB_URL = ""


class Command(BaseCommand):
    help = "Test tab scraping against a real URL to verify connectivity and parsing"

    def add_arguments(self, parser):
        parser.add_argument(
            "url",
            nargs="?",
            default=DEFAULT_TAB_URL,
            type=str,
            help=f"Tab URL to scrape (default: {DEFAULT_TAB_URL})",
        )

    def handle(self, *args, **options):
        url = options["url"]
        self.stdout.write(f"Scraping tab from: {url}")

        scraper = TabScraper()
        try:
            tab = scraper.load_tab_from_url(url)
        except ServerNotAvailable as e:
            self.stderr.write(self.style.ERROR(f"FAILED: {e}"))
            return

        if tab is None:
            self.stderr.write(self.style.WARNING("Tab not found (404)"))
            return

        self.stdout.write(self.style.SUCCESS("SUCCESS - Tab scraped successfully"))
        self.stdout.write(f"  Artist:     {tab.get('artist')}")
        self.stdout.write(f"  Title:      {tab.get('title')}")
        self.stdout.write(f"  URL:        {tab.get('url')}")
        self.stdout.write(f"  Rating:     {tab.get('rating')}")
        self.stdout.write(f"  Votes:      {tab.get('votes')}")
        self.stdout.write(f"  Type:       {tab.get('type')}")
        self.stdout.write(f"  Difficulty: {tab.get('difficulty')}")
        self.stdout.write(f"  Capo:       {tab.get('capo')}")
        self.stdout.write(f"  Key:        {tab.get('key')}")
        self.stdout.write(f"  Tuning:     {tab.get('tuning')}")
        content_preview = (tab.get("content") or "")[:200]
        self.stdout.write(f"  Content:    {content_preview}...")
