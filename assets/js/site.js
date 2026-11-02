// Shared page behavior: theme toggle, scroll reveals, reading progress, header menus, footer.
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

  // Our socials, centered between the disclaimer and the copyright.
  document.querySelectorAll(".foot").forEach((foot) => {
    const links = [
      ["TikTok", "https://www.tiktok.com/@financedhub", '<path fill="currentColor" stroke="none" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z"/>'],
      ["Instagram", "https://www.instagram.com/financed.hub/", '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>'],
      ["YouTube", "https://www.youtube.com/@FinancedHub", '<path fill="currentColor" stroke="none" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1Z"/>'],
    ];
    const nav = document.createElement("nav");
    nav.className = "socials";
    nav.setAttribute("aria-label", window.FH ? FH.t("FinancedHub on social media", "FinancedHub en redes sociales") : "FinancedHub on social media");
    nav.innerHTML = links.map(([name, href, icon]) => `<a href="${href}" target="_blank" rel="noopener" aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></a>`).join("");
    const disc = foot.querySelector(".disclaimer");
    if (disc) disc.after(nav); else foot.appendChild(nav);
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

  // Header: once you scroll, it turns see-through so the page shows through it (CSS keys off .scrolled).
  // Over a dark photo band (home hero, About's banner), the see-through header turns dark with light text.
  const darkBand = document.querySelector(".hero-photos, .page-hero");
  const onTop = () => {
    root.classList.toggle("scrolled", scrollY > 24);
    if (darkBand) root.classList.toggle("over-hero", darkBand.getBoundingClientRect().bottom > 64);
  };
  addEventListener("scroll", onTop, { passive: true });
  onTop();

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
      ? `<p>Aquí no hay cookies de rastreo ni de anuncios. Tu progreso se guarda en este navegador para que no lo pierdas. <a href="${base}legal/cookies">Detalles</a></p><button class="btn sm">Entendido</button>`
      : `<p>No tracking or ad cookies here. Your progress is saved in this browser so you don't lose it. <a href="${base}legal/cookies">Details</a></p><button class="btn sm">Got it</button>`;
    n.querySelector("button").addEventListener("click", () => {
      try { localStorage.setItem("fh-notice-ok", "1"); } catch (e) { /* storage blocked */ }
      n.remove();
    });
    document.body.appendChild(n);
  }
})();

// Signed-out learners: ask them (inline, never a pop-up) to make a free account so their progress isn't stuck in one browser.
// FHSaveNudge(el, "afterend", { title, text }) adds a card; { compact: true } adds a one-line note instead.
window.FHSaveNudge = (el, pos, o = {}) => {
  try { if (!el || Object.keys(localStorage).some((k) => /^sb-.*-auth-token$/.test(k))) return; } catch (e) { return; }
  const T = FH.t, root = document.body.dataset.root || "./";
  if (o.compact) return el.insertAdjacentHTML(pos, `<p class="save-line">${T("Not signed in: your progress is saved only in this browser.", "Sin cuenta: tu progreso se guarda solo en este navegador.")} <a class="linkish" href="${root}account/#create">${T("Create a free account to keep it →", "Crea una cuenta gratis para conservarlo →")}</a></p>`);
  el.insertAdjacentHTML(pos, `<div class="save-nudge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z"/><path d="m9.5 13 2 2 3.5-3.5"/></svg>
    <div><b>${o.title || T("Save your progress", "Guarda tu progreso")}</b><p>${o.text || T(`You've earned ${FH.state.xp} XP. Create a free account so your XP, streak and path follow you to any device and don't vanish if you clear your browser.`, `Llevas ${FH.state.xp} XP. Crea una cuenta gratis para que tu XP, tu racha y tu camino te sigan a cualquier dispositivo y no se borren si limpias tu navegador.`)}</p>
    <p class="sn-acts"><a class="btn sm" href="${root}account/#create">${T("Create my free account", "Crear mi cuenta gratis")}</a><a class="linkish" href="${root}account/#login">${T("I have one, log in", "Ya tengo una, entrar")}</a></p></div></div>`);
};

// "Where it leads" maps: build up like a wiring diagram once in view. The lesson before connects in,
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
    // A copy of the first wire in and out carries the flowing dashes.
    [ins[0], outs[0]].filter(Boolean).forEach((p) => {
      const f = p.cloneNode(); f.setAttribute("class", "cm-flow"); p.parentNode.appendChild(f);
    });
    svg.classList.add("cm-live");
    steps.forEach(([els, , kind]) => els.forEach((el) => {
      el.classList.add(kind === "wire" ? "cm-wire" : "cm-node");
      if (kind === "wire") el.setAttribute("pathLength", "1");
    }));
    if (still) { svg.classList.add("cm-done"); return; }
    // Once most of the map is on screen, the whole thing draws in one go (about 1.6 seconds), then stays drawn.
    const paint = (p) => steps.forEach(([els, at, kind]) => {
      const k = Math.min(1, Math.max(0, (p - at) / .14));
      els.forEach((el) => {
        if (kind === "wire") el.style.strokeDashoffset = 1 - k;
        else { el.style.opacity = k; el.style.transform = `scale(${.8 + .2 * k})`; }
      });
    });
    const span = Math.max(...steps.map(([, at]) => at)) + .14; // so the last branch finishes too
    const play = () => {
      const t0 = performance.now();
      const tick = (now) => { const p = Math.min(1, (now - t0) / 1600); paint(p * span); if (p < 1) requestAnimationFrame(tick); else svg.classList.add("cm-done"); };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: .6 });
    io.observe(svg);
  });
})();

// Header, left to right: your streak, your XP, the notifications bell, then theme and account.
// Hovering (or tapping) the streak or the XP drops a small card that explains it; only one pop-up shows at a time. New badges also pop up in the corner.
(() => {
  const T = FH.t, root = document.body.dataset.root || "./";
  const right = document.querySelector(".topbar .top-right"), xp = right && right.querySelector(".xp");
  if (!xp) return;
  const flame = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c-3.5 0-6-2.5-6-6 0-4 4-6 4-11 3 2 5 5 5 8 1-.8 1.5-2 1.5-3 1.5 1.6 2.5 3.8 2.5 6 0 3.5-3 6-7 6z"/></svg>';
  const streak = document.createElement("span");
  streak.className = "streak hov";
  streak.tabIndex = 0;
  streak.innerHTML = `${flame}<b></b><span class="hov-card" role="tooltip"><b class="hc-title"></b><span class="hc-text">${T("Come back every day to keep your streak going. Any visit counts. Miss a day and it starts over.", "Vuelve cada día para no perder tu racha. Cualquier visita cuenta. Si faltas un día, empieza de nuevo.")}</span><span class="hc-best"></span><button class="btn sm line" type="button" data-share>${T("Share my streak", "Compartir mi racha")}</button></span>`;
  xp.before(streak);
  // XP: what it is and where it comes from.
  xp.classList.add("hov");
  xp.tabIndex = 0;
  xp.insertAdjacentHTML("beforeend", `<span class="hov-card" role="tooltip"><b class="hc-title">${T("XP: points for learning", "XP: puntos por aprender")}</b><ul class="hc-list">
    <li><b>+5</b> ${T("each section of a lesson you open", "por cada sección de una lección que abres")}</li>
    <li><b>+10</b> ${T("each quiz answer you get right", "por cada respuesta correcta en el examen")}</li>
    <li><b>+25</b> ${T("finishing a lesson", "por terminar una lección")}</li>
    <li><b>+50</b> ${T("the first time you play a lesson's game (+15 replays)", "la primera vez que juegas el juego de una lección (+15 al repetir)")}</li></ul></span>`);
  const notes = document.createElement("div");
  notes.className = "notes";
  notes.innerHTML = `<button class="icon-btn bell" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${T("Notifications", "Notificaciones")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><i class="dot" hidden></i></button>
    <div class="notes-pop" hidden><p class="np-head">${T("Notifications", "Notificaciones")}</p><ul></ul>
      <div class="np-foot"><a href="${root}account/#achievements">${T("See all achievements →", "Ver todos los logros →")}</a></div></div>`;
  xp.after(notes);
  const bell = notes.querySelector(".bell"), pop = notes.querySelector(".notes-pop");
  const ago = (iso) => {
    const m = Math.round((Date.now() - new Date(iso)) / 60000);
    return m < 1 ? T("just now", "ahora") : m < 60 ? T(`${m} min ago`, `hace ${m} min`) : m < 1440 ? T(`${Math.round(m / 60)} h ago`, `hace ${Math.round(m / 60)} h`) : T(`${Math.round(m / 1440)} d ago`, `hace ${Math.round(m / 1440)} d`);
  };
  const paint = () => {
    const days = FH.streak(), list = (FH.state.notes || []).filter((n) => FH.badgeInfo(n.id));
    streak.querySelector(":scope > b").textContent = days;
    streak.classList.toggle("lit", days > 0);
    streak.querySelector(".hc-title").textContent = T(`${days}-day streak`, `Racha de ${days} ${days === 1 ? "día" : "días"}`);
    streak.querySelector(".hc-best").textContent = T(`Your best: ${Math.max(FH.state.streak.best || 0, days)} days`, `Tu mejor racha: ${Math.max(FH.state.streak.best || 0, days)} días`);
    notes.querySelector(".dot").hidden = !list.some((n) => !n.read);
    pop.querySelector("ul").innerHTML = list.length ? list.slice().reverse().slice(0, 8).map((n) => {
      const b = FH.badgeInfo(n.id);
      return `<li class="${n.read ? "" : "new"}">${FH.medal(b)}<span><b>${T("Achievement earned:", "Logro ganado:")} ${b.name}</b><small>${b.how} · ${ago(n.at)}</small></span></li>`;
    }).join("") : `<li class="np-empty">${T("Nothing yet. Finish a lesson to earn your first achievement.", "Nada todavía. Termina una lección para ganar tu primer logro.")}</li>`;
  };
  const close = () => { pop.hidden = true; bell.setAttribute("aria-expanded", "false"); };
  // Only one header pop-up at a time: opening one (or hovering a card) sends "fh:popup", and the others close.
  const opened = (owner) => document.dispatchEvent(new CustomEvent("fh:popup", { detail: owner }));
  document.addEventListener("fh:popup", (e) => {
    if (e.detail !== notes) close();
    const f = document.activeElement;
    if (f && f.closest(".hov") && f.closest(".hov") !== e.detail) f.blur();
  });
  [streak, xp].forEach((h) => ["mouseenter", "focusin"].forEach((ev) => h.addEventListener(ev, () => opened(h))));
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = pop.hidden;
    if (open) opened(notes);
    pop.hidden = !open;
    bell.setAttribute("aria-expanded", String(open));
    if (open) FH.readNotes();
  });
  document.addEventListener("click", (e) => { if (!pop.hidden && !e.target.closest(".notes")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { close(); bell.focus(); } });
  streak.querySelector("[data-share]").addEventListener("click", () => window.FHShareStreak());
  document.addEventListener("fh:save", paint);
  paint();

  // Share the streak as a picture: a square card with the flame, the number of days and the site, drawn on a canvas.
  // Phones get the share sheet with the image attached; computers download the image and copy the text.
  const streakCard = (days) => new Promise((done) => {
    const c = document.createElement("canvas"), x = c.getContext("2d"), W = 1080;
    c.width = c.height = W;
    const g = x.createLinearGradient(0, 0, W, W);
    g.addColorStop(0, "#10201c"); g.addColorStop(1, "#1f4a3e");
    x.fillStyle = g; x.fillRect(0, 0, W, W);
    // Faint tree rings, like the logo, in the corner.
    x.strokeStyle = "rgba(143, 220, 191, .1)"; x.lineWidth = 6;
    [120, 220, 330, 450, 580].forEach((r, i) => { x.beginPath(); x.arc(W - 120 - i * 14, 150 + i * 14, r, 0, Math.PI * 2); x.stroke(); });
    // Flame.
    x.save(); x.translate(W / 2 - 150, 230); x.scale(12.5, 12.5);
    x.fillStyle = "#e0702f"; x.fill(new Path2D("M12 21c-3.5 0-6-2.5-6-6 0-4 4-6 4-11 3 2 5 5 5 8 1-.8 1.5-2 1.5-3 1.5 1.6 2.5 3.8 2.5 6 0 3.5-3 6-7 6z")); x.restore();
    x.textAlign = "center"; x.fillStyle = "#fbf8f2";
    x.font = `700 ${days > 99 ? 200 : 260}px Georgia, serif`; x.fillText(String(days), W / 2, 760);
    x.font = "600 64px system-ui, sans-serif"; x.fillText(T("day streak", days === 1 ? "día de racha" : "días de racha"), W / 2, 850);
    x.fillStyle = "rgba(251, 248, 242, .72)"; x.font = "400 40px system-ui, sans-serif";
    x.fillText(T("learning money on FinancedHub", "aprendiendo de dinero en FinancedHub"), W / 2, 930);
    x.fillStyle = "#8fdcbf"; x.font = "italic 700 44px Georgia, serif"; x.fillText("financedhub.com", W / 2, 1010);
    c.toBlob(done, "image/png");
  });
  // One share at a time: a second click while the share sheet is open does nothing (it used to fall through to a download).
  // While sharing, the streak card stays open so the share sheet isn't left pointing at nothing.
  let sharing = false;
  window.FHShareStreak = async () => {
    if (sharing) return;
    sharing = true;
    streak.classList.add("keep");
    try {
      const d = FH.streak();
      const text = T(`I'm on a ${d}-day streak learning money on FinancedHub 🔥 https://financedhub.com`, `Llevo una racha de ${d} ${d === 1 ? "día" : "días"} aprendiendo de dinero en FinancedHub 🔥 https://financedhub.com`);
      const blob = await streakCard(d), file = new File([blob], "financedhub-streak.png", { type: "image/png" });
      // The picture plus the bare link. Messages only draws a link's preview card when the link is on its own,
      // so the words stay on the picture instead of in the message.
      const pick = [{ files: [file], url: "https://financedhub.com/" }, { files: [file], text }].find((d) => navigator.canShare && navigator.canShare(d));
      if (pick) {
        try { await navigator.share(pick); } catch (e) { /* closed or cancelled */ }
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      try { await navigator.clipboard.writeText(text); } catch (e) { /* clipboard blocked */ }
      FH.toast(T("Saved your streak picture and copied the text. Post them anywhere.", "Guardamos la imagen de tu racha y copiamos el texto. Publícalos donde quieras."));
    } finally {
      sharing = false;
      streak.classList.remove("keep");
    }
  };

  // The pop-up for a new badge.
  let card;
  document.addEventListener("fh:badge", (e) => {
    const b = e.detail;
    if (!card) { card = document.createElement("div"); card.className = "badge-pop"; card.setAttribute("role", "status"); document.body.append(card); }
    card.innerHTML = `${FH.medal(b)}<span><small>${T("Achievement unlocked", "Logro desbloqueado")}</small><b>${b.name}</b><em>${b.how}</em></span>`;
    card.classList.remove("show"); void card.offsetWidth; card.classList.add("show");
    clearTimeout(card._t);
    card._t = setTimeout(() => card.classList.remove("show"), 4200);
  });
})();
