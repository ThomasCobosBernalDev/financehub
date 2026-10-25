"""Stamp every local CSS/JS link with ?v=<stamp> so browsers load fresh files after a push.

Usage: python3 tools/bust_cache.py   (run after tools/build_pages.py, before committing)
"""
import os, re, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
stamp = time.strftime("%Y%m%d%H%M")
pattern = re.compile(r'((?:href|src)="(?!https?:)[^"]*?\.(?:css|js))(?:\?v=\w+)?"')

for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in (".git", "tools", "node_modules")]
    for f in files:
        if f.endswith(".html"):
            path = os.path.join(dirpath, f)
            html = open(path).read()
            new = pattern.sub(lambda m: f'{m.group(1)}?v={stamp}"', html)
            if new != html:
                open(path, "w").write(new)
                print(os.path.relpath(path, ROOT))
