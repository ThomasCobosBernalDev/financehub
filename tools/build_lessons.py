"""Build full lesson pages from tools/lessons/<slug>.html into lessons/<slug>/index.html,
and the Spanish ones from tools/lessons/es/<slug>.html into es/lessons/<slug>/index.html.
Spanish pages share lessons/<slug>/lesson.js and lesson.css; their narration lives in
es/lessons/<slug>/ (narration.json and audio/).

Each source file starts with meta comments, then one block per chapter:
  <!-- title: ... -->  <!-- description: ... -->  <!-- kicker: Unit 1 · Lesson 1 -->  <!-- topic: Scarcity -->
  <!-- @start --> fold text (h1, story, four questions)
  <!-- @art -->   fold illustration
  <!-- @see --> <!-- @hear --> <!-- @play --> <!-- @logic --> <!-- @nature -->
  <!-- @notes --> <!-- @together --> <!-- @solo --> <!-- @check --> <!-- @connects -->
The shell adds the header, chapter rail, companion panel, style picker, footer and scripts.
Run tools/bust_cache.py afterwards.
"""
import glob, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHAPTER_IDS = [  # id, learning style, tinted, narrow
    ("see", "visual", True, False), ("hear", "auditory", False, True), ("play", "kinesthetic", True, False),
    ("logic", "logical", False, True), ("nature", "naturalistic", True, False), ("notes", "reading", False, True),
    ("together", "social", True, False), ("solo", "solitary", False, True), ("check", None, True, True),
    ("connects", None, False, False),
]

# Every piece of shell text, per language. Chapter entries are (rail label, kicker label).
TEXT = {
    "en": {
        "chapters": {"see": ("See it", "See it"), "hear": ("Hear it", "Hear it"), "play": ("Play it", "Play it"),
                     "logic": ("Break it down", "Break it down"), "nature": ("Nature", "Nature link"), "notes": ("Notes", "Notes"),
                     "together": ("Together", "Together"), "solo": ("On your own", "On your own"), "check": ("Check", "Check"),
                     "connects": ("Where it leads", "Where it leads")},
        "your_style": "your style", "skip": "Skip to the lesson", "course": "Course", "about": "About",
        "theme": "Switch light or dark mode", "sign_in": "Sign in", "rail": "Lesson chapters", "start": "Start",
        "companion": "Your character so far", "savings": "Savings", "lessons_done": "Lessons done",
        "badges": "badges earned. Your numbers carry into every lesson.",
        "who": "You", "who_sub": "Your money, lesson by lesson",
        "play_btn": "Play narration", "speed": "Playback speed",
        "foot_nav": "Legal and info", "f_about": "About", "f_contact": "Contact", "f_privacy": "Privacy", "f_terms": "Terms",
        "f_cookies": "Cookies and storage", "f_delete": "Delete my data", "f_credits": "Credits",
        "disclaimer": "FinancedHub is for education only. It isn't financial, tax, investment or legal advice. Examples are simplified and the numbers are made up for practice.",
        "lang_label": "Español", "lang_short": "ES", "lang_code": "es", "lang_aria": "Ver en español",
    },
    "es": {
        "chapters": {"see": ("Míralo", "Míralo"), "hear": ("Escúchalo", "Escúchalo"), "play": ("Juégalo", "Juégalo"),
                     "logic": ("Paso a paso", "Paso a paso"), "nature": ("Naturaleza", "Conexión con la naturaleza"), "notes": ("Apuntes", "Apuntes"),
                     "together": ("En grupo", "En grupo"), "solo": ("Por tu cuenta", "Por tu cuenta"), "check": ("Ponte a prueba", "Ponte a prueba"),
                     "connects": ("Hacia dónde va", "Hacia dónde va")},
        "your_style": "tu estilo", "skip": "Saltar a la lección", "course": "Curso", "about": "Acerca de",
        "theme": "Cambiar entre modo claro y oscuro", "sign_in": "Entrar", "rail": "Capítulos de la lección", "start": "Inicio",
        "companion": "Tu personaje hasta ahora", "savings": "Ahorros", "lessons_done": "Lecciones hechas",
        "badges": "insignias ganadas. Tus números pasan a cada lección.",
        "who": "Tú", "who_sub": "Tu dinero, lección por lección",
        "play_btn": "Reproducir narración", "speed": "Velocidad",
        "foot_nav": "Información legal", "f_about": "Acerca de", "f_contact": "Contacto", "f_privacy": "Privacidad", "f_terms": "Términos",
        "f_cookies": "Cookies y almacenamiento", "f_delete": "Borrar mis datos", "f_credits": "Créditos",
        "disclaimer": "FinancedHub es solo educativo. No es asesoría financiera, fiscal, de inversión ni legal. Los ejemplos están simplificados y los números son inventados para practicar.",
        "lang_label": "English", "lang_short": "EN", "lang_code": "en", "lang_aria": "View in English",
    },
}

HEAR_PLAYER = """
      <div class="player reveal" id="player">
        <button class="play-btn" id="play-btn" aria-label="{play_btn}">
          <svg class="play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
          <svg class="pause" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
        </button>
        <div class="wave" aria-hidden="true" id="wave"></div>
        <div class="speed" role="group" aria-label="{speed}">
          <button data-rate="0.9">0.9×</button><button data-rate="1" class="on">1×</button><button data-rate="1.25">1.25×</button><button data-rate="1.5">1.5×</button>
        </div>
      </div>
      <div class="transcript reveal" id="transcript"></div>
      <audio id="narration" preload="none"></audio>"""

FACE = '<svg viewBox="-34 -60 68 68" aria-hidden="true"><circle cx="0" cy="-22" r="27" fill="#f2c9a5" stroke="#2a2420" stroke-width="2"/><path d="M-27 -26 C-28 -58 28 -58 27 -26 C16 -40 -6 -42 -27 -26Z" fill="#2a2420"/><circle cx="-9" cy="-22" r="2.8" fill="#2a2420"/><circle cx="9" cy="-22" r="2.8" fill="#2a2420"/><path d="M-9 -10 Q0 -2 9 -10" stroke="#2a2420" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>'

PAGE = """<!doctype html>
<html lang="{lang}" data-alt="{alt}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title} · FinancedHub</title>
  <meta name="description" content="{description}">
  <script>try {{ var h = document.documentElement, l = localStorage.getItem("fh-lang"); if (l ? l !== h.lang : h.lang === "en" && /^es/i.test(navigator.language || "")) location.replace(h.dataset.alt + location.search + location.hash); if (localStorage.getItem("fh-theme") === "dark") h.dataset.theme = "dark"; }} catch (e) {{}}</script>
  <link rel="stylesheet" href="{a}assets/css/style.css">
  <link rel="icon" href="{a}favicon.ico" sizes="32x32">
  <link rel="icon" href="{a}favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{a}apple-touch-icon.png">
  <link rel="stylesheet" href="{own}lesson.css">
</head>
<body data-root="{r}">
<a class="skip" href="#main">{skip}</a>

<header class="topbar">
  <div class="wrap wide">
    <a class="logo" href="{r}"><svg class="logo-mark" viewBox="7 7 50 50" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="currentColor"/><g fill="none" stroke="var(--paper)" stroke-width="2.6"><circle cx="29.5" cy="34.5" r="16.5"/><circle cx="27.5" cy="36.5" r="9.5"/></g><circle cx="26.5" cy="37.5" r="3.2" fill="var(--paper)"/></svg>Financed<span>Hub</span></a>
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
  <div class="read-progress"></div>
</header>

<nav class="rail" aria-label="{rail_label}">
  <a href="#start"><i></i><span>{start_label}</span></a>
{rail}
</nav>

<main id="main">

  <section class="chapter" id="start">
    <div class="wrap fold">
      <div class="fold-text">
        <div class="kicker reveal"><span class="num">{kicker}</span> {topic}</div>
{start}
      </div>
      <div class="fold-art reveal">
{art}
      </div>
    </div>
  </section>
{chapters}
</main>

<footer class="foot">
  <div class="wrap">
    <nav aria-label="{foot_nav}"><a href="{r}about.html">{f_about}</a><a href="{r}contact.html">{f_contact}</a><a href="{r}legal/privacy.html">{f_privacy}</a><a href="{r}legal/terms.html">{f_terms}</a><a href="{r}legal/cookies.html">{f_cookies}</a><a href="{r}credits.html">{f_credits}</a></nav>
    <p><a class="foot-lang" href="{alt}" data-set-lang="{lang_code}" hreflang="{lang_code}" lang="{lang_code}">{lang_aria}</a></p>
    <p class="disclaimer">{disclaimer}</p>
    <p>© 2026 FinancedHub</p>
  </div>
</footer>

<script src="{a}assets/js/save.js"></script>
<script src="{a}assets/vendor/supabase-2.45.4.js"></script>
<script src="{a}assets/js/auth.js"></script>
<script src="{a}assets/js/site.js"></script>
<script src="{a}assets/js/lesson-kit.js"></script>
<script src="{own}lesson.js"></script>
</body>
</html>
"""


def build(src, lang):
    T = TEXT[lang]
    text = open(src).read()
    meta = dict(re.findall(r"<!--\s*([a-z_]+):\s*(.*?)\s*-->", text))
    parts = dict(re.findall(r"<!--\s*@(\w+)\s*-->\n?(.*?)(?=<!--\s*@\w+\s*-->|\Z)", text, re.S))
    rail, chapters, n = [], [], 0
    for cid, style, tint, narrow in CHAPTER_IDS:
        if cid not in parts:
            continue
        label, kick = T["chapters"][cid]
        n += 1
        ds = f' data-style="{style}"' if style else ""
        rail.append(f'  <a href="#{cid}"{ds}><i></i><span>{label}</span></a>')
        tag = f' <span class="pref-tag">{T["your_style"]}</span>' if style else ""
        body = parts[cid].rstrip()
        if cid == "hear":
            body = body.replace("<!-- player -->", HEAR_PLAYER.format(**T))
        chapters.append(
            f'\n  <section class="chapter{" tint" if tint else ""}" id="{cid}"{ds}>\n'
            f'    <div class="wrap{" narrow" if narrow else ""}">\n'
            f'      <div class="kicker reveal"><span class="num">{n:02d}</span> {kick}{tag}</div>\n'
            f'{body}\n    </div>\n  </section>\n'
        )
    slug = os.path.splitext(os.path.basename(src))[0]
    # r: this language's site root (links). a: the real site root (shared assets).
    # Spanish pages live under es/ and reuse the English lesson.js and lesson.css.
    if lang == "en":
        rel, r, a, own, alt = os.path.join("lessons", slug), "../../", "../../", "", f"../../es/lessons/{slug}/"
    else:
        rel, r, a, own, alt = os.path.join("es", "lessons", slug), "../../", "../../../", f"../../../lessons/{slug}/", f"../../../lessons/{slug}/"
    out_dir = os.path.join(ROOT, rel)
    os.makedirs(out_dir, exist_ok=True)
    fields = {k: v for k, v in T.items() if isinstance(v, str) and k not in ("rail", "start")}
    fields.update(rail_label=T["rail"], start_label=T["start"], who=meta.get("who", T["who"]), who_sub=meta.get("who_sub", T["who_sub"]))
    html = PAGE.format(
        lang=lang, alt=alt, r=r, a=a, own=own, face=FACE,
        title=meta["title"], description=meta["description"], kicker=meta["kicker"], topic=meta["topic"],
        rail="\n".join(rail), start=parts["start"].rstrip(), art=parts["art"].rstrip(), chapters="".join(chapters),
        **fields,
    )
    open(os.path.join(out_dir, "index.html"), "w").write(html)
    print(os.path.join(rel, "index.html"))


for f in sorted(glob.glob(os.path.join(ROOT, "tools", "lessons", "*.html"))):
    build(f, "en")
for f in sorted(glob.glob(os.path.join(ROOT, "tools", "lessons", "es", "*.html"))):
    build(f, "es")
