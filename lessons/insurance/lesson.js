// Unit 6, Lesson 1: Insurance: health, car and renters
(function () {
  const LESSON = "u6-insurance";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");

  // ---------- See it: two health plans ----------
  const PLANS = [
    { k: "a", n: T("Plan A · low premium", "Plan A · prima baja"), prem: 120, ded: 1500, co: 0.2, max: 5000 },
    { k: "b", n: T("Plan B · high premium", "Plan B · prima alta"), prem: 250, ded: 500, co: 0.1, max: 2500 },
  ];
  const care = (p, bill) => Math.min(p.max, Math.min(bill, p.ded) + Math.max(0, bill - p.ded) * p.co);
  const billEl = $("#hp-bill");
  const drawHp = () => {
    const bill = +billEl.value;
    $("#hp-bill-v").textContent = usd(bill);
    const rows = PLANS.map((p) => ({ ...p, c: care(p, bill), y: p.prem * 12 }));
    const top = Math.max(...PLANS.map((p) => p.prem * 12 + p.max));
    $("#hp-plans").innerHTML = rows.map((r) => `<div class="hp-row hp-${r.k}"><span>${r.n}</span><div class="hp-bar"><i class="hp-prem" style="width:${(100 * r.y) / top}%"></i><i class="hp-care" style="width:${(100 * r.c) / top}%"></i></div><b>${usd(r.y + r.c)}</b><small>${T(`${usd(r.y)} premiums + ${usd(r.c)} care`, `${usd(r.y)} de primas + ${usd(r.c)} de atención`)}</small></div>`).join("");
    const [a, b] = rows, ta = a.y + a.c, tb = b.y + b.c;
    $("#hp-msg").innerHTML = Math.abs(ta - tb) < 50
      ? T(`About a tie: ${usd(ta)} vs. ${usd(tb)}.`, `Casi un empate: ${usd(ta)} contra ${usd(tb)}.`)
      : ta < tb ? T(`Plan A is cheaper by <b>${usd(tb - ta)}</b> this year.`, `El Plan A sale <b>${usd(tb - ta)}</b> más barato este año.`)
      : T(`Plan B is cheaper by <b>${usd(ta - tb)}</b> this year.`, `El Plan B sale <b>${usd(ta - tb)}</b> más barato este año.`);
    fillRange(billEl);
  };
  billEl.addEventListener("input", drawHp);
  drawHp();

  // ---------- Play it: who pays? ----------
  const ROUNDS = [
    { facts: [T("Health plan: $1,500 deductible, then 20%", "Plan médico: deducible de $1,500, luego 20%"), T("Out-of-pocket max: $5,000", "Máximo de bolsillo: $5,000"), T("Bill: $800 for a doctor visit and tests", "Cuenta: $800 por consulta y estudios")],
      q: T("It's your first bill this year. How much do you pay?", "Es tu primera cuenta del año. ¿Cuánto pagas?"), opts: ["$800", "$160", "$0"], a: 0,
      why: T("$800 is less than the $1,500 deductible, so you pay all of it. Insurance starts sharing after the deductible.", "$800 es menos que el deducible de $1,500, así que lo pagas todo. El seguro empieza a compartir después del deducible.") },
    { facts: [T("Health plan: $1,500 deductible, then 20%", "Plan médico: deducible de $1,500, luego 20%"), T("Out-of-pocket max: $5,000", "Máximo de bolsillo: $5,000"), T("Bill: $8,000 for a broken wrist", "Cuenta: $8,000 por una muñeca rota")],
      q: T("How much do you pay?", "¿Cuánto pagas?"), opts: ["$2,800", "$1,600", "$8,000"], a: 0,
      why: T("$1,500 deductible + ($8,000 − $1,500) × 0.20 = $1,500 + $1,300 = $2,800.", "Deducible de $1,500 + ($8,000 − $1,500) × 0.20 = $1,500 + $1,300 = $2,800.") },
    { facts: [T("Health plan: $1,500 deductible, then 20%", "Plan médico: deducible de $1,500, luego 20%"), T("Out-of-pocket max: $5,000", "Máximo de bolsillo: $5,000"), T("Bill: $40,000 for surgery", "Cuenta: $40,000 por una cirugía")],
      q: T("How much do you pay?", "¿Cuánto pagas?"), opts: ["$5,000", "$9,200", "$8,000"], a: 0,
      why: T("The formula gives $1,500 + $38,500 × 0.20 = $9,200, but the out-of-pocket maximum caps you at $5,000.", "La fórmula da $1,500 + $38,500 × 0.20 = $9,200, pero el máximo de bolsillo te deja en $5,000.") },
    { facts: [T("Car: liability + collision", "Carro: responsabilidad civil + choque"), T("Collision deductible: $500", "Deducible de choque: $500"), T("You back into a pole. Repair: $2,300", "Le das en reversa a un poste. Reparación: $2,300")],
      q: T("How much do you pay?", "¿Cuánto pagas?"), opts: ["$500", "$2,300", "$1,800"], a: 0,
      why: T("Collision fixes your car after the $500 deductible. The insurer pays $2,300 − $500 = $1,800.", "La cobertura de choque arregla tu carro después del deducible de $500. El seguro paga $2,300 − $500 = $1,800.") },
    { facts: [T("Car: liability only", "Carro: solo responsabilidad civil"), T("A hailstorm dents your car. Repair: $1,200", "Una granizada abolla tu carro. Reparación: $1,200")],
      q: T("How much do you pay?", "¿Cuánto pagas?"), opts: ["$1,200", "$0", "$500"], a: 0,
      why: T("Liability only pays for damage you cause to others. Hail is covered by comprehensive, which you don't have, so you pay all $1,200.", "La responsabilidad civil solo paga daños que causas a otros. El granizo lo cubre la cobertura amplia, que no tienes, así que pagas los $1,200.") },
    { facts: [T("Renters insurance, $250 deductible", "Seguro de inquilino, deducible de $250"), T("A break-in: laptop $1,000, bike $600, TV $400 stolen", "Un robo: se llevan laptop de $1,000, bicicleta de $600 y TV de $400")],
      q: T("How much do you pay?", "¿Cuánto pagas?"), opts: ["$250", "$2,000", "$1,750"], a: 0,
      why: T("$1,000 + $600 + $400 = $2,000 stolen. You pay the $250 deductible; insurance pays $1,750.", "$1,000 + $600 + $400 = $2,000 robados. Pagas el deducible de $250; el seguro paga $1,750.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#wp-why"), nextB = $("#wp-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#wp-round").textContent = T(`Claim ${G.i + 1} of ${N}`, `Reclamo ${G.i + 1} de ${N}`);
    $("#wp-q").textContent = r.q;
    $("#wp-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#wp-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next claim", "Siguiente reclamo")} <span class="arrow">→</span>`;
  };
  $("#wp-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#wp-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#wp-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#wp-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Claims pro", "Experto en reclamos") : G.score >= 4 ? T("Well covered", "Bien cubierto") : T("Review the deductible steps", "Repasa los pasos del deducible")}</b><p>${T("Deductible first, then your share, never more than the maximum. And check which coverage you actually have.", "Primero el deducible, luego tu parte, nunca más que el máximo. Y revisa qué cobertura tienes de verdad.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="wp-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#wp-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#wp-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#wp").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Settled six claims", "Resolviste seis reclamos"));
    if (G.score === N) FH.badge("claims-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Why can an insurance company pay for one person's $40,000 surgery?", opts: ["Many people pay premiums, and only a few have big costs in a year", "The government pays every claim", "It charges the sick person more afterward", "It only covers people who never get sick"], a: 0, why: "That's pooling risk: lots of premiums from people who stay healthy pay for the few who don't." },
    { q: "What is a deductible?", opts: ["The amount you pay before insurance starts paying", "Your monthly payment for insurance", "The most you'll ever pay in a year", "A discount for not using insurance"], a: 0, why: "The deductible comes first. The monthly payment is the premium; the most you pay is the out-of-pocket maximum." },
    { q: "Your plan has a $1,500 deductible and 20% coinsurance. You get an $8,000 bill. How much do you pay?", opts: ["$2,800", "$1,600", "$1,500", "$6,500"], a: 0, why: "$1,500 + ($8,000 − $1,500) × 0.20 = $1,500 + $1,300 = $2,800." },
    { q: "Your plan's out-of-pocket maximum is $5,000. A surgery bill would make your share $9,200. What do you pay?", opts: ["$5,000", "$9,200", "$4,200", "$0"], a: 0, why: "The out-of-pocket maximum caps what you pay for covered care in a year. After $5,000, the insurer pays 100%." },
    { q: "Plan A costs $120 a month; Plan B costs $250. In a year you'd pay $300 of care on either plan. Which costs less for the year?", opts: ["Plan A: $1,740 vs. $3,300", "Plan B, because it has a lower deductible", "They cost the same", "Plan A: $420 vs. $550"], a: 0, why: "Plan A: 12 × $120 + $300 = $1,740. Plan B: 12 × $250 + $300 = $3,300. Compare by the full year." },
    { q: "Which car coverage pays for damage you cause to someone else's car?", opts: ["Liability", "Collision", "Comprehensive", "Renters"], a: 0, why: "Liability pays others, and nearly every state requires it. Collision and comprehensive pay for your own car." },
    { q: "A hailstorm dents your car. Which coverage pays for it?", opts: ["Comprehensive", "Liability", "Collision", "None ever does"], a: 0, why: "Comprehensive covers damage that isn't a crash: hail, theft, fire, hitting a deer." },
    { q: "You rent an apartment and your laptop and bike are stolen. Whose insurance covers them?", opts: ["Your renters insurance, if you have it", "The landlord's insurance", "Your car insurance", "Your health insurance"], a: 0, why: "The landlord's policy covers the building, not your things. Renters insurance covers your belongings, minus your deductible." },
  ];
  const QUIZ_ES = [
    { q: "¿Por qué una aseguradora puede pagar la cirugía de $40,000 de una persona?", opts: ["Mucha gente paga primas y solo unos pocos tienen gastos grandes en un año", "El gobierno paga todos los reclamos", "Le cobra más a la persona enferma después", "Solo cubre a gente que nunca se enferma"], a: 0, why: "Eso es compartir el riesgo: muchas primas de gente que sigue sana pagan a los pocos que no." },
    { q: "¿Qué es un deducible?", opts: ["Lo que pagas antes de que el seguro empiece a pagar", "Tu pago mensual del seguro", "Lo máximo que pagarás en un año", "Un descuento por no usar el seguro"], a: 0, why: "El deducible va primero. El pago mensual es la prima; lo máximo que pagas es el máximo de bolsillo." },
    { q: "Tu plan tiene deducible de $1,500 y coaseguro de 20%. Te llega una cuenta de $8,000. ¿Cuánto pagas?", opts: ["$2,800", "$1,600", "$1,500", "$6,500"], a: 0, why: "$1,500 + ($8,000 − $1,500) × 0.20 = $1,500 + $1,300 = $2,800." },
    { q: "El máximo de bolsillo de tu plan es $5,000. Por una cirugía tu parte sería $9,200. ¿Cuánto pagas?", opts: ["$5,000", "$9,200", "$4,200", "$0"], a: 0, why: "El máximo de bolsillo limita lo que pagas por atención cubierta en un año. Después de $5,000, el seguro paga el 100%." },
    { q: "El Plan A cuesta $120 al mes; el Plan B, $250. En un año tendrías $300 de atención con cualquiera. ¿Cuál cuesta menos en el año?", opts: ["El Plan A: $1,740 contra $3,300", "El Plan B, porque tiene deducible más bajo", "Cuestan lo mismo", "El Plan A: $420 contra $550"], a: 0, why: "Plan A: 12 × $120 + $300 = $1,740. Plan B: 12 × $250 + $300 = $3,300. Compara por el año completo." },
    { q: "¿Qué cobertura de carro paga los daños que le causas al carro de otra persona?", opts: ["Responsabilidad civil", "Choque", "Amplia", "De inquilino"], a: 0, why: "La responsabilidad civil paga a otros, y casi todos los estados la exigen. Choque y amplia pagan tu propio carro." },
    { q: "Una granizada abolla tu carro. ¿Qué cobertura lo paga?", opts: ["Amplia", "Responsabilidad civil", "Choque", "Ninguna"], a: 0, why: "La cobertura amplia cubre daños que no son choques: granizo, robo, incendio, atropellar un venado." },
    { q: "Rentas un departamento y te roban la laptop y la bicicleta. ¿Qué seguro las cubre?", opts: ["Tu seguro de inquilino, si lo tienes", "El seguro del dueño", "Tu seguro de carro", "Tu seguro médico"], a: 0, why: "La póliza del dueño cubre el edificio, no tus cosas. El seguro de inquilino cubre tus pertenencias, menos tu deducible." },
  ];

  FHLesson.init({ id: LESSON, short: "insurance", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
