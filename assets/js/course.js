// Course page: part tabs, that part's units, and the chosen unit's lessons, with the learner's path highlighted.
(function () {
const T = FH.t;
const root = document.body.dataset.root || "./";
// Course explorer: part tabs, that part's units, and the chosen unit's lessons. Drawn from the catalog in save.js.
const map = document.getElementById("course-map");
const unitLessons = (u) => FH.CATALOG.filter((l) => l.unit === u);
const tabs = document.getElementById("ex-tabs"), unitList = document.getElementById("ex-units"), lessonBox = document.getElementById("ex-lessons");
tabs.innerHTML = FH.PARTS.map((p) => `<button class="ex-tab" role="tab" id="part-${p.n}" data-part="${p.n}" aria-selected="false"><b>${p.n}</b>${p.name} <small>${p.units.length} ${T("units", "unidades")}</small></button>`).join("");
const unitStatus = (u) => {
  const ls = unitLessons(u), open = ls.filter((l) => l.href).length;
  return !ls.length ? T("Coming soon", "Muy pronto")
    : open ? T(`${open} of ${ls.length} lessons open`, `${open} de ${ls.length} lecciones abiertas`)
    : T(`${ls.length} lessons planned`, `${ls.length} lecciones planeadas`);
};
lessonBox.innerHTML = FH.PARTS.flatMap((p) => p.units).map((u) => {
  const ls = unitLessons(u);
  const list = !ls.length ? `<p class="ex-empty">${T("The lessons for this unit are being planned.", "Las lecciones de esta unidad se están planeando.")}</p>` : `<ol class="ex-ls">${ls.map((l) => l.href
    ? `<li><a href="${root}${l.href}" data-lesson="${l.id}"><span class="dot"></span><b><span class="ln">${l.unit}.${l.n}</span>${l.title}</b><small>${l.sub}</small></a></li>`
    : `<li><span class="soon" data-lesson="${l.id}"><span class="dot"></span><b><span class="ln">${l.unit}.${l.n}</span>${l.title}</b><small>${l.sub} · ${T("coming soon", "muy pronto")}</small></span></li>`).join("")}</ol>`;
  return `<div class="ex-group" data-for="${u}" role="tabpanel" hidden><p class="kicker">${T("Unit", "Unidad")} ${u}</p><h3>${FH.UNIT_NAMES[u - 1]}</h3><p>${unitStatus(u)}</p>${list}</div>`;
}).join("");
let curPart = 0, curUnit = 0;
const pickUnit = (u) => {
  curUnit = u;
  unitList.querySelectorAll(".unit").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.unit === u)));
  lessonBox.querySelectorAll(".ex-group").forEach((g) => { g.hidden = +g.dataset.for !== u; });
  const sel = unitList.querySelector(`.unit[data-unit="${u}"]`);
  if (sel && unitList.scrollWidth > unitList.clientWidth) unitList.scrollTo({ left: sel.parentNode.offsetLeft - 16, behavior: "smooth" });
};
const pickPart = (n, unit) => {
  const part = FH.PARTS.find((p) => p.n === n);
  curPart = n;
  tabs.querySelectorAll(".ex-tab").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.part === n)));
  unitList.innerHTML = part.units.map((u) => {
    const ls = unitLessons(u), open = ls.filter((l) => l.href).length;
    return `<li><button class="unit${open ? " live" : ""}" role="tab" data-unit="${u}" aria-selected="false"><span class="n">${u}</span><h3>${FH.UNIT_NAMES[u - 1]}</h3><p>${unitStatus(u)}</p><span class="bar"><i></i></span></button></li>`;
  }).join("");
  unitList.querySelectorAll(".unit").forEach((b) => b.addEventListener("click", () => pickUnit(+b.dataset.unit)));
  pickUnit(unit || part.units[0]);
  if (typeof paintPath === "function") paintPath();
};
tabs.querySelectorAll(".ex-tab").forEach((b) => b.addEventListener("click", () => pickPart(+b.dataset.part)));
// Links like #part-3 open that part.
const fromHash = () => { const m = /^#part-(\d)$/.exec(location.hash); if (m && FH.PARTS.some((p) => p.n === +m[1])) { pickPart(+m[1]); map.scrollIntoView({ behavior: "smooth" }); } };
addEventListener("hashchange", fromHash);

// Your path: its lessons are highlighted in place, and its tools sit in the header.
const paintPath = () => {
  const { items, on, known, setUp } = FH.path;
  const onIds = new Set(items.filter((x) => x.lesson).map((x) => x.lesson.id));
  map.classList.toggle("path-set", setUp);
  map.querySelectorAll(".unit").forEach((u) => {
    const n = Number(u.dataset.unit);
    u.classList.toggle("known", known.has(n));
    const inPath = setUp && on.has(n);
    u.classList.toggle("on-path", inPath);
    u.classList.toggle("off-path", setUp && !inPath);
    const ls = unitLessons(n), doneN = ls.filter((l) => FH.done(l.id)).length;
    u.classList.toggle("all-done", ls.length > 0 && ls.every((l) => FH.done(l.id)));
    u.querySelector(".bar i").style.setProperty("--p", ls.length ? (doneN / ls.length) * 100 + "%" : "0%");
    const pathN = ls.filter((l) => onIds.has(l.id)).length;
    let pd = u.querySelector(".pd");
    if (setUp && pathN && !known.has(n)) {
      if (!pd) { pd = document.createElement("span"); pd.className = "pd"; u.querySelector(".bar").before(pd); }
      pd.textContent = T(`${pathN} on your path`, `${pathN} en tu camino`);
    } else if (pd) pd.remove();
    let tag = u.querySelector(".path-tag");
    const text = known.has(n) ? T("You know this", "Ya lo sabes") : "";
    if (!text) { if (tag) tag.remove(); return; }
    if (!tag) { tag = document.createElement("span"); tag.className = "path-tag"; u.querySelector("h3").after(tag); }
    tag.textContent = text;
  });
  const next = FH.nextLesson();
  map.querySelectorAll("[data-lesson]").forEach((el) => {
    const id = el.dataset.lesson, done = FH.done(id), sm = el.querySelector("small");
    const onIt = setUp && onIds.has(id), isNext = setUp && next && next.id === id && !done;
    el.classList.toggle("done", done);
    el.classList.toggle("on-path", onIt);
    el.classList.toggle("is-next", !!isNext);
    let pt = el.querySelector(".pt");
    if (onIt) {
      if (!pt) { pt = document.createElement("span"); pt.className = "pt"; el.append(pt); }
      pt.textContent = isNext ? T("Up next", "Sigue") : done ? T("Your path · done", "Tu camino · hecha") : T("On your path", "En tu camino");
    } else if (pt) pt.remove();
    sm.dataset.base = sm.dataset.base || sm.textContent;
    sm.textContent = sm.dataset.base + (done && !onIt ? T(" · done", " · hecha") : "");
  });
  const tools = document.getElementById("my-path");
  const p = FH.state.profile;
  if (!setUp) {
    tools.innerHTML = T(
      `<p>Pick a part, then a unit, to see its lessons.</p><a class="btn sm" href="${root}start/">Build my path</a>`,
      `<p>Elige una parte y luego una unidad para ver sus lecciones.</p><a class="btn sm" href="${root}start/">Crear mi camino</a>`);
    return;
  }
  const lessons = items.filter((x) => x.lesson).map((x) => x.lesson);
  const doneN = lessons.filter((l) => FH.done(l.id)).length;
  tools.innerHTML = `<div class="mp-bar" aria-hidden="true"><i style="width:${lessons.length ? (doneN / lessons.length) * 100 : 0}%"></i></div>`
    + T(`<p>Your path: <b>${doneN} of ${lessons.length} lessons done</b>.</p>`, `<p>Tu camino: <b>${doneN} de ${lessons.length} lecciones hechas</b>.</p>`)
    + `<a class="btn sm line" href="${root}start/">${T("Change my path", "Cambiar mi camino")}</a>`
    + (p.quiz ? "" : `<a class="btn sm line" href="${root}start/#check">${T("Take the placement check", "Hacer la prueba de nivel")}</a>`)
    + `<button class="linkish" type="button" id="clear-path">${T("Clear my path", "Quitar mi camino")}</button>`;
  document.getElementById("clear-path").addEventListener("click", () => {
    FH.clearPath();
    FH.toast(T("Path cleared. You'll see the whole course again.", "Camino quitado. Verás todo el curso otra vez."));
  });
};
paintPath();
document.addEventListener("fh:save", paintPath);

// Open the explorer on the part and unit of the next lesson.
const first = FH.nextLesson();
pickPart(first ? FH.partOf(first.unit).n : 1, first ? first.unit : 0);
fromHash();
})();
