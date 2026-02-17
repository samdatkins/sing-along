from django.conf import settings
from django.core.management.base import BaseCommand

from sing_along.utils.tabs import ServerNotAvailable, TabFetcher, TabType


class Command(BaseCommand):
    help = "Test tab scraping by searching for a song and fetching its content"

    def add_arguments(self, parser):
        parser.add_argument(
            "query",
            nargs="?",
            default="wonderwall oasis",
            type=str,
            help="Song search query (default: 'wonderwall oasis')",
        )

    def handle(self, *args, **options):
        query = options["query"]
        proxy = settings.BOT_PROXY_URL
        self.stdout.write(f"Searching for: {query}")
        self.stdout.write(f"Search URL: {settings.TAB_SEARCH_URL}")
        self.stdout.write(f"Proxy: {'configured' if proxy else 'none (direct)'}")

        fetcher = TabFetcher(settings.TAB_SEARCH_URL, [TabType.CHORDS])
        try:
            tab = fetcher.search_for_best_tab(query)
        except ServerNotAvailable as e:
            self.stderr.write(self.style.ERROR(f"FAILED: {e}"))
            return

        if tab is None:
            self.stderr.write(self.style.WARNING("No tab found for that query"))
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
