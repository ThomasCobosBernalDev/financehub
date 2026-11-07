// Unit 4, Lesson 3: Car, student and payday loans
(function () {
  const LESSON = "u4-loans";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ---------- See it: loan calculator ----------
  const amtEl = $("#lc-amt"), aprEl = $("#lc-apr");
  let months = 48;
  const payment = (P, apr, n) => { const r = apr / 1200; return r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n)); };
  const drawLc = () => {
    const P = +amtEl.value, apr = +aprEl.value;
    const pay = Math.round(payment(P, apr, months) * 100) / 100;
    const tot = Math.round(pay * months * 100) / 100, int = Math.max(0, Math.round((tot - P) * 100) / 100);
    $("#lc-amt-v").textContent = usd(P);
    $("#lc-apr-v").textContent = `${apr.toFixed(1)}%`;
    $("#lc-pay").textContent = cents(pay);
    $("#lc-int").textContent = cents(int);
    $("#lc-tot").textContent = cents(tot);
    // Year-by-year split of the payments.
    let bal = P; const years = [];
    for (let y = 0; y < months / 12; y++) {
      let ip = 0, pp = 0;
      for (let m = 0; m < 12; m++) { const i = (bal * apr) / 1200; const p = Math.min(pay - i, bal); ip += i; pp += p; bal -= p; }
      years.push({ ip, pp });
    }
    const top = pay * 12;
    $("#lc-years").innerHTML = years.map((y, k) => `<div class="lc-yr"><span>${T("Year", "Año")} ${k + 1}</span><div class="lc-bar"><i class="po-princ" style="width:${(100 * y.pp) / top}%"></i><i class="po-intr" style="width:${(100 * y.ip) / top}%"></i></div><small>${usd(y.ip)} ${T("interest", "interés")}</small></div>`).join("");
    const longer = months < 72 ? Math.round(payment(P, apr, 72) * 100) / 100 : null;
    $("#lc-msg").innerHTML = longer
      ? T(`Stretching it to 6 years drops the payment to ${cents(longer)}, but the interest grows to ${cents(Math.max(0, longer * 72 - P))}.`, `Si la alargas a 6 años el pago baja a ${cents(longer)}, pero el interés sube a ${cents(Math.max(0, longer * 72 - P))}.`)
      : T(`6 years is the longest term here, and it costs the most interest. Try 4 years to compare.`, `6 años es el plazo más largo aquí, y es el que más interés cuesta. Prueba 4 años para comparar.`);
    fillRange(amtEl); fillRange(aprEl);
  };
  amtEl.addEventListener("input", drawLc);
  aprEl.addEventListener("input", drawLc);
  $$("#lc-t .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#lc-t .chip").forEach((x) => x.classList.toggle("on", x === c));
    months = +c.dataset.v; drawLc();
  }));
  drawLc();

  // ---------- Play it: loan detective ----------
  const ROUNDS = [
    { facts: [T("Car loan: $10,000", "Préstamo de carro: $10,000"), T("Payment: $170.49 a month", "Pago: $170.49 al mes"), T("Term: 72 months", "Plazo: 72 meses")],
      q: T("How much do you pay in total over the whole loan?", "¿Cuánto pagas en total durante todo el préstamo?"), opts: ["$12,275.28", "$10,000.00", "$11,494.08"], a: 0,
      why: T("Total paid = payment × months: $170.49 × 72 = $12,275.28. That's $2,275.28 of interest.", "Total pagado = pago × meses: $170.49 × 72 = $12,275.28. Son $2,275.28 de interés.") },
    { facts: [T("Same $10,000 car loan", "El mismo préstamo de carro de $10,000"), T("4 years: $1,494.08 of interest", "4 años: $1,494.08 de interés"), T("6 years: $2,275.28 of interest", "6 años: $2,275.28 de interés")],
      q: T("How much interest do you save with the 4-year loan?", "¿Cuánto interés te ahorras con el préstamo de 4 años?"), opts: ["$781.20", "$68.97", "$2,275.28"], a: 0,
      why: T("$2,275.28 − $1,494.08 = $781.20. The bigger payment saves money.", "$2,275.28 − $1,494.08 = $781.20. El pago más grande ahorra dinero.") },
    { facts: [T("Payday loan: $300", "Préstamo de día de pago: $300"), T("Fee: $45", "Cargo: $45"), T("Due in 2 weeks", "Se paga en 2 semanas")],
      q: T("About what APR is that?", "¿Más o menos qué APR es?"), opts: ["390%", "15%", "45%"], a: 0,
      why: T(`${fr("$45", "$300")} = 15% for 2 weeks. A year has 26 two-week periods: 15% × 26 = 390%.`, `${fr("$45", "$300")} = 15% por 2 semanas. Un año tiene 26 periodos de 2 semanas: 15% × 26 = 390%.`) },
    { facts: [T("Unsubsidized federal student loan: $2,000", "Préstamo estudiantil federal no subsidiado: $2,000"), T("Rate: 6.39% a year", "Tasa: 6.39% al año"), T("You're in school for 4 years before paying", "Estás 4 años en la escuela antes de pagar")],
      q: T("How much interest adds up before your first payment?", "¿Cuánto interés se acumula antes de tu primer pago?"), opts: ["$511.20", "$0", "$127.80"], a: 0,
      why: T("Unsubsidized loans add interest during school: $2,000 × 0.0639 × 4 = $511.20. A subsidized loan would add $0.", "Los préstamos no subsidiados suman interés durante la escuela: $2,000 × 0.0639 × 4 = $511.20. Uno subsidiado sumaría $0.") },
    { facts: [T("Car loan balance: $10,000", "Saldo del préstamo de carro: $10,000"), T("APR: 7%", "APR: 7%"), T("Monthly payment: $239.46", "Pago mensual: $239.46")],
      q: T("In the first payment, how much pays down the $10,000?", "En el primer pago, ¿cuánto baja los $10,000?"), opts: ["$181.13", "$58.33", "$239.46"], a: 0,
      why: T(`Interest first: $10,000 × ${fr("0.07", "12")} = $58.33. The rest, $239.46 − $58.33 = $181.13, pays down the principal.`, `Primero el interés: $10,000 × ${fr("0.07", "12")} = $58.33. El resto, $239.46 − $58.33 = $181.13, baja el principal.`) },
    { facts: [T("Your take-home pay: $2,400 a month", "Tu sueldo neto: $2,400 al mes"), T("Car payment: $239.46 a month", "Pago del carro: $239.46 al mes")],
      q: T("What share of your take-home pay is the car payment?", "¿Qué parte de tu sueldo neto es el pago del carro?"), opts: ["10%", "24%", "1%"], a: 0,
      why: T(`${fr("$239.46", "$2,400")} = 0.10 = 10%, right at the usual limit for a car payment.`, `${fr("$239.46", "$2,400")} = 0.10 = 10%, justo en el límite común para un pago de carro.`) },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#ld-why"), nextB = $("#ld-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#ld-round").textContent = T(`Case ${G.i + 1} of ${N}`, `Caso ${G.i + 1} de ${N}`);
    $("#ld-q").textContent = r.q;
    $("#ld-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#ld-opts").innerHTML = r.opts.map((o, j) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next case", "Siguiente caso")} <span class="arrow">→</span>`;
  };
  $("#ld-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#ld-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#ld-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#ld-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Loan detective", "Detective de préstamos") : G.score >= 4 ? T("Sharp borrower", "Buen deudor") : T("Review the five steps", "Repasa los cinco pasos")}</b><p>${T("Look past the monthly payment: total cost, APR, and how long you'll owe.", "Mira más allá del pago mensual: el costo total, el APR y cuánto tiempo vas a deber.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="ld-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#ld-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#ld-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#ld").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Solved six loan cases", "Resolviste seis casos de préstamos"));
    if (G.score === N) FH.badge("loan-detective");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "A car costs $12,000 and you pay $2,000 down. What is the principal of your loan?", opts: ["$10,000", "$12,000", "$14,000", "$2,000"], a: 0, why: "Principal = price − down payment: $12,000 − $2,000 = $10,000." },
    { q: "You owe $10,000 on a loan at 7% APR. About how much interest is charged in the first month?", opts: ["$58.33", "$700", "$7", "$239.46"], a: 0, why: `$10,000 × ${fr("0.07", "12")} = $58.33.` },
    { q: "Over the life of a loan, how does each payment change?", opts: ["Less goes to interest and more to principal", "More goes to interest each month", "It's always half interest, half principal", "The payment gets bigger"], a: 0, why: "Interest is figured on what you still owe. As the balance shrinks, the interest part shrinks and more of the same payment pays down principal." },
    { q: "A $10,000 loan costs $239.46 a month for 48 months or $170.49 for 72 months. Which costs less in total?", opts: ["The 48-month loan, by $781.20", "The 72-month loan, because the payment is lower", "They cost the same", "The 72-month loan, by $68.97"], a: 0, why: "$239.46 × 48 = $11,494.08 and $170.49 × 72 = $12,275.28. The difference is $781.20." },
    { q: "What's the difference between subsidized and unsubsidized federal student loans?", opts: ["With subsidized, the government pays the interest while you're in school", "Subsidized loans need a co-signer", "Unsubsidized loans have no interest", "Subsidized loans come from private banks"], a: 0, why: "Subsidized loans don't grow while you're in school. Unsubsidized loans add interest from day one." },
    { q: "You borrow $2,000 unsubsidized at 6.39% and stay in school 4 years. How much interest adds up before you start paying?", opts: ["$511.20", "$0", "$127.80", "$2,511.20"], a: 0, why: "$2,000 × 0.0639 × 4 = $511.20 of interest. It's added to what you owe." },
    { q: "A payday loan charges $15 for every $100, due in 2 weeks. About what is the APR?", opts: ["390%", "15%", "30%", "26%"], a: 0, why: "15% for 2 weeks × 26 two-week periods in a year = 390%." },
    { q: "Which is usually the best first step before buying a car with a loan?", opts: ["Get a loan offer from your bank or credit union first", "Tell the dealer the monthly payment you want", "Choose the longest term to keep payments low", "Skip the down payment"], a: 0, why: "A pre-approval tells you a fair APR before the dealer starts talking monthly payments. Then compare total cost." },
  ];
  const QUIZ_ES = [
    { q: "Un carro cuesta $12,000 y das $2,000 de pago inicial. ¿Cuál es el principal de tu préstamo?", opts: ["$10,000", "$12,000", "$14,000", "$2,000"], a: 0, why: "Principal = precio − pago inicial: $12,000 − $2,000 = $10,000." },
    { q: "Debes $10,000 en un préstamo con APR de 7%. ¿Más o menos cuánto interés te cobran el primer mes?", opts: ["$58.33", "$700", "$7", "$239.46"], a: 0, why: `$10,000 × ${fr("0.07", "12")} = $58.33.` },
    { q: "Durante la vida de un préstamo, ¿cómo cambia cada pago?", opts: ["Menos va a interés y más al principal", "Cada mes más va a interés", "Siempre es mitad interés, mitad principal", "El pago se hace más grande"], a: 0, why: "El interés se calcula sobre lo que todavía debes. Al bajar el saldo, baja la parte de interés y más del mismo pago baja el principal." },
    { q: "Un préstamo de $10,000 cuesta $239.46 al mes por 48 meses o $170.49 por 72 meses. ¿Cuál cuesta menos en total?", opts: ["El de 48 meses, por $781.20", "El de 72 meses, porque el pago es menor", "Cuestan lo mismo", "El de 72 meses, por $68.97"], a: 0, why: "$239.46 × 48 = $11,494.08 y $170.49 × 72 = $12,275.28. La diferencia es $781.20." },
    { q: "¿Cuál es la diferencia entre los préstamos estudiantiles federales subsidiados y no subsidiados?", opts: ["Con el subsidiado, el gobierno paga el interés mientras estás en la escuela", "Los subsidiados necesitan un aval", "Los no subsidiados no tienen interés", "Los subsidiados vienen de bancos privados"], a: 0, why: "Los subsidiados no crecen mientras estás en la escuela. Los no subsidiados suman interés desde el primer día." },
    { q: "Pides $2,000 no subsidiados al 6.39% y estás 4 años en la escuela. ¿Cuánto interés se acumula antes de empezar a pagar?", opts: ["$511.20", "$0", "$127.80", "$2,511.20"], a: 0, why: "$2,000 × 0.0639 × 4 = $511.20 de interés. Se suma a lo que debes." },
    { q: "Un préstamo de día de pago cobra $15 por cada $100, a pagar en 2 semanas. ¿Más o menos cuál es el APR?", opts: ["390%", "15%", "30%", "26%"], a: 0, why: "15% por 2 semanas × 26 periodos de 2 semanas en un año = 390%." },
    { q: "¿Cuál suele ser el mejor primer paso antes de comprar un carro con préstamo?", opts: ["Conseguir primero una oferta de préstamo de tu banco o cooperativa", "Decirle al vendedor el pago mensual que quieres", "Elegir el plazo más largo para pagar menos al mes", "No dar pago inicial"], a: 0, why: "Una preaprobación te dice un APR justo antes de que el vendedor hable de pagos mensuales. Luego compara el costo total." },
  ];

  FHLesson.init({ id: LESSON, short: "loans", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
