// Unit 3, Lesson 3: Make your savings earn more (high-yield savings)
(function () {
  const LESSON = "u3-high-yield";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const cents = (x) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");

  // ---------- See it: rate comparison ----------
  const balEl = $("#hy-bal"), apyEl = $("#hy-apy");
  let years = 1;
  const grow = (b, apy, y) => b * Math.pow(1 + apy / 100, y) - b;
  const draw = () => {
    const bal = +balEl.value, apy = +apyEl.value;
    $("#hy-bal-v").textContent = usd(bal);
    $("#hy-apy-v").textContent = `${apy.toFixed(2)}%`;
    const rows = [
      [T("Big bank", "Banco grande"), 0.01, "low"],
      [T("National average", "Promedio nacional"), 0.38, "avg"],
      [T("Your pick", "Tu elección"), apy, "you"],
    ].map(([n, r, cls]) => ({ n, r, cls, i: grow(bal, r, years) }));
    const top = Math.max(...rows.map((x) => x.i), 1);
    $("#hy-bars").innerHTML = rows.map((x) => `<div class="hy-row ${x.cls}"><span>${x.n} <small>${x.r.toFixed(2)}%</small></span><div class="hy-track"><i style="width:${Math.max(0.6, (100 * x.i) / top).toFixed(1)}%"></i></div><b>${cents(x.i)}</b></div>`).join("");
    const extra = rows[2].i - rows[1].i;
    const yl = years === 1 ? T("1 year", "1 año") : T(`${years} years`, `${years} años`);
    $("#hy-msg").innerHTML = extra >= 0
      ? T(`In ${yl}, ${usd(bal)} at ${apy.toFixed(2)}% earns <b>${cents(rows[2].i)}</b>: <b>${cents(extra)}</b> more than the national average, with the same FDIC protection.`,
        `En ${yl}, ${usd(bal)} al ${apy.toFixed(2)}% gana <b>${cents(rows[2].i)}</b>: <b>${cents(extra)}</b> más que el promedio nacional, con la misma protección de la FDIC.`)
      : T(`At ${apy.toFixed(2)}% you'd earn less than the national average. Shop around.`, `Al ${apy.toFixed(2)}% ganarías menos que el promedio nacional. Compara opciones.`);
    $("#hy-msg").dataset.tone = extra >= 0 ? "good" : "warn";
    fillRange(balEl); fillRange(apyEl);
  };
  balEl.addEventListener("input", draw);
  apyEl.addEventListener("input", draw);
  $$("#hy-y .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#hy-y .chip").forEach((x) => x.classList.toggle("on", x === c));
    years = +c.dataset.v; draw();
  }));
  draw();

  // ---------- Play it: pick the better account ----------
  // Each card: name, lines of facts, and what $3,600 earns in a year (net).
  const ROUNDS = [
    { a: { name: T("Big Bank Savings", "Ahorro Banco Grande"), facts: [T("0.01% APY", "0.01% APY"), T("FDIC insured", "Asegurado por la FDIC"), T("No fees", "Sin comisiones")], earn: 0.36 },
      b: { name: T("Online Bank Savings", "Ahorro Banco en Línea"), facts: [T("4.00% APY", "4.00% APY"), T("FDIC insured", "Asegurado por la FDIC"), T("No fees", "Sin comisiones")], earn: 144 },
      best: "b", why: T("Same safety, same fees. $3,600 × 0.04 = $144 beats $3,600 × 0.0001 = $0.36.", "Misma seguridad, mismas comisiones. $3,600 × 0.04 = $144 le gana a $3,600 × 0.0001 = $0.36.") },
    { a: { name: T("Zippy Cash App", "App Zippy Cash"), facts: [T("4.50% APY", "4.50% APY"), T("Not a bank, and not FDIC insured", "No es banco y no tiene seguro de la FDIC"), T("No fees", "Sin comisiones")], earn: 162 },
      b: { name: T("Riverbend Savings", "Ahorro Riverbend"), facts: [T("4.00% APY", "4.00% APY"), T("FDIC insured", "Asegurado por la FDIC"), T("No fees", "Sin comisiones")], earn: 144 },
      best: "b", why: T("The extra $18 isn't worth risking your whole $3,600 emergency fund. Insurance comes first.", "Los $18 extra no valen arriesgar todo tu fondo de emergencia de $3,600. Primero el seguro.") },
    { a: { name: T("Promo Savings", "Ahorro Promo"), facts: [T("5.00% APY for the first 3 months", "5.00% APY los primeros 3 meses"), T("Then 0.50% APY", "Después 0.50% APY"), T("FDIC insured", "Asegurado por la FDIC")], earn: 58.5 },
      b: { name: T("Steady Savings", "Ahorro Estable"), facts: [T("4.00% APY", "4.00% APY"), T("FDIC insured", "Asegurado por la FDIC"), T("No fees", "Sin comisiones")], earn: 144 },
      best: "b", why: T("The teaser earns $45 in 3 months, then just $13.50 in the next 9: $58.50. The steady 4% earns $144.", "La promoción gana $45 en 3 meses y solo $13.50 en los 9 siguientes: $58.50. El 4% estable gana $144.") },
    { a: { name: T("Premier Savings", "Ahorro Premier"), facts: [T("4.00% APY", "4.00% APY"), T("$5 monthly fee unless you keep $10,000", "Comisión de $5 al mes si no tienes $10,000"), T("FDIC insured", "Asegurado por la FDIC")], earn: 84 },
      b: { name: T("Simple Savings", "Ahorro Sencillo"), facts: [T("3.75% APY", "3.75% APY"), T("No fees", "Sin comisiones"), T("FDIC insured", "Asegurado por la FDIC")], earn: 135 },
      best: "b", why: T("You have $3,600, so you'd pay the fee: $144 − 12 × $5 = $84. The no-fee 3.75% earns $3,600 × 0.0375 = $135.", "Tienes $3,600, así que pagarías la comisión: $144 − 12 × $5 = $84. El 3.75% sin comisión gana $3,600 × 0.0375 = $135.") },
    { a: { name: T("Hometown Credit Union", "Cooperativa del Pueblo"), facts: [T("4.10% APY", "4.10% APY"), T("NCUA insured", "Asegurado por la NCUA"), T("No fees", "Sin comisiones")], earn: 147.6 },
      b: { name: T("Online Bank Savings", "Ahorro Banco en Línea"), facts: [T("4.00% APY", "4.00% APY"), T("FDIC insured", "Asegurado por la FDIC"), T("No fees", "Sin comisiones")], earn: 144 },
      best: "a", why: T("NCUA protects credit unions just like the FDIC protects banks. Both are safe, so the higher APY wins: $3,600 × 0.041 = $147.60.", "La NCUA protege a las cooperativas igual que la FDIC a los bancos. Las dos son seguras, así que gana el APY más alto: $3,600 × 0.041 = $147.60.") },
    { a: { name: T("Savings at your checking bank", "Ahorro en tu banco de cheques"), facts: [T("0.40% APY", "0.40% APY"), T("Transfers to checking: instant", "Transferencias a cheques: al instante"), T("FDIC insured", "Asegurado por la FDIC")], earn: 14.4 },
      b: { name: T("Online high-yield savings", "Ahorro de alto rendimiento en línea"), facts: [T("4.00% APY", "4.00% APY"), T("Transfers to checking: 1 to 2 business days", "Transferencias a cheques: 1 a 2 días hábiles"), T("FDIC insured", "Asegurado por la FDIC")], earn: 144 },
      best: "b", why: T("For an emergency fund, waiting 1 to 2 days is fine, and it earns $144 instead of $14.40. Keep a small cushion in checking for same-day needs.", "Para un fondo de emergencia, esperar 1 o 2 días está bien, y gana $144 en vez de $14.40. Deja un colchón pequeño en cheques para lo del mismo día.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#pb-why"), nextB = $("#pb-next");
  const card = (k, c) => `<button type="button" class="pb-card" data-k="${k}"><b>${c.name}</b><ul>${c.facts.map((f) => `<li>${f}</li>`).join("")}</ul><span class="pb-earn">${T("A year on $3,600", "Un año con $3,600")}: <b>${cents(c.earn)}</b></span></button>`;
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#pb-round").textContent = T(`Offer ${G.i + 1} of ${N}`, `Oferta ${G.i + 1} de ${N}`);
    $("#pb-pair").innerHTML = card("a", r.a) + card("b", r.b);
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next offer", "Siguiente oferta")} <span class="arrow">→</span>`;
  };
  $("#pb-pair").addEventListener("click", (e) => {
    const b = e.target.closest(".pb-card"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = b.dataset.k === r.best;
    G.n++; if (ok) G.score++;
    $$("#pb-pair .pb-card").forEach((x) => { x.disabled = true; x.classList.add("shown"); if (x.dataset.k === r.best) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Good pick.", "Buena elección.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#pb-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#pb-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Rate shopper", "Cazador de tasas") : G.score >= 4 ? T("Sharp saver", "Buen ahorrador") : T("Check insurance, fees and teasers first", "Revisa primero el seguro, las comisiones y las promociones")}</b><p>${T("Insured first, then the highest APY after fees, for the whole year, not just the first months.", "Primero que esté asegurado, luego el APY más alto después de comisiones, por todo el año y no solo los primeros meses.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="pb-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#pb-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#pb-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#pb").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Compared six savings accounts", "Comparaste seis cuentas de ahorro"));
    if (G.score === N) FH.badge("rate-shopper");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Why is APY the best number for comparing savings accounts?", opts: ["It counts compounding, so it's what you really earn in a year", "It's always the highest number the bank shows", "It includes the bank's fees", "It never changes"], a: 0, why: "APY counts interest on interest. The plain interest rate is a bit lower, so compare APY to APY. Fees are separate." },
    { q: "You keep $3,600 in savings at 4.00% APY for one year. How much interest do you earn?", opts: ["$144", "$14.40", "$1,440", "$36"], a: 0, why: "Interest = balance × APY: $3,600 × 0.04 = $144." },
    { q: "How much more does $3,600 earn in a year at 4.00% APY than at the 0.38% national average?", opts: ["$130.32", "$144.00", "$13.68", "$3.62"], a: 0, why: "$3,600 × (0.04 − 0.0038) = $3,600 × 0.0362 = $130.32." },
    { q: "Why can many online banks pay higher savings rates?", opts: ["They have no branches to pay for", "They aren't insured", "They take more risk with your money", "The government pays them extra"], a: 0, why: "Online banks save on branches and pass some of it to savers. At an FDIC-insured online bank, your money is just as protected." },
    { q: "Your savings is at an FDIC-insured bank. How much of it is protected if the bank fails?", opts: ["Up to $250,000 per person, per bank", "Up to $10,000", "Only the interest", "None of it"], a: 0, why: "FDIC insurance covers up to $250,000 per person, per bank. Credit unions get the same from the NCUA." },
    { q: "An account pays 5.00% APY for 3 months, then 0.50%. What does $3,600 earn in the first year?", opts: ["$58.50", "$180.00", "$144.00", "$18.00"], a: 0, why: `3 months: $3,600 × 0.05 × <span class='frac'><span>3</span><span>12</span></span> = $45. 9 months: $3,600 × 0.005 × <span class='frac'><span>9</span><span>12</span></span> = $13.50. Total $58.50.` },
    { q: "A 4.00% APY account charges $5 a month unless you keep $10,000. You keep $3,600. What do you net in a year?", opts: ["$84", "$144", "$139", "$60"], a: 0, why: "Interest $144 minus fees of 12 × $5 = $60: $144 − $60 = $84." },
    { q: "You earn $144 of savings interest and you're in the 12% tax bracket. How much do you keep?", opts: ["$126.72", "$144.00", "$17.28", "$132.00"], a: 0, why: "Interest is income, taxed at your marginal rate: $144 × 0.12 = $17.28 of tax, so you keep $144 − $17.28 = $126.72." },
  ];
  const QUIZ_ES = [
    { q: "¿Por qué el APY es el mejor número para comparar cuentas de ahorro?", opts: ["Cuenta el interés compuesto, así que es lo que de verdad ganas en un año", "Siempre es el número más alto que muestra el banco", "Incluye las comisiones del banco", "Nunca cambia"], a: 0, why: "El APY cuenta el interés sobre el interés. La tasa de interés simple es un poco menor, así que compara APY con APY. Las comisiones van aparte." },
    { q: "Guardas $3,600 en ahorro al 4.00% APY por un año. ¿Cuánto interés ganas?", opts: ["$144", "$14.40", "$1,440", "$36"], a: 0, why: "Interés = saldo × APY: $3,600 × 0.04 = $144." },
    { q: "¿Cuánto más ganan $3,600 en un año al 4.00% APY que al promedio nacional de 0.38%?", opts: ["$130.32", "$144.00", "$13.68", "$3.62"], a: 0, why: "$3,600 × (0.04 − 0.0038) = $3,600 × 0.0362 = $130.32." },
    { q: "¿Por qué muchos bancos en línea pueden pagar tasas de ahorro más altas?", opts: ["No tienen sucursales que pagar", "No están asegurados", "Arriesgan más tu dinero", "El gobierno les paga extra"], a: 0, why: "Los bancos en línea se ahorran las sucursales y pasan parte de eso a quienes ahorran. En un banco en línea asegurado por la FDIC, tu dinero está igual de protegido." },
    { q: "Tu ahorro está en un banco asegurado por la FDIC. ¿Cuánto está protegido si el banco quiebra?", opts: ["Hasta $250,000 por persona, por banco", "Hasta $10,000", "Solo el interés", "Nada"], a: 0, why: "El seguro de la FDIC cubre hasta $250,000 por persona, por banco. Las cooperativas tienen lo mismo con la NCUA." },
    { q: "Una cuenta paga 5.00% APY por 3 meses y luego 0.50%. ¿Cuánto ganan $3,600 el primer año?", opts: ["$58.50", "$180.00", "$144.00", "$18.00"], a: 0, why: `3 meses: $3,600 × 0.05 × <span class='frac'><span>3</span><span>12</span></span> = $45. 9 meses: $3,600 × 0.005 × <span class='frac'><span>9</span><span>12</span></span> = $13.50. Total $58.50.` },
    { q: "Una cuenta al 4.00% APY cobra $5 al mes si no tienes $10,000. Tienes $3,600. ¿Cuánto te queda en un año?", opts: ["$84", "$144", "$139", "$60"], a: 0, why: "Interés de $144 menos comisiones de 12 × $5 = $60: $144 − $60 = $84." },
    { q: "Ganas $144 de interés de ahorro y estás en la categoría del 12%. ¿Con cuánto te quedas?", opts: ["$126.72", "$144.00", "$17.28", "$132.00"], a: 0, why: "El interés es ingreso y paga tu tasa marginal: $144 × 0.12 = $17.28 de impuesto, así que te quedas con $144 − $17.28 = $126.72." },
  ];

  FHLesson.init({ id: LESSON, short: "high-yield", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
