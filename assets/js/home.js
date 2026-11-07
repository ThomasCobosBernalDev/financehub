// Home for returning learners (home/): the next lesson as a photo banner, then streak, XP and path,
// what's coming up on the path, recent badges and links to the rest of the site.
(function () {
const T = FH.t;
const root = document.body.dataset.root || "./";
const $ = (s) => document.querySelector(s);
const icon = (st) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg>`;
const flame = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c-3.5 0-6-2.5-6-6 0-4 4-6 4-11 3 2 5 5 5 8 1-.8 1.5-2 1.5-3 1.5 1.6 2.5 3.8 2.5 6 0 3.5-3 6-7 6z"/></svg>';

$("#hm-date").textContent = new Date().toLocaleDateString(FH.lang === "es" ? "es-MX" : "en-US", { weekday: "long", month: "long", day: "numeric" });
if (window.FHAuth) FHAuth.onChange((u) => {
  const name = u && ((u.user_metadata || {}).username || u.email.split("@")[0]);
  $("#hm-h").textContent = name ? T(`Welcome back, ${name}`, `Qué bueno verte, ${name}`) : T("Welcome back", "Qué bueno verte");
});

// The next lesson, big, with its unit's photo.
const banner = (next) => {
  if (!next) return `<div class="cx-detail"><div class="cx-d-photo"><img src="${FH.unitPhoto(1)}" alt="" onerror="this.remove()"><div><p class="kicker">${T("All caught up", "Todo al día")}</p><h3>${T("You've finished every open lesson", "Terminaste todas las lecciones abiertas")}</h3></div></div>
    <div class="cx-d-info"><p class="cx-what">${T("New lessons are added a few at a time. Review one you liked, or look at what's coming.", "Las lecciones nuevas se agregan de pocas en pocas. Repasa una que te gustó o mira lo que viene.")}</p><div class="cx-d-foot"><a class="btn sm" href="${root}course/">${T("See the whole course", "Ver todo el curso")} <span class="arrow">→</span></a></div></div></div>`;
  const started = Object.keys((FH.state.lessons[next.id] || {}).sections || {}).length > 0;
  const why = next.why === "review" ? T("On your path, in a unit you already know. A quick review.", "En tu camino, en una unidad que ya sabes. Un repaso rápido.")
    : next.why === "extra" ? T("Your path's open lessons are done, so here's an extra one.", "Ya hiciste las lecciones abiertas de tu camino, así que aquí va una extra.")
    : FH.path.setUp ? T("Next on your path.", "Lo siguiente en tu camino.") : T("Next in the course.", "Lo siguiente en el curso.");
  return `<div class="cx-detail"><div class="cx-d-photo"><img src="${FH.unitPhoto(next.unit)}" alt="" onerror="this.remove()"><div><h3>${T("Unit", "Unidad")} ${next.unit} · ${T("Lesson", "Lección")} ${next.n}</h3><p class="cx-d-name">${next.title}</p><p class="cx-org">${next.sub}</p></div></div>
  <div class="cx-d-info">
    <p class="cx-what">${why} ${T("Taught eight ways:", "Enseñada de ocho formas:")}</p>
    <ul class="ex-ways">${FH.STYLES.map((st) => `<li>${icon(st)}<span>${st.chapter}</span></li>`).join("")}</ul>
    <div class="cx-d-foot"><a class="btn" href="${root}${next.href}">${started ? T("Continue lesson", "Seguir la lección") : T("Start lesson", "Empezar lección")} <span class="arrow">→</span></a></div>
  </div></div>`;
};

const paint = () => {
  const s = FH.state, { items, known, setUp } = FH.path, next = FH.nextLesson(), days = FH.streak();
  $("#hm-sub").textContent = days > 1 ? T(`You're on a ${days}-day streak. Keep it going today.`, `Llevas una racha de ${days} días. No la pierdas hoy.`)
    : T("One lesson a day adds up fast. Here's where you are.", "Una lección al día suma rápido. Así vas.");
  $("#hm-next").innerHTML = banner(next);

  // Streak, XP and path.
  const pathLessons = items.filter((x) => x.lesson).map((x) => x.lesson);
  const pathDone = pathLessons.filter((l) => FH.done(l.id)).length;
  const goal = FH.ACHIEVEMENTS.find((a) => a.id !== "account" && !s.badges.includes(a.id));
  $("#hm-stats").innerHTML = `
    <div class="hm-stat"><p class="cx-col">${T("Streak", "Racha")}</p><p class="hm-big streak-big${days ? " lit" : ""}">${flame}<b>${days}</b></p>
      <p>${T(`${days === 1 ? "day" : "days"} in a row · best ${Math.max(s.streak.best || 0, days)}`, `${days === 1 ? "día seguido" : "días seguidos"} · mejor ${Math.max(s.streak.best || 0, days)}`)}</p>
      <button class="linkish" type="button" id="hm-share">${T("Share my streak", "Compartir mi racha")}</button></div>
    <div class="hm-stat"><p class="cx-col">XP</p><p class="hm-big"><b>${s.xp}</b></p>
      <p>${goal ? T(`Next achievement: <b>${goal.name}</b>. ${goal.how}`, `Siguiente logro: <b>${goal.name}</b>. ${goal.how}`) : T("You've earned every course achievement.", "Ganaste todos los logros del curso.")}</p></div>
    <div class="hm-stat"><p class="cx-col">${T("Your path", "Tu camino")}</p>${setUp
      ? `<p class="hm-big"><b>${pathDone}</b><small>/ ${pathLessons.length}</small></p><div class="mp-bar" aria-hidden="true"><i style="width:${pathLessons.length ? (pathDone / pathLessons.length) * 100 : 0}%"></i></div>
        <p>${T("lessons done", "lecciones hechas")} · <a class="linkish" href="${root}start/">${T("Change my path", "Cambiar mi camino")}</a></p>`
      : `<p>${T("Answer a few quick questions and we'll pick only the lessons you need.", "Responde unas preguntas rápidas y elegimos solo las lecciones que necesitas.")}</p><a class="btn sm" href="${root}start/">${T("Build my path", "Crear mi camino")}</a>`}</div>`;
  $("#hm-share").addEventListener("click", () => window.FHShareStreak && window.FHShareStreak());

  // The next few lessons: from the path if there is one, else the course in order.
  const pool = setUp ? pathLessons.filter((l) => !known.has(l.unit)) : FH.CATALOG;
  const up = pool.filter((l) => !FH.done(l.id) && (!next || l.id !== next.id)).slice(0, 4);
  $("#hm-up").innerHTML = up.length ? up.map((l) => `<li>${l.href ? `<a class="cx-tile" href="${root}${l.href}">` : '<span class="cx-tile soon">'}<b><span class="ln">${l.unit}.${l.n}</span>${l.title}</b><small>${l.href ? l.sub : T("Coming soon", "Muy pronto")}</small>${l.href ? "</a>" : "</span>"}</li>`).join("")
    : `<li class="hm-none">${T("Nothing else on your path right now.", "Por ahora no hay nada más en tu camino.")}</li>`;

  // Recent badges, newest first.
  const earned = s.badges.map(FH.badgeInfo).filter(Boolean).reverse().slice(0, 6);
  $("#hm-badges").innerHTML = (earned.length ? `<ul class="badge-wall">${earned.map((b) => `<li class="got">${FH.medal(b)}<b>${b.name}</b></li>`).join("")}</ul>`
    : `<p class="hm-none">${T("Finish a lesson to earn your first achievement.", "Termina una lección para ganar tu primer logro.")}</p>`)
    + `<a class="linkish hm-all" href="${root}account/#achievements">${T("See all achievements →", "Ver todos los logros →")}</a>`;
};
paint();
document.addEventListener("fh:save", paint);
})();
