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
