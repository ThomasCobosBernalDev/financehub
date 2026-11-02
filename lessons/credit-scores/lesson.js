// Unit 4, Lesson 1: Your credit score
(function () {
  const LESSON = "u4-credit-scores";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");

  // ---------- See it: the five parts ----------
  const PARTS = [
    { k: "pay", w: 35, n: T("Payment history", "Historial de pagos"), d: T("Did you pay on time? Every on-time payment helps. A payment 30 or more days late hurts the most and stays 7 years.", "¿Pagaste a tiempo? Cada pago a tiempo ayuda. Un pago con 30 días o más de atraso es lo que más daña y se queda 7 años.") },
    { k: "owe", w: 30, n: T("Amounts owed", "Lo que debes"), d: T("Mostly your utilization: card balances divided by card limits. Under 30% is fine, under 10% is best.", "Sobre todo tu uso del crédito: saldos de tus tarjetas entre sus límites. Menos del 30% está bien, menos del 10% es lo mejor.") },
    { k: "age", w: 15, n: T("Length of history", "Antigüedad"), d: T("How long your accounts have been open. Time is the only fix, so starting early helps.", "Cuánto tiempo llevan abiertas tus cuentas. Solo el tiempo lo arregla, así que empezar temprano ayuda.") },
    { k: "new", w: 10, n: T("New credit", "Crédito nuevo"), d: T("Recent applications. Each one is a hard inquiry that can cost a few points. Several in a short time look risky.", "Solicitudes recientes. Cada una es una consulta dura que puede bajar unos puntos. Varias en poco tiempo se ven riesgosas.") },
    { k: "mix", w: 10, n: T("Credit mix", "Tipos de crédito"), d: T("Having different kinds, like a card and a loan. It counts the least. Never borrow just to improve it.", "Tener distintos tipos, como una tarjeta y un préstamo. Es lo que menos cuenta. Nunca pidas prestado solo para mejorarlo.") },
  ];
  const showPart = (k) => {
    const p = PARTS.find((x) => x.k === k);
    $$("#cf-bar .cf-seg").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === k));
    $("#cf-info").innerHTML = `<b>${p.n}: ${p.w}%</b> ${p.d}`;
  };
  $("#cf-bar").innerHTML = PARTS.map((p) => `<button type="button" class="cf-seg cf-${p.k}" data-k="${p.k}" style="flex:${p.w}"><b>${p.w}%</b><span>${p.n}</span></button>`).join("");
  $("#cf-bar").addEventListener("click", (e) => { const b = e.target.closest(".cf-seg"); if (b) showPart(b.dataset.k); });
  showPart("pay");

  // ---------- See it: utilization meter ----------
  const balEl = $("#ut-bal");
  let limit = 500;
  const drawUt = () => {
    const bal = Math.min(+balEl.value, limit);
    if (+balEl.value > limit) balEl.value = limit;
    balEl.max = limit;
    const u = bal / limit, pct = Math.round(u * 1000) / 10;
    $("#ut-bal-v").textContent = usd(bal);
    $("#ut-fill").style.width = `${Math.max(0.5, u * 100)}%`;
    const zone = u < 0.1 ? "best" : u <= 0.3 ? "ok" : "high";
    $("#ut-fill").dataset.zone = zone;
    const frac = `<span class="frac"><span>${usd(bal)}</span><span>${usd(limit)}</span></span>`;
    const tail = zone === "best" ? T("Under 10%: the best zone.", "Menos del 10%: la mejor zona.")
      : zone === "ok" ? T(`Under 30% is fine. Get to ${usd(limit * 0.1)} or less for the best zone.`, `Menos del 30% está bien. Baja a ${usd(limit * 0.1)} o menos para la mejor zona.`)
      : T(`Over 30%, which can lower your score. Pay it down to ${usd(limit * 0.3)} or less before the statement closes.`, `Más del 30%, lo que puede bajar tu puntaje. Bájalo a ${usd(limit * 0.3)} o menos antes del corte del estado de cuenta.`);
    $("#ut-msg").innerHTML = `${T("Utilization", "Uso del crédito")}: ${frac} = <b>${pct}%</b>. ${tail}`;
    $("#ut-msg").dataset.tone = zone === "high" ? "warn" : "good";
    fillRange(balEl);
  };
  balEl.addEventListener("input", drawUt);
  $$("#ut-lim .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#ut-lim .chip").forEach((x) => x.classList.toggle("on", x === c));
    limit = +c.dataset.v; drawUt();
  }));
  drawUt();

  // ---------- Play it: score moves ----------
  const ROUNDS = [
    { q: T("Sam puts a $40 phone bill on a credit card and pays the full $40 by the due date.", "Sam paga una cuenta de teléfono de $40 con su tarjeta de crédito y paga los $40 completos antes de la fecha límite."), a: "up",
      why: T("An on-time payment adds to payment history, the biggest part of the score (35%).", "Un pago a tiempo suma al historial de pagos, la parte más grande del puntaje (35%).") },
    { q: T("Sam checks their own credit score in a banking app.", "Sam revisa su propio puntaje de crédito en una app del banco."), a: "none",
      why: T("Checking your own score is a soft inquiry. It never changes your score.", "Revisar tu propio puntaje es una consulta suave. Nunca cambia tu puntaje.") },
    { q: T("Sam forgets a $40 card payment. It ends up 30 days late.", "Sam olvida un pago de $40 de su tarjeta. Termina con 30 días de atraso."), a: "down",
      why: T("A payment 30 or more days late is reported and stays on the report for 7 years.", "Un pago con 30 días o más de atraso se reporta y se queda en el reporte 7 años.") },
    { q: T("Sam's card has a $500 limit. The statement shows a $450 balance.", "La tarjeta de Sam tiene un límite de $500. El estado de cuenta muestra un saldo de $450."), a: "down",
      why: T("Utilization is $450 over $500 = 90%, far above 30%.", "El uso es $450 entre $500 = 90%, muy por encima del 30%.") },
    { q: T("Sam applies for three store credit cards in one week.", "Sam solicita tres tarjetas de crédito de tiendas en una semana."), a: "down",
      why: T("Three applications mean three hard inquiries and three new accounts at once. That's the new credit part (10%).", "Tres solicitudes son tres consultas duras y tres cuentas nuevas a la vez. Eso es la parte de crédito nuevo (10%).") },
    { q: T("Sam uses a debit card for groceries all month.", "Sam usa su tarjeta de débito para el súper todo el mes."), a: "none",
      why: T("A debit card spends your own money. It isn't borrowing, so it isn't reported to the bureaus.", "La tarjeta de débito gasta tu propio dinero. No es un préstamo, así que no se reporta a los burós.") },
    { q: T("Sam gets a raise from $2,400 to $2,800 a month.", "A Sam le suben el sueldo de $2,400 a $2,800 al mes."), a: "none",
      why: T("Income isn't part of a credit score. Lenders may ask about it separately, but the score ignores it.", "El ingreso no es parte del puntaje de crédito. Los prestamistas pueden preguntarlo aparte, pero el puntaje no lo usa.") },
    { q: T("Sam's card has a $1,000 limit. Sam pays the balance down from $600 to $50 before the statement closes.", "La tarjeta de Sam tiene un límite de $1,000. Sam baja el saldo de $600 a $50 antes del corte del estado de cuenta."), a: "up",
      why: T("Utilization drops from $600 over $1,000 = 60% to $50 over $1,000 = 5%, under 10%.", "El uso baja de $600 entre $1,000 = 60% a $50 entre $1,000 = 5%, menos del 10%.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#sm-why"), nextB = $("#sm-next");
  const start = () => {
    G.done = false;
    $("#sm-round").textContent = T(`Move ${G.i + 1} of ${N}`, `Jugada ${G.i + 1} de ${N}`);
    $("#sm-q").textContent = ROUNDS[G.i].q;
    $$("#sm-opts .sm-btn").forEach((b) => { b.disabled = false; b.className = "sm-btn"; });
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next move", "Siguiente jugada")} <span class="arrow">→</span>`;
  };
  $("#sm-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#sm-opts .sm-btn").forEach((x) => { x.disabled = true; if (x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#sm-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#sm-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Score keeper", "Guardián del puntaje") : G.score >= 6 ? T("Credit smart", "Sabes de crédito") : T("Review the five parts", "Repasa las cinco partes")}</b><p>${T("Pay on time, keep balances low, apply only when you need to. Income, savings and debit cards don't count.", "Paga a tiempo, mantén saldos bajos y solicita crédito solo cuando lo necesites. El ingreso, el ahorro y el débito no cuentan.")}</p></div></div>
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
    if (first) FH.addXP(50, T("Called eight score moves", "Decidiste ocho jugadas de crédito"));
    if (G.score === N) FH.badge("score-keeper");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const fr = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "What range do FICO scores fall in?", opts: ["300 to 850", "0 to 100", "100 to 1,000", "500 to 900"], a: 0, why: "FICO scores run from 300 to 850. Higher is better. VantageScore uses the same range." },
    { q: "Which part counts the most in a FICO score?", opts: ["Payment history (35%)", "Amounts owed (30%)", "Credit mix (10%)", "Your income"], a: 0, why: "Payment history is 35%, then amounts owed 30%, length of history 15%, new credit 10% and credit mix 10%. Income isn't in the score." },
    { q: "Your card has a $1,000 limit and your statement balance is $300. What's your utilization?", opts: ["30%", "3%", "70%", "$700"], a: 0, why: `Utilization = ${fr("$300", "$1,000")} = 0.30 = 30%.` },
    { q: "You check your own credit score in your bank's app. What happens to your score?", opts: ["Nothing: it's a soft inquiry", "It drops a few points", "It goes up for checking", "It drops for 7 years"], a: 0, why: "Checking your own score is a soft inquiry and never changes it. Hard inquiries come from applying for credit." },
    { q: "A payment that is 30 or more days late stays on your credit report for how long?", opts: ["7 years", "30 days", "1 year", "Forever"], a: 0, why: "Late payments stay 7 years, though they count less as they get older. Hard inquiries stay 2 years." },
    { q: "Which of these is NOT part of your credit score?", opts: ["Your income", "On-time payments", "Card balances", "New applications"], a: 0, why: "Income, savings and debit card use aren't in your score. Payments, balances and applications are." },
    { q: "You have no credit history. Which is a common first step to build it?", opts: ["Open a secured card and pay a small bill in full each month", "Use your debit card more", "Apply for five cards at once", "Keep a big balance on a card"], a: 0, why: "A secured card reports to the bureaus like a normal card. A small bill paid in full keeps utilization low and payments on time. Debit cards aren't reported." },
    { q: "On a $20,000, 5-year car loan, a good score gets a $386.66 payment and a fair score gets $444.89. How much more does the fair score pay in total?", opts: ["$3,493.80", "$58.23", "$444.89", "$6,693.34"], a: 0, why: "60 payments × ($444.89 − $386.66) = 60 × $58.23 = $3,493.80." },
  ];
  const QUIZ_ES = [
    { q: "¿En qué rango están los puntajes FICO?", opts: ["300 a 850", "0 a 100", "100 a 1,000", "500 a 900"], a: 0, why: "Los puntajes FICO van de 300 a 850. Más alto es mejor. VantageScore usa el mismo rango." },
    { q: "¿Qué parte cuenta más en un puntaje FICO?", opts: ["Historial de pagos (35%)", "Lo que debes (30%)", "Tipos de crédito (10%)", "Tu ingreso"], a: 0, why: "El historial de pagos es 35%, luego lo que debes 30%, la antigüedad 15%, el crédito nuevo 10% y los tipos de crédito 10%. El ingreso no está en el puntaje." },
    { q: "Tu tarjeta tiene un límite de $1,000 y el saldo de tu estado de cuenta es $300. ¿Cuál es tu uso del crédito?", opts: ["30%", "3%", "70%", "$700"], a: 0, why: `Uso = ${fr("$300", "$1,000")} = 0.30 = 30%.` },
    { q: "Revisas tu propio puntaje de crédito en la app de tu banco. ¿Qué le pasa a tu puntaje?", opts: ["Nada: es una consulta suave", "Baja unos puntos", "Sube por revisarlo", "Baja por 7 años"], a: 0, why: "Revisar tu propio puntaje es una consulta suave y nunca lo cambia. Las consultas duras vienen de solicitar crédito." },
    { q: "Un pago con 30 días o más de atraso, ¿cuánto tiempo se queda en tu reporte de crédito?", opts: ["7 años", "30 días", "1 año", "Para siempre"], a: 0, why: "Los pagos atrasados se quedan 7 años, aunque cuentan menos con el tiempo. Las consultas duras se quedan 2 años." },
    { q: "¿Cuál de estos NO es parte de tu puntaje de crédito?", opts: ["Tu ingreso", "Los pagos a tiempo", "Los saldos de tus tarjetas", "Las solicitudes nuevas"], a: 0, why: "El ingreso, el ahorro y el uso de la tarjeta de débito no están en tu puntaje. Los pagos, los saldos y las solicitudes sí." },
    { q: "No tienes historial de crédito. ¿Cuál es un primer paso común para crearlo?", opts: ["Abrir una tarjeta asegurada y pagar una cuenta pequeña completa cada mes", "Usar más tu tarjeta de débito", "Solicitar cinco tarjetas a la vez", "Tener un saldo alto en una tarjeta"], a: 0, why: "Una tarjeta asegurada se reporta a los burós como una tarjeta normal. Una cuenta pequeña pagada completa mantiene el uso bajo y los pagos a tiempo. El débito no se reporta." },
    { q: "En un préstamo de carro de $20,000 a 5 años, un buen puntaje paga $386.66 al mes y uno regular paga $444.89. ¿Cuánto más paga en total el puntaje regular?", opts: ["$3,493.80", "$58.23", "$444.89", "$6,693.34"], a: 0, why: "60 pagos × ($444.89 − $386.66) = 60 × $58.23 = $3,493.80." },
  ];

  FHLesson.init({ id: LESSON, short: "credit-scores", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
