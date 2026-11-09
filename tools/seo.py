"""Tell search engines which address is the real one for every page.

Run by tools/bust_cache.py (so it happens on every build). It:
- adds <link rel="canonical"> plus English/Spanish hreflang links to every public page, so Google stops
  treating /about and /about.html (or the two languages) as unlabeled duplicates;
- marks personal pages (home dashboard, account, setup, 404) noindex;
- writes sitemap.xml and robots.txt;
- makes the root 404.html use absolute links, since GitHub Pages serves it at any depth.
"""
import os, re
from urllib.parse import urljoin

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://financedhub.com/"
SKIP_DIRS = {".git", "tools", "node_modules", "assets", "supabase"}
PRIVATE = ("home/", "account/", "start/", "404")  # personal or utility pages: not for search results
BLOCK = re.compile(r'\n  <!-- seo -->.*?<!-- /seo -->', re.S)


def url_of(rel):
    rel = rel.replace(os.sep, "/")
    if rel.endswith("index.html"): rel = rel[: -len("index.html")]
    elif rel.endswith(".html"): rel = rel[:-5]  # GitHub Pages serves about.html at /about
    return rel


def main():
    urls = []
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for f in sorted(files):
            if not f.endswith(".html"): continue
            path = os.path.join(dirpath, f)
            rel = url_of(os.path.relpath(path, ROOT))
            html = open(path).read()
            m = re.search(r'<html lang="(\w+)" data-alt="([^"]*)"', html)
            if not m or "</head>" not in html: continue
            lang, alt = m.group(1), m.group(2)
            here = SITE + rel
            other = urljoin(here, alt)
            if other.endswith(".html"): other = other[:-5]
            en, es = (here, other) if lang == "en" else (other, here)
            private = rel.removeprefix("es/").startswith(PRIVATE)
            tags = ["<!-- seo -->"]
            if private: tags.append('<meta name="robots" content="noindex">')
            else:
                tags += [f'<link rel="canonical" href="{here}">', f'<link rel="alternate" hreflang="en" href="{en}">',
                         f'<link rel="alternate" hreflang="es" href="{es}">', f'<link rel="alternate" hreflang="x-default" href="{en}">',
                         f'<meta property="og:url" content="{here}">']
                urls.append(here)
            tags.append("<!-- /seo -->")
            new = BLOCK.sub("", html).replace("</head>", "\n  " + "\n  ".join(tags) + "\n</head>", 1)
            if rel == "404":  # root 404 is served at any path, so every local link must start at /
                new = re.sub(r'(href|src)="(?!https?:|#|/|mailto:|data:)(?:\./)?', r'\1="/', new)
                new = new.replace('data-root=""', 'data-root="/"').replace('data-root="./"', 'data-root="/"')
                new = re.sub(r'data-alt="(?!/)', 'data-alt="/', new)
            if new != html: open(path, "w").write(new)
    open(os.path.join(ROOT, "sitemap.xml"), "w").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{u}</loc></url>\n" for u in sorted(urls)) + "</urlset>\n")
    open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n")
    print(f"seo: {len(urls)} pages in sitemap")


if __name__ == "__main__":
    main()
