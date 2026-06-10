"""Page fetching with a Jina Reader fallback for scrape-hostile sites."""

import httpx
from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

FETCH_ERROR = "We couldn't reach that page. Check the link and try again."


class PageUnreachable(Exception):
    pass


async def fetch_page(url: str) -> tuple[str | None, str]:
    """Fetch a page. Returns (html, readable_text).

    html is None when the page came via the Jina Reader fallback (which
    returns clean text, not HTML — fine for the AI path, useless for JSON-LD).
    """
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.get(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                timeout=8.0,
            )
            if response.status_code == 200 and response.text:
                html = response.text
                return html, html_to_text(html)
        except httpx.HTTPError:
            pass

        # Fallback: Jina AI Reader — free, keyless, good at blocked sites.
        try:
            response = await client.get(
                f"https://r.jina.ai/{url}",
                headers={"Accept": "text/plain", "X-Return-Format": "text"},
                timeout=15.0,
            )
            if response.status_code == 200 and response.text.strip():
                return None, response.text
        except httpx.HTTPError:
            pass

    raise PageUnreachable(FETCH_ERROR)


def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header"]):
        tag.decompose()
    return " ".join(soup.get_text(" ", strip=True).split())
