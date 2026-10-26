"""Make the Spanish copies of the hand-written pages: the home page and the budgeting lesson.

Usage: python3 tools/build_spanish_copies.py   (then tools/bust_cache.py)
The English file is the source of truth. Each Spanish page is that file with its asset paths moved
one folder up and every English string swapped using the pairs in tools/i18n/<name>.py. A pair that
no longer matches stops the build, so an edit to the English page can't silently skip translation.
"""
import importlib.util, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def pairs(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "tools", "i18n", name + ".py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.PAIRS


def translate(src, out, name, up, shared):
    html = open(os.path.join(ROOT, src)).read()
    for en, es in pairs(name):
        n = html.count(en)
        if n == 0:
            raise SystemExit(f"{name}: no longer found in {src}: {en[:80]!r}")
        html = html.replace(en, es)
    # Shared files (CSS, JS, fonts) stay where they are, so point at them from one folder deeper.
    html = re.sub(r'((?:href|src)=")(?!https?:|#|\.\./|[a-z]+/|[a-z-]+\.html)([^"]*\.(?:css|js)(?:\?v=\w+)?")', lambda m: m.group(1) + shared + m.group(2), html)
    html = re.sub(r'((?:href|src)=")((?:\.\./)*assets/)', lambda m: m.group(1) + up + m.group(2), html)
    path = os.path.join(ROOT, out)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(html)
    print(out)


translate("index.html", "es/index.html", "home", "../", "")
if os.path.exists(os.path.join(ROOT, "tools", "i18n", "budgeting.py")):
    translate("lessons/budgeting/index.html", "es/lessons/budgeting/index.html", "budgeting", "../", "../../../lessons/budgeting/")
