"""Wrap the plain info pages (legal, about, credits, account) in the shared site shell.

Usage: python3 tools/build_pages.py
Edit the page bodies in tools/pages/*.html (Spanish: tools/pages/es/*.html, built under es/), then rerun. Output paths mirror the source names,
with "__" meaning a folder (legal__privacy.html -> legal/privacy.html).
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "pages")

SHELL = """<!doctype html>
<html lang="{lang}" data-alt="{alt}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title} · FinanceHub</title>
  <meta name="description" content="{description}">
  <script>try {{ var h = document.documentElement, l = localStorage.getItem("fh-lang"); if (l ? l !== h.lang : h.lang === "en" && /^es/i.test(navigator.language || "")) location.replace(h.dataset.alt + location.search + location.hash); if (localStorage.getItem("fh-theme") === "dark") h.dataset.theme = "dark"; }} catch (e) {{}}</script>
  <link rel="stylesheet" href="{a}assets/css/style.css">
</head>
<body data-root="{r}">
<a class="skip" href="#main">{skip}</a>
<header class="topbar">
  <div class="wrap wide">
    <a class="logo" href="{r}">Finance<span>Hub</span></a>
    <nav class="topnav" aria-label="Site"><a href="{r}course/">{course}</a><a href="{r}about.html">{about}</a></nav>
    <div class="top-right">
    <span class="xp"><b id="xp">0</b> xp</span>
    <button class="icon-btn theme-toggle" aria-label="{theme}">
      <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>
      <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>
    </button>
    <a class="btn sm" href="{r}account/">{sign_in}</a>
    </div>
  </div>
</header>
<main id="main" class="{main_class}">
{body}
</main>
<footer class="foot">
  <div class="wrap">
    <nav aria-label="{foot_nav}"><a href="{r}about.html">{f_about}</a><a href="{r}contact.html">{f_contact}</a><a href="{r}legal/privacy.html">{f_privacy}</a><a href="{r}legal/terms.html">{f_terms}</a><a href="{r}legal/cookies.html">{f_cookies}</a><a href="{r}credits.html">{f_credits}</a></nav>
    <p><a class="foot-lang" href="{alt}" data-set-lang="{lang_code}" hreflang="{lang_code}" lang="{lang_code}">{lang_aria}</a></p>
    <p class="disclaimer">{disclaimer}</p>
    <p>© 2026 FinanceHub</p>
  </div>
</footer>
<script src="{a}assets/js/save.js"></script>
<script src="{a}assets/vendor/supabase-2.45.4.js"></script>
<script src="{a}assets/js/auth.js"></script>
<script src="{a}assets/js/site.js"></script>
<script>document.getElementById("xp").textContent = FH.state.xp;</script>
{scripts}
</body>
</html>
"""

TEXT = {
    "en": dict(skip="Skip to content", course="Course", about="About", theme="Switch light or dark mode", sign_in="Sign in",
               foot_nav="Legal and info", f_about="About", f_contact="Contact", f_privacy="Privacy", f_terms="Terms",
               f_cookies="Cookies and storage", f_delete="Delete my data", f_credits="Credits",
               disclaimer="FinanceHub is for education only. It isn't financial, tax, investment or legal advice. Examples are simplified and the numbers are made up for practice.",
               lang_label="Español", lang_short="ES", lang_code="es", lang_aria="Ver en español"),
    "es": dict(skip="Saltar al contenido", course="Curso", about="Acerca de", theme="Cambiar entre modo claro y oscuro", sign_in="Entrar",
               foot_nav="Información legal", f_about="Acerca de", f_contact="Contacto", f_privacy="Privacidad", f_terms="Términos",
               f_cookies="Cookies y almacenamiento", f_delete="Borrar mis datos", f_credits="Créditos",
               disclaimer="FinanceHub es solo educativo. No es asesoría financiera, fiscal, de inversión ni legal. Los ejemplos están simplificados y los números son inventados para practicar.",
               lang_label="English", lang_short="EN", lang_code="en", lang_aria="View in English"),
}

for lang, src in (("en", SRC), ("es", os.path.join(SRC, "es"))):
    if not os.path.isdir(src):
        continue
    for name in sorted(os.listdir(src)):
        if not name.endswith(".html"):
            continue
        raw = open(os.path.join(src, name)).read()
        meta = dict(re.findall(r"<!--\s*(\w+):\s*(.*?)\s*-->", raw))
        body = re.sub(r"<!--\s*\w+:.*?-->\n?", "", raw).strip()
        scripts = ""
        if "<script" in body:
            i = body.index("<script")
            body, scripts = body[:i].rstrip(), body[i:]
        out = name.replace("__", "/")
        depth = out.count("/")
        up = "../" * depth
        if lang == "en":
            r = a = up or "./"
            alt, path = f"{up}es/{out}", out
        else:  # Spanish pages live under es/ and share the site's assets
            r, a = up or "./", up + "../"
            alt, path = f"{up}../{out}", os.path.join("es", out)
        alt = alt.replace("index.html", "")
        html = SHELL.format(title=meta["title"], description=meta["description"], r=r, a=a, lang=lang, alt=alt,
                            body=body, scripts=scripts, main_class=meta.get("main", "wrap narrow doc"), **TEXT[lang])
        full = os.path.join(ROOT, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, "w").write(html)
        print(path)
