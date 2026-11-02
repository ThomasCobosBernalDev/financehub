// Unit 2, Lesson 3: File your first tax return
(function () {
  const LESSON = "u2-file-taxes";
  const { $, $$ } = FHLesson;
  const T = FH.t;
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const r2 = (x) => Math.round((x + 1e-9) * 100) / 100;
  const STD = 16100;
  const BRACKETS = [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24]];
  const incomeTax = (taxable) => { let tax = 0, lo = 0; for (const [hi, p] of BRACKETS) { tax += Math.max(0, Math.min(taxable, hi) - lo) * p; lo = hi; } return r2(tax); };

  // ---------- See it: build your 1040 ----------
  // Every pile here stays under $16,100, so income tax is $0 and the small-business deduction never matters.
  const DOCS = [
    { id: "w2", on: true, name: T("W-2 · campus job", "W-2 · trabajo del campus"), note: T("$8,450 wages, $40.04 withheld", "$8,450 de sueldo, $40.04 retenidos"), wages: 8450, paid: 40.04 },
    { id: "int", on: true, name: T("1099-INT · bank", "1099-INT · banco"), note: T("$45 interest", "$45 de interés"), interest: 45 },
    { id: "tutor", on: false, name: T("Tutoring · no form", "Tutorías · sin formulario"), note: T("$1,200 profit", "$1,200 de ganancia"), profit: 1200 },
    { id: "intern", on: false, name: T("W-2 · summer internship", "W-2 · práctica de verano"), note: T("$6,000 wages, $300.75 withheld", "$6,000 de sueldo, $300.75 retenidos"), wages: 6000, paid: 300.75 },
    { id: "gift", on: false, name: T("Birthday check · grandma", "Cheque de cumpleaños · abuela"), note: T("$200 gift", "$200 de regalo"), gift: 200 },
  ];
  const sum = (k) => DOCS.filter((d) => d.on).reduce((s, d) => s + (d[k] || 0), 0);
  const draw = () => {
    $("#ft-docs").innerHTML = DOCS.map((d) => `<button type="button" class="ft-doc${d.on ? " on" : ""}" data-id="${d.id}" aria-pressed="${d.on}"><b>${d.name}</b><small>${d.note}</small></button>`).join("");
    const wages = sum("wages"), interest = sum("interest"), profit = sum("profit"), paid = r2(sum("paid"));
    const total = wages + interest + profit;
    const se = profit >= 400 ? r2(profit * 0.9235 * 0.153) : 0, half = r2(se / 2);
    const taxable = Math.max(0, r2(total - half - STD)), itax = incomeTax(taxable), owed = r2(itax + se), bottom = r2(paid - owed);
    const rows = [
      [T("Total income", "Ingreso total"), T("wages + interest + side hustle", "sueldos + interés + trabajo extra"), cents(total), ""],
      ...(se ? [[T("Half of self-employment tax", "Mitad del impuesto de trabajo por cuenta propia"), `${cents(se)} ÷ 2`, `−${cents(half)}`, "save"]] : []),
      [T("Standard deduction", "Deducción estándar"), T("never taxed", "nunca paga impuesto"), `−${cents(STD)}`, "save"],
      [T("Taxable income", "Ingreso gravable"), T("can't go below $0", "no puede bajar de $0"), cents(taxable), ""],
      [T("Income tax", "Impuesto sobre la renta"), T("from the brackets", "según las categorías"), cents(itax), "tax"],
      ...(se ? [[T("Self-employment tax", "Impuesto de trabajo por cuenta propia"), `${cents(profit)} × 0.9235 × 0.153`, cents(se), "tax"]] : []),
      [T("Payments", "Pagos"), T("tax withheld on your W-2s", "impuesto retenido en tus W-2"), cents(paid), ""],
      [bottom >= 0 ? T("Refund", "Reembolso") : T("You owe", "Debes"), T("payments − total tax", "pagos − impuesto total"), cents(Math.abs(bottom)), bottom >= 0 ? "net" : "owe"],
    ];
    // Show the division as a stacked fraction in the half-SE row.
    $("#ft-lines").innerHTML = rows.map(([a, b, c, cls]) => `<div class="ps-row ${cls}"><span><b>${a}</b><small>${b.replace(/(\$[\d,.]+) ÷ 2/, "<span class='frac'><span>$1</span><span>2</span></span>")}</small></span><b>${c}</b></div>`).join("");
    const must = total >= STD || profit >= 400;
    const gift = DOCS.find((d) => d.id === "gift").on;
    $("#ft-msg").innerHTML = (must
      ? T(`You <b>must</b> file${profit >= 400 ? ": side-hustle profit is $400 or more" : ""}.`, `<b>Debes</b> declarar${profit >= 400 ? ": la ganancia extra es de $400 o más" : ""}.`)
      : T("You don't <i>have</i> to file, but file anyway to get your withheld tax back.", "No <i>tienes</i> que declarar, pero hazlo para recuperar lo que te retuvieron."))
      + (gift ? T(" The $200 gift isn't income, so it changed nothing.", " El regalo de $200 no es ingreso, así que no cambió nada.") : "");
    $("#ft-msg").dataset.tone = bottom >= 0 ? "good" : "warn";
  };
  $("#ft-docs").addEventListener("click", (e) => {
    const b = e.target.closest(".ft-doc"); if (!b) return;
    const d = DOCS.find((x) => x.id === b.dataset.id); d.on = !d.on; draw();
  });
  draw();

  // ---------- Play it: sort the mail ----------
  const ITEMS = [
    { icon: "W-2", what: T("A <b>W-2</b> from your campus job: $8,450 in box 1.", "Un <b>W-2</b> de tu trabajo del campus: $8,450 en la casilla 1."), yes: 1, why: T("Wages are income. Box 1 goes on the return, and box 2 counts as tax you already paid.", "El sueldo es ingreso. La casilla 1 va en la declaración y la casilla 2 cuenta como impuesto ya pagado.") },
    { icon: T("Gift", "Regalo"), what: T("A <b>$200 birthday check</b> from your grandma.", "Un <b>cheque de $200 de cumpleaños</b> de tu abuela."), yes: 0, why: T("Gifts you get aren't income for you. You didn't earn it.", "Los regalos que recibes no son ingreso para ti. No lo ganaste.") },
    { icon: "App", what: T("<b>$1,200</b> from parents who paid you by app for tutoring. No form came.", "<b>$1,200</b> de papás que te pagaron por app por dar tutorías. No llegó ningún formulario."), yes: 1, why: T("Side-hustle pay counts even with no form. $1,200 of profit is over $400, so you also owe self-employment tax: $169.55.", "El dinero de un trabajo extra cuenta aunque no llegue formulario. $1,200 de ganancia pasa de $400, así que también debes impuesto de trabajo por cuenta propia: $169.55.") },
    { icon: "$15", what: T("<b>$15</b> from a friend paying you back their share of a pizza.", "<b>$15</b> de un amigo que te paga su parte de una pizza."), yes: 0, why: T("Being paid back isn't income. You just got your own money back.", "Que te devuelvan dinero no es ingreso. Solo recuperaste tu propio dinero.") },
    { icon: "1099", what: T("A <b>1099-INT</b> from your bank: $45 of interest.", "Un <b>1099-INT</b> de tu banco: $45 de interés."), yes: 1, why: T("Interest is income. Banks send a 1099-INT when it's $10 or more.", "El interés es ingreso. Los bancos mandan un 1099-INT cuando es de $10 o más.") },
    { icon: "IRS", what: T("Last year's <b>$40.04 federal tax refund</b> hitting your account.", "El <b>reembolso federal de $40.04</b> del año pasado llegando a tu cuenta."), yes: 0, why: T("A federal refund is your own overpaid tax coming back, not new income.", "Un reembolso federal es tu propio impuesto pagado de más que regresa, no un ingreso nuevo.") },
    { icon: T("Tuition", "Beca"), what: T("A <b>$1,000 scholarship</b> that went straight to your tuition.", "Una <b>beca de $1,000</b> que se fue directo a tu colegiatura."), yes: 0, why: T("A scholarship spent on tuition and required books isn't income.", "Una beca que se usa en colegiatura y libros obligatorios no es ingreso.") },
    { icon: "$6", what: T("<b>$6</b> of interest from a second bank. No form came.", "<b>$6</b> de interés de un segundo banco. No llegó formulario."), yes: 1, why: T("Interest under $10 doesn't get a 1099-INT, but it still counts as income.", "El interés de menos de $10 no recibe 1099-INT, pero sigue siendo ingreso.") },
  ];
  const N = ITEMS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#sm-why"), nextB = $("#sm-next");
  const start = () => {
    const it = ITEMS[G.i];
    G.done = false;
    $("#sm-round").textContent = T(`Item ${G.i + 1} of ${N}`, `Cosa ${G.i + 1} de ${N}`);
    $("#sm-card").innerHTML = `<span class="sm-ico" aria-hidden="true">${it.icon}</span><p>${it.what}</p>`;
    $$(".sm-bin").forEach((b) => { b.disabled = false; b.className = "fd-opt sm-bin"; });
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next item", "Siguiente")} <span class="arrow">→</span>`;
  };
  $$(".sm-bin").forEach((b) => b.addEventListener("click", () => {
    if (G.done) return;
    G.done = true;
    const it = ITEMS[G.i], ok = +b.dataset.v === it.yes;
    G.n++; if (ok) G.score++;
    $$(".sm-bin").forEach((x) => { x.disabled = true; if (+x.dataset.v === it.yes) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    $("#sm-card").classList.toggle("in-pile", it.yes === 1);
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${it.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#sm-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  }));
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#sm-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Ready to file", "Listo para declarar") : G.score >= 6 ? T("Almost there", "Ya casi") : T("Review Part 2, then play again", "Repasa la Parte 2 y juega otra vez")}</b><p>${T("Money you earned counts, form or no form. Gifts, paybacks, refunds and tuition scholarships don't.", "El dinero que ganaste cuenta, con o sin formulario. Los regalos, lo que te devuelven, los reembolsos y las becas de colegiatura no.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="sm-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#sm-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#sm-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#sm").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Sorted your tax mail", "Ordenaste tu correo de impuestos"));
    if (G.score === N) FH.badge("mail-sorter");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const fr = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "Which form shows your yearly wages and the federal tax your employer withheld?", opts: ["W-2", "W-4", "1099-INT", "Form 1040"], a: 0, why: "Your employer sends a W-2 by the end of January: box 1 is wages, box 2 is federal tax withheld. The W-4 is the form you filled out when you started." },
    { q: "Your bank paid you $45 of interest. Which form will it send?", opts: ["1099-INT", "W-2", "W-4", "No form, interest isn't taxed"], a: 0, why: "Banks send a 1099-INT for $10 or more of interest. Interest is income either way." },
    { q: "You earned $8,450 of wages and $45 of interest, with no side hustle. What is your taxable income?", opts: ["$0", "$8,495", "$7,605", "$849.50"], a: 0, why: "$8,450 + $45 = $8,495. Minus the $16,100 standard deduction is below zero, so taxable income is $0." },
    { q: "$40.04 was withheld, but you owe $0. Your income is under $16,100 and you have no side hustle. Should you file?", opts: ["Yes: filing is the only way to get the $40.04 back", "No, the IRS mails it automatically", "No, it's against the rules to file", "Only if you owe money"], a: 0, why: "You aren't required to file under $16,100, but the IRS only refunds withheld tax when you file a return." },
    { q: "You made $1,200 of side-hustle profit. How much self-employment tax do you owe?", opts: ["$169.55", "$91.80", "$183.60", "$0, there was no form"], a: 0, why: "SE tax = profit × 0.9235 × 0.153: $1,200 × 0.9235 = $1,108.20, × 0.153 = $169.55. $183.60 forgets the 92.35% step." },
    { q: "Why is self-employment tax 15.3% when a W-2 worker pays only 7.65% for Social Security and Medicare?", opts: ["You pay both the worker's and the employer's half", "Side hustles are taxed as luxuries", "It includes federal income tax", "It's a penalty for having no form"], a: 0, why: "7.65% + 7.65% = 15.3%. When you work for yourself, you are the employer too." },
    { q: "You file an extension in April. What does it change?", opts: ["You can file until October 15, but tax owed is still due April 15", "You can pay until October 15", "You don't have to file at all", "Your refund arrives faster"], a: 0, why: "An extension gives more time to file, not to pay. Anything owed is still due on April 15." },
    { q: "Which of these is NOT income you report?", opts: ["A $200 birthday check from your grandma", "Venmo pay for tutoring with no form", "$6 of bank interest with no form", "W-2 wages"], a: 0, why: "Gifts you receive aren't income. Side-hustle pay and interest count even when no form arrives." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué formulario muestra tu sueldo del año y el impuesto federal que retuvo tu empleador?", opts: ["W-2", "W-4", "1099-INT", "Formulario 1040"], a: 0, why: "Tu empleador manda un W-2 a fin de enero: la casilla 1 es el sueldo y la casilla 2 el impuesto federal retenido. El W-4 es el que llenaste al empezar." },
    { q: "Tu banco te pagó $45 de interés. ¿Qué formulario te manda?", opts: ["1099-INT", "W-2", "W-4", "Ninguno, el interés no paga impuesto"], a: 0, why: "Los bancos mandan un 1099-INT por $10 o más de interés. El interés es ingreso de todos modos." },
    { q: "Ganaste $8,450 de sueldo y $45 de interés, sin trabajo extra. ¿Cuál es tu ingreso gravable?", opts: ["$0", "$8,495", "$7,605", "$849.50"], a: 0, why: "$8,450 + $45 = $8,495. Menos la deducción estándar de $16,100 queda debajo de cero, así que el ingreso gravable es $0." },
    { q: "Te retuvieron $40.04, pero debes $0. Tu ingreso es menor de $16,100 y no tienes trabajo extra. ¿Debes declarar?", opts: ["Sí: declarar es la única forma de recuperar los $40.04", "No, el IRS te los manda solo", "No, está prohibido declarar", "Solo si debes dinero"], a: 0, why: "No estás obligado a declarar con menos de $16,100, pero el IRS solo regresa lo retenido si presentas una declaración." },
    { q: "Ganaste $1,200 de ganancia en un trabajo extra. ¿Cuánto impuesto de trabajo por cuenta propia debes?", opts: ["$169.55", "$91.80", "$183.60", "$0, no hubo formulario"], a: 0, why: "Impuesto = ganancia × 0.9235 × 0.153: $1,200 × 0.9235 = $1,108.20, × 0.153 = $169.55. $183.60 se salta el paso del 92.35%." },
    { q: "¿Por qué el impuesto de trabajo por cuenta propia es 15.3% si un trabajador con W-2 paga solo 7.65% de Seguro Social y Medicare?", opts: ["Pagas la mitad del trabajador y la del empleador", "Los trabajos extra se cobran como lujos", "Incluye el impuesto federal sobre la renta", "Es una multa por no tener formulario"], a: 0, why: "7.65% + 7.65% = 15.3%. Cuando trabajas por tu cuenta, también eres el empleador." },
    { q: "Pides una prórroga en abril. ¿Qué cambia?", opts: ["Puedes declarar hasta el 15 de octubre, pero lo que debes se paga el 15 de abril", "Puedes pagar hasta el 15 de octubre", "Ya no tienes que declarar", "Tu reembolso llega más rápido"], a: 0, why: "Una prórroga da más tiempo para declarar, no para pagar. Lo que debas se paga el 15 de abril." },
    { q: "¿Cuál de estos NO es un ingreso que reportas?", opts: ["Un cheque de cumpleaños de $200 de tu abuela", "Pagos por app por tutorías sin formulario", "$6 de interés del banco sin formulario", "El sueldo de tu W-2"], a: 0, why: "Los regalos que recibes no son ingreso. El dinero de un trabajo extra y el interés cuentan aunque no llegue formulario." },
  ];

  FHLesson.init({ id: LESSON, short: "file-taxes", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
