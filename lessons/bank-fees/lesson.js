// Unit 1, Lesson 3: Dodge the fees
(function () {
  const LESSON = "u1-bank-fees";
  const { $, $$, fillRange } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const cents = (x) => `${x < 0 ? "−" : ""}$${Math.abs(x).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const chips = (sel, fn) => $$(`${sel} .chip`).forEach((c) => c.addEventListener("click", () => {
    $$(`${sel} .chip`).forEach((x) => x.classList.toggle("on", x === c));
    fn(c.dataset.v);
  }));
  const FEE = 27;

  // ---------- See it: one bad day ----------
  const TX = [
    { time: T("8:10 am", "8:10 a. m."), name: T("Coffee", "Café"), amt: 5.25, card: true },
    { time: T("12:30 pm", "12:30 p. m."), name: T("Lunch", "Almuerzo"), amt: 12.5, card: true },
    { time: T("3:00 pm", "3:00 p. m."), name: T("Phone bill", "Factura del teléfono"), amt: 45, card: false },
    { time: T("6:15 pm", "6:15 p. m."), name: T("Gas", "Gasolina"), amt: 20, card: true },
    { time: T("9:00 pm", "9:00 p. m."), name: T("Streaming", "Streaming"), amt: 11.99, card: false },
  ];
  const SPENT = TX.reduce((s, t) => s + t.amt, 0);
  const postDay = (start, optIn, order) => {
    const list = order === "big" ? TX.slice().sort((a, b) => b.amt - a.amt) : TX.slice();
    let bal = start, fees = 0, declined = 0;
    const rows = list.map((t) => {
      let st;
      if (t.amt <= bal + 1e-9) { bal -= t.amt; st = "paid"; }
      else if (t.card && !optIn) { st = "dec"; declined++; }
      else { bal -= t.amt + FEE; fees += FEE; st = "fee"; }
      return { t, st, bal };
    });
    return { rows, fees, declined, bal };
  };
  const csStart = $("#cs-start");
  let optIn = true, order = "time";
  const drawDay = () => {
    const start = +csStart.value;
    $("#cs-start-v").textContent = money(start);
    const r = postDay(start, optIn, order);
    const TAG = { paid: T("Paid", "Pagado"), fee: T(`Paid + $${FEE} fee`, `Pagado + comisión de $${FEE}`), dec: T("Declined, no fee", "Rechazado, sin comisión") };
    $("#cs-list").innerHTML = r.rows.map((x, k) => `<li class="cs-row st-${x.st}" style="--d:${k * 70}ms">
      <span class="cs-time">${x.t.time}</span>
      <span class="cs-name"><b>${x.t.name}</b><small>${x.t.card ? T("Debit card", "Tarjeta de débito") : T("Autopay", "Pago automático")}</small></span>
      <span class="cs-amt">−${cents(x.t.amt)}</span>
      <span class="cs-tag">${TAG[x.st]}</span>
      <span class="cs-bal ${x.bal < 0 ? "neg" : ""}">${cents(x.bal)}</span></li>`).join("");
    $("#cs-sum").innerHTML = `<div><small>${T("Fees", "Comisiones")}</small><b class="${r.fees ? "neg" : "ok"}">${money(r.fees)}</b></div>
      <div><small>${T("Declined", "Rechazados")}</small><b>${r.declined}</b></div>
      <div><small>${T("End of day", "Al final del día")}</small><b class="${r.bal < 0 ? "neg" : "ok"}">${cents(r.bal)}</b></div>`;
    const m = $("#cs-msg");
    if (!r.fees) {
      m.innerHTML = r.declined
        ? T(`No fees, but <b>${r.declined}</b> card ${r.declined === 1 ? "purchase was" : "purchases were"} declined at the register. A cushion of $95 or more would cover the whole day.`, `Sin comisiones, pero ${r.declined === 1 ? "<b>1</b> compra con tarjeta fue rechazada" : `<b>${r.declined}</b> compras con tarjeta fueron rechazadas`} en la caja. Un colchón de $95 o más cubriría todo el día.`)
        : T(`No fees. Everything clears and you end the day with <b>${cents(r.bal)}</b>.`, `Sin comisiones. Todo pasa y terminas el día con <b>${cents(r.bal)}</b>.`);
      m.dataset.tone = r.declined ? "warn" : "good";
    } else {
      const other = postDay(start, optIn, order === "big" ? "time" : "big").fees;
      const out = optIn ? postDay(start, false, order).fees : r.fees;
      let tip = "";
      if (order === "big" && other < r.fees) tip = T(` Posted in time order, it would be ${money(other)}.`, ` En orden de hora, serían ${money(other)}.`);
      else if (optIn && out < r.fees) tip = T(` Opted out, the short card purchases would be declined instead, and fees would be ${money(out)}.`, ` Sin aceptar la cobertura, las compras con tarjeta se rechazarían y las comisiones serían ${money(out)}.`);
      else if (!optIn) tip = T(" Opting out stopped the card fees, but autopays can still overdraw.", " Rechazar la cobertura frenó las comisiones de tarjeta, pero los pagos automáticos todavía pueden sobregirar.");
      m.innerHTML = T(`<b>${money(r.fees)}</b> in fees on ${cents(SPENT)} of spending.${tip}`, `<b>${money(r.fees)}</b> de comisiones por ${cents(SPENT)} de gastos.${tip}`);
      m.dataset.tone = "warn";
    }
    fillRange(csStart);
  };
  csStart.addEventListener("input", drawDay);
  chips("#cs-opt", (v) => { optIn = v === "1"; drawDay(); });
  chips("#cs-ord", (v) => { order = v; drawDay(); });
  drawDay();

  // ---------- See it: stolen card ----------
  const STOLEN = 900;
  let frCard = "debit", frWhen = 0;
  const drawFraud = () => {
    const you = frCard === "credit" ? 50 : [50, 500, STOLEN][frWhen];
    $("#fr-bar").innerHTML = `<i class="you" style="width:${(you / STOLEN) * 100}%"><b>${money(you)}</b></i><i class="bank" style="width:${100 - (you / STOLEN) * 100}%">${you < STOLEN ? `<b>${money(STOLEN - you)}</b>` : ""}</i>`;
    const m = $("#fr-msg");
    if (frCard === "credit") {
      m.innerHTML = T(`On a credit card, the most you can owe is <b>$50</b>, however long you take. And it's the bank's money that's missing, not yours.${frWhen ? " Still, report it fast." : ""}`, `Con tarjeta de crédito, lo más que puedes deber es <b>$50</b>, sin importar cuánto tardes. Y el dinero que falta es del banco, no tuyo.${frWhen ? " Aun así, repórtalo rápido." : ""}`);
      m.dataset.tone = "good";
    } else if (frWhen === 0) {
      m.innerHTML = T("Reported within 2 business days, you owe at most <b>$50</b> of the $900. Lock the card in the app, then call.", "Si lo reportas en 2 días hábiles, debes como máximo <b>$50</b> de los $900. Bloquea la tarjeta en la app y luego llama.");
      m.dataset.tone = "good";
    } else {
      m.innerHTML = frWhen === 1
        ? T("Wait longer than 2 business days and you could owe up to <b>$500</b>, from your own checking.", "Si esperas más de 2 días hábiles, podrías deber hasta <b>$500</b>, de tu propia cuenta de cheques.")
        : T("Miss 60 days after your statement and the law no longer protects new charges: you could lose <b>all $900</b>.", "Si pasan 60 días después de tu estado de cuenta, la ley ya no protege los cargos nuevos: podrías perder <b>los $900</b>.");
      m.dataset.tone = "warn";
    }
  };
  chips("#fr-card", (v) => { frCard = v; drawFraud(); });
  chips("#fr-when", (v) => { frWhen = +v; drawFraud(); });
  drawFraud();

  // ---------- Play it: get through the month ----------
  const ROUNDS = [
    { day: T("Week 1 · Tue 6:40 pm", "Semana 1 · mar 6:40 p. m."), cur: 18.4, pend: [], cov: true,
      q: T("What do you do?", "¿Qué haces?"),
      scene: T("You're at the register. The groceries come to <b>$31.25</b>, and you have no cash on you.", "Estás en la caja. Tu compra del supermercado suma <b>$31.25</b> y no traes efectivo."),
      opts: [
        { t: T("Tap your debit card", "Pagas con tu tarjeta de débito"), cost: FEE, why: T("Approved, but you're $12.85 below $0, and you're opted in, so Riverbend charges $27. Those groceries cost $31.25 + $27 = $58.25.", "Aprobada, pero quedas $12.85 bajo cero y aceptaste la cobertura, así que Riverbend cobra $27. Esa compra te costó $31.25 + $27 = $58.25.") },
        { t: T("Move $20 from Peak savings, then tap", "Pasas $20 de tu ahorro en Peak y luego pagas"), cost: FEE, why: T("Peak is a different bank, so the transfer takes 1 to 3 business days. It lands after the purchase: still a $27 overdraft.", "Peak es otro banco, así que la transferencia tarda de 1 a 3 días hábiles. Llega después de la compra: igual es un sobregiro de $27.") },
        { t: T("Put back $13 of snacks", "Devuelves $13 de snacks"), cost: 0, why: T("$31.25 − $13.00 = $18.25, just under your $18.40. No overdraft, no fee.", "$31.25 − $13.00 = $18.25, justo abajo de tus $18.40. Sin sobregiro, sin comisión.") },
      ] },
    { day: T("Week 1 · Thu 1:00 pm", "Semana 1 · jue 1:00 p. m."), cur: 84, pend: [[T("Gas station hold", "Retención de la gasolinera"), 45]], cov: true,
      q: T("Buy the shoes?", "¿Compras los zapatos?"),
      scene: T("Shoes you want are on sale for <b>$60</b>. Payday is Friday.", "Unos zapatos que quieres están en oferta a <b>$60</b>. El día de pago es el viernes."),
      opts: [
        { t: T("Buy them: the app says $84", "Los compras: la app dice $84"), cost: FEE, why: T("$84 is your current balance. The $45 gas hold already took that money, so you can spend $84 − $45 = $39. $39 − $60 = −$21: a $27 fee.", "$84 es tu saldo actual. La retención de $45 de gasolina ya apartó ese dinero, así que puedes gastar $84 − $45 = $39. $39 − $60 = −$21: una comisión de $27.") },
        { t: T("Buy them: the gas is only pending", "Los compras: la gasolina solo está pendiente"), cost: FEE, why: T("Pending still counts. Your available balance is $39, so the shoes overdraw you by $21 and cost $27 more.", "Lo pendiente sí cuenta. Tu saldo disponible es $39, así que los zapatos te sobregiran por $21 y cuestan $27 más.") },
        { t: T("Wait until Friday, after payday", "Esperas al viernes, después del día de pago"), cost: 0, why: T("Smart: $84 − $45 = $39 available, less than $60. On Friday your $600 paycheck lands and the shoes cost just $60.", "Bien pensado: $84 − $45 = $39 disponibles, menos de $60. El viernes llega tu cheque de $600 y los zapatos cuestan solo $60.") },
      ] },
    { day: T("Week 1 · Sat 7:30 pm", "Semana 1 · sáb 7:30 p. m."), cur: 9, pend: [], cov: false,
      q: T("How do you pay?", "¿Cómo pagas?"),
      scene: T("You turned overdraft coverage off. Dinner with friends is <b>$14.00</b>, and you have a $20 bill in your pocket.", "Desactivaste la cobertura de sobregiro. La cena con amigos cuesta <b>$14.00</b> y traes un billete de $20."),
      opts: [
        { t: T("Turn coverage back on, then tap", "Vuelves a activar la cobertura y pagas con tarjeta"), cost: FEE, why: T("Now the bank covers it: $9 − $14 = −$5, plus a $27 fee. Dinner cost $41.", "Ahora el banco la cubre: $9 − $14 = −$5, más una comisión de $27. La cena te costó $41.") },
        { t: T("Tap your card anyway", "Pagas con tarjeta de todos modos"), cost: 0, why: T("Declined, because you're opted out, and that costs $0. A little awkward, but you pay with the $20 instead.", "Rechazada, porque no aceptaste la cobertura, y eso cuesta $0. Un poco incómodo, pero pagas con los $20.") },
        { t: T("Pay with the $20 bill", "Pagas con el billete de $20"), cost: 0, why: T("No card, no risk: you get $6 back, and checking stays at $9.", "Sin tarjeta, sin riesgo: te dan $6 de cambio y tu cuenta sigue en $9.") },
      ] },
    { day: T("Week 2 · Mon 8:00 am", "Semana 2 · lun 8:00 a. m."), cur: 12, pend: [], sched: [T("Gym autopay · Fri 6:00 am", "Pago automático del gimnasio · vie 6:00 a. m."), 30], cov: false,
      q: T("What do you do today?", "¿Qué haces hoy?"),
      scene: T("Your <b>$30</b> gym autopay runs Friday at 6 am. Your paycheck lands Friday at noon. Overdraft coverage is off.", "Tu pago automático de <b>$30</b> del gimnasio se cobra el viernes a las 6 a. m. Tu cheque llega el viernes a mediodía. La cobertura de sobregiro está desactivada."),
      opts: [
        { t: T("Nothing: you're opted out, so it'll just be declined", "Nada: no aceptaste la cobertura, así que solo se rechaza"), cost: 17, why: T("The opt-in only covers card purchases and ATMs. Riverbend returns the autopay unpaid and charges a $17 NSF fee, and the gym may add a late fee.", "La cobertura solo aplica a compras con tarjeta y cajeros. Riverbend devuelve el pago sin pagar y cobra $17 por fondos insuficientes, y el gimnasio puede agregar un cargo por atraso.") },
        { t: T("Move $20 from Peak savings today", "Pasas $20 de tu ahorro en Peak hoy"), cost: 0, why: T("Started Monday, a 1 to 3 business day transfer arrives by Thursday: $12 + $20 = $32, enough for the $30.", "Si empieza el lunes, una transferencia de 1 a 3 días hábiles llega a más tardar el jueves: $12 + $20 = $32, suficiente para los $30.") },
        { t: T("Ask the gym to charge after payday", "Le pides al gimnasio que cobre después del día de pago"), cost: 0, why: T("Many companies let you pick your billing date. Moving it to after payday fixes this month and every month after.", "Muchas empresas te dejan elegir la fecha de cobro. Moverla a después del día de pago arregla este mes y todos los que siguen.") },
      ] },
    { day: T("Week 3 · Sat 2:00 pm", "Semana 3 · sáb 2:00 p. m."), cur: 140, pend: [], cov: false,
      q: T("How do you get the cash?", "¿Cómo sacas el efectivo?"),
      scene: T("You need <b>$40</b> in cash to pay a friend back. The ATM right here isn't Riverbend's.", "Necesitas <b>$40</b> en efectivo para pagarle a un amigo. El cajero que tienes enfrente no es de Riverbend."),
      opts: [
        { t: T("Use this ATM: it's right here", "Usas este cajero: está aquí mismo"), cost: 4.86, why: T("On average, $3.22 to the ATM's owner plus $1.64 to Riverbend: $4.86, which is 12% of your $40.", "En promedio, $3.22 para el dueño del cajero más $1.64 para Riverbend: $4.86, que es 12% de tus $40.") },
        { t: T("Buy gum at the grocery store and ask for $40 cash back", "Compras un chicle en el supermercado y pides $40 de efectivo"), cost: 0, why: T("Most grocery stores give cash back on a debit purchase for free. The gum is the only thing you pay for.", "La mayoría de los supermercados te dan efectivo gratis al pagar con débito. Solo pagas el chicle.") },
        { t: T("Walk ten minutes to a Riverbend ATM", "Caminas diez minutos a un cajero de Riverbend"), cost: 0, why: T("Your own bank's ATMs are free. Ten minutes saved you $4.86.", "Los cajeros de tu propio banco son gratis. Diez minutos te ahorraron $4.86.") },
      ] },
    { day: T("Week 4 · Sun 9:00 am", "Semana 4 · dom 9:00 a. m."), cur: 212, pend: [], cov: false, alert: T("Your wallet is gone", "Tu billetera desapareció"),
      q: T("What do you do?", "¿Qué haces?"),
      scene: T("Your wallet, with your Riverbend debit card in it, was stolen at the park.", "Te robaron la billetera en el parque, con tu tarjeta de débito de Riverbend adentro."),
      opts: [
        { t: T("Lock the card in the app and call Riverbend now", "Bloqueas la tarjeta en la app y llamas a Riverbend ya"), cost: 0, why: T("Reported within 2 business days, the law caps your loss at $50, and like many banks, Riverbend promises $0 when you report fast. The thief's $900 spree gets refunded.", "Si lo reportas en 2 días hábiles, la ley limita tu pérdida a $50, y como muchos bancos, Riverbend promete $0 si reportas rápido. Te devuelven los $900 que gastó el ladrón.") },
        { t: T("Wait for your statement to see if anything was charged", "Esperas tu estado de cuenta para ver si hubo cargos"), cost: 500, why: T("The thief spent $900 by Tuesday. Reported after 2 business days, you could owe up to $500, straight from your checking.", "El ladrón gastó $900 para el martes. Si lo reportas después de 2 días hábiles, podrías deber hasta $500, directo de tu cuenta.") },
        { t: T("Relax: debit cards are protected like credit cards", "Tranquilidad: las tarjetas de débito están protegidas como las de crédito") , cost: 500, why: T("They aren't. A credit card caps you at $50 no matter what. A debit card's cap grows the longer you wait: up to $500 here, on the thief's $900.", "No es así. Una tarjeta de crédito te limita a $50 pase lo que pase. En una de débito, el límite crece mientras más esperas: hasta $500 aquí, de los $900 del ladrón.") },
      ] },
  ];
  const G = { i: 0, done: false, score: 0, cost: 0, log: [] };
  const phone = $("#fd-phone"), whyEl = $("#fd-why"), nextB = $("#fd-next"), optsEl = $("#fd-opts");
  const drawPhone = (r) => {
    const pend = r.pend.reduce((s, p) => s + p[1], 0), avail = r.cur - pend;
    phone.innerHTML = `<div class="fd-screen">
      <div class="fd-bar"><b>Riverbend</b><span>${r.day}</span></div>
      ${r.alert ? `<div class="fd-alert">${r.alert}</div>` : ""}
      <small>${T("Available balance", "Saldo disponible")}</small>
      <div class="fd-avail">${cents(avail)}</div>
      <div class="fd-line"><span>${T("Current balance", "Saldo actual")}</span><b>${cents(r.cur)}</b></div>
      ${r.pend.map((p) => `<div class="fd-line pend"><span>${T("Pending", "Pendiente")} · ${p[0]}</span><b>−${cents(p[1])}</b></div>`).join("")}
      ${r.sched ? `<div class="fd-line pend"><span>${T("Scheduled", "Programado")} · ${r.sched[0]}</span><b>−${cents(r.sched[1])}</b></div>` : ""}
      <div class="fd-line"><span>${T("Overdraft coverage", "Cobertura de sobregiro")}</span><b class="fd-sw ${r.cov ? "on" : ""}">${r.cov ? T("On", "Activada") : T("Off", "Desactivada")}</b></div>
      <div class="fd-line"><span>${T("Peak savings (another bank)", "Ahorro en Peak (otro banco)")}</span><b>$300.00</b></div>
    </div>`;
  };
  const startRound = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#fd-round").textContent = T(`Moment ${G.i + 1} of 6`, `Momento ${G.i + 1} de 6`);
    $("#fd-q").textContent = r.q;
    $("#fd-scene").innerHTML = r.scene;
    drawPhone(r);
    optsEl.innerHTML = r.opts.map((o, k) => `<button type="button" class="fd-opt" data-k="${k}">${o.t}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next moment", "Siguiente momento")} <span class="arrow">→</span>`;
  };
  optsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".fd-opt");
    if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], o = r.opts[+b.dataset.k], ok = o.cost === 0;
    G.cost += o.cost;
    if (ok) G.score++;
    G.log.push({ q: r.day, t: o.t, cost: o.cost });
    $$(".fd-opt").forEach((x) => { x.disabled = true; if (r.opts[+x.dataset.k].cost === 0 && x !== b) x.classList.add("alt"); });
    b.classList.add(ok ? "right" : "wrong");
    whyEl.innerHTML = `<b>${ok ? T("Fee dodged.", "Comisión esquivada.") : T(`That cost you ${cents(o.cost)}.`, `Eso te costó ${cents(o.cost)}.`)}</b> ${o.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#fd-cost").textContent = cents(G.cost);
    $("#fd-cost").classList.toggle("neg", G.cost > 0);
    nextB.disabled = false;
    if (G.i === ROUNDS.length - 1) nextB.innerHTML = `${T("See your month", "Ver tu mes")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < ROUNDS.length - 1) { G.i++; startRound(); return; }
    const res = $("#fd-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/6</span><div><b>${G.score === 6 ? T("A fee-free month", "Un mes sin comisiones") : G.score >= 4 ? T("Close to fee-free", "Casi sin comisiones") : T("The fees got you this time", "Esta vez las comisiones te ganaron")}</b><p>${T(`You paid <b>${cents(G.cost)}</b> in fees and losses. Spend from your available balance, plan transfers days ahead, and lock a lost card the minute you notice.`, `Pagaste <b>${cents(G.cost)}</b> en comisiones y pérdidas. Gasta según tu saldo disponible, planea las transferencias con días de anticipación y bloquea una tarjeta perdida en cuanto te des cuenta.`)}</p></div></div>
      <dl class="rd-cmp">${G.log.map((l) => `<div><dt>${l.q}</dt><dd class="${l.cost ? "no" : "ok"}">${l.cost ? cents(l.cost) : T("$0 ✓", "$0 ✓")}</dd></div>`).join("")}</dl>
      <div style="margin-top:16px"><button class="btn line" type="button" id="fd-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#fd-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, cost: 0, log: [] });
      $("#fd-cost").textContent = "$0.00";
      $("#fd-cost").classList.remove("neg");
      res.classList.add("hidden");
      startRound();
      $("#fd").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / 6) * 100));
    if (first) FH.addXP(50, T("Made it through a month with your debit card", "Pasaste un mes con tu tarjeta de débito"));
    if (G.score === 6) FH.badge("fee-dodger", T("Fee Dodger", "Esquiva comisiones"));
    FH.save();
  });
  startRound();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "You have $40.00 available and buy a $55.00 jacket with your debit card. You've opted in to overdraft coverage, and the fee is $27. What does the jacket really cost?",
      opts: ["$82.00", "$55.00", "$67.00", "$15.00"], a: 0,
      why: "Real cost = purchase + fee = $55 + $27 = $82. The purchase overdraws you by $15, and the fee comes on top." },
    { q: "You have NOT opted in to overdraft coverage. You have $20 available and try to buy a $35 meal with your debit card. What happens?",
      opts: ["It's declined, with no fee", "It's approved, and you pay a $27 overdraft fee", "It's approved, and you pay a $16.82 NSF fee", "The bank pulls the money from your savings at another bank"], a: 0,
      why: "Since 2010, a bank can't charge an overdraft fee on a one-time debit card purchase or ATM withdrawal unless you opt in. Without it, the purchase is simply declined." },
    { q: "Which of these can still overdraw your account even if you never opted in to overdraft coverage?",
      opts: ["An automatic bill payment", "A one-time debit card purchase", "An ATM withdrawal", "A tap-to-pay purchase at a store"], a: 0,
      why: "The opt-in rule covers ATM withdrawals and one-time debit card purchases. Checks and autopays can still be paid with an overdraft fee or returned with an NSF fee." },
    { q: "Your app shows a current balance of $200, with $80 of charges pending. How much can you spend without overdrawing?",
      opts: ["$120", "$200", "$280", "$80"], a: 0,
      why: "Available = current balance − pending = $200 − $80 = $120." },
    { q: "A 2014 CFPB study found a typical debit card overdraft was $24, repaid in 3 days, with a $34 fee. Expressed as a yearly interest rate, that's about:",
      opts: ["17,000%", "142%", "1,700%", "34%"], a: 0,
      why: "<span class='frac'><span>$34</span><span>$24</span></span> = 1.417 for 3 days. Times <span class='frac'><span>365</span><span>3</span></span> = 121.7 stretches in a year: 1.417 × 121.7 ≈ 172, or about 17,000%." },
    { q: "Your debit card is stolen, and you report it to your bank the next morning. Under federal law, what's the most you could owe?",
      opts: ["$50", "$0", "$500", "Everything the thief spent"], a: 0,
      why: "Reported within 2 business days, a lost or stolen debit card's liability is capped at $50. Many banks promise $0, but the law is the floor." },
    { q: "You start the day with $50, opted in, and five charges post largest first instead of in time order. Why can that mean more fees?",
      opts: ["The biggest charge uses up your balance first, so more small charges overdraw", "Each fee gets bigger when charges are larger", "Largest-first posting adds a monthly fee", "Small charges always come with fees"], a: 0,
      why: "Largest first, the $45 bill leaves $5, and four charges overdraw: $108. In time order, coffee and lunch clear first, and only three overdraw: $81." },
  ];
  const QUIZ_ES = [
    { q: "Tienes $40.00 disponibles y compras una chaqueta de $55.00 con tu tarjeta de débito. Aceptaste la cobertura de sobregiro y la comisión es de $27. ¿Cuánto te cuesta en realidad la chaqueta?",
      opts: ["$82.00", "$55.00", "$67.00", "$15.00"], a: 0,
      why: "Costo real = compra + comisión = $55 + $27 = $82. La compra te sobregira por $15, y la comisión va encima." },
    { q: "NO aceptaste la cobertura de sobregiro. Tienes $20 disponibles e intentas pagar una comida de $35 con tu tarjeta de débito. ¿Qué pasa?",
      opts: ["Se rechaza, sin comisión", "Se aprueba y pagas una comisión por sobregiro de $27", "Se aprueba y pagas una comisión por fondos insuficientes de $16.82", "El banco toma el dinero de tu ahorro en otro banco"], a: 0,
      why: "Desde 2010, un banco no puede cobrar comisión por sobregiro en una compra única con tarjeta de débito ni en un retiro de cajero si no aceptas la cobertura. Sin ella, la compra solo se rechaza." },
    { q: "¿Cuál de estos todavía puede sobregirar tu cuenta aunque nunca hayas aceptado la cobertura de sobregiro?",
      opts: ["Un pago automático de una factura", "Una compra única con tarjeta de débito", "Un retiro en cajero automático", "Una compra sin contacto en una tienda"], a: 0,
      why: "La regla de aceptar la cobertura aplica a retiros de cajero y compras únicas con tarjeta de débito. Los cheques y pagos automáticos todavía pueden pagarse con comisión por sobregiro o devolverse con comisión por fondos insuficientes." },
    { q: "Tu app muestra un saldo actual de $200, con $80 en cargos pendientes. ¿Cuánto puedes gastar sin sobregirarte?",
      opts: ["$120", "$200", "$280", "$80"], a: 0,
      why: "Disponible = saldo actual − pendientes = $200 − $80 = $120." },
    { q: "Un estudio de la CFPB de 2014 encontró que un sobregiro típico con tarjeta de débito era de $24, se pagaba en 3 días y tenía una comisión de $34. Como tasa de interés anual, eso es como:",
      opts: ["17,000%", "142%", "1,700%", "34%"], a: 0,
      why: "<span class='frac'><span>$34</span><span>$24</span></span> = 1.417 por 3 días. Por <span class='frac'><span>365</span><span>3</span></span> = 121.7 periodos en un año: 1.417 × 121.7 ≈ 172, o como 17,000%." },
    { q: "Te roban tu tarjeta de débito y lo reportas a tu banco a la mañana siguiente. Según la ley federal, ¿qué es lo más que podrías deber?",
      opts: ["$50", "$0", "$500", "Todo lo que gastó el ladrón"], a: 0,
      why: "Si lo reportas en 2 días hábiles, tu responsabilidad por una tarjeta de débito perdida o robada tiene un límite de $50. Muchos bancos prometen $0, pero la ley es el mínimo." },
    { q: "Empiezas el día con $50, aceptaste la cobertura, y cinco cargos se registran del más grande al más chico en vez de por hora. ¿Por qué eso puede significar más comisiones?",
      opts: ["El cargo más grande se acaba tu saldo primero, así que más cargos chicos sobregiran", "Cada comisión crece cuando los cargos son más grandes", "Registrar del más grande al más chico agrega una comisión mensual", "Los cargos chicos siempre traen comisiones"], a: 0,
      why: "Del más grande al más chico, la factura de $45 deja $5, y cuatro cargos sobregiran: $108. Por hora, el café y el almuerzo pasan primero, y solo tres sobregiran: $81." },
  ];

  FHLesson.init({ id: LESSON, short: "bank-fees", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
