class OriginNormalizationMiddleware:
    """Strip trailing slashes from the HTTP Origin header before CSRF checks.

    Some browsers send Origin as ``http://host:port/`` instead of the
    standard ``http://host:port``.  Django's CsrfViewMiddleware does an
    exact-match comparison, so the slash causes a mismatch.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN")
        if origin:
            request.META["HTTP_ORIGIN"] = origin.rstrip("/")
        return self.get_response(request)
