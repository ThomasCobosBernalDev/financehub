// Unit 1, Lesson 1: Checking and savings
(function () {
  const LESSON = "u1-checking-savings";
  const { $, $$, fillRange, wait } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const cents = (n) => (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const APY = 0.04;

  // ---------- See it: split your $900 ----------
  const TOTAL = 900, BILLS = 250, CUSH_LO = 100, CUSH_HI = 200;
  const range = $("#sp-range");
  const renderSplit = () => {
    fillRange(range);
    const sav = +range.value, chk = TOTAL - sav, cush = chk - BILLS;
    $("#sp-move").textContent = money(sav);
    $("#sp-chk").textContent = money(chk);
    $("#sp-sav").textContent = money(sav);
    const fill = $("#sp-fill");
    fill.setAttribute("width", Math.max(0.01, (chk / TOTAL) * 600));
    fill.setAttribute("fill", cush < 0 ? "var(--danger)" : "var(--needs)");
    $("#sp-chk-note").textContent = cush < 0
      ? T(`${money(-cush)} short of the $250 in bills`, `Faltan ${money(-cush)} para los $250 de gastos`)
      : T(`$250 for bills + a ${money(cush)} cushion`, `$250 para gastos + un colchón de ${money(cush)}`);
    $("#sp-sav-note").textContent = T(`Earns about ${cents(sav * APY)} a year`, `Gana unos ${cents(sav * APY)} al año`);
    const msg = $("#sp-msg");
    let tone;
    if (cush < 0) {
      tone = "bad";
      msg.textContent = T(`Checking can't cover the $250 coming out before payday. You'd run ${money(-cush)} short, and an overdraft fee could make it worse.`,
        `La cuenta de cheques no alcanza para los $250 que salen antes del día de pago. Te faltarían ${money(-cush)}, y un cargo por sobregiro lo empeoraría.`);
    } else if (cush < CUSH_LO) {
      tone = "warn";
      msg.textContent = T(`Your bills are covered, but only ${money(cush)} is left for surprises. One flat tire could overdraw checking.`,
        `Tus gastos están cubiertos, pero solo quedan ${money(cush)} para sorpresas. Una llanta desinflada podría sobregirar tu cuenta de cheques.`);
    } else if (cush > CUSH_HI) {
      tone = "warn";
      const extra = cush - CUSH_HI;
      msg.textContent = T(`Safe, but ${money(extra)} more than a $200 cushion is sitting in checking, earning nothing. In savings it would earn ${cents(extra * APY)} a year.`,
        `Seguro, pero hay ${money(extra)} más que un colchón de $200 en la cuenta de cheques, sin ganar nada. En la de ahorro ganaría ${cents(extra * APY)} al año.`);
    } else {
      tone = "good";
      msg.textContent = T(`Nice split. Your bills are covered, you have a ${money(cush)} cushion, and ${money(sav)} in savings earns about ${cents(sav * APY)} a year.`,
        `Buen reparto. Tus gastos están cubiertos, tienes un colchón de ${money(cush)} y ${money(sav)} en ahorro ganan unos ${cents(sav * APY)} al año.`);
      FH.badge("smart-split", T("Smart Split", "Buen reparto"));
    }
    msg.dataset.tone = tone;
  };
  range.addEventListener("input", renderSplit);
  renderSplit();

  // ---------- Play it: run your bank app ----------
  // One month, four weeks. Known bills are shown before each week; surprises aren't.
  const PAY = 600, FEE = 35, CUSHION = 150;
  const B = (en, es, amt) => [T(en, es), amt];
  const WEEKS = [
    { bills: [B("Phone bill · autopay", "Factura del celular · pago automático", 45), B("Groceries · debit card", "Supermercado · tarjeta de débito", 60), B("Gas · debit card", "Gasolina · tarjeta de débito", 40)], surprise: null },
    { bills: [B("Groceries · debit card", "Supermercado · tarjeta de débito", 55), B("Gas · debit card", "Gasolina · tarjeta de débito", 40), B("Streaming · autopay", "Streaming · pago automático", 15), B("Friend's birthday dinner", "Cena de cumpleaños de un amigo", 35)],
      surprise: B("Doctor visit co-pay", "Copago en el doctor", 30) },
    { pay: true, bills: [B("Car insurance · autopay", "Seguro del carro · pago automático", 110), B("Groceries · debit card", "Supermercado · tarjeta de débito", 60), B("Gas · debit card", "Gasolina · tarjeta de débito", 40)],
      surprise: B("Flat tire", "Llanta desinflada", 120) },
    { bills: [B("Groceries · debit card", "Supermercado · tarjeta de débito", 65), B("Gas · debit card", "Gasolina · tarjeta de débito", 40), B("Concert ticket", "Boleto para un concierto", 60)],
      surprise: B("A friend pays you back · payment app", "Un amigo te paga lo que te debía · app de pagos", -25) },
  ];
  const billSum = (wk) => wk.bills.reduce((a, b) => a + b[1], 0);
  // Benchmark: keep each week's bills plus a $150 cushion in checking, and the rest in savings.
  const BENCH = (() => {
    let c = 300 + PAY, s = 0, sum = 0;
    WEEKS.forEach((wk, i) => {
      if (i && wk.pay) c += PAY;
      const move = c - (billSum(wk) + CUSHION);
      s += move; c -= move; sum += s;
      c -= billSum(wk) + (wk.surprise ? wk.surprise[1] : 0);
    });
    return sum / WEEKS.length;
  })();

  let G;
  const ui = { act: $("#g-act"), amt: $("#g-amt"), go: $("#g-go") };
  const line = (name, sub, amt, cls = "") => {
    const li = document.createElement("li");
    li.className = cls;
    li.innerHTML = `<span><b>${name}</b><small>${sub}</small></span><em>${amt > 0 ? "+" : ""}${cents(amt)}</em>`;
    ui.act.prepend(li);
  };
  const flash = (card, cls) => { card.classList.remove(cls); void card.offsetWidth; card.classList.add(cls); };
  const renderBank = () => {
    $("#g-chk").textContent = cents(G.chk);
    $("#g-chk").classList.toggle("neg", G.chk < 0);
    $("#g-sav").textContent = cents(G.sav);
    $("#g-int").textContent = T(`Interest so far this month: ${cents(G.interest)}`, `Interés acumulado este mes: ${cents(G.interest)}`);
    $("#g-wd").textContent = T(`Savings withdrawals: ${G.wd} of 6 this month`, `Retiros de ahorro: ${G.wd} de 6 este mes`);
    $("#g-week").textContent = T(`Week ${Math.min(G.w + 1, 4)} of 4`, `Semana ${Math.min(G.w + 1, 4)} de 4`);
    $("#g-fees").textContent = money(G.fees);
    $("#g-fees").style.color = G.fees ? "var(--danger)" : "";
    $("#g-avg").textContent = money(G.lived ? G.savSum / G.lived : 0);
    $("#g-earn").textContent = cents(G.interest);
    const planning = G.phase === "plan";
    $$("#g-transfer button, #g-transfer input").forEach((x) => (x.disabled = !planning));
    ui.go.disabled = !planning;
  };
  const plan = () => {
    G.phase = "plan";
    const wk = WEEKS[G.w], sum = billSum(wk);
    $("#g-phase").textContent = T(`Plan week ${G.w + 1} of 4`, `Planea la semana ${G.w + 1} de 4`);
    $("#g-title").textContent = T("Coming up this week", "Lo que viene esta semana");
    $("#g-up").innerHTML = wk.bills.map(([n, a]) => `<li><span>${n}</span><b>${cents(-a)}</b></li>`).join("")
      + `<li class="total"><span>${T("Known bills", "Gastos conocidos")}</span><b>${cents(-sum)}</b></li>`
      + `<li class="muted"><span>${T("Plus any surprises you can't see coming", "Más las sorpresas que no puedes ver venir")}</span></li>`;
    let hint = G.w === 0
      ? T(`Your $300 cash and $600 paycheck are in checking. Leave enough for this week's ${money(sum)} plus a cushion, and move the rest to savings.`,
        `Tus $300 en efectivo y tu sueldo de $600 están en la cuenta de cheques. Deja lo suficiente para los ${money(sum)} de esta semana más un colchón, y pasa el resto al ahorro.`)
      : (wk.pay ? T("Payday! $600 just landed in checking. ", "¡Día de pago! Acaban de llegar $600 a tu cuenta de cheques. ") : "")
        + T(`Checking has ${cents(G.chk)} and this week's known bills are ${money(sum)}.`, `La cuenta de cheques tiene ${cents(G.chk)} y los gastos conocidos de esta semana suman ${money(sum)}.`);
    if (G.chk < 0) hint += T(" Checking is below $0, so move money from savings to cover it.", " La cuenta de cheques está debajo de $0, así que pasa dinero del ahorro para cubrirla.");
    $("#g-hint").textContent = hint;
    renderBank();
  };
  const start = () => {
    G = { chk: 0, sav: 0, w: 0, fees: 0, wd: 0, savSum: 0, lived: 0, interest: 0, dir: "save", phase: "plan" };
    ui.act.innerHTML = "";
    G.chk += 300; line(T("Cash deposit", "Depósito en efectivo"), T("Checking", "Cheques"), 300, "in");
    G.chk += PAY; line(T("Direct deposit · paycheck", "Depósito directo · sueldo"), T("Checking", "Cheques"), PAY, "in");
    $("#g-result").classList.add("hidden");
    plan();
  };

  $$(".ph-dir button").forEach((b) => b.addEventListener("click", () => {
    G.dir = b.dataset.dir;
    $$(".ph-dir button").forEach((x) => x.classList.toggle("on", x === b));
  }));
  const readAmt = () => Math.max(0, Math.round(+String(ui.amt.value).replace(/[^\d.]/g, "") || 0));
  $("#g-minus").addEventListener("click", () => { ui.amt.value = Math.max(0, readAmt() - 25); });
  $("#g-plus").addEventListener("click", () => { ui.amt.value = readAmt() + 25; });
  $("#g-move").addEventListener("click", () => {
    if (G.phase !== "plan") return;
    const amt = readAmt();
    if (!amt) return FH.toast(T("Type an amount to move.", "Escribe una cantidad para mover."));
    if (G.dir === "save") {
      if (amt > G.chk) return FH.toast(T(`Checking only has ${cents(Math.max(0, G.chk))}.`, `La cuenta de cheques solo tiene ${cents(Math.max(0, G.chk))}.`));
      G.chk -= amt; G.sav += amt;
      line(T("Transfer to savings", "Transferencia al ahorro"), T("Checking → Savings", "Cheques → Ahorro"), -amt, "move");
    } else {
      if (amt > G.sav) return FH.toast(T(`Savings only has ${cents(G.sav)}.`, `El ahorro solo tiene ${cents(G.sav)}.`));
      if (G.wd >= 6) return FH.toast(T("You've used all 6 savings withdrawals this month.", "Ya usaste los 6 retiros de ahorro de este mes."));
      G.sav -= amt; G.chk += amt; G.wd++;
      line(T("Transfer from savings", "Transferencia desde el ahorro"), T("Savings → Checking", "Ahorro → Cheques"), amt, "move");
    }
    renderBank();
  });

  ui.go.addEventListener("click", async () => {
    if (G.phase !== "plan") return;
    G.phase = "live"; renderBank();
    const wk = WEEKS[G.w];
    // Savings earns interest for the week on what's in it now; the bank pays it at month end.
    G.savSum += G.sav; G.lived++;
    G.interest += (G.sav * APY) / 52;
    $("#g-phase").textContent = T(`Week ${G.w + 1} is happening…`, `La semana ${G.w + 1} está pasando…`);
    const events = wk.bills.map(([n, a]) => ({ n, a })).concat(wk.surprise ? [{ n: wk.surprise[0], a: wk.surprise[1], surprise: true }] : []);
    for (const e of events) {
      await wait(450);
      G.chk -= e.a;
      line(e.n, e.surprise ? T("Surprise! · Checking", "¡Sorpresa! · Cheques") : T("Checking", "Cheques"), -e.a, (e.a < 0 ? "in" : "out") + (e.surprise ? " surprise" : ""));
      if (e.a > 0 && G.chk < 0) {
        await wait(300);
        G.chk -= FEE; G.fees += FEE;
        line(T("Overdraft fee", "Cargo por sobregiro"), T("Checking went below $0", "La cuenta quedó debajo de $0"), -FEE, "fee");
        flash($("#g-chk-card"), "flash-bad");
      }
      renderBank();
    }
    await wait(500);
    G.w++;
    if (G.w >= WEEKS.length) return finish();
    if (WEEKS[G.w].pay) { G.chk += PAY; line(T("Direct deposit · paycheck", "Depósito directo · sueldo"), T("Checking", "Cheques"), PAY, "in"); flash($("#g-chk-card"), "flash-good"); }
    plan();
  });

  const finish = () => {
    G.phase = "done";
    const paid = Math.round(G.interest * 100) / 100;
    G.sav += paid;
    line(T("Interest paid · 4.00% APY", "Interés pagado · 4.00% APY"), T("Savings", "Ahorro"), paid, "in");
    flash($("#g-sav-card"), "flash-good");
    renderBank();
    const avg = G.savSum / WEEKS.length, nFees = G.fees / FEE;
    // Savings earn up to 70 points; each overdraft takes 15 off the other 30, and can pull the total down too.
    const score = Math.max(0, Math.round(Math.min(1, avg / BENCH) * 70 + 30 - 15 * nFees));
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 65 ? "C" : "D";
    $("#g-phase").textContent = T("Month complete", "Mes terminado");
    $("#g-title").textContent = T("How you did", "Cómo te fue");
    $("#g-up").innerHTML = "";
    $("#g-hint").textContent = "";
    const notes = [];
    if (nFees) notes.push(T(`Checking ran dry ${nFees === 1 ? "once" : `${nFees} times`}, and each overdraft cost $35. A cushion of $100 to $200 in checking would have covered the surprises.`,
      `La cuenta de cheques se quedó sin dinero ${nFees === 1 ? "una vez" : `${nFees} veces`}, y cada sobregiro costó $35. Un colchón de $100 a $200 en la cuenta de cheques habría cubierto las sorpresas.`));
    if (avg < BENCH * 0.85) notes.push(T(`Your savings averaged ${money(avg)}. Keeping each week's bills plus a $150 cushion in checking would have let about ${money(BENCH)} sit in savings, earning interest.`,
      `Tu ahorro promedió ${money(avg)}. Dejar en la cuenta de cheques los gastos de cada semana más un colchón de $150 habría dejado unos ${money(BENCH)} en ahorro, ganando interés.`));
    if (!notes.length) notes.push(T("No fees, and most of your money was earning interest. That's exactly how people use these two accounts.", "Sin cargos, y la mayor parte de tu dinero estuvo ganando interés. Así es exactamente como se usan estas dos cuentas."));
    const res = $("#g-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${score} / 100</b><p>${notes.join(" ")} ${T(`At this pace for a full year, your savings would earn about <b>${money(avg * APY)}</b>.`, `A este ritmo durante un año completo, tu ahorro ganaría unos <b>${money(avg * APY)}</b>.`)}</p></div></div>
      <button class="btn line" type="button" id="g-again">${T("Play the month again", "Jugar el mes otra vez")}</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    FH.addXP(first ? 50 : 15, first ? T("Finished your first month", "Terminaste tu primer mes") : T("Another month on the app", "Otro mes en la app"));
    if (grade === "A") FH.badge("bank-app-a", T("Bank App Pro", "Experto en la app del banco"));
    FH.save();
    $("#g-again").addEventListener("click", start);
  };
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Which account is built for everyday spending with a debit card?",
      opts: ["A savings account", "A checking account", "Cash kept at home", "Both accounts equally"], a: 1,
      why: "Checking is for money moving in and out: your pay lands there, and your debit card and bills pull from it. Savings is for money you set aside." },
    { q: "You keep $800 in a savings account paying 4% APY for a full year. About how much interest do you earn?",
      opts: ["$3.20", "$32", "$320", "$8"], a: 1,
      why: "Interest for a year = balance × APY = $800 × 0.04 = $32." },
    { q: "You have $1,000. Spending until your next payday is $300, and you want a $150 cushion. How much should you move to savings?",
      opts: ["$1,000", "$700", "$550", "$150"], a: 2,
      why: "Keep in checking = $300 + $150 = $450. Move to savings = $1,000 − $450 = $550." },
    { q: "Why don't most people keep all of their money in savings?",
      opts: ["Bills and card swipes come out of checking, and savings withdrawals are limited", "Savings accounts can only hold a few thousand dollars before they're full", "Money in savings stops earning interest once a month has gone by", "The bank charges you interest for every dollar kept in savings"], a: 0,
      why: "Your debit card and autopay bills pull from checking, so checking needs enough for them. Many banks also allow only about six withdrawals from savings a month." },
    { q: "You have $40 in checking and use your debit card for $60. Your bank covers it and charges a $35 overdraft fee. How much do you now owe the bank?",
      opts: ["$20", "$35", "$55", "$95"], a: 2,
      why: "You were $60 − $40 = $20 short, plus the $35 fee: $20 + $35 = $55." },
    { q: "What does a 4% APY on a savings account tell you?",
      opts: ["Your balance earns about 4% of itself in a year", "The bank charges you 4% a year to hold your money", "You can take out 4% of your balance each month", "Your balance grows by 4% every single month"], a: 0,
      why: "APY is the percent your balance earns in one year. At 4%, each $100 earns about $4 a year." },
    { q: "The same $500 sits for a year at 0.01% APY in one account and at 4% APY in another. How much more does the 4% account earn?",
      opts: ["$0.05", "$4.00", "$19.95", "$20.05"], a: 2,
      why: "$500 × 0.04 = $20, and $500 × 0.0001 = $0.05. The difference is $20 − $0.05 = $19.95." },
  ];

  const QUIZ_ES = [
    { q: "¿Qué cuenta está hecha para los gastos de todos los días con tarjeta de débito?",
      opts: ["Una cuenta de ahorro", "Una cuenta de cheques", "Efectivo guardado en casa", "Las dos cuentas por igual"], a: 1,
      why: "La cuenta de cheques es para el dinero que entra y sale: ahí llega tu sueldo, y de ahí salen los pagos con tu tarjeta de débito y tus pagos fijos. La de ahorro es para el dinero que apartas." },
    { q: "Tienes $800 en una cuenta de ahorro que paga 4% APY durante un año completo. ¿Más o menos cuánto interés ganas?",
      opts: ["$3.20", "$32", "$320", "$8"], a: 1,
      why: "Interés del año = saldo × APY = $800 × 0.04 = $32." },
    { q: "Tienes $1,000. Lo que gastas hasta tu próximo día de pago son $300, y quieres un colchón de $150. ¿Cuánto debes pasar al ahorro?",
      opts: ["$1,000", "$700", "$550", "$150"], a: 2,
      why: "Dejar en cheques = $300 + $150 = $450. Pasar al ahorro = $1,000 − $450 = $550." },
    { q: "¿Por qué la mayoría de la gente no guarda todo su dinero en la cuenta de ahorro?",
      opts: ["Los pagos fijos y la tarjeta salen de cheques, y los retiros de ahorro tienen límite", "Las cuentas de ahorro solo aguantan unos cuantos miles de dólares antes de llenarse", "El dinero en la cuenta de ahorro deja de ganar interés después de un mes", "El banco te cobra interés por cada dólar que guardas en tu cuenta de ahorro"], a: 0,
      why: "Tu tarjeta de débito y tus pagos automáticos salen de la cuenta de cheques, así que necesita lo suficiente para ellos. Además, muchos bancos permiten solo unos seis retiros del ahorro al mes." },
    { q: "Tienes $40 en tu cuenta de cheques y usas tu tarjeta de débito para pagar $60. El banco lo cubre y te cobra un cargo por sobregiro de $35. ¿Cuánto le debes ahora al banco?",
      opts: ["$20", "$35", "$55", "$95"], a: 2,
      why: "Te faltaban $60 − $40 = $20, más el cargo de $35: $20 + $35 = $55." },
    { q: "¿Qué te dice un APY de 4% en una cuenta de ahorro?",
      opts: ["Tu saldo gana más o menos el 4% de sí mismo en un año", "El banco te cobra 4% al año por guardar tu dinero", "Puedes sacar el 4% de tu saldo cada mes", "Tu saldo crece un 4% cada mes, todos los meses"], a: 0,
      why: "El APY es el porcentaje que gana tu saldo en un año. Al 4%, cada $100 ganan unos $4 al año." },
    { q: "Los mismos $500 pasan un año al 0.01% APY en una cuenta y al 4% APY en otra. ¿Cuánto más gana la cuenta al 4%?",
      opts: ["$0.05", "$4.00", "$19.95", "$20.05"], a: 2,
      why: "$500 × 0.04 = $20, y $500 × 0.0001 = $0.05. La diferencia es $20 − $0.05 = $19.95." },
  ];

  FHLesson.init({ id: LESSON, short: "checking-savings", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
