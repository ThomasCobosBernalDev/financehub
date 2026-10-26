// Unit 1, Lesson 1: Scarcity and trade-offs
(function () {
  const LESSON = "u1-scarcity";
  const { $, $$, fillRange, wait, shuffle } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";

  // ---------- See it: the price of an hour ----------
  const slider = $("#oc-slider");
  const strip = $("#oc-strip");
  for (let i = 0; i < 10; i++) strip.appendChild(document.createElement("span"));
  const renderOC = () => {
    const h = +slider.value;
    fillRange(slider);
    $("#oc-hours").textContent = h;
    $("#oc-earn").textContent = money(h * 15);
    $("#oc-free").textContent = `${10 - h} h`;
    $("#oc-cost").textContent = money((10 - h) * 15);
    [...strip.children].forEach((s, i) => { s.className = i < h ? "k-mow" : "k-friends"; s.textContent = i < h ? "$15" : T("fun", "ocio"); });
  };
  slider.addEventListener("input", renderOC);
  renderOC();

  // ---------- See it: production possibilities frontier ----------
  // Lawns 0..10 on x (80..600), bikes 0..5 on y (360..40).
  const X = (l) => 80 + l * 52, Y = (b) => 360 - b * 64;
  // Hours each bike in the garage takes, quickest first: flat tire, chain,
  // brakes, full fix-up. The stand speeds up the bigger jobs and frees time
  // for a fifth bike. A lawn is always 1 hour; you have 10.
  const OLD_BIKES = [1, 2, 3, 4], NEW_BIKES = [1, 1, 2, 2, 4];
  let bikeHours = OLD_BIKES, grown = false;
  // Most bikes you can finish with the hours left after mowing l lawns.
  const bikesFor = (l, hrs = bikeHours) => {
    let left = 10 - l, b = 0;
    for (const h of hrs) { if (left >= h) { b++; left -= h; } else { b += left / h; break; } }
    return b;
  };
  const frontier = (l) => bikesFor(l);
  const fmt = (n) => String(Math.round(n * 10) / 10);
  // The exact frontier is a few straight pieces (one per bike). Real PPFs have
  // so many units that the pieces blur into a smooth bow, so draw the textbook
  // shape: a curve from the most bikes to the most lawns that passes within a
  // hair of every exact plan (checked for both the old and new tools).
  const smooth = (hrs) => {
    const top = bikesFor(0, hrs);
    return (l) => top * Math.max(0, 1 - (l / 10) ** 1.4) ** (1 / 1.4);
  };
  const pathFor = (hrs, k = 1, from = hrs) => {
    const a = smooth(from), b2 = smooth(hrs);
    let d = "";
    for (let i = 0; i <= 100; i++) { const l = i / 10, b = a(l) + (b2(l) - a(l)) * k; d += `${i ? "L" : "M"}${X(l).toFixed(1)} ${Y(b).toFixed(1)} `; }
    return d;
  };
  const drawPPF = () => {
    const d = pathFor(bikeHours);
    $("#ppf-line").setAttribute("d", d);
    $("#ppf-area").setAttribute("d", `${d} L${X(0)} ${Y(0)} Z`);
  };
  const ticks = $("#ppf-ticks");
  for (let l = 0; l <= 10; l += 2) { const t = document.createElementNS(NS, "text"); t.setAttribute("x", X(l)); t.setAttribute("y", 380); t.setAttribute("text-anchor", "middle"); t.textContent = l; ticks.appendChild(t); }
  for (let b = 1; b <= 5; b++) { const t = document.createElementNS(NS, "text"); t.setAttribute("x", 66); t.setAttribute("y", Y(b) + 4); t.setAttribute("text-anchor", "end"); t.textContent = b; ticks.appendChild(t); }
  drawPPF();

  const ppf = $("#ppf"), pin = $("#ppf-pin"), msg = $("#ppf-msg");
  let tested = new Set();
  $("#ppf-hit").addEventListener("click", (e) => {
    const pt = ppf.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(ppf.getScreenCTM().inverse());
    // You can't mow part of a lawn, so lawns snap to whole numbers.
    const l = Math.round(Math.max(0, Math.min(10, (p.x - 80) / 52)));
    const edge = frontier(l);
    let b = Math.max(0, (360 - p.y) / 64);
    // Close to the curve counts as on it; elsewhere bikes snap to halves.
    b = Math.abs(b - edge) < 0.3 ? edge : Math.round(b * 2) / 2;
    if (Math.abs(b - edge) < 0.01) b = edge;
    // On the frontier, sit the dot on the drawn curve.
    pin.setAttribute("transform", `translate(${X(l)} ${Y(b === edge ? smooth(bikeHours)(l) : b)})`);
    pin.setAttribute("opacity", 1);
    const c = pin.querySelector("circle");
    // e.g. "3 lawns (3 h) + 2 bikes (3 h + 4 h = 7 h)"
    const parts = []; let rest = b, bh = 0;
    for (const h of bikeHours) { if (rest <= 0) break; const n = Math.min(1, rest); parts.push(`${fmt(n * h)}\u00a0h`); bh += n * h; rest -= n; }
    const bikeNote = !parts.length ? "" : parts.length === 1 ? ` (${parts[0]})` : ` (${parts.join(" + ")} =\u00a0${fmt(bh)}\u00a0h)`;
    const hrs = l + bh;
    const plan = [l ? T(`${l} lawn${l === 1 ? "" : "s"}`, `${l} ${l === 1 ? "jardín" : "jardines"}`) + ` (${l}\u00a0h)` : "", b ? T(`${fmt(b)} bike${b <= 1 ? "" : "s"}`, `${fmt(b)} bicicleta${b <= 1 ? "" : "s"}`) + bikeNote : ""].filter(Boolean).join(" + ") || T("Nothing at all", "Nada de nada");
    const hr = (n) => T(`${fmt(n)} hour${n === 1 ? "" : "s"}`, `${fmt(n)} hora${n === 1 ? "" : "s"}`);
    let kind;
    if (b === edge) {
      kind = "on"; c.setAttribute("fill", "var(--savings)"); c.setAttribute("stroke", "var(--ink)");
      msg.innerHTML = T(`<b class="c-good">Efficient:</b> ${plan}. That uses all 10 hours.`, `<b class="c-good">Eficiente:</b> ${plan}. Usa las 10 horas.`);
    } else if (b < edge) {
      kind = "in"; c.setAttribute("fill", "var(--paper)"); c.setAttribute("stroke", "var(--ink-3)");
      msg.innerHTML = T(`<b>Wasteful:</b> ${plan}. That's ${hr(hrs)}, so ${hr(10 - hrs)} go unused.`, `<b>Desperdicio:</b> ${plan}. Son ${hr(hrs)}, así que ${hr(10 - hrs)} quedan sin usar.`);
    } else {
      kind = "out"; c.setAttribute("fill", "none"); c.setAttribute("stroke", "var(--danger)");
      msg.innerHTML = T(`<b class="c-danger">Impossible:</b> ${plan}. That's ${hr(hrs)}, and you only have 10.`, `<b class="c-danger">Imposible:</b> ${plan}. Son ${hr(hrs)}, y solo tienes 10.`);
    }
    tested.add(kind);
    if (tested.size === 3) FH.badge("ppf-explorer", T("Frontier Explorer", "Explorador de la frontera"));
  });
  $("#ppf-grow").addEventListener("click", () => {
    const old = $("#ppf-old");
    const from = bikeHours;
    if (grown) {
      grown = false; bikeHours = OLD_BIKES; old.setAttribute("opacity", 0);
      $("#ppf-grow").textContent = T("Buy a $60 repair stand", "Comprar un soporte de $60");
      msg.innerHTML = T("<b>Back to your old tools.</b> Without the stand, your four bikes take 1 + 2 + 3 + 4 = 10 hours, so the curve goes back to where it was: at most 4 bikes.", "<b>De vuelta a tus herramientas viejas.</b> Sin el soporte, tus cuatro bicicletas tardan 1 + 2 + 3 + 4 = 10 horas, así que la curva vuelve a donde estaba: 4 bicicletas como máximo.");
    } else {
      old.setAttribute("d", pathFor(OLD_BIKES)); old.setAttribute("opacity", 1);
      grown = true; bikeHours = NEW_BIKES;
      $("#ppf-grow").textContent = T("Go back to old tools", "Volver a las herramientas viejas");
      msg.innerHTML = T("<b>You bought a repair stand.</b> It holds the bike steady, so the bigger jobs go faster. The flat tire bike still takes 1 hour, the chain bike now takes 1 hour (was 2), the brakes bike 2 hours (was 3), and the rusty bike 2 hours (was 4). Those are four separate bikes, so together they now take 1 + 1 + 2 + 2 = 6 hours instead of 10, which leaves time for a fifth bike. So the curve moved out: you can now fix up to 5 bikes in the same 10 hours. The dashed line is your old curve. When the most you can make goes up like this, economists call it <b>growth</b>.", "<b>Compraste un soporte de reparación.</b> Sujeta la bicicleta firme, así que los trabajos grandes van más rápido. La bicicleta del pinchazo sigue tardando 1 hora, la de la cadena ahora tarda 1 hora (antes 2), la de los frenos 2 horas (antes 3) y la oxidada 2 horas (antes 4). Son cuatro bicicletas distintas, así que juntas ahora tardan 1 + 1 + 2 + 2 = 6 horas en vez de 10, y queda tiempo para una quinta bicicleta. Por eso la curva se movió hacia afuera: ahora puedes arreglar hasta 5 bicicletas en las mismas 10 horas. La línea punteada es tu curva vieja. Cuando lo máximo que puedes producir sube así, los economistas lo llaman <b>crecimiento</b>.");
    }
    ppf.classList.add("growing");
    animatePPF(from, bikeHours);
  });
  const animatePPF = (from, to) => {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700), e = 1 - (1 - k) ** 3;
      const d = pathFor(to, e, from);
      $("#ppf-line").setAttribute("d", d);
      $("#ppf-area").setAttribute("d", `${d} L${X(0)} ${Y(0)} Z`);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---------- Play it: Ten Free Hours ----------
  const GOAL_MONEY = 200, GOAL_STUDY = 12;
  const ACTS = [
    { id: "mow", name: T("Mow lawns", "Cortar césped"), unit: 1, desc: T("$15 an hour. Tiring.", "$15 la hora. Cansa."), color: "var(--savings)" },
    { id: "bike", name: T("Fix a bike to resell", "Arreglar una bicicleta para revender"), unit: 4, desc: "", color: "var(--needs)" },
    { id: "gig", name: T("Help a neighbor move", "Ayudar a un vecino a mudarse"), unit: 1, desc: T("$25 an hour, this weekend only. Exhausting.", "$25 la hora, solo este fin de semana. Agotador."), color: "var(--accent)", eventOnly: true },
    { id: "study", name: T("SAT practice", "Práctica del SAT"), unit: 1, desc: T("1 hour of practice. Draining.", "1 hora de práctica. Agota."), color: "#7a5bb5" },
    { id: "friends", name: T("Friends and rest", "Amigos y descanso"), unit: 1, desc: T("Recharges your energy.", "Recarga tu energía."), color: "var(--wants)" },
  ];
  const EVENTS = [
    { id: "rain", text: T("It's raining all weekend. No lawns can be mowed.", "Llueve todo el fin de semana. No se puede cortar césped."), apply: (w) => { w.noMow = true; } },
    { id: "gig", text: T("A neighbor is moving and will pay $25 an hour, up to 4 hours.", "Un vecino se muda y paga $25 la hora, hasta 4 horas."), apply: (w) => { w.gig = true; } },
    { id: "parts", text: T("A garage sale has cheap parts. Each bike you fix earns $95 this weekend.", "Una venta de garaje tiene piezas baratas. Cada bicicleta que arregles deja $95 este fin de semana."), apply: (w) => { w.bikePay = 95; } },
  ];
  const S = { week: 0, money: 0, study: 0, energy: 70, log: [] };
  let W, plan, busy = false;
  const deck = [null, ...shuffle([...EVENTS])];

  const newWeekend = () => {
    W = { hours: S.energy < 30 ? 7 : 10, noMow: false, gig: false, bikePay: 70, event: deck[S.week] };
    if (W.event) W.event.apply(W);
    plan = { mow: 0, bike: 0, gig: 0, study: 0, friends: 0 };
    $("#g-week").textContent = T(`Weekend ${S.week + 1} of 4`, `Fin de semana ${S.week + 1} de 4`);
    const notes = [];
    if (W.event) notes.push(W.event.text);
    if (W.hours < 10) notes.push(T("You're burned out, so you only have 7 useful hours this weekend.", "Estás agotado, así que solo tienes 7 horas útiles este fin de semana."));
    $("#g-event-note").innerHTML = notes.map((n) => `<b>${n}</b>`).join(" ");
    renderActs();
  };
  const used = () => Object.values(plan).reduce((a, b) => a + b, 0);
  const rates = () => ({ mow: W.noMow ? 0 : 15, bike: W.bikePay / 4, gig: W.gig ? 25 : 0 });
  const bestPaid = () => Math.max(...Object.values(rates()));

  const renderActs = () => {
    const box = $("#g-acts");
    box.innerHTML = "";
    ACTS.forEach((a) => {
      if (a.eventOnly && !W.gig) return;
      const off = a.id === "mow" && W.noMow;
      const row = document.createElement("div");
      row.className = "act" + (off ? " off" : "");
      row.style.setProperty("--c", a.color);
      const desc = a.id === "bike" ? T(`4 hours each. About $${W.bikePay} profit.`, `4 horas cada una. Unos $${W.bikePay} de ganancia.`) : a.desc;
      row.innerHTML = `<div class="act-name"><i></i><div><b>${a.name}</b><small>${off ? T("Rained out", "Suspendido por lluvia") : desc}</small></div></div>
        <div class="stepper"><button aria-label="${T("Less", "Menos")} ${a.name}" data-d="-1">−</button><output>${plan[a.id]} h</output><button aria-label="${T("More", "Más")} ${a.name}" data-d="1">+</button></div>`;
      $$("button", row).forEach((b) => b.addEventListener("click", () => {
        if (busy || off) return;
        const d = +b.dataset.d * a.unit;
        const next = plan[a.id] + d;
        if (next < 0) return;
        if (d > 0 && used() + d > W.hours) { FH.toast(a.id === "bike" ? T("A bike needs 4 free hours.", "Una bicicleta necesita 4 horas libres.") : T("No hours left. Take some from somewhere else.", "No quedan horas. Quita de otra actividad.")); return; }
        if (a.id === "gig" && next > 4) { FH.toast(T("The move only needs 4 hours.", "La mudanza solo necesita 4 horas.")); return; }
        plan[a.id] = next;
        $("output", row).textContent = `${next} h`;
        renderStrip();
      }));
      box.appendChild(row);
    });
    renderStrip();
  };
  const gStrip = $("#g-strip");
  const renderStrip = () => {
    gStrip.innerHTML = "";
    const order = ["mow", "bike", "gig", "study", "friends"];
    let n = 0;
    order.forEach((k) => { for (let i = 0; i < plan[k]; i++, n++) { const s = document.createElement("span"); s.style.background = ACTS.find((a) => a.id === k).color; s.className = "filled"; gStrip.appendChild(s); } });
    for (; n < W.hours; n++) gStrip.appendChild(document.createElement("span"));
    for (; n < 10; n++) { const s = document.createElement("span"); s.className = "lost"; gStrip.appendChild(s); }
    const left = W.hours - used();
    $("#g-left").textContent = left ? T(`${left} hour${left === 1 ? "" : "s"} left`, `Queda${left === 1 ? "" : "n"} ${left} hora${left === 1 ? "" : "s"}`) : T("Every hour has a job", "Cada hora tiene un trabajo");
    $("#g-left").style.color = left ? "" : "var(--good)";
    $("#g-go").disabled = left !== 0;
  };
  const renderGauges = () => {
    $("#s-money").textContent = money(S.money);
    $("#m-money").style.width = `${Math.min(100, (S.money / GOAL_MONEY) * 100)}%`;
    $("#s-study").textContent = `${S.study} h`;
    $("#m-study").style.width = `${Math.min(100, (S.study / GOAL_STUDY) * 100)}%`;
    $("#s-energy").textContent = Math.round(S.energy);
    $("#m-energy").style.width = `${S.energy}%`;
    $("#s-energy").style.color = S.energy < 30 ? "var(--danger)" : "";
  };
  const log = (html, cls = "") => { const li = document.createElement("li"); li.className = cls; li.innerHTML = html; $("#g-log").prepend(li); };

  $("#g-go").addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    $("#g-go").disabled = true;
    const earned = plan.mow * 15 + (plan.bike / 4) * W.bikePay + plan.gig * 25;
    const energyDelta = -3 * plan.mow - 2 * plan.bike - 5 * plan.gig - 4 * plan.study + 9 * plan.friends;
    // Animate the hour blocks being "spent".
    for (const s of $$("span.filled", gStrip)) { s.classList.add("spent"); await wait(90); }
    S.money += earned;
    S.study += plan.study;
    S.energy = Math.max(0, Math.min(100, S.energy + energyDelta));
    renderGauges();
    const best = bestPaid();
    const parts = [];
    if (earned) parts.push(T(`earned <b>${money(earned)}</b>`, `ganaste <b>${money(earned)}</b>`));
    if (plan.study) parts.push(T(`studied <b>${plan.study} h</b>`, `estudiaste <b>${plan.study} h</b>`));
    if (plan.friends) parts.push(T(`rested <b>${plan.friends} h</b>`, `descansaste <b>${plan.friends} h</b>`));
    const unpaid = plan.study + plan.friends;
    const oc = unpaid ? T(` Those ${unpaid} unpaid hours had an opportunity cost of <b>${money(unpaid * best)}</b>, at your best rate of ${money(best)} an hour.`, ` Esas ${unpaid} horas sin paga tuvieron un costo de oportunidad de <b>${money(unpaid * best)}</b>, a tu mejor tarifa de ${money(best)} la hora.`) : T(" You didn't rest or study at all. Watch your energy.", " No descansaste ni estudiaste nada. Cuida tu energía.");
    log(T(`Weekend ${S.week + 1}: you ${parts.join(", ") || "did nothing"}.`, `Fin de semana ${S.week + 1}: ${parts.join(", ") || "no hiciste nada"}.`) + oc, energyDelta < -15 ? "bad" : "good");
    S.week++;
    await wait(500);
    busy = false;
    if (S.week < 4) newWeekend();
    else finish();
  });

  const finish = () => {
    $("#g-acts").innerHTML = "";
    $("#g-strip").innerHTML = "";
    $("#g-event-note").textContent = "";
    $("#g-go").classList.add("hidden");
    $("#g-left").textContent = T("Summer's over", "Se acabó el verano");
    $("#g-week").textContent = T("Final results", "Resultados finales");
    const mScore = Math.min(1, S.money / GOAL_MONEY) * 40;
    const sScore = Math.min(1, S.study / GOAL_STUDY) * 40;
    const eScore = S.energy >= 40 ? 20 : (S.energy / 40) * 20;
    const score = Math.round(mScore + sScore + eScore);
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
    const hit = [S.money >= GOAL_MONEY && T("the money goal", "la meta de dinero"), S.study >= GOAL_STUDY && T("the SAT goal", "la meta del SAT"), S.energy >= 40 && T("your energy", "tu energía")].filter(Boolean);
    const lesson = hit.length === 3
      ? T("You hit all three. You found the mix where each hour went to whatever it was worth most.", "Lograste las tres. Encontraste la mezcla en la que cada hora fue a lo que más valía.")
      : T(`You protected ${hit.length ? hit.join(" and ") : "nothing fully"}. Every goal you missed is the opportunity cost of the goals you chased. There's no plan that maxes everything, only trade-offs you choose on purpose.`, `Protegiste ${hit.length ? hit.join(" y ") : "nada por completo"}. Cada meta que no lograste es el costo de oportunidad de las metas que perseguiste. No hay plan que lo maximice todo, solo renuncias que eliges a propósito.`);
    const r = $("#g-result");
    r.classList.remove("hidden");
    r.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${score} / 100</b><p>${lesson}</p></div></div>
      <p class="small muted">${T(`${money(S.money)} saved goes into your savings for the rest of the course.`, `Los ${money(S.money)} ahorrados van a tus ahorros para el resto del curso.`)}</p>
      <button class="btn line" id="g-again">${T("Play again", "Jugar otra vez")}</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    if (first) FH.updateCharacter({ checking: FH.state.character.checking + S.money });
    FH.addXP(first ? 50 : 15, first ? T("Finished Ten Free Hours", "Terminaste Diez horas libres") : T("Another summer down", "Otro verano más"));
    if (grade === "A") FH.badge("ten-hours-a", T("Ten Free Hours: A", "Diez horas libres: A"));
    $("#g-again").addEventListener("click", () => {
      Object.assign(S, { week: 0, money: 0, study: 0, energy: 70 });
      deck.splice(1, 3, ...shuffle([...EVENTS]));
      $("#g-log").innerHTML = "";
      r.classList.add("hidden");
      $("#g-go").classList.remove("hidden");
      renderGauges();
      newWeekend();
    });
  };
  renderGauges();
  newWeekend();

  // ---------- Check ----------
  // ---------- Which point is best? Price each whole-bike plan ----------
  const bestSlider = $("#best-slider");
  const PLANS = [[0, 10], [1, 9], [2, 7], [3, 4], [4, 0]];
  const bikesTxt = (k) => `${k} ${k === 1 ? T("bike", "bicicleta") : T("bikes", "bicicletas")}`;
  const lawnsTxt = (l) => `${l} ${l === 1 ? T("lawn", "jardín") : T("lawns", "jardines")}`;
  const bestBox = $("#best-plans");
  bestBox.innerHTML = PLANS.map(([k, l]) => `<div class="bp-row"><span class="bp-name">${bikesTxt(k)} + ${lawnsTxt(l)}</span><span class="bp-bar"><i></i></span><span class="bp-val"><b></b><small></small></span></div>`).join("");
  const bestRows = [...bestBox.children];
  function drawBest() {
    const p = +bestSlider.value;
    const totals = PLANS.map(([k, l]) => k * p + l * 15);
    const top = Math.max(...totals);
    bestRows.forEach((r, i) => {
      const [k, l] = PLANS[i];
      r.classList.toggle("win", totals[i] === top);
      r.querySelector("i").style.width = `${(totals[i] / 400) * 100}%`;
      r.querySelector("b").textContent = money(totals[i]);
      r.querySelector("small").textContent = `${money(k * p)} + ${money(l * 15)}`;
    });
    $("#best-price").textContent = money(p);
    fillRange(bestSlider);
    const wins = PLANS.filter((_, i) => totals[i] === top).map(([k, l]) => `<b>${bikesTxt(k)} + ${lawnsTxt(l)}</b>`);
    $("#best-msg").innerHTML = wins.length === 1
      ? T(`At ${money(p)} a bike, the best plan is ${wins[0]}, making <b>${money(top)}</b>.`, `A ${money(p)} por bicicleta, el mejor plan es ${wins[0]}, que deja <b>${money(top)}</b>.`)
      : T(`At ${money(p)} a bike, it's a tie: ${wins.join(" and ")} both make <b>${money(top)}</b>.`, `A ${money(p)} por bicicleta hay empate: ${wins.join(" y ")} dejan <b>${money(top)}</b> cada uno.`);
  }
  bestSlider.addEventListener("input", drawBest);
  drawBest();

  const QUIZ_EN = [
    { q: "Jada can work a $16-an-hour shift or tutor for $20 an hour on Saturday. She goes to the beach instead. What's the opportunity cost of her beach day for a 4-hour block?",
      opts: ["$80", "$64", "$144", "$0, because she enjoyed it"], a: 0,
      why: "Opportunity cost is the value of the best alternative given up: tutoring at $20 × 4 = $80. You don't add the shift too, because she could only have done one." },
    { q: "On a production possibilities frontier, a point inside the curve represents:",
      opts: ["An impossible combination", "An efficient use of resources", "Unused or wasted resources", "Economic growth"], a: 2,
      why: "Inside the frontier, you could make more of at least one good without giving up any of the other, so resources are being wasted." },
    { q: "A country can produce either 100 tons of wheat or 50 cars. Assuming a straight-line PPF, what's the opportunity cost of one car?",
      opts: ["0.5 tons of wheat", "2 tons of wheat", "50 tons of wheat", "100 tons of wheat"], a: 1,
      why: "Giving up all 100 tons gets 50 cars, so each car costs 100 ÷ 50 = 2 tons of wheat." },
    { q: "Why is a PPF usually bowed outward?",
      opts: ["Prices rise over time", "Resources aren't equally suited to producing both goods", "Technology improves", "People prefer one good"], a: 1,
      why: "Think of Maya, Leo and Jordan. To get more bikes, you switch the best bike fixer first, so the first bikes cost few lawns. Then you have to switch people who are worse at bikes, so each extra bike costs more lawns. Costs that keep rising make the curve bulge outward. If everyone were equally good, it would be a straight line." },
    { q: "Which of these would shift a country's PPF outward?",
      opts: ["Unemployment falls", "A new technology makes factories more productive", "Prices of goods fall", "People buy more cars and less wheat"], a: 1,
      why: "The curve only moves when the most a country could make goes up. New technology does that: the same workers and machines now produce more. Lower unemployment just puts idle people to work, moving the country from inside up to the curve it already had. Buying more cars and less wheat slides along the same curve. And prices don't change how much can be made at all." },
    { q: "You paid $40 for a concert ticket you can't resell. On the day, you feel sick and would rather stay home. What should you base your decision on?",
      opts: ["The $40, so it isn't wasted", "Only how you feel now, since the $40 is a sunk cost", "Whether the band is popular", "Splitting the difference and leaving early"], a: 1,
      why: "The $40 is gone either way. A rational choice compares only future costs and benefits: going sick versus staying home." },
    { q: "A factory has 10 workers and one building. Each new machine costs $4,000. Machines 1 to 4 each add $5,000 of output. A 5th machine would add only $3,500, because the same 10 workers can't keep five machines busy. How many machines should the factory buy?",
      opts: ["As many as possible", "Four", "Five", "None"], a: 1,
      why: "Buy one more as long as what it adds is bigger than what it costs. Machines 1 to 4 add $5,000 and cost $4,000, so each one gains $1,000. Machine 5 adds $3,500 but costs $4,000, so buying it loses $500. Stop at four. This is the repair-stand example from the lesson: more machines with the same workers means each extra one adds less (diminishing returns)." },
  ];

  const QUIZ_ES = [
    { q: "Jada puede trabajar un turno de $16 la hora o dar clases particulares a $20 la hora el sábado. En cambio, se va a la playa. ¿Cuál es el costo de oportunidad de su día de playa en un bloque de 4 horas?",
      opts: ["$80", "$64", "$144", "$0, porque lo disfrutó"], a: 0,
      why: "El costo de oportunidad es el valor de la mejor alternativa a la que renuncias: dar clases a $20 × 4 = $80. No sumas también el turno, porque solo podía hacer una de las dos." },
    { q: "En una frontera de posibilidades de producción, un punto dentro de la curva representa:",
      opts: ["Una combinación imposible", "Un uso eficiente de los recursos", "Recursos sin usar o desperdiciados", "Crecimiento económico"], a: 2,
      why: "Dentro de la frontera podrías producir más de al menos un bien sin renunciar a nada del otro, así que se están desperdiciando recursos." },
    { q: "Un país puede producir 100 toneladas de trigo o 50 carros. Si la FPP es una línea recta, ¿cuál es el costo de oportunidad de un carro?",
      opts: ["0.5 toneladas de trigo", "2 toneladas de trigo", "50 toneladas de trigo", "100 toneladas de trigo"], a: 1,
      why: "Renunciar a las 100 toneladas da 50 carros, así que cada carro cuesta 100 ÷ 50 = 2 toneladas de trigo." },
    { q: "¿Por qué una FPP suele estar curvada hacia afuera?",
      opts: ["Los precios suben con el tiempo", "Los recursos no sirven igual de bien para producir ambos bienes", "La tecnología mejora", "La gente prefiere un bien"], a: 1,
      why: "Piensa en Maya, Leo y Jordan. Para tener más bicicletas, primero cambias a quien mejor arregla bicicletas, así que las primeras bicicletas cuestan pocos jardines. Luego tienes que cambiar a gente peor con las bicicletas, así que cada bicicleta extra cuesta más jardines. Costos que siguen subiendo hacen que la curva se abombe hacia afuera. Si todos fueran igual de buenos, sería una línea recta." },
    { q: "¿Cuál de estas opciones desplazaría hacia afuera la FPP de un país?",
      opts: ["Baja el desempleo", "Una nueva tecnología hace las fábricas más productivas", "Bajan los precios de los bienes", "La gente compra más carros y menos trigo"], a: 1,
      why: "La curva solo se mueve cuando sube lo máximo que un país podría producir. La nueva tecnología hace eso: los mismos trabajadores y máquinas ahora producen más. Un desempleo más bajo solo pone a trabajar a gente parada, y mueve al país desde dentro hasta la curva que ya tenía. Comprar más carros y menos trigo es deslizarse por la misma curva. Y los precios no cambian cuánto se puede producir." },
    { q: "Pagaste $40 por una entrada de concierto que no puedes revender. Ese día te sientes mal y preferirías quedarte en casa. ¿En qué deberías basar tu decisión?",
      opts: ["En los $40, para no desperdiciarlos", "Solo en cómo te sientes ahora, porque los $40 son un costo hundido", "En si la banda es popular", "En un término medio: ir y salir temprano"], a: 1,
      why: "Los $40 ya se fueron, vayas o no. Una decisión racional compara solo costos y beneficios futuros: ir enfermo frente a quedarte en casa." },
    { q: "Una fábrica tiene 10 trabajadores y un edificio. Cada máquina nueva cuesta $4,000. Las máquinas 1 a 4 añaden $5,000 de producción cada una. Una 5.ª máquina añadiría solo $3,500, porque los mismos 10 trabajadores no pueden mantener ocupadas cinco máquinas. ¿Cuántas máquinas debería comprar la fábrica?",
      opts: ["Todas las posibles", "Cuatro", "Cinco", "Ninguna"], a: 1,
      why: "Compra una más mientras lo que añade sea mayor que lo que cuesta. Las máquinas 1 a 4 añaden $5,000 y cuestan $4,000, así que cada una gana $1,000. La máquina 5 añade $3,500 pero cuesta $4,000, así que comprarla pierde $500. Para en cuatro. Es el ejemplo del soporte de reparación de la lección: más máquinas con los mismos trabajadores hace que cada una extra añada menos (rendimientos decrecientes)." },
  ];

  FHLesson.init({ id: LESSON, short: "scarcity", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
