// Course page, laid out like the certifications page: units on the left (grouped by part), and on the right the
// picked unit's lesson as a photo banner with its lesson tiles under it. The learner's path is highlighted.
(function () {
const T = FH.t;
const root = document.body.dataset.root || "./";
const map = document.getElementById("course-map");
const unitList = document.getElementById("ex-units"), panel = document.getElementById("ex-panel");
const unitLessons = (u) => FH.CATALOG.filter((l) => l.unit === u);
const lessonById = (id) => FH.CATALOG.find((l) => l.id === id);

const icon = (st) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg>`;

unitList.innerHTML = FH.PARTS.map((p) => `<li class="cx-group">${T("Part", "Parte")} ${p.n} · ${p.name}</li>`
  + p.units.map((u) => `<li><button class="unit${unitLessons(u).some((l) => l.href) ? " live" : ""}" role="tab" id="unit-${u}" data-unit="${u}" aria-selected="false"><span class="n">${u}</span><h3>${FH.UNIT_NAMES[u - 1]}</h3></button></li>`).join("")).join("");

let curUnit = 0, curLesson = null;
const pathInfo = () => {
  const { items, setUp } = FH.path;
  return { setUp, onIds: new Set(items.filter((x) => x.lesson).map((x) => x.lesson.id)), next: FH.nextLesson() };
};
// A lesson's state, used by its tile and the banner.
const stateOf = (l, pi) => {
  const done = FH.done(l.id), onIt = pi.setUp && pi.onIds.has(l.id), isNext = onIt && pi.next && pi.next.id === l.id && !done;
  return { done, onIt, isNext };
};

const banner = (u, l, pi) => {
  const top = `<div class="cx-d-photo"><img src="${FH.unitPhoto(u)}" alt="" onerror="this.remove()"><div>`;
  if (!l) return `<div class="cx-detail" aria-live="polite">${top}<p class="kicker">${T("Unit", "Unidad")} ${u}</p><h3>${FH.UNIT_NAMES[u - 1]}</h3></div></div>
    <div class="cx-d-info"><p class="cx-what">${T("The lessons for this unit are being planned. Every one will teach its topic eight ways, like the open lessons do.", "Las lecciones de esta unidad se están planeando. Cada una enseñará su tema de ocho formas, como las lecciones abiertas.")}</p></div></div>`;
  const s = stateOf(l, pi);
  const needs = (l.needs || []).map(lessonById).filter(Boolean);
  const status = !l.href ? T("Coming soon", "Muy pronto") : s.done ? T("Done", "Hecha") : T("Open now", "Abierta");
  const path = !pi.setUp ? T("No path yet", "Aún sin camino") : s.isNext ? T("Up next", "Sigue") : s.onIt ? T("On your path", "En tu camino") : T("Not on your path", "No está en tu camino");
  const go = l.href
    ? `<a class="btn sm" href="${root}${l.href}">${s.done ? T("Review lesson", "Repasar lección") : T("Start lesson", "Empezar lección")} <span class="arrow">→</span></a>`
    : `<span class="btn sm line" aria-disabled="true">${T("Coming soon", "Muy pronto")}</span>`;
  return `<div class="cx-detail" aria-live="polite">${top}<p class="kicker">${T("Lesson", "Lección")} ${l.unit}.${l.n}</p><h3>${l.title}</h3><p class="cx-org">${l.sub}</p></div></div>
  <div class="cx-d-info">
    <p class="cx-what">${T("Pick the way you learn best, or do all eight:", "Elige la forma en que mejor aprendes, o haz las ocho:")}</p>
    <ul class="ex-ways">${FH.STYLES.map((st) => `<li>${icon(st)}<span>${st.chapter}</span></li>`).join("")}</ul>
    <dl>
      <div><dt>${T("Status", "Estado")}</dt><dd>${status}</dd></div>
      <div><dt>${T("Your path", "Tu camino")}</dt><dd>${path}</dd></div>
      <div><dt>${T("Builds on", "Se basa en")}</dt><dd>${needs.length ? needs.map((n) => `${n.unit}.${n.n} ${n.title}`).join(", ") : T("Nothing, start here", "Nada, empieza aquí")}</dd></div>
    </dl>
    <div class="cx-d-foot">${go}</div>
  </div></div>`;
};

const renderPane = () => {
  const u = curUnit, ls = unitLessons(u), pi = pathInfo(), part = FH.partOf(u);
  const open = ls.filter((l) => l.href).length, doneN = ls.filter((l) => FH.done(l.id)).length, pathN = ls.filter((l) => pi.onIds.has(l.id)).length;
  const l = lessonById(curLesson);
  const facts = !ls.length ? T("Lessons coming soon.", "Lecciones muy pronto.")
    : [open ? T(`${open} of ${ls.length} lessons open`, `${open} de ${ls.length} lecciones abiertas`) : T(`${ls.length} lessons planned`, `${ls.length} lecciones planeadas`),
      doneN ? T(`${doneN} done`, `${doneN} hechas`) : "", pi.setUp && pathN ? T(`${pathN} on your path`, `${pathN} en tu camino`) : ""].filter(Boolean).join(" · ");
  const tiles = ls.map((x) => {
    const s = stateOf(x, pi);
    return `<li><button type="button" class="cx-tile${x.href ? "" : " soon"}${s.done ? " done" : ""}${s.onIt ? " on-path" : ""}${s.isNext ? " is-next" : ""}" data-lesson="${x.id}" aria-pressed="${x.id === curLesson}">
      <b><span class="ln">${x.unit}.${x.n}</span>${x.title}</b><small>${x.href ? x.sub : T("Coming soon", "Muy pronto")}</small>${s.done ? `<span class="tk" title="${T("Finished", "Terminada")}">✓</span>` : ""}</button></li>`;
  }).join("");
  panel.innerHTML = `<div class="cx-pane"><p class="cx-col">${T("Unit", "Unidad")} ${u} · ${T("Part", "Parte")} ${part.n}, ${part.name}</p>
    <div class="cx-title"><h2>${FH.UNIT_NAMES[u - 1]}</h2><p class="cx-does">${facts}</p></div>
    <div id="ex-detail">${banner(u, l, pi)}</div>
    ${ls.length ? `<p class="cx-col">${T("Lessons", "Lecciones")}</p><ol class="ex-tiles">${tiles}</ol>` : ""}</div>`;
  panel.querySelectorAll(".cx-tile").forEach((b) => b.addEventListener("click", () => {
    curLesson = b.dataset.lesson;
    panel.querySelectorAll(".cx-tile").forEach((t) => t.setAttribute("aria-pressed", String(t === b)));
    const box = document.getElementById("ex-detail");
    box.innerHTML = banner(curUnit, lessonById(curLesson), pathInfo());
    if (box.getBoundingClientRect().top < 64) box.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
};

// The lesson a unit opens on: your next lesson if it's here, else the first open one not done, else the first.
const startLesson = (u) => {
  const ls = unitLessons(u), next = FH.nextLesson();
  const l = (next && next.unit === u && next) || ls.find((x) => x.href && !FH.done(x.id)) || ls.find((x) => x.href) || ls[0];
  return l ? l.id : null;
};
const pickUnit = (u) => {
  curUnit = u; curLesson = startLesson(u);
  unitList.querySelectorAll(".unit").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.unit === u)));
  const sel = unitList.querySelector(`.unit[data-unit="${u}"]`);
  if (sel && unitList.scrollWidth > unitList.clientWidth) unitList.scrollTo({ left: sel.parentNode.offsetLeft - 16, behavior: "smooth" });
  renderPane();
};
unitList.querySelectorAll(".unit").forEach((b) => b.addEventListener("click", () => pickUnit(+b.dataset.unit)));
// Links like #part-3 open that part's first unit.
const fromHash = () => { const m = /^#part-(\d)$/.exec(location.hash), p = m && FH.PARTS.find((x) => x.n === +m[1]); if (p) { pickUnit(p.units[0]); map.scrollIntoView({ behavior: "smooth" }); } };
addEventListener("hashchange", fromHash);

// Your path: units on it get an outlined number (filled once all done), units you know a soft fill, the rest are grayed out.
const key = (setUp) => `<ul class="ex-key">${(setUp ? [["on", T("On your path", "En tu camino")], ["done", T("Finished", "Terminada")], ["known", T("You already know it", "Ya lo sabes")], ["next", T("Up next", "Sigue")], ["off", T("Not on your path", "No está en tu camino")]]
  : [["live", T("Lessons open", "Lecciones abiertas")], ["done", T("Finished", "Terminada")], ["off", T("Coming soon", "Muy pronto")]]).map(([k, t]) => `<li><span class="k ${k}"></span>${t}</li>`).join("")}</ul>`;
const paintPath = () => {
  const { on, known, setUp, items } = FH.path;
  map.classList.toggle("path-set", setUp);
  unitList.querySelectorAll(".unit").forEach((b) => {
    const n = +b.dataset.unit, ls = unitLessons(n), inPath = setUp && on.has(n);
    b.classList.toggle("known", setUp && known.has(n));
    b.classList.toggle("on-path", inPath);
    b.classList.toggle("off-path", setUp && !inPath);
    b.classList.toggle("all-done", ls.length > 0 && ls.every((l) => FH.done(l.id)));
  });
  if (curUnit) renderPane();
  // Your path, beside the course title: progress, a color key and plain links to change it.
  const tools = document.getElementById("my-path");
  if (!setUp) {
    tools.innerHTML = `<div class="mp-main"><h2>${T("Your path", "Tu camino")}</h2><p class="mp-line">${T("You don't have a path yet. Answer a few quick questions and we'll highlight only the lessons you need.", "Aún no tienes camino. Responde unas preguntas rápidas y marcamos solo las lecciones que necesitas.")}</p>${key(false)}</div>`
      + `<div class="mp-acts"><a class="btn sm" href="${root}start/">${T("Build my path", "Crear mi camino")} <span class="arrow">→</span></a></div>`;
    return;
  }
  const lessons = items.filter((x) => x.lesson).map((x) => x.lesson);
  const doneN = lessons.filter((l) => FH.done(l.id)).length;
  tools.innerHTML = `<div class="mp-main"><h2>${T("Your path", "Tu camino")}</h2><p class="mp-line">${T(`<b>${doneN} of ${lessons.length}</b> lessons done. Lessons on your path are outlined below.`, `<b>${doneN} de ${lessons.length}</b> lecciones hechas. Las lecciones de tu camino están marcadas abajo.`)}</p>`
    + `<div class="mp-bar" aria-hidden="true"><i style="width:${lessons.length ? (doneN / lessons.length) * 100 : 0}%"></i></div>${key(true)}</div>`
    + `<div class="mp-acts"><a class="linkish" href="${root}start/">${T("Change my path", "Cambiar mi camino")}</a>`
    + `<a class="linkish" href="${root}start/#check">${FH.state.profile.quiz ? T("Retake the quick quiz", "Repetir la prueba rápida") : T("Take the quick quiz", "Hacer la prueba rápida")}</a>`
    + `<button class="linkish" type="button" id="clear-path">${T("Clear my path", "Quitar mi camino")}</button></div>`;
  document.getElementById("clear-path").addEventListener("click", () => {
    FH.clearPath();
    FH.toast(T("Path cleared. You'll see the whole course again.", "Camino quitado. Verás todo el curso otra vez."));
  });
};
document.addEventListener("fh:save", paintPath);

// Open on the unit of the next lesson.
const first = FH.nextLesson();
pickUnit(first ? first.unit : 1);
paintPath();
fromHash();
})();
