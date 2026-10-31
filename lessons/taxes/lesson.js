// Unit 2, Lesson 2: How taxes work
(function () {
  const LESSON = "u2-taxes";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const STD = 16100;
  // 2026 single filer. Each bucket: [rate, size]. The first is the untaxed standard deduction.
  const BUCKETS = [[0, STD], [0.10, 12400], [0.12, 38000], [0.22, 55300], [0.24, 96075]];
  const NAMES = [T("Untaxed", "Sin impuesto"), "10%", "12%", "22%", "24%"];
  const pour = (gross) => {
    let left = gross;
    return BUCKETS.map(([rate, size]) => { const amt = Math.max(0, Math.min(left, size)); left -= amt; return { rate, size, amt, tax: amt * rate }; });
  };
  const lastBucket = (fill) => { let i = 0; fill.forEach((b, j) => { if (b.amt > 0) i = j; }); return i; };
  const bucketsHTML = (fill, opts = {}) => fill.map((b, i) => {
    const pct = (100 * b.amt) / b.size;
    const tag = opts.buttons ? "button" : "div";
    return `<${tag} ${opts.buttons ? `type="button" data-i="${i}"` : ""} class="tx-b${i === 0 ? " free" : ""}${b.amt > 0 ? " on" : ""}">
      <span class="tx-cup"><i style="height:${pct.toFixed(1)}%"></i><b>${NAMES[i]}</b></span>
      ${opts.buttons ? "" : `<small>${usd(b.amt)}${i ? `<br>${T("tax", "impuesto")} ${usd(b.tax)}` : ""}</small>`}
    </${tag}>`;
  }).join("");

  // ---------- See it: bracket calculator ----------
  const payEl = $("#tx-pay");
  const draw = () => {
    const gross = +payEl.value, fill = pour(gross);
    const taxable = Math.max(0, gross - STD), tax = fill.reduce((s, b) => s + b.tax, 0);
    const top = lastBucket(fill), marginal = fill[top].rate;
    $("#tx-pay-v").textContent = usd(gross);
    $("#tx-buckets").innerHTML = bucketsHTML(fill);
    const rows = [
      [T("Gross income", "Ingreso bruto"), T("your yearly pay", "tu sueldo del año"), usd(gross), ""],
      [T("Standard deduction", "Deducción estándar"), T("never taxed", "nunca paga impuesto"), `−${usd(Math.min(gross, STD))}`, "save"],
      [T("Taxable income", "Ingreso gravable"), `${usd(gross)} − ${usd(STD)}`, usd(taxable), ""],
      ...fill.slice(1).filter((b) => b.amt > 0).map((b) => [T(`${Math.round(b.rate * 100)}% bucket`, `Cubeta del ${Math.round(b.rate * 100)}%`), `${Math.round(b.rate * 100)}% × ${usd(b.amt)}`, usd(b.tax), "tax"]),
      [T("Federal income tax", "Impuesto federal sobre la renta"), T(`about ${usd(tax / 26)} per paycheck, every other week`, `unos ${usd(tax / 26)} por cheque, cada dos semanas`), usd(tax), "net"],
    ];
    $("#tx-lines").innerHTML = rows.map(([a, b, c, cls]) => `<div class="ps-row ${cls}"><span><b>${a}</b><small>${b}</small></span><b>${c}</b></div>`).join("");
    const eff = gross ? (100 * tax) / gross : 0;
    $("#tx-msg").innerHTML = taxable === 0
      ? T(`All ${usd(gross)} fits under the ${usd(STD)} standard deduction, so you owe <b>$0</b> of federal income tax.`, `Los ${usd(gross)} caben debajo de la deducción estándar de ${usd(STD)}, así que debes <b>$0</b> de impuesto federal.`)
      : T(`Marginal rate <b>${Math.round(marginal * 100)}%</b>: your next dollar is taxed ${Math.round(marginal * 100)} cents. Effective rate <b>${eff.toFixed(1)}%</b>: ${usd(tax)} out of ${usd(gross)}.`,
        `Tasa marginal <b>${Math.round(marginal * 100)}%</b>: tu siguiente dólar paga ${Math.round(marginal * 100)} centavos. Tasa efectiva <b>${eff.toFixed(1)}%</b>: ${usd(tax)} de ${usd(gross)}.`);
    $("#tx-msg").dataset.tone = "good";
    fillRange(payEl);
  };
  payEl.addEventListener("input", draw);
  draw();

  // Where taxes go: $100 of federal spending, FY2025.
  const SPEND = [[26, T("Health", "Salud"), "#3f7d6e"], [23, T("Social Security", "Seguro Social"), "#5a7fb0"], [14, T("Interest", "Intereses"), "#c0703c"], [13, T("Defense", "Defensa"), "#7a6a8e"], [24, T("Everything else", "Todo lo demás"), "#9a948a"]];
  $("#tx-spend").innerHTML = `<div class="tx-sbar">${SPEND.map(([v, , c]) => `<i style="flex:${v};background:${c}"></i>`).join("")}</div>
    <div class="tx-skeys">${SPEND.map(([v, n, c]) => `<span><i style="background:${c}"></i>${n} <b>$${v}</b></span>`).join("")}</div>`;

  // ---------- Play it: pour the paycheck ----------
  const tax = (g) => pour(g).reduce((s, b) => s + b.tax, 0);
  const ROUNDS = [
    { pay: 15000, why: T("$15,000 is under the $16,100 standard deduction. Taxable income is $0, so every dollar is untaxed and the tax is $0.", "$15,000 está debajo de la deducción estándar de $16,100. El ingreso gravable es $0, así que ningún dólar paga impuesto y el impuesto es $0.") },
    { pay: 22000, why: T("$22,000 − $16,100 = $5,900 taxable. That fits inside the 10% bucket (up to $12,400): 10% × $5,900 = $590 of tax.", "$22,000 − $16,100 = $5,900 gravables. Cabe en la cubeta del 10% (hasta $12,400): 10% × $5,900 = $590 de impuesto.") },
    { pay: 55000, why: T("Your offer: $55,000 − $16,100 = $38,900 taxable. It fills the 10% bucket and $26,500 spills into 12%. Tax: $1,240 + $3,180 = $4,420.", "Tu oferta: $55,000 − $16,100 = $38,900 gravables. Llena la cubeta del 10% y $26,500 pasan a la del 12%. Impuesto: $1,240 + $3,180 = $4,420.") },
    { pay: 90000, why: T("$90,000 − $16,100 = $73,900 taxable. It passes $50,400, so the last $23,500 lands in 22%. Tax: $1,240 + $4,560 + $5,170 = $10,970.", "$90,000 − $16,100 = $73,900 gravables. Pasa de $50,400, así que los últimos $23,500 caen en el 22%. Impuesto: $1,240 + $4,560 + $5,170 = $10,970.") },
    { story: T("You worked the campus job for only <b>6 paychecks</b> this summer: 6 × $650 = <b>$3,900</b>. Each check withheld <b>$3.08</b>, and your W-4 was filled out normally.", "Trabajaste en el campus solo <b>6 cheques</b> este verano: 6 × $650 = <b>$3,900</b>. A cada cheque le retuvieron <b>$3.08</b> y tu W-4 estaba bien llenado."),
      a: 0, why: T("$3,900 is under $16,100, so you owe $0. But 6 × $3.08 = $18.48 was withheld, so it comes back: an $18.48 refund.", "$3,900 está debajo de $16,100, así que debes $0. Pero te retuvieron 6 × $3.08 = $18.48, así que te lo regresan: un reembolso de $18.48.") },
    { story: T("All year you work <b>two jobs</b>: $650 and $500 every other week. You left <b>Step 2</b> blank on both W-4s. Job 1 withheld $80.08 for the year; job 2 withheld $0.", "Todo el año tienes <b>dos trabajos</b>: $650 y $500 cada dos semanas. Dejaste el <b>Paso 2</b> en blanco en los dos W-4. El trabajo 1 retuvo $80.08 en el año; el trabajo 2 retuvo $0."),
      a: 1, why: T("Total pay $29,900, taxable $13,800, real tax $1,240 + $168 = $1,408. Only $80.08 was withheld, so you owe $1,327.92. Checking Step 2 would have fixed it.", "Sueldo total $29,900, gravable $13,800, impuesto real $1,240 + $168 = $1,408. Solo te retuvieron $80.08, así que debes $1,327.92. Marcar el Paso 2 lo habría evitado.") },
  ];
  const OPTS = [T("Refund", "Reembolso"), T("Owe", "Debes"), T("About even", "Casi parejo")];
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#pp-why"), nextB = $("#pp-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#pp-round").textContent = T(`Round ${G.i + 1} of 6`, `Ronda ${G.i + 1} de 6`);
    if (r.pay !== undefined) {
      $("#pp-ask").textContent = T("Where does the last dollar land?", "¿Dónde cae el último dólar?");
      $("#pp-scene").innerHTML = T(`A single person earns <b>${usd(r.pay)}</b> a year. Tap the bucket where the last dollar lands.`, `Una persona soltera gana <b>${usd(r.pay)}</b> al año. Toca la cubeta donde cae el último dólar.`);
      $("#pp-buckets").innerHTML = bucketsHTML(pour(0), { buttons: true });
      $("#pp-buckets").hidden = false; $("#pp-opts").hidden = true;
    } else {
      $("#pp-ask").textContent = T("Refund, owe, or about even?", "¿Reembolso, debes o casi parejo?");
      $("#pp-scene").innerHTML = r.story;
      $("#pp-opts").innerHTML = OPTS.map((o, i) => `<button type="button" class="fd-opt" data-i="${i}">${o}</button>`).join("");
      $("#pp-buckets").hidden = true; $("#pp-opts").hidden = false;
    }
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next round", "Siguiente ronda")} <span class="arrow">→</span>`;
  };
  const answer = (i, el) => {
    if (G.done) return;
    G.done = true;
    const r = ROUNDS[G.i];
    const right = r.pay !== undefined ? lastBucket(pour(r.pay)) : r.a;
    const ok = i === right;
    G.n++; if (ok) G.score++;
    if (r.pay !== undefined) {
      $("#pp-buckets").innerHTML = bucketsHTML(pour(r.pay));
      const cells = $$("#pp-buckets .tx-b");
      cells[right].classList.add("right");
      if (!ok) cells[i].classList.add("wrong");
    } else {
      $$("#pp-opts .fd-opt").forEach((b) => { b.disabled = true; if (+b.dataset.i === right) b.classList.add(ok ? "right" : "alt"); });
      if (!ok) el.classList.add("wrong");
    }
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#pp-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === ROUNDS.length - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  };
  $("#pp-buckets").addEventListener("click", (e) => { const b = e.target.closest("button.tx-b"); if (b) answer(+b.dataset.i, b); });
  $("#pp-opts").addEventListener("click", (e) => { const b = e.target.closest(".fd-opt"); if (b) answer(+b.dataset.i, b); });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < ROUNDS.length - 1) { G.i++; start(); return; }
    const res = $("#pp-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/6</span><div><b>${G.score === 6 ? T("Tax pro", "Experto en impuestos") : G.score >= 4 ? T("Solid", "Muy bien") : T("Try the calculator, then play again", "Prueba la calculadora y juega otra vez")}</b><p>${T("Subtract $16,100, fill the buckets in order, and compare what was withheld with what you owe.", "Resta $16,100, llena las cubetas en orden y compara lo que te retuvieron con lo que debes.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="pp-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#pp-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#pp-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#pp").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / 6) * 100));
    if (first) FH.addXP(50, T("Poured six paychecks", "Repartiste seis sueldos"));
    if (G.score === 6) FH.badge("bracket-pro", T("Bracket Pro", "Experto en categorías"));
    FH.save();
  });
  start();

  // ---------- Check ----------
  const fr = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "A single person earns $55,000 in 2026. What is their taxable income?", opts: ["$38,900", "$55,000", "$71,100", "$42,600"], a: 0, why: "Taxable income = gross − standard deduction: $55,000 − $16,100 = $38,900." },
    { q: "Taxable income is $38,900. Using the 2026 brackets (10% to $12,400, 12% to $50,400), what is the federal income tax?", opts: ["$4,420", "$4,668", "$3,890", "$8,558"], a: 0, why: "Fill the buckets in order: 10% × $12,400 = $1,240, plus 12% × $26,500 = $3,180. Total $4,420. $4,668 would wrongly tax every dollar at 12%." },
    { q: "With $38,900 of taxable income, what is the marginal tax rate?", opts: ["12%", "10%", "8%", "22%"], a: 0, why: "The marginal rate is the rate of the highest bucket reached. $38,900 is between $12,400 and $50,400: the 12% bucket." },
    { q: "Federal income tax is $4,420 on a $55,000 salary. What is the effective tax rate?", opts: ["About 8%", "12%", "10%", "About 29%"], a: 0, why: `Effective rate = ${fr("total tax", "gross income")} = ${fr("$4,420", "$55,000")} = 0.080, about 8%.` },
    { q: "Maya's raise moves $3,500 of her taxable income into the 22% bracket. What happens to her income tax?", opts: ["Only that $3,500 is taxed at 22%: $770 more", "All her income is now taxed at 22%", "She takes home less than before the raise", "Nothing changes until she files"], a: 0, why: "Brackets fill in order. The dollars in the 10% and 12% buckets keep those rates; only the $3,500 above $50,400 is taxed at 22%: $770. She keeps $2,730 more." },
    { q: "What does a W-4 do?", opts: ["Tells your employer how much federal income tax to withhold", "Reports your yearly pay to you after the year ends", "Is the tax return you file in April", "Sets your hourly rate"], a: 0, why: "You fill out a W-4 when you start a job. Your employer uses it to decide how much income tax to take from each paycheck." },
    { q: "You worked half the year. $40.04 was withheld, but you owe $0. What happens?", opts: ["You get a $40.04 refund", "You owe $40.04", "The $40.04 is lost", "Your employer keeps it"], a: 0, why: "Refund = withheld − owed = $40.04 − $0 = $40.04. A refund is your own overpaid money coming back." },
    { q: "You have two jobs. What should you do on each W-4 so you don't owe a lot in April?", opts: ["Check the box in Step 2", "Leave everything blank", "Claim a dependent in Step 3", "Skip signing Step 5"], a: 0, why: "Step 2 tells each employer you have more than one job. Without it, each one gives you the full standard deduction and withholds too little." },
  ];
  const QUIZ_ES = [
    { q: "Una persona soltera gana $55,000 en 2026. ¿Cuál es su ingreso gravable?", opts: ["$38,900", "$55,000", "$71,100", "$42,600"], a: 0, why: "Ingreso gravable = bruto − deducción estándar: $55,000 − $16,100 = $38,900." },
    { q: "El ingreso gravable es $38,900. Con las categorías de 2026 (10% hasta $12,400, 12% hasta $50,400), ¿cuánto es el impuesto federal?", opts: ["$4,420", "$4,668", "$3,890", "$8,558"], a: 0, why: "Llena las cubetas en orden: 10% × $12,400 = $1,240, más 12% × $26,500 = $3,180. Total $4,420. $4,668 cobraría 12% a cada dólar, y eso está mal." },
    { q: "Con $38,900 de ingreso gravable, ¿cuál es la tasa marginal?", opts: ["12%", "10%", "8%", "22%"], a: 0, why: "La tasa marginal es la de la cubeta más alta a la que llegas. $38,900 está entre $12,400 y $50,400: la cubeta del 12%." },
    { q: "El impuesto federal es $4,420 sobre un sueldo de $55,000. ¿Cuál es la tasa efectiva?", opts: ["Cerca del 8%", "12%", "10%", "Cerca del 29%"], a: 0, why: `Tasa efectiva = ${fr("impuesto total", "ingreso bruto")} = ${fr("$4,420", "$55,000")} = 0.080, cerca del 8%.` },
    { q: "El aumento de Maya pasa $3,500 de su ingreso gravable a la categoría del 22%. ¿Qué pasa con su impuesto?", opts: ["Solo esos $3,500 pagan 22%: $770 más", "Todo su ingreso ahora paga 22%", "Se lleva menos a casa que antes del aumento", "Nada cambia hasta que declara"], a: 0, why: "Las categorías se llenan en orden. Los dólares de las cubetas del 10% y 12% conservan esas tasas; solo los $3,500 arriba de $50,400 pagan 22%: $770. Se queda con $2,730 más." },
    { q: "¿Para qué sirve el W-4?", opts: ["Le dice a tu empleador cuánto impuesto federal retener", "Te informa tu sueldo del año cuando termina", "Es la declaración que presentas en abril", "Fija tu tarifa por hora"], a: 0, why: "Llenas un W-4 al empezar un trabajo. Tu empleador lo usa para decidir cuánto impuesto quitarte de cada cheque." },
    { q: "Trabajaste medio año. Te retuvieron $40.04, pero debes $0. ¿Qué pasa?", opts: ["Recibes un reembolso de $40.04", "Debes $40.04", "Los $40.04 se pierden", "Tu empleador se los queda"], a: 0, why: "Reembolso = retenido − debido = $40.04 − $0 = $40.04. Un reembolso es tu propio dinero que pagaste de más y regresa." },
    { q: "Tienes dos trabajos. ¿Qué debes hacer en cada W-4 para no deber mucho en abril?", opts: ["Marcar la casilla del Paso 2", "Dejar todo en blanco", "Declarar un dependiente en el Paso 3", "No firmar el Paso 5"], a: 0, why: "El Paso 2 le dice a cada empleador que tienes más de un trabajo. Sin eso, cada uno te da la deducción estándar completa y retiene muy poco." },
  ];

  FHLesson.init({ id: LESSON, short: "taxes", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
