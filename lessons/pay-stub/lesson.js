// Unit 2, Lesson 1: Read your first pay stub
(function () {
  const LESSON = "u2-pay-stub";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const r2 = (x) => Math.round((x + 1e-9) * 100) / 100;
  // 2026 single filer, paid every other week: simplified IRS percentage method.
  const BRACKETS = [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24]];
  const fedPerCheck = (taxable) => {
    const t = Math.max(0, taxable * 26 - 16100);
    let tax = 0, lo = 0;
    for (const [hi, p] of BRACKETS) { tax += Math.max(0, Math.min(t, hi) - lo) * p; lo = hi; }
    return r2(tax / 26);
  };
  const stubOf = (rate, hrs, k = 0) => {
    const gross = r2(rate * hrs), k401 = r2(gross * k / 100);
    const fed = fedPerCheck(gross - k401), ss = r2(gross * 0.062), med = r2(gross * 0.0145);
    return { rate, hrs, gross, k401, fed, ss, med, net: r2(gross - k401 - fed - ss - med) };
  };

  // ---------- See it: pay stub calculator ----------
  const rateEl = $("#ps-rate"), hrsEl = $("#ps-hrs");
  let k = 0;
  const draw = () => {
    const s = stubOf(+rateEl.value, +hrsEl.value, k);
    $("#ps-rate-v").textContent = cents(s.rate);
    $("#ps-hrs-v").textContent = s.hrs;
    const rows = [
      [T("Gross pay", "Sueldo bruto"), `${s.hrs} × ${cents(s.rate)}`, cents(s.gross), ""],
      ...(k ? [[T("401(k), pre-tax", "401(k), antes de impuestos"), `5% × ${cents(s.gross)}`, `−${cents(s.k401)}`, "save"]] : []),
      [T("Federal income tax", "Impuesto federal sobre la renta"), T("10% above $16,100 a year", "10% sobre lo que pase de $16,100 al año"), `−${cents(s.fed)}`, "tax"],
      [T("Social Security", "Seguro Social"), `6.2% × ${cents(s.gross)}`, `−${cents(s.ss)}`, "tax"],
      ["Medicare", `1.45% × ${cents(s.gross)}`, `−${cents(s.med)}`, "tax"],
      [T("State income tax", "Impuesto estatal"), T("none in this example", "ninguno en este ejemplo"), "$0.00", "tax"],
      [T("Net pay", "Sueldo neto"), T("lands in your account", "llega a tu cuenta"), cents(s.net), "net"],
    ];
    $("#ps-lines").innerHTML = rows.map(([a, b, c, cls]) => `<div class="ps-row ${cls}"><span><b>${a}</b><small>${b}</small></span><b>${c}</b></div>`).join("");
    const taxes = s.fed + s.ss + s.med, pct = (x) => `${(100 * x / s.gross).toFixed(1)}%`;
    $("#ps-bar").innerHTML = `<i class="net" style="width:${pct(s.net)}"></i>${k ? `<i class="save" style="width:${pct(s.k401)}"></i>` : ""}<i class="tax" style="width:${pct(taxes)}"></i>`;
    const keep = Math.round(100 * s.net / s.gross);
    $("#ps-msg").innerHTML = T(`You keep <b>${cents(s.net)}</b> of ${cents(s.gross)}, about <b>${keep}%</b>.${k ? ` Another ${cents(s.k401)} goes to your 401(k), and it's still yours.` : ""} Taxes take ${cents(r2(taxes))}.`,
      `Te quedas con <b>${cents(s.net)}</b> de ${cents(s.gross)}, cerca del <b>${keep}%</b>.${k ? ` Otros ${cents(s.k401)} van a tu 401(k), y siguen siendo tuyos.` : ""} Los impuestos se llevan ${cents(r2(taxes))}.`);
    $("#ps-msg").dataset.tone = "good";
    fillRange(rateEl); fillRange(hrsEl);
  };
  rateEl.addEventListener("input", draw);
  hrsEl.addEventListener("input", draw);
  $$("#ps-k .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#ps-k .chip").forEach((x) => x.classList.toggle("on", x === c));
    k = +c.dataset.v; draw();
  }));
  draw();

  // ---------- Play it: stub detective ----------
  const LINES = [
    ["hrs", T("Hours", "Horas")], ["rate", T("Rate", "Tarifa")], ["gross", T("Gross pay", "Sueldo bruto")],
    ["fed", T("Federal income tax", "Impuesto federal")], ["ss", T("Social Security", "Seguro Social")], ["med", "Medicare"], ["net", T("Net pay", "Sueldo neto")],
  ];
  const base = stubOf(16.25, 40);
  const ROUNDS = [
    { scene: T("Your timesheet says you worked <b>40 hours</b> at <b>$16.25</b>.", "Tu hoja de horas dice que trabajaste <b>40 horas</b> a <b>$16.25</b>."),
      stub: stubOf(16.25, 36), bad: "hrs", why: T("The stub pays 36 hours, not 40. Every number after it is right for 36 hours, so you'd only catch it by checking hours first. You're owed 4 × $16.25 = $65 more in gross pay.", "El talón paga 36 horas, no 40. Todo lo demás está bien para 36 horas, así que solo lo notas si revisas las horas primero. Te deben 4 × $16.25 = $65 más de sueldo bruto.") },
    { scene: T("Your offer letter says <b>$16.25 an hour</b>. You worked 40 hours.", "Tu carta de oferta dice <b>$16.25 la hora</b>. Trabajaste 40 horas."),
      stub: stubOf(15.25, 40), bad: "rate", why: T("The rate is $15.25 instead of $16.25. That's $1 × 40 = $40 less gross pay.", "La tarifa es $15.25 en vez de $16.25. Son $1 × 40 = $40 menos de sueldo bruto.") },
    { scene: T("40 hours at $16.25. Social Security is 6.2%.", "40 horas a $16.25. El Seguro Social es 6.2%."),
      stub: Object.assign({}, base, { ss: 65, net: r2(650 - 3.08 - 65 - 9.43) }), bad: "ss", why: T("6.2% × $650 = $40.30, not $65.00. $65 would be 10%.", "6.2% × $650 = $40.30, no $65.00. $65 sería el 10%.") },
    { scene: T("40 hours at $16.25. Check every line.", "40 horas a $16.25. Revisa cada línea."),
      stub: base, bad: null, why: T("$650 gross, $3.08 federal, $40.30 Social Security, $9.43 Medicare, and $650 − $52.81 = $597.19 net. All correct.", "$650 bruto, $3.08 federal, $40.30 de Seguro Social, $9.43 de Medicare, y $650 − $52.81 = $597.19 neto. Todo correcto.") },
    { scene: T("40 hours at $16.25. Your bank shows a deposit of $579.19.", "40 horas a $16.25. Tu banco muestra un depósito de $579.19."),
      stub: Object.assign({}, base, { net: 579.19 }), bad: "net", why: T("$650.00 − $3.08 − $40.30 − $9.43 = $597.19. The stub, and the deposit, are $18 short.", "$650.00 − $3.08 − $40.30 − $9.43 = $597.19. Al talón, y al depósito, les faltan $18.") },
    { scene: T("40 hours at $16.25. Medicare is 1.45% of every paycheck.", "40 horas a $16.25. Medicare es 1.45% de cada cheque."),
      stub: Object.assign({}, base, { med: 0, net: r2(650 - 3.08 - 40.3) }), bad: "med", why: T("Medicare is $0.00, but it should be 1.45% × $650 = $9.43. It looks like a bonus, but you'd owe it later.", "Medicare está en $0.00, pero debería ser 1.45% × $650 = $9.43. Parece un regalo, pero lo deberías después.") },
  ];
  const fmt = (key, s) => key === "hrs" ? String(s.hrs) : key === "rate" ? cents(s.rate) : (["fed", "ss", "med"].includes(key) ? "−" : "") + cents(s[key]);
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#sd-why"), nextB = $("#sd-next"), okB = $("#sd-ok");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#sd-round").textContent = T(`Stub ${G.i + 1} of 6`, `Talón ${G.i + 1} de 6`);
    $("#sd-scene").innerHTML = r.scene;
    $("#sd-stub").innerHTML = LINES.map(([key, name]) => `<button type="button" class="sd-line${key === "net" ? " net" : ""}" data-k="${key}"><span>${name}</span><b>${fmt(key, r.stub)}</b></button>`).join("");
    okB.disabled = false; okB.className = "fd-opt sd-ok";
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next stub", "Siguiente talón")} <span class="arrow">→</span>`;
  };
  const pick = (key, el) => {
    if (G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], right = key === r.bad;
    G.n++; if (right) G.score++;
    $$("#sd-stub .sd-line").forEach((b) => { b.disabled = true; if (b.dataset.k === r.bad) b.classList.add(right ? "right" : "alt"); });
    okB.disabled = true;
    if (r.bad === null) okB.classList.add(right ? "right" : "alt");
    if (!right) el.classList.add("wrong");
    whyEl.innerHTML = `<b>${right ? T("Caught it.", "Lo encontraste.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = right ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#sd-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === ROUNDS.length - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  };
  $("#sd-stub").addEventListener("click", (e) => { const b = e.target.closest(".sd-line"); if (b) pick(b.dataset.k, b); });
  okB.addEventListener("click", () => pick(null, okB));
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < ROUNDS.length - 1) { G.i++; start(); return; }
    const res = $("#sd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/6</span><div><b>${G.score === 6 ? T("Payroll pro", "Experto en nómina") : G.score >= 4 ? T("Sharp eyes", "Buen ojo") : T("Check line by line next time", "La próxima, revisa línea por línea")}</b><p>${T("Hours, rate, gross, each tax, then net. Check them in that order and no mistake gets past you.", "Horas, tarifa, bruto, cada impuesto y luego el neto. Revísalos en ese orden y ningún error se te escapa.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="sd-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#sd-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#sd-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#sd").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / 6) * 100));
    if (first) FH.addXP(50, T("Checked six pay stubs", "Revisaste seis talones de pago"));
    if (G.score === 6) FH.badge("stub-detective", T("Stub Detective", "Detective de talones"));
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is gross pay?", opts: ["What you earn before anything is taken out", "What lands in your bank account", "Only the taxes on your paycheck", "Your pay after the standard deduction"], a: 0, why: "Gross pay is hours × rate, before taxes. What lands in your account is net pay." },
    { q: "Your gross pay is $1,000. How much Social Security tax is withheld?", opts: ["$62.00", "$14.50", "$76.50", "$100.00"], a: 0, why: "Social Security is 6.2%: $1,000 × 0.062 = $62.00." },
    { q: "Your gross pay is $1,000. How much Medicare tax is withheld?", opts: ["$14.50", "$62.00", "$1.45", "$7.65"], a: 0, why: "Medicare is 1.45%: $1,000 × 0.0145 = $14.50." },
    { q: "Together, Social Security and Medicare (FICA) take what share of your gross pay?", opts: ["7.65%", "6.2%", "10%", "15.3%"], a: 0, why: "6.2% + 1.45% = 7.65%. Your employer pays another 7.65% on top, which is where 15.3% comes from, but that part isn't taken from you." },
    { q: "Your campus job pays $650 every other week. Why is so little federal income tax withheld?", opts: ["Most of your yearly pay is under the $16,100 standard deduction", "Students don't pay federal income tax", "FICA replaces income tax for part-time jobs", "Your employer pays your income tax"], a: 0, why: "$650 × 26 = $16,900 a year. Only $800 is above the $16,100 standard deduction, so the tax is 10% × $800 = $80 a year, or $3.08 a check." },
    { q: "Gross pay is $800 and $90 is taken out in total. What is your net pay?", opts: ["$710", "$890", "$800", "$90"], a: 0, why: "Net pay = gross − everything taken out: $800 − $90 = $710." },
    { q: "You put 5% of your pay into a 401(k) as a pre-tax deduction. Which tax does it lower?", opts: ["Federal income tax", "Social Security tax", "Medicare tax", "All three equally"], a: 0, why: "A pre-tax 401(k) comes out before income tax is figured, so you're taxed on less. Social Security and Medicare still apply to it." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es el sueldo bruto?", opts: ["Lo que ganas antes de que te quiten algo", "Lo que llega a tu cuenta de banco", "Solo los impuestos de tu cheque", "Tu sueldo después de la deducción estándar"], a: 0, why: "El sueldo bruto es horas × tarifa, antes de impuestos. Lo que llega a tu cuenta es el sueldo neto." },
    { q: "Tu sueldo bruto es $1,000. ¿Cuánto se retiene de Seguro Social?", opts: ["$62.00", "$14.50", "$76.50", "$100.00"], a: 0, why: "El Seguro Social es 6.2%: $1,000 × 0.062 = $62.00." },
    { q: "Tu sueldo bruto es $1,000. ¿Cuánto se retiene de Medicare?", opts: ["$14.50", "$62.00", "$1.45", "$7.65"], a: 0, why: "Medicare es 1.45%: $1,000 × 0.0145 = $14.50." },
    { q: "Juntos, el Seguro Social y Medicare (FICA), ¿qué parte de tu sueldo bruto se llevan?", opts: ["7.65%", "6.2%", "10%", "15.3%"], a: 0, why: "6.2% + 1.45% = 7.65%. Tu empleador paga otro 7.65% aparte, de ahí sale el 15.3%, pero esa parte no te la quitan a ti." },
    { q: "Tu trabajo en el campus paga $650 cada dos semanas. ¿Por qué te retienen tan poco impuesto federal?", opts: ["Casi todo tu sueldo del año queda debajo de la deducción estándar de $16,100", "Los estudiantes no pagan impuesto federal", "El FICA reemplaza el impuesto sobre la renta en trabajos de medio tiempo", "Tu empleador paga tu impuesto sobre la renta"], a: 0, why: "$650 × 26 = $16,900 al año. Solo $800 pasan de la deducción estándar de $16,100, así que el impuesto es 10% × $800 = $80 al año, o $3.08 por cheque." },
    { q: "Tu sueldo bruto es $800 y te quitan $90 en total. ¿Cuál es tu sueldo neto?", opts: ["$710", "$890", "$800", "$90"], a: 0, why: "Sueldo neto = bruto − todo lo que te quitan: $800 − $90 = $710." },
    { q: "Pones 5% de tu sueldo en un 401(k) como deducción antes de impuestos. ¿Qué impuesto baja?", opts: ["El impuesto federal sobre la renta", "El impuesto del Seguro Social", "El impuesto de Medicare", "Los tres por igual"], a: 0, why: "Un 401(k) antes de impuestos sale antes de calcular el impuesto sobre la renta, así que pagas sobre menos. El Seguro Social y Medicare se siguen cobrando." },
  ];

  FHLesson.init({ id: LESSON, short: "pay-stub", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
