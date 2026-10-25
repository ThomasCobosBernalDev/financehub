"""Build full lesson pages from tools/lessons/<slug>.html into lessons/<slug>/index.html.

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

CHAPTERS = [  # id, rail label, kicker label, learning style, tinted, narrow
    ("see", "See it", "See it", "visual", True, False),
    ("hear", "Hear it", "Hear it", "auditory", False, True),
    ("play", "Play it", "Play it", "kinesthetic", True, False),
    ("logic", "Break it down", "Break it down", "logical", False, True),
    ("nature", "Nature", "Nature link", "naturalistic", True, False),
    ("notes", "Notes", "Notes", "reading", False, True),
    ("together", "Together", "Together", "social", True, False),
    ("solo", "On your own", "On your own", "solitary", False, True),
    ("check", "Check", "Check", None, True, True),
    ("connects", "Where it leads", "Where it leads", None, False, False),
]

HEAR_PLAYER = """
      <div class="player reveal" id="player">
        <button class="play-btn" id="play-btn" aria-label="Play narration">
          <svg class="play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
          <svg class="pause" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
        </button>
        <div class="wave" aria-hidden="true" id="wave"></div>
        <div class="speed" role="group" aria-label="Playback speed">
          <button data-rate="0.9">0.9×</button><button data-rate="1" class="on">1×</button><button data-rate="1.25">1.25×</button><button data-rate="1.5">1.5×</button>
        </div>
      </div>
      <div class="transcript reveal" id="transcript"></div>
      <audio id="narration" preload="none"></audio>"""

STYLE_PICK = """
    <div class="wrap">
      <div class="style-pick reveal" id="style-picker">
        I learn best by
        <span class="opts">
          <button data-pick="visual">seeing</button><span class="sep">,</span>
          <button data-pick="auditory">listening</button><span class="sep">,</span>
          <button data-pick="kinesthetic">doing</button><span class="sep">,</span>
          <button data-pick="logical">working out the logic</button><span class="sep">,</span>
          <button data-pick="naturalistic">linking it to nature</button><span class="sep">,</span>
          <button data-pick="reading">reading and writing</button><span class="sep">,</span>
          <button data-pick="social">talking it through</button><span class="sep">, or</span>
          <button data-pick="solitary">thinking on my own</button>.
        </span>
      </div>
    </div>"""

FACE = '<svg viewBox="-34 -60 68 68" aria-hidden="true"><circle cx="0" cy="-22" r="27" fill="#f2c9a5" stroke="#2a2420" stroke-width="2"/><path d="M-27 -26 C-28 -58 28 -58 27 -26 C16 -40 -6 -42 -27 -26Z" fill="#2a2420"/><circle cx="-9" cy="-22" r="2.8" fill="#2a2420"/><circle cx="9" cy="-22" r="2.8" fill="#2a2420"/><path d="M-9 -10 Q0 -2 9 -10" stroke="#2a2420" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>'

PAGE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title} · FinanceHub</title>
  <meta name="description" content="{description}">
  <script>try {{ if (localStorage.getItem("fh-theme") === "dark") document.documentElement.dataset.theme = "dark"; }} catch (e) {{}}</script>
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="lesson.css">
</head>
<body data-root="../../">
<a class="skip" href="#main">Skip to the lesson</a>

<header class="topbar">
  <div class="wrap">
    <a class="logo" href="../../">Finance<span>Hub</span></a>
    <nav class="topnav" aria-label="Site"><a href="../../">Course</a><a href="../../about.html">About</a></nav>
    <div class="spacer"></div>
    <span class="xp"><b id="xp">0</b> xp</span>
    <button class="icon-btn theme-toggle" aria-label="Switch light or dark mode">
      <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>
      <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>
    </button>
    <a class="btn sm" href="../../account/">Sign in</a>
  </div>
  <div class="read-progress"></div>
</header>

<nav class="rail" aria-label="Lesson chapters">
  <a href="#start"><i></i><span>Start</span></a>
{rail}
</nav>

<aside class="companion" aria-label="Your character so far">
  <div class="who">
    {face}
    <div><b>{who}</b>{who_sub}</div>
  </div>
  <dl>
    <dt>Savings</dt><dd data-k="cash">$0</dd>
    <dt>Lessons done</dt><dd data-k="lessons">0</dd>
    <dt>XP</dt><dd data-k="xp">0</dd>
  </dl>
  <div class="badges"><b data-k="badges">0</b> badges earned. Your numbers carry into every lesson.</div>
</aside>

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
{style_pick}
  </section>
{chapters}
</main>

<footer class="foot">
  <div class="wrap">
    <nav aria-label="Legal and info"><a href="../../about.html">About and contact</a><a href="../../legal/privacy.html">Privacy</a><a href="../../legal/terms.html">Terms</a><a href="../../legal/cookies.html">Cookies and storage</a><a href="../../legal/privacy.html#delete">Delete my data</a><a href="../../credits.html">Credits</a></nav>
    <p class="disclaimer">FinanceHub is for education only. It isn't financial, tax, investment or legal advice. Examples are simplified and the numbers are made up for practice.</p>
    <p>© 2026 FinanceHub</p>
  </div>
</footer>

<script src="../../assets/js/save.js"></script>
<script src="../../assets/vendor/supabase-2.45.4.js"></script>
<script src="../../assets/js/auth.js"></script>
<script src="../../assets/js/site.js"></script>
<script src="../../assets/js/lesson-kit.js"></script>
<script src="lesson.js"></script>
</body>
</html>
"""


def build(src):
    text = open(src).read()
    meta = dict(re.findall(r"<!--\s*([a-z_]+):\s*(.*?)\s*-->", text))
    parts = dict(re.findall(r"<!--\s*@(\w+)\s*-->\n?(.*?)(?=<!--\s*@\w+\s*-->|\Z)", text, re.S))
    rail, chapters, n = [], [], 0
    for cid, label, kick, style, tint, narrow in CHAPTERS:
        if cid not in parts:
            continue
        n += 1
        ds = f' data-style="{style}"' if style else ""
        rail.append(f'  <a href="#{cid}"{ds}><i></i><span>{label}</span></a>')
        tag = ' <span class="pref-tag">your style</span>' if style else ""
        body = parts[cid].rstrip()
        if cid == "hear":
            body = body.replace("<!-- player -->", HEAR_PLAYER)
        chapters.append(
            f'\n  <section class="chapter{" tint" if tint else ""}" id="{cid}"{ds}>\n'
            f'    <div class="wrap{" narrow" if narrow else ""}">\n'
            f'      <div class="kicker reveal"><span class="num">{n:02d}</span> {kick}{tag}</div>\n'
            f'{body}\n    </div>\n  </section>\n'
        )
    slug = os.path.splitext(os.path.basename(src))[0]
    out_dir = os.path.join(ROOT, "lessons", slug)
    os.makedirs(out_dir, exist_ok=True)
    html = PAGE.format(
        title=meta["title"], description=meta["description"], kicker=meta["kicker"], topic=meta["topic"],
        who=meta.get("who", "You, age 17"), who_sub=meta.get("who_sub", "Fixing up bikes for cash"), face=FACE,
        rail="\n".join(rail), start=parts["start"].rstrip(), art=parts["art"].rstrip(),
        style_pick=STYLE_PICK, chapters="".join(chapters),
    )
    open(os.path.join(out_dir, "index.html"), "w").write(html)
    print("lessons/%s/index.html" % slug)


for f in sorted(glob.glob(os.path.join(ROOT, "tools", "lessons", "*.html"))):
    build(f)
