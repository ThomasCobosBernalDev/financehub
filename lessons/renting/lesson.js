// Unit 7, Lesson 1: Rent your first apartment
(function () {
  const LESSON = "u7-renting";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ---------- See it: rent checker ----------
  const INCOME = 3000;
  const rentEl = $("#rt-rent");
  let ppl = 1;
  const drawRt = () => {
    const rent = +rentEl.value, share = rent / ppl, pct = share / INCOME, move = share * 2 + 50;
    $("#rt-rent-v").textContent = usd(rent);
    const pass = 3 * share <= INCOME;
    $("#rt-out").innerHTML = [
      [T("Your share of rent", "Tu parte de la renta"), ppl === 1 ? `<b>${usd(share)}</b>` : `${fr(usd(rent), T(`${ppl} people`, `${ppl} personas`))} = <b>${usd(share)}</b>`],
      [T("Part of your income", "Parte de tu ingreso"), `${fr(usd(share), usd(INCOME))} = <b>${Math.round(pct * 100)}%</b>`],
      [T("Landlord's 3 times check", "Revisión de 3 veces del casero"), `3 × ${usd(share)} = ${usd(3 * share)} <b class="${pass ? "ok" : "no"}">${pass ? T("pass", "pasa") : T("fail", "no pasa")}</b>`],
      [T("Cash to move in", "Efectivo para mudarte"), `${usd(share)} + ${usd(share)} + $50 = <b>${usd(move)}</b>`],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    const fill = $("#rt-fill");
    fill.style.width = `${Math.min(100, pct * 100 / 0.6)}%`;
    fill.dataset.tone = pct <= 0.3 ? "good" : "warn";
    $("#rt-msg").innerHTML = pct <= 0.3
      ? T(`<b>Fits.</b> ${usd(share)} is at or under your $900 cap, leaving ${usd(INCOME - share)} for everything else.`, `<b>Te alcanza.</b> ${usd(share)} está en tu tope de $900 o por debajo, y te quedan ${usd(INCOME - share)} para todo lo demás.`)
      : pass
        ? T(`<b>Tight.</b> The landlord would say yes, but ${usd(share)} is ${usd(share - 900)} over your 30% cap of $900.`, `<b>Apretado.</b> El casero diría que sí, pero ${usd(share)} pasa por ${usd(share - 900)} tu tope del 30%, que es $900.`)
        : T(`<b>Too high.</b> You'd need ${usd(3 * share)} a month to pass the landlord's check. Try a roommate or a cheaper place.`, `<b>Demasiado alto.</b> Necesitarías ${usd(3 * share)} al mes para pasar la revisión del casero. Prueba con un compañero de cuarto o un lugar más barato.`);
    fillRange(rentEl);
  };
  rentEl.addEventListener("input", drawRt);
  $$("#rt .rt-ppl .sm-btn").forEach((b) => b.addEventListener("click", () => {
    ppl = +b.dataset.n;
    $$("#rt .rt-ppl .sm-btn").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    drawRt();
  }));
  drawRt();

  // ---------- Play it: lease check ----------
  const ROUNDS = [
    { facts: [T("Income before taxes: $2,500 a month", "Ingreso antes de impuestos: $2,500 al mes")],
      q: T("By the 30% rule, what's the most rent you should pay?", "Según la regla del 30%, ¿cuál es la renta máxima que deberías pagar?"), opts: ["$750", "$833", "$1,000"], a: 0,
      why: T("$2,500 × 0.30 = $750.", "$2,500 × 0.30 = $750.") },
    { facts: [T("Rent: $1,100 a month", "Renta: $1,100 al mes"), T("Landlord's rule: income at least 3 times the rent", "Regla del casero: ingreso de al menos 3 veces la renta")],
      q: T("What monthly income do you need?", "¿Qué ingreso mensual necesitas?"), opts: ["$3,300", "$3,667", "$2,200"], a: 0,
      why: T("3 × $1,100 = $3,300 a month before taxes.", "3 × $1,100 = $3,300 al mes antes de impuestos.") },
    { facts: [T("Rent: $950 a month", "Renta: $950 al mes"), T("Security deposit: one month's rent", "Depósito de garantía: un mes de renta"), T("Application fee: $40", "Cuota de solicitud: $40")],
      q: T("How much cash do you need to move in?", "¿Cuánto efectivo necesitas para mudarte?"), opts: ["$1,940", "$990", "$1,900"], a: 0,
      why: T("First month $950 + deposit $950 + fee $40 = $1,940.", "Primer mes $950 + depósito $950 + cuota $40 = $1,940.") },
    { facts: [T("2-bedroom rent: $1,200, split 2 ways", "Renta del departamento de 2 recámaras: $1,200, entre 2"), T("Utilities: $120, split 2 ways", "Servicios: $120, entre 2")],
      q: T("What's your share each month?", "¿Cuánto te toca cada mes?"), opts: ["$660", "$600", "$1,320"], a: 0,
      why: T(`${fr("$1,200 + $120", "2")} = ${fr("$1,320", "2")} = $660.`, `${fr("$1,200 + $120", "2")} = ${fr("$1,320", "2")} = $660.`) },
    { facts: [T("Rent is due on the 1st", "La renta se paga el día 1"), T("5-day grace period, then a $50 late fee", "5 días de gracia, luego un cargo por atraso de $50"), T("You pay on the 4th", "Pagas el día 4")],
      q: T("What late fee do you owe?", "¿Qué cargo por atraso debes?"), opts: ["$0", "$50", "$150"], a: 0,
      why: T("The 4th is inside the 5-day grace period, so there's no fee. Pay by the 1st anyway; the grace period is a backup.", "El día 4 está dentro de los 5 días de gracia, así que no hay cargo. Igual paga el día 1; la gracia es un respaldo.") },
    { facts: [T("Security deposit: $900", "Depósito de garantía: $900"), T("At move-out: carpet worn from normal use", "Al mudarte: alfombra gastada por el uso normal"), T("And a hole in the wall that costs $150 to fix", "Y un hoyo en la pared que cuesta $150 arreglar")],
      q: T("How much of the deposit should you get back?", "¿Cuánto del depósito te deberían devolver?"), opts: ["$750", "$900", "$0"], a: 0,
      why: T("Worn carpet is normal wear and tear, so it costs you $0. The hole is damage: $900 − $150 = $750.", "La alfombra gastada es desgaste normal, así que no te cuesta nada. El hoyo es daño: $900 − $150 = $750.") },
    { facts: [T("You and a roommate share one lease", "Tú y un compañero de cuarto firmaron un solo contrato"), T("Rent: $1,400 a month, $700 each", "Renta: $1,400 al mes, $700 cada uno"), T("Your roommate moves out and stops paying", "Tu compañero se va y deja de pagar")],
      q: T("How much can the landlord ask you for each month?", "¿Cuánto te puede pedir el casero cada mes?"), opts: ["$1,400", "$700", "$0"], a: 0,
      why: T("Joint liability: each person on the lease is responsible for the whole rent, so the landlord can ask you for all $1,400.", "Responsabilidad conjunta: cada persona en el contrato responde por toda la renta, así que el casero te puede pedir los $1,400.") },
    { facts: [T("12-month lease, rent $900", "Contrato de 12 meses, renta de $900"), T("Breaking it early costs 2 months' rent", "Romperlo antes cuesta 2 meses de renta"), T("You get a job in another city after 8 months", "Consigues trabajo en otra ciudad a los 8 meses")],
      q: T("What does breaking the lease cost?", "¿Cuánto cuesta romper el contrato?"), opts: ["$1,800", "$900", "$3,600"], a: 0,
      why: T("2 × $900 = $1,800. Sometimes it's cheaper to find someone to take over the lease, if the landlord allows it.", "2 × $900 = $1,800. A veces sale más barato encontrar a alguien que tome tu contrato, si el casero lo permite.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#lk-why"), nextB = $("#lk-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#lk-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#lk-q").textContent = r.q;
    $("#lk-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#lk-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#lk-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#lk-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#lk-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#lk-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Lease ready", "Listo para rentar") : G.score >= 6 ? T("Almost ready to sign", "Casi listo para firmar") : T("Review the four checks", "Repasa las cuatro revisiones")}</b><p>${T("Rent cap, landlord's check, move-in cash, full monthly cost. Then read every line of the lease.", "Tope de renta, revisión del casero, efectivo para mudarte, costo mensual completo. Luego lee cada línea del contrato.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="lk-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#lk-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#lk-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#lk").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Checked eight leases", "Revisaste ocho contratos"));
    if (G.score === N) FH.badge("lease-ready");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "You earn $2,800 a month before taxes. By the 30% rule, what's the most rent you should pay?", opts: ["$840", "$933", "$700", "$1,000"], a: 0, why: "$2,800 × 0.30 = $840." },
    { q: "A landlord requires income of 3 times the rent. Rent is $1,000. What income do you need?", opts: ["$3,000 a month", "$1,000 a month", "$3,333 a month", "$2,000 a month"], a: 0, why: "3 × $1,000 = $3,000 a month before taxes." },
    { q: "Rent is $800, the deposit is one month's rent, and the application fee is $40. How much cash do you need to move in?", opts: ["$1,640", "$840", "$1,600", "$2,440"], a: 0, why: "$800 first month + $800 deposit + $40 fee = $1,640." },
    { q: "What is a security deposit for?", opts: ["To cover unpaid rent or damage; the rest comes back after you move out", "It's the landlord's fee for the credit check", "It's your last month's rent, always", "It's a tip the landlord keeps"], a: 0, why: "The landlord holds it as protection, and state law sets a deadline to return what's left, with a written list of anything kept." },
    { q: "When you move out, which can the landlord charge to your deposit?", opts: ["A hole punched in the wall", "Paint that faded over two years", "Carpet worn from normal walking", "Light scuffs on the walls from everyday living"], a: 0, why: "Landlords can charge for damage, not normal wear and tear like faded paint or worn carpet." },
    { q: "You and a roommate signed one lease for $1,400. Your roommate moves out. What does joint liability mean for you?", opts: ["The landlord can ask you for the full $1,400", "You only ever owe your $700", "The lease ends automatically", "Your roommate's deposit pays the rest forever"], a: 0, why: "On a shared lease, each person is responsible for the whole rent." },
    { q: "A studio costs $1,000. A 2-bedroom costs $1,500, split with a roommate. How much less rent do you pay each month with the roommate?", opts: ["$250", "$500", "$750", "$0"], a: 0, why: `${fr("$1,500", "2")} = $750 each. $1,000 − $750 = $250 a month less.` },
    { q: "What's the best thing to do on move-in day?", opts: ["Walk through and take dated photos of every scratch and stain", "Paint the walls your favorite color", "Throw away the lease", "Skip the walk-through to save time"], a: 0, why: "Photos prove what was already there, so you aren't charged for it when you leave." },
  ];
  const QUIZ_ES = [
    { q: "Ganas $2,800 al mes antes de impuestos. Según la regla del 30%, ¿cuál es la renta máxima que deberías pagar?", opts: ["$840", "$933", "$700", "$1,000"], a: 0, why: "$2,800 × 0.30 = $840." },
    { q: "Un casero pide un ingreso de 3 veces la renta. La renta es $1,000. ¿Qué ingreso necesitas?", opts: ["$3,000 al mes", "$1,000 al mes", "$3,333 al mes", "$2,000 al mes"], a: 0, why: "3 × $1,000 = $3,000 al mes antes de impuestos." },
    { q: "La renta es $800, el depósito es un mes de renta y la cuota de solicitud es $40. ¿Cuánto efectivo necesitas para mudarte?", opts: ["$1,640", "$840", "$1,600", "$2,440"], a: 0, why: "$800 del primer mes + $800 de depósito + $40 de cuota = $1,640." },
    { q: "¿Para qué sirve el depósito de garantía?", opts: ["Para cubrir renta sin pagar o daños; el resto se te devuelve al mudarte", "Es la cuota del casero por revisar tu crédito", "Siempre es tu último mes de renta", "Es una propina que se queda el casero"], a: 0, why: "El casero lo guarda como protección, y la ley del estado fija un plazo para devolver lo que sobre, con una lista por escrito de lo que se quedó." },
    { q: "Al mudarte, ¿qué puede cobrar el casero de tu depósito?", opts: ["Un hoyo en la pared", "Pintura que se desgastó en dos años", "Alfombra gastada por caminar normalmente", "Raspones leves en las paredes por el uso diario"], a: 0, why: "El casero puede cobrar daños, no el desgaste normal como pintura desteñida o alfombra gastada." },
    { q: "Tú y un compañero de cuarto firmaron un contrato de $1,400. Tu compañero se va. ¿Qué significa para ti la responsabilidad conjunta?", opts: ["El casero te puede pedir los $1,400 completos", "Solo debes tus $700", "El contrato se termina solo", "El depósito de tu compañero paga el resto para siempre"], a: 0, why: "En un contrato compartido, cada persona responde por toda la renta." },
    { q: "Un estudio cuesta $1,000. Un departamento de 2 recámaras cuesta $1,500, compartido con un compañero. ¿Cuánto menos pagas de renta al mes con el compañero?", opts: ["$250", "$500", "$750", "$0"], a: 0, why: `${fr("$1,500", "2")} = $750 cada uno. $1,000 − $750 = $250 menos al mes.` },
    { q: "¿Qué es lo mejor que puedes hacer el día que te mudas?", opts: ["Recorrer el lugar y tomar fotos con fecha de cada rayón y mancha", "Pintar las paredes de tu color favorito", "Tirar el contrato", "Saltarte el recorrido para ahorrar tiempo"], a: 0, why: "Las fotos prueban lo que ya estaba ahí, para que no te lo cobren al irte." },
  ];

  FHLesson.init({ id: LESSON, short: "renting", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
