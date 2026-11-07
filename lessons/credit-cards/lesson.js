// Unit 4, Lesson 2: Use a credit card without getting burned
(function () {
  const LESSON = "u4-credit-cards";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ---------- See it: payoff slider ----------
  // Same rule as the lesson: 2% a month, minimum = 1% of balance + interest (at least $25).
  const PAYS = ["min", 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 800, "full"];
  const payoff = (pay) => {
    if (pay === "full") return { m: 1, i: 0 };
    let bal = 1000, m = 0, tot = 0;
    while (bal > 0.005 && m < 1000) {
      const i = Math.round(bal * 2) / 100;
      let p = pay === "min" ? Math.max(25, Math.round((bal * 0.01 + i) * 100) / 100) : pay;
      bal += i; tot += i; p = Math.min(p, bal); bal = Math.round((bal - p) * 100) / 100; m++;
    }
    return { m, i: Math.round(tot * 100) / 100 };
  };
  const poEl = $("#po-pay");
  const drawPo = () => {
    const pay = PAYS[+poEl.value], r = payoff(pay);
    $("#po-pay-v").textContent = pay === "min" ? T("the minimum ($30 at first)", "el mínimo ($30 al principio)") : pay === "full" ? T("all $1,000 by the due date", "los $1,000 completos antes de la fecha límite") : `$${pay}`;
    const y = Math.floor(r.m / 12), mo = r.m % 12;
    const ms = r.m === 1 ? T("1 month", "1 mes") : T(`${r.m} months`, `${r.m} meses`);
    const yrs = r.m > 12 ? T(` (${y} yr${y > 1 ? "s" : ""}${mo ? ` ${mo} mo` : ""})`, ` (${y} año${y > 1 ? "s" : ""}${mo ? ` ${mo} m` : ""})`) : "";
    $("#po-months").textContent = ms + yrs;
    $("#po-int").textContent = cents(r.i);
    $("#po-total").textContent = cents(1000 + r.i);
    $("#po-int").dataset.tone = r.i === 0 ? "good" : r.i > 500 ? "bad" : "";
    const MAX = 1886.9; // minimum-only total, the longest bar
    $("#po-princ").style.width = `${(100 * 1000) / MAX}%`;
    $("#po-intr").style.width = `${(100 * r.i) / MAX}%`;
    fillRange(poEl);
  };
  poEl.addEventListener("input", drawPo);
  drawPo();

  // ---------- Play it: statement day ----------
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const ROUNDS = [
    { q: T("What's the least you can pay by March 25 and owe no interest?", "¿Qué es lo mínimo que puedes pagar antes del 25 de marzo sin deber intereses?"),
      opts: ["$1,000", "$30", "$1,180"], a: 0,
      why: T("The statement balance, $1,000. The $180 you spent after March 1 goes on next month's statement. $30 only keeps you from being late.", "El saldo del estado de cuenta, $1,000. Los $180 que gastaste después del 1 de marzo van en el siguiente estado de cuenta. Los $30 solo evitan que llegues tarde.") },
    { q: T("You pay only the $30 minimum. About how much interest is added next month?", "Pagas solo el mínimo de $30. ¿Más o menos cuánto interés se suma el próximo mes?"),
      opts: ["$19.40", "$0", "$240"], a: 0,
      why: T(`The monthly rate is ${fr("24%", "12")} = 2%. ($1,000 − $30) × 0.02 = $970 × 0.02 = $19.40.`, `La tasa mensual es ${fr("24%", "12")} = 2%. ($1,000 − $30) × 0.02 = $970 × 0.02 = $19.40.`) },
    { q: T("You pay the full $1,000 on March 28, three days after the due date. What happens?", "Pagas los $1,000 completos el 28 de marzo, tres días después de la fecha límite. ¿Qué pasa?"),
      opts: [T("You pay a late fee and interest", "Pagas un cargo por atraso e intereses"), T("Nothing, 3 days is fine", "Nada, 3 días no importan"), T("It goes on your credit report for 7 years", "Se queda en tu reporte de crédito 7 años")], a: 0,
      why: T("Missing the due date means a late fee and you lose the grace period, so interest is charged. It only reaches your credit report at 30 days late.", "Pasarte de la fecha límite significa un cargo por atraso y pierdes el periodo de gracia, así que te cobran intereses. Solo llega a tu reporte de crédito a los 30 días de atraso.") },
    { q: T("Your card's cash advance fee is 5%. You take $200 from an ATM with the card. What's the fee?", "La comisión por adelanto en efectivo de tu tarjeta es 5%. Sacas $200 de un cajero con la tarjeta. ¿Cuánto es la comisión?"),
      opts: ["$10", "$5", "$0"], a: 0,
      why: T("$200 × 0.05 = $10, charged right away. Then interest starts that same day at 29.99%, with no grace period.", "$200 × 0.05 = $10, cobrados de inmediato. Luego el interés empieza ese mismo día al 29.99%, sin periodo de gracia.") },
    { q: T("What was your utilization on this statement?", "¿Cuál fue tu uso del crédito en este estado de cuenta?"),
      opts: ["67%", "30%", "100%"], a: 0,
      why: T(`${fr("$1,000", "$1,500")} = 0.67 = 67%, well over 30%. Paying part of it before the statement closes keeps it lower.`, `${fr("$1,000", "$1,500")} = 0.67 = 67%, muy por encima del 30%. Pagar una parte antes del corte lo mantiene más bajo.`) },
    { q: T("The card gives 1.5% cash back, so the laptop earned $15. Is it worth paying only the minimum and keeping the balance?", "La tarjeta da 1.5% de reembolso, así que la laptop te dio $15. ¿Vale la pena pagar solo el mínimo y mantener el saldo?"),
      opts: [T("No: one month of interest is about $20", "No: un mes de interés es como $20"), T("Yes: $15 is free money", "Sí: $15 son dinero gratis"), T("Yes, if you pay late", "Sí, si pagas tarde")], a: 0,
      why: T("$1,000 × 0.02 = $20 of interest in a single month, more than the whole $15 reward. Rewards only pay if you pay in full.", "$1,000 × 0.02 = $20 de interés en un solo mes, más que todo el reembolso de $15. Las recompensas solo valen si pagas completo.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#sd-why"), nextB = $("#sd-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#sd-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#sd-q").textContent = r.q;
    $("#sd-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#sd-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#sd-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#sd-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#sd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Statement pro", "Experto en estados de cuenta") : G.score >= 4 ? T("Card smart", "Sabes usar tu tarjeta") : T("Reread the statement section", "Vuelve a leer la parte del estado de cuenta")}</b><p>${T("Pay the statement balance by the due date, skip cash advances, and keep the balance low.", "Paga el saldo del estado de cuenta antes de la fecha límite, evita los adelantos en efectivo y mantén el saldo bajo.")}</p></div></div>
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
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Read a card statement", "Leíste un estado de cuenta"));
    if (G.score === N) FH.badge("statement-pro");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "How do you use a credit card and pay no interest at all?", opts: ["Pay the full statement balance by the due date", "Pay the minimum on time", "Pay a few days after the due date", "Use the card only for big purchases"], a: 0, why: "Paying the full statement balance within the grace period means no interest on purchases. The minimum avoids a late fee but not interest." },
    { q: "A card has a 24% APR. About what is the monthly interest rate?", opts: ["2%", "24%", "0.24%", "12%"], a: 0, why: `${fr("24%", "12")} = 2% a month.` },
    { q: "You leave $1,000 unpaid on a card at 24% APR. About how much interest is added in one month?", opts: ["$20", "$240", "$2", "$24"], a: 0, why: "$1,000 × 0.02 = $20." },
    { q: "The minimum is 1% of the balance plus that month's interest. The balance is $1,000 and the interest is $20. What's the minimum?", opts: ["$30", "$10", "$20", "$100"], a: 0, why: "1% of $1,000 = $10, plus $20 of interest = $30. Only $10 of it lowers the balance." },
    { q: "Paying only the minimum on a $1,000 balance at 24% APR takes about how long?", opts: ["74 months, with $886.90 of interest", "10 months", "12 months, with $20 of interest", "It never gets paid off"], a: 0, why: "Because most of each minimum is interest, it takes 74 months and $886.90 of interest. Paying $100 a month takes 12 months and $127.04." },
    { q: "What is the grace period on a credit card?", opts: ["The days between the statement and the due date when you can pay in full with no interest", "Extra days after the due date with no late fee", "The first year with no annual fee", "The time before a late payment hits your report"], a: 0, why: "It's at least 21 days from the statement to the due date. Pay the statement balance in that time and you pay no interest." },
    { q: "You take $200 cash from an ATM with your credit card. The fee is 5%. What do you pay up front?", opts: ["$10, plus interest from that same day", "$0, if you pay by the due date", "$1", "$200"], a: 0, why: "$200 × 0.05 = $10. Cash advances have no grace period, so interest starts right away, usually at a higher APR." },
    { q: "Why can a credit card be safer than a debit card if your card is stolen?", opts: ["Your liability is capped at $50, and it's the bank's money that's missing", "Credit cards can't be stolen", "Debit cards have no protection at all", "Credit cards have no limit"], a: 0, why: "Federal law caps credit card fraud liability at $50, and the stolen money is the bank's while they investigate. With debit it's your own checking money." },
  ];
  const QUIZ_ES = [
    { q: "¿Cómo usas una tarjeta de crédito sin pagar nada de intereses?", opts: ["Pagando el saldo completo del estado de cuenta antes de la fecha límite", "Pagando el mínimo a tiempo", "Pagando unos días después de la fecha límite", "Usando la tarjeta solo para compras grandes"], a: 0, why: "Pagar el saldo completo del estado de cuenta dentro del periodo de gracia significa cero intereses en tus compras. El mínimo evita el cargo por atraso, pero no los intereses." },
    { q: "Una tarjeta tiene un APR de 24%. ¿Más o menos cuál es la tasa de interés mensual?", opts: ["2%", "24%", "0.24%", "12%"], a: 0, why: `${fr("24%", "12")} = 2% al mes.` },
    { q: "Dejas $1,000 sin pagar en una tarjeta con APR de 24%. ¿Más o menos cuánto interés se suma en un mes?", opts: ["$20", "$240", "$2", "$24"], a: 0, why: "$1,000 × 0.02 = $20." },
    { q: "El mínimo es 1% del saldo más el interés de ese mes. El saldo es $1,000 y el interés es $20. ¿Cuál es el mínimo?", opts: ["$30", "$10", "$20", "$100"], a: 0, why: "1% de $1,000 = $10, más $20 de interés = $30. Solo $10 bajan el saldo." },
    { q: "Pagar solo el mínimo de un saldo de $1,000 con APR de 24%, ¿más o menos cuánto tarda?", opts: ["74 meses, con $886.90 de interés", "10 meses", "12 meses, con $20 de interés", "Nunca se termina de pagar"], a: 0, why: "Como casi todo el mínimo es interés, tarda 74 meses y $886.90 de interés. Pagando $100 al mes tarda 12 meses y $127.04." },
    { q: "¿Qué es el periodo de gracia de una tarjeta de crédito?", opts: ["Los días entre el estado de cuenta y la fecha límite en que puedes pagar completo sin intereses", "Días extra después de la fecha límite sin cargo por atraso", "El primer año sin anualidad", "El tiempo antes de que un pago atrasado llegue a tu reporte"], a: 0, why: "Son al menos 21 días del estado de cuenta a la fecha límite. Paga el saldo del estado de cuenta en ese tiempo y no pagas intereses." },
    { q: "Sacas $200 en efectivo de un cajero con tu tarjeta de crédito. La comisión es 5%. ¿Cuánto pagas de entrada?", opts: ["$10, más intereses desde ese mismo día", "$0, si pagas antes de la fecha límite", "$1", "$200"], a: 0, why: "$200 × 0.05 = $10. Los adelantos en efectivo no tienen periodo de gracia, así que el interés empieza de inmediato, casi siempre con un APR más alto." },
    { q: "¿Por qué una tarjeta de crédito puede ser más segura que una de débito si te la roban?", opts: ["Tu responsabilidad máxima es $50, y el dinero que falta es del banco", "Las tarjetas de crédito no se pueden robar", "Las de débito no tienen ninguna protección", "Las tarjetas de crédito no tienen límite"], a: 0, why: "La ley federal limita a $50 tu responsabilidad por fraude con tarjeta de crédito, y mientras investigan, el dinero robado es del banco. Con débito es tu propio dinero de cheques." },
  ];

  FHLesson.init({ id: LESSON, short: "credit-cards", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
