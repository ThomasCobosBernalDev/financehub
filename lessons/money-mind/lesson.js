// Unit 10, Lesson 3: Why we make bad money choices
(function () {
  const LESSON = "u10-money-mind";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const sgn = (n) => (n < 0 ? "−$" : n > 0 ? "+$" : "$") + Math.abs(n).toLocaleString("en-US");

  // ---------- See it: the coin flip ----------
  const wEl = $("#la-w");
  const setBar = (el, v) => {
    const w = (Math.min(Math.abs(v), 100) / 100) * 50;
    el.style.left = (v >= 0 ? 50 : 50 - w) + "%";
    el.style.width = w + "%";
    el.dataset.tone = v > 0 ? "good" : v < 0 ? "warn" : "";
  };
  const drawLa = () => {
    const W = +wEl.value, math = (W - 100) / 2, feel = (W - 200) / 2;
    $("#la-w-v").textContent = "$" + W;
    setBar($("#la-math"), math);
    setBar($("#la-feel"), feel);
    $("#la-out").innerHTML = [
      [T("Average result", "Resultado promedio"), `${fr(`$${W} − $100`, "2")} = <b>${sgn(math)}</b>`],
      [T("How it feels", "Cómo se siente"), `${fr(`$${W} − $200`, "2")} = <b>${sgn(feel)}</b>`],
    ].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
    const m = $("#la-msg");
    if (math === 0) { m.textContent = T(`A fair bet: you break even on average, but it feels like ${sgn(feel)}, so almost everyone says no.`, `Una apuesta pareja: en promedio quedas igual, pero se siente como ${sgn(feel)}, así que casi todos dicen que no.`); m.dataset.tone = "warn"; }
    else if (math < 0) { m.textContent = T("A bad bet: on average you lose. Saying no is right.", "Una mala apuesta: en promedio pierdes. Decir que no es lo correcto."); m.dataset.tone = "warn"; }
    else if (feel < 0) { m.textContent = T(`The math says take it (${sgn(math)} on average), but it feels like ${sgn(feel)}. This is where loss aversion makes people say no.`, `Las cuentas dicen que sí (${sgn(math)} en promedio), pero se siente como ${sgn(feel)}. Aquí es donde la aversión a las pérdidas hace que la gente diga que no.`); m.dataset.tone = "warn"; }
    else if (feel === 0) { m.textContent = T("At a $200 prize, it finally feels even. Most people start saying yes around here.", "Con un premio de $200, por fin se siente parejo. La mayoría empieza a decir que sí por aquí."); m.dataset.tone = ""; }
    else { m.textContent = T("Now the math and the feeling agree: take the bet, if you can afford to lose $100.", "Ahora las cuentas y el sentimiento coinciden: acepta la apuesta, si puedes darte el lujo de perder $100."); m.dataset.tone = "good"; }
    fillRange(wEl);
  };
  wEl.addEventListener("input", drawLa);
  drawLa();

  // ---------- Play it: name the trap ----------
  const B = {
    ma: T("Mental accounting", "Contabilidad mental"), la: T("Loss aversion", "Aversión a las pérdidas"), pb: T("Present bias", "Sesgo del presente"),
    an: T("Anchoring", "Anclaje"), hb: T("Herd behavior", "Efecto manada"), oc: T("Overconfidence", "Exceso de confianza"),
  };
  const ROUNDS = [
    { facts: [T("Tax refund: $800", "Reembolso de impuestos: $800"), T("Credit card balance: $800 at 22% a year", "Saldo de tarjeta: $800 al 22% anual"), T("You spend the refund on a trip because \"it's extra money\"", "Gastas el reembolso en un viaje porque \"es dinero extra\"")],
      a: "ma", o: ["pb", "hb"], why: T("The refund spends like any other dollar. Paying the card would save $800 × 0.22 = $176 a year.", "El reembolso se gasta como cualquier otro dólar. Pagar la tarjeta ahorraría $800 × 0.22 = $176 al año.") },
    { facts: [T("You bought a stock at $50", "Compraste una acción a $50"), T("It's now $30", "Ahora vale $30"), T("You won't sell \"until it gets back to $50,\" though you'd never buy it today", "No la vendes \"hasta que vuelva a $50\", aunque hoy nunca la comprarías")],
      a: "la", o: ["an", "oc"], why: T("Selling would make the loss feel real, so you hold on. The $50 isn't coming back just because you paid it.", "Vender haría que la pérdida se sintiera real, así que la conservas. Los $50 no van a volver solo porque los pagaste.") },
    { facts: [T("Your goal: save $100 a month", "Tu meta: ahorrar $100 al mes"), T("Each month you say \"I'll start next month\"", "Cada mes dices \"empiezo el próximo mes\""), T("It's been 5 months: $500 not saved", "Ya van 5 meses: $500 sin ahorrar")],
      a: "pb", o: ["ma", "la"], why: T("Today always wins over the future. An automatic transfer on payday fixes it.", "Hoy siempre le gana al futuro. Una transferencia automática el día de pago lo arregla.") },
    { facts: [T("A car dealer first says $30,000", "Un vendedor de carros primero dice $30,000"), T("Then offers a \"special deal\": $26,000", "Luego ofrece un \"trato especial\": $26,000"), T("The same car sells for $24,000 elsewhere", "El mismo carro se vende en $24,000 en otro lado")],
      a: "an", o: ["hb", "pb"], why: T("The $30,000 made $26,000 feel like a win. Compared with the real market, you'd overpay by $2,000.", "Los $30,000 hicieron que $26,000 se sintiera como un triunfo. Comparado con el mercado real, pagarías $2,000 de más.") },
    { facts: [T("A new coin is up 300% this month", "Una moneda digital nueva subió 300% este mes"), T("All your coworkers are buying", "Todos tus compañeros de trabajo están comprando"), T("You buy $1,000 without looking into it", "Compras $1,000 sin investigar")],
      a: "hb", o: ["oc", "ma"], why: T("You bought because everyone else did, after the price had already jumped.", "Compraste porque todos compraban, después de que el precio ya había subido.") },
    { facts: [T("Your last 3 stock picks went up", "Tus últimas 3 acciones subieron"), T("Your emergency fund: $5,000", "Tu fondo de emergencia: $5,000"), T("You move all $5,000 into one stock you're \"sure about\"", "Pasas los $5,000 a una acción de la que estás \"seguro\"")],
      a: "oc", o: ["hb", "an"], why: T("Three wins can be luck. Betting your safety net on one stock is taking far too much risk.", "Tres aciertos pueden ser suerte. Apostar tu red de seguridad a una sola acción es arriesgar demasiado.") },
    { facts: [T("Offer: a 50/50 coin flip", "Oferta: lanzar una moneda, 50/50"), T("Heads you win $80, tails you lose $50", "Si sale cara ganas $80, si sale cruz pierdes $50"), T("You say no right away", "Dices que no de inmediato")],
      a: "la", o: ["pb", "ma"], why: `${fr("$80 − $50", "2")} = ${T("+$15 on average. It's a good bet, but the $50 loss feels bigger than the $80 win.", "+$15 en promedio. Es una buena apuesta, pero perder $50 se siente más que ganar $80.")}` },
    { facts: [T("Choice: $50 today", "Opción: $50 hoy"), T("Or $60 next week", "O $60 la próxima semana"), T("You don't need the money this week", "No necesitas el dinero esta semana")],
      a: "pb", o: ["an", "oc"], why: `${fr("$60 − $50", "$50")} = ${T("0.20, a 20% return for waiting one week. Taking $50 now is present bias.", "0.20, un rendimiento de 20% por esperar una semana. Tomar $50 hoy es sesgo del presente.")}` },
  ].map((r) => ({ ...r, opts: [B[r.a], ...r.o.map((k) => B[k])], a: 0 }));
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#nb-why"), nextB = $("#nb-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#nb-round").textContent = T(`Moment ${G.i + 1} of ${N}`, `Momento ${G.i + 1} de ${N}`);
    $("#nb-q").textContent = T("Which trap is this?", "¿Qué trampa es esta?");
    $("#nb-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#nb-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next moment", "Siguiente momento")} <span class="arrow">→</span>`;
  };
  $("#nb-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#nb-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right:", "Correcto:") : T("Not quite:", "No exactamente:")} ${r.opts[0]}.</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#nb-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#nb-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Bias buster", "Detector de sesgos") : G.score >= 6 ? T("Hard to fool", "Difícil de engañar") : T("Review the six traps", "Repasa las seis trampas")}</b><p>${T("Pause, name the trap, do the math, then set a rule.", "Haz una pausa, nombra la trampa, haz las cuentas y luego pon una regla.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="nb-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#nb-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#nb-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#nb").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Named eight money traps", "Nombraste ocho trampas del dinero"));
    if (G.score === N) FH.badge("bias-buster");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What does loss aversion describe?", opts: ["A loss feels about twice as strong as a gain of the same size", "People avoid all investments", "Losses are taxed more than gains", "People forget their losses quickly"], a: 0, why: "Kahneman and Tversky found losses weigh roughly twice as much as equal gains." },
    { q: "A 50/50 coin flip: heads you win $300, tails you lose $200. What is the average result?", opts: ["+$50", "+$100", "+$250", "−$50"], a: 0, why: `${fr("$300 − $200", "2")} = +$50 on average.` },
    { q: "Which is an example of mental accounting?", opts: ["Spending a $500 refund on \"fun\" while carrying credit card debt", "Comparing two loan rates before signing", "Saving 10% of every paycheck automatically", "Checking your bank balance weekly"], a: 0, why: "Treating the refund as separate \"fun money\" ignores that it could pay down costly debt." },
    { q: "A laptop is tagged \"List price $1,000, today $700.\" What role does the $1,000 play?", opts: ["It's an anchor that makes $700 feel cheap", "It's the laptop's true value", "It's the store's cost", "It's the sales tax"], a: 0, why: "The first number shapes how the second feels. What matters is whether $700 is a good price and whether you need it." },
    { q: "Choosing $50 today over $60 next month, when you don't need the money now, is an example of:", opts: ["Present bias", "Herd behavior", "Anchoring", "Overconfidence"], a: 0, why: `Waiting pays ${fr("$60 − $50", "$50")} = 0.20, a 20% return in one month. Grabbing $50 now is present bias.` },
    { q: "Automatic 401(k) sign-up raised participation from about 37% to 86% at one company. What does this show?", opts: ["Defaults strongly shape behavior", "People dislike retirement plans", "Higher pay causes saving", "Workers were forced to save"], a: 0, why: "Workers could still opt out. Only the default changed, and participation more than doubled." },
    { q: "In Barber and Odean's study, the households that traded most earned 11.4% a year while the market returned 17.9%. What's the lesson?", opts: ["Overconfident frequent trading tends to lower returns", "Trading more raises returns", "The market is always wrong", "Only professionals should own stocks"], a: 0, why: "Overconfidence leads to too much trading, and the costs and bad timing add up." },
    { q: "You buy a hyped stock at $80 after it ran up from $20. It falls to $40. What is your percent loss?", opts: ["50%", "40%", "25%", "100%"], a: 0, why: `${fr("$40 − $80", "$80")} = −0.50, a 50% loss. Following the herd meant buying late.` },
  ];
  const QUIZ_ES = [
    { q: "¿Qué describe la aversión a las pérdidas?", opts: ["Una pérdida se siente cerca del doble que una ganancia del mismo tamaño", "La gente evita todas las inversiones", "Las pérdidas pagan más impuestos que las ganancias", "La gente olvida rápido sus pérdidas"], a: 0, why: "Kahneman y Tversky encontraron que las pérdidas pesan más o menos el doble que ganancias iguales." },
    { q: "Lanzas una moneda, 50/50: si sale cara ganas $300, si sale cruz pierdes $200. ¿Cuál es el resultado promedio?", opts: ["+$50", "+$100", "+$250", "−$50"], a: 0, why: `${fr("$300 − $200", "2")} = +$50 en promedio.` },
    { q: "¿Cuál es un ejemplo de contabilidad mental?", opts: ["Gastar un reembolso de $500 en \"diversión\" mientras debes en la tarjeta", "Comparar dos tasas de préstamo antes de firmar", "Ahorrar 10% de cada sueldo de forma automática", "Revisar tu saldo del banco cada semana"], a: 0, why: "Tratar el reembolso como \"dinero para divertirse\" ignora que podría pagar una deuda cara." },
    { q: "Una laptop dice \"Precio de lista $1,000, hoy $700\". ¿Qué papel juegan los $1,000?", opts: ["Son un ancla que hace que $700 se sienta barato", "Son el valor real de la laptop", "Son lo que le costó a la tienda", "Son el impuesto"], a: 0, why: "El primer número cambia cómo se siente el segundo. Lo que importa es si $700 es buen precio y si la necesitas." },
    { q: "Elegir $50 hoy en vez de $60 el próximo mes, cuando no necesitas el dinero ahora, es un ejemplo de:", opts: ["Sesgo del presente", "Efecto manada", "Anclaje", "Exceso de confianza"], a: 0, why: `Esperar paga ${fr("$60 − $50", "$50")} = 0.20, un rendimiento de 20% en un mes. Tomar $50 hoy es sesgo del presente.` },
    { q: "La inscripción automática al 401(k) subió la participación de cerca de 37% a 86% en una empresa. ¿Qué muestra esto?", opts: ["Las opciones predeterminadas influyen mucho en lo que hacemos", "A la gente no le gustan los planes de retiro", "Un sueldo más alto hace que la gente ahorre", "Obligaron a los trabajadores a ahorrar"], a: 0, why: "Los trabajadores aún podían salirse. Solo cambió la opción predeterminada, y la participación se duplicó con creces." },
    { q: "En el estudio de Barber y Odean, los hogares que más operaban ganaron 11.4% al año mientras el mercado dio 17.9%. ¿Cuál es la lección?", opts: ["Operar mucho por exceso de confianza suele bajar los rendimientos", "Operar más sube los rendimientos", "El mercado siempre se equivoca", "Solo los profesionales deberían tener acciones"], a: 0, why: "El exceso de confianza lleva a operar demasiado, y los costos y el mal momento se van sumando." },
    { q: "Compras una acción de moda a $80 después de que subió desde $20. Cae a $40. ¿Cuál es tu pérdida en porcentaje?", opts: ["50%", "40%", "25%", "100%"], a: 0, why: `${fr("$40 − $80", "$80")} = −0.50, una pérdida de 50%. Seguir a la manada significó comprar tarde.` },
  ];

  FHLesson.init({ id: LESSON, short: "money-mind", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
