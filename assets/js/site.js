// Shared page behavior: theme toggle, scroll reveals, reading progress, section rail.
(function () {
  const root = document.documentElement;

  // Theme: light unless the reader picked dark.
  document.querySelectorAll(".theme-toggle").forEach((btn) =>
    btn.addEventListener("click", () => {
      const dark = root.dataset.theme !== "dark";
      if (dark) root.dataset.theme = "dark";
      else delete root.dataset.theme;
      try { localStorage.setItem("fh-theme", dark ? "dark" : "light"); } catch (e) { /* storage blocked */ }
    })
  );

  // Language switch in the header: remember the pick, then go to the other version of the page.
  document.querySelectorAll("[data-set-lang]").forEach((a) =>
    a.addEventListener("click", (e) => {
      if (!window.FH) return;
      e.preventDefault();
      FH.setLang(a.dataset.setLang);
    })
  );

  // Footer language picker: a globe, the current language and a caret, bottom left. The plain link stays as a fallback without JS.
  document.querySelectorAll(".foot-lang").forEach((link) => {
    if (!window.FH) return;
    const wrap = document.createElement("label");
    wrap.className = "lang-pick";
    wrap.innerHTML = `<svg class="globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>
      <select aria-label="${FH.t("Language", "Idioma")}"><option value="en">English</option><option value="es">Español</option></select>
      <svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
    const sel = wrap.querySelector("select");
    sel.value = FH.lang;
    sel.addEventListener("change", () => FH.setLang(sel.value));
    const holder = link.closest("p") || link;
    holder.replaceWith(wrap);
  });

  // Fade elements up as they scroll into view. Lists and grids come in one item at a time.
  const io = "IntersectionObserver" in window ? new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -8% 0px" }
  ) : null;
  const watch = (el) => (io ? io.observe(el) : el.classList.add("in"));
  document.querySelectorAll(".reveal").forEach(watch);
  const STAGGER = ".four, .figures, .lessons, .lp-grid, .goal-grid, .level-grid, .my-path, .cols, .steps, [data-stagger]";
  const stagger = () => document.querySelectorAll(STAGGER).forEach((list) => {
    [...list.children].forEach((kid, i) => {
      if (kid.classList.contains("rv-kid")) return;
      kid.classList.add("rv-kid");
      kid.style.setProperty("--i", Math.min(i, 10));
      watch(kid);
    });
  });
  // Some lists are filled in by page scripts, so run once those are done too.
  stagger();
  document.addEventListener("DOMContentLoaded", stagger);
  window.FHStagger = stagger;

  // Units on the course path slide in from alternating sides.
  const sides = (r) => r.querySelectorAll(".path .unit").forEach((u, i) => u.classList.add(i % 2 ? "from-right" : "from-left"));
  sides(document);
  // For parts of a page drawn by its own script after this file runs.
  window.FHReveal = (r) => { sides(r.parentNode || r); r.querySelectorAll(".reveal:not(.in)").forEach(watch); stagger(); };

  // Thin reading-progress line under the header.
  const bar = document.querySelector(".read-progress");
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  // Storage notice. We set no tracking or ad cookies, so this informs rather than asks.
  const base = document.body.dataset.root || "./";
  let noticed = false;
  try { noticed = localStorage.getItem("fh-notice-ok") === "1"; } catch (e) { noticed = true; }
  if (!noticed) {
    const n = document.createElement("div");
    n.className = "notice";
    n.setAttribute("role", "region");
    const es = root.lang === "es";
    n.setAttribute("aria-label", es ? "Cómo guarda datos este sitio" : "How this site stores data");
    n.innerHTML = es
      ? `<p>Aquí no hay cookies de rastreo ni de anuncios. Tu progreso se guarda en este navegador para que no lo pierdas. <a href="${base}legal/cookies.html">Detalles</a></p><button class="btn sm">Entendido</button>`
      : `<p>No tracking or ad cookies here. Your progress is saved in this browser so you don't lose it. <a href="${base}legal/cookies.html">Details</a></p><button class="btn sm">Got it</button>`;
    n.querySelector("button").addEventListener("click", () => {
      try { localStorage.setItem("fh-notice-ok", "1"); } catch (e) { /* storage blocked */ }
      n.remove();
    });
    document.body.appendChild(n);
  }

  // Companion panel in the right margin: your character's numbers, live.
  const comp = document.querySelector(".companion");
  if (comp && window.FH) {
    const render = () => {
      const s = FH.state, c = s.character, m = FH.money;
      const set = (k, v) => { const el = comp.querySelector(`[data-k=${k}]`); if (el) el.textContent = v; return el; };
      set("pay", m(c.monthlyTakeHome));
      set("ef", m(c.emergencyFund));
      set("inv", m(c.investments));
      set("cash", m(c.checking));
      const debt = set("debt", m(c.creditCardDebt));
      if (debt) debt.classList.toggle("bad", c.creditCardDebt > 0);
      set("xp", s.xp);
      set("badges", s.badges.length);
      set("lessons", Object.values(s.lessons).filter((l) => l.completedAt).length);
    };
    document.addEventListener("fh:save", render);
    render();
  }

  // Section rail: highlight the chapter currently on screen.
  const rail = document.querySelector(".rail");
  if (rail && !rail.hasAttribute("data-own")) {
    const links = [...rail.querySelectorAll("a")];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("current", a.getAttribute("href") === `#${e.target.id}`));
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); if (t) io.observe(t); });
  }
})();

// "Where it leads" maps: build up as you scroll, like a wiring diagram. The lesson before connects in,
// "You are here" lights up, then the later lessons branch out one by one. Once it's all drawn, a dashed
// line keeps flowing along the route into the next lesson.
(() => {
  const maps = document.querySelectorAll("svg.connect-map");
  if (!maps.length) return;
  const still = window.FH ? FH.still() : matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const num = (el, a) => parseFloat(el.getAttribute(a)) || 0;
  maps.forEach((svg) => {
    const steps = []; // [element, when (0..1 of the scroll), kind]
    const wires = [...svg.querySelectorAll("g[fill='none'] path")];
    const hub = svg.querySelector("rect");
    if (!hub || !wires.length) return;
    const hubX = num(hub, "x"), hubR = hubX + num(hub, "width");
    const start = (p) => p.getAttribute("d").match(/M\s*([\d.]+)[ ,]+([\d.]+)/).slice(1).map(Number);
    const end = (p) => p.getAttribute("d").trim().split(/[\s,]+/).slice(-2).map(Number);
    const ins = wires.filter((p) => start(p)[0] < hubX), outs = wires.filter((p) => start(p)[0] >= hubX);
    // Labels: a link (<a>) is one node; loose <text> pairs are grouped by row.
    const nodes = [];
    svg.querySelectorAll("g:not([fill='none']) > a, g:not([fill='none']) > text").forEach((el) => {
      const t = el.tagName === "a" ? el.querySelector("text") : el;
      const x = num(t, "x"), y = num(t, "y");
      const near = nodes.find((n) => Math.abs(n.x - x) < 40 && y - n.y > 0 && y - n.y < 30 && el.tagName !== "a" && !n.link);
      if (near) near.els.push(el); else nodes.push({ x, y, els: [el], link: el.tagName === "a" });
    });
    const before = nodes.filter((n) => n.x < hubX).sort((a, b) => a.y - b.y);
    const after = nodes.filter((n) => n.x > hubR).sort((a, b) => a.y - b.y);
    const hubEls = [hub, ...[...svg.children].filter((el) => el.tagName === "text")];
    // Little round ports where each wire meets a lesson, like plugs on a board.
    const port = (x, y) => { const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", x < hubX ? x : x - 2); c.setAttribute("cy", y); c.setAttribute("r", 5); c.setAttribute("class", "cm-port"); svg.insertBefore(c, hub); return c; };
    before.forEach((n, i) => { steps.push([n.els, .05 + i * .08, "node"]); });
    ins.forEach((p) => { const [x, y] = start(p); steps.push([[port(x, y)], .12, "node"]); steps.push([[p], .2, "wire"]); });
    steps.push([hubEls, .36, "hub"]);
    outs.forEach((p, i) => { const [x, y] = end(p); const at = .46 + i * .13; steps.push([[p], at, "wire"]); steps.push([[port(x, y)], at + .08, "node"]); });
    after.forEach((n, i) => steps.push([n.els, .54 + i * .13, "node"]));
    // The flowing route: into this lesson, then out to the first lesson after it.
    const flows = [ins[0], outs[0]].filter(Boolean).map((p) => {
      const f = p.cloneNode(); f.setAttribute("class", "cm-flow"); p.parentNode.appendChild(f); return f;
    });
    svg.classList.add("cm-live");
    steps.forEach(([els, , kind]) => els.forEach((el) => {
      el.classList.add(kind === "wire" ? "cm-wire" : "cm-node");
      if (kind === "wire") el.setAttribute("pathLength", "1");
    }));
    if (still) { svg.classList.add("cm-done"); return; }
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = svg.getBoundingClientRect(), vh = innerHeight;
      // 0 when the map's top reaches the bottom fifth of the screen, 1 when its middle reaches the screen's middle.
      const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .35 + r.height * .5)));
      steps.forEach(([els, at, kind]) => {
        const k = Math.min(1, Math.max(0, (p - at) / .14));
        els.forEach((el) => {
          if (kind === "wire") el.style.strokeDashoffset = 1 - k;
          else { el.style.opacity = k; el.style.transform = `scale(${.8 + .2 * k})`; }
        });
      });
      svg.classList.toggle("cm-done", p >= 1);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    paint();
  });
})();

// Home course map: a line runs down the units as you scroll, and each unit's number lights up when the line reaches it.
(() => {
  const path = document.querySelector("#course-map.path");
  if (!path) return;
  const fill = document.createElement("div");
  fill.className = "path-fill";
  let ticking = false;
  const paint = () => {
    ticking = false;
    if (!fill.isConnected) path.prepend(fill); // the home page script fills the map after this runs
    const r = path.getBoundingClientRect(), mid = innerHeight * .6;
    const h = Math.min(r.height, Math.max(0, mid - r.top));
    fill.style.height = h + "px";
    path.querySelectorAll(".unit .n").forEach((n) => n.classList.toggle("lit", n.getBoundingClientRect().top + 24 < mid));
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener("resize", paint);
  setTimeout(paint, 50);
})();

// Header "Lessons" menu: course parts on the left, that part's units and lessons on the right.
(function () {
  const nav = document.querySelector(".topbar .topnav");
  const bar = document.querySelector(".topbar");
  if (!nav || !window.FH || !FH.PARTS) return;
  const t = FH.t;
  const root = document.body.dataset.root || "./";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "mm-trigger";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "mm");
  trigger.innerHTML = `${t("Lessons", "Lecciones")}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
  nav.prepend(trigger);

  const panel = document.createElement("div");
  panel.className = "mm";
  panel.id = "mm";
  panel.innerHTML = `<div class="mm-in">
    <div class="mm-side">
      <p class="mm-k">${t("The course", "El curso")}</p>
      <p>${t("Five parts, from your first bank account to a job on Wall Street.", "Cinco partes, desde tu primera cuenta de banco hasta un trabajo en Wall Street.")}</p>
      <div role="tablist" aria-orientation="vertical">${FH.PARTS.map((p) =>
        `<button class="mm-part" role="tab" data-part="${p.n}" aria-selected="false"><b>${p.n}</b>${esc(p.name)}</button>`).join("")}</div>
    </div>
    <div class="mm-main" role="tabpanel"></div>
  </div>`;
  bar.append(panel);
  const main = panel.querySelector(".mm-main");

  const showPart = (n) => {
    const part = FH.PARTS.find((p) => p.n === n);
    panel.querySelectorAll(".mm-part").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.part === n)));
    main.innerHTML = `<p class="mm-k">${t(`Part ${n}`, `Parte ${n}`)} · ${esc(part.name)}</p>
      <div class="mm-units">${part.units.map((u) => {
        const lessons = FH.CATALOG.filter((l) => l.unit === u);
        return `<div class="mm-unit"><h4><small>${t("Unit", "Unidad")} ${u}</small>${esc(FH.UNIT_NAMES[u - 1])}</h4><ul>${lessons.map((l) => l.href
          ? `<li><a href="${root}${l.href}">${esc(l.title)}${FH.done(l.id) ? ` <span class="ok" aria-label="${t("done", "terminada")}">✓</span>` : ""}</a></li>`
          : `<li><span class="soon">${esc(l.title)} <i>${t("soon", "pronto")}</i></span></li>`).join("")
          || `<li><span class="soon">${t("Lessons coming", "Lecciones en camino")} <i>${t("soon", "pronto")}</i></span></li>`}</ul></div>`;
      }).join("")}</div>
      <a class="mm-all" href="${root}course/">${t("See the whole course →", "Ver todo el curso →")}</a>`;
  };

  // Open on the part the reader is in: this lesson's part, or the first part.
  const here = FH.CATALOG.find((l) => l.href && location.pathname.endsWith(l.href));
  const setOpen = (open) => {
    if (open) showPart(here ? FH.partOf(here.unit).n : +((panel.querySelector('.mm-part[aria-selected="true"]') || {}).dataset || {}).part || 1);
    panel.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", String(open));
  };
  trigger.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  // Any link in the menu closes it, so a jump on this same page (like the course map) is visible.
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  panel.querySelectorAll(".mm-part").forEach((b) => {
    b.addEventListener("click", () => showPart(+b.dataset.part));
    b.addEventListener("mouseenter", () => showPart(+b.dataset.part));
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".mm, .mm-trigger")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) { setOpen(false); trigger.focus(); }
  });
})();
