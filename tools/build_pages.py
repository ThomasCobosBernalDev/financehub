"""Wrap the plain info pages (legal, about, credits, account) in the shared site shell.

Usage: python3 tools/build_pages.py
Edit the page bodies in tools/pages/*.html, then rerun. Output paths mirror the source names,
with "__" meaning a folder (legal__privacy.html -> legal/privacy.html).
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "pages")

SHELL = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title} · FinanceHub</title>
  <meta name="description" content="{description}">
  <script>try {{ if (localStorage.getItem("fh-theme") === "dark") document.documentElement.dataset.theme = "dark"; }} catch (e) {{}}</script>
  <link rel="stylesheet" href="{r}assets/css/style.css">
</head>
<body data-root="{r}">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap">
    <a class="logo" href="{r}">Finance<span>Hub</span></a>
    <nav class="topnav" aria-label="Site"><a href="{r}">Course</a><a href="{r}about.html">About</a></nav>
    <div class="spacer"></div>
    <span class="xp"><b id="xp">0</b> xp</span>
    <button class="icon-btn theme-toggle" aria-label="Switch light or dark mode">
      <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>
      <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>
    </button>
    <a class="btn sm" href="{r}account/">Sign in</a>
  </div>
</header>
<main id="main" class="{main_class}">
{body}
</main>
<footer class="foot">
  <div class="wrap">
    <nav aria-label="Legal and info"><a href="{r}about.html">About and contact</a><a href="{r}legal/privacy.html">Privacy</a><a href="{r}legal/terms.html">Terms</a><a href="{r}legal/cookies.html">Cookies and storage</a><a href="{r}legal/privacy.html#delete">Delete my data</a><a href="{r}credits.html">Credits</a></nav>
    <p class="disclaimer">FinanceHub is for education only. It isn't financial, tax, investment or legal advice. Examples are simplified and the numbers are made up for practice.</p>
    <p>© 2026 FinanceHub</p>
  </div>
</footer>
<script src="{r}assets/js/save.js"></script>
<script src="{r}assets/vendor/supabase-2.45.4.js"></script>
<script src="{r}assets/js/auth.js"></script>
<script src="{r}assets/js/site.js"></script>
<script>document.getElementById("xp").textContent = FH.state.xp;</script>
{scripts}
</body>
</html>
"""

for name in sorted(os.listdir(SRC)):
    if not name.endswith(".html"):
        continue
    raw = open(os.path.join(SRC, name)).read()
    meta = dict(re.findall(r"<!--\s*(\w+):\s*(.*?)\s*-->", raw))
    body = re.sub(r"<!--\s*\w+:.*?-->\n?", "", raw).strip()
    scripts = ""
    if "<script" in body:
        i = body.index("<script")
        body, scripts = body[:i].rstrip(), body[i:]
    out = name.replace("__", "/")
    depth = out.count("/")
    html = SHELL.format(title=meta["title"], description=meta["description"], r="../" * depth, body=body, scripts=scripts,
                        main_class=meta.get("main", "wrap narrow doc"))
    path = os.path.join(ROOT, out)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(html)
    print(out)
