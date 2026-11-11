// Unit 16, Lesson 2: How trading works
(function () {
  const LESSON = "u16-trading";
  const { $, $$, fillRange, shuffle } = FHLesson;
  const T = FH.t;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const usd = (n, d = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const num = (n) => n.toLocaleString("en-US");

  // ---------- See it: the order book ----------
  const ASKS = [[26.20, 1000], [26.10, 800], [26.05, 500], [26.00, 300]], BIDS = [[25.95, 400], [25.90, 600], [25.80, 900]];
  const nEl = $("#ob-n");
  const W = (s) => (s / 1000) * 380;
  const drawOb = () => {
    const n = +nEl.value;
    let left = n, cost = 0;
    const fill = {};
    [...ASKS].reverse().forEach(([p, s]) => { const t = Math.min(left, s); fill[p] = t; cost += t * p; left -= t; });
    $("#ob-n-v").textContent = T(`${num(n)} shares`, `${num(n)} acciones`);
    let g = "", y = 8;
    ASKS.forEach(([p, s]) => {
      g += `<text x="96" y="${y + 23}" text-anchor="end" class="ob-p">${usd(p)}</text><rect x="110" y="${y}" width="${W(s)}" height="30" rx="6" class="ob-ask"/>`;
      if (fill[p]) g += `<rect x="110" y="${y}" width="${W(fill[p])}" height="30" rx="6" class="ob-fill"/>`;
      g += `<text x="${118 + W(s)}" y="${y + 21}" class="ob-s">${num(s)}</text>`;
      y += 36;
    });
    g += `<text x="300" y="${y + 18}" text-anchor="middle" class="ob-gap">${T("spread: 5¢", "diferencial: 5¢")}</text>`;
    y += 30;
    BIDS.forEach(([p, s]) => { g += `<text x="96" y="${y + 23}" text-anchor="end" class="ob-p">${usd(p)}</text><rect x="110" y="${y}" width="${W(s)}" height="30" rx="6" class="ob-bid"/><text x="${118 + W(s)}" y="${y + 21}" class="ob-s">${num(s)}</text>`; y += 36; });
    $("#ob-out").innerHTML = `<svg viewBox="0 0 600 ${y + 4}" class="ob-chart">${g}</svg>`;
    const avg = cost / n, extra = cost - n * 26;
    const m = $("#ob-msg");
    m.innerHTML = extra < 0.005
      ? T(`${num(n)} shares all fill at <b>$26.00</b>: ${usd(cost)}. No price impact.`, `Las ${num(n)} acciones se compran a <b>$26.00</b>: ${usd(cost)}. Sin impacto en el precio.`)
      : T(`${num(n)} shares cost ${usd(cost)}, an average of <b>${usd(avg, 3)}</b>. That's <b>${usd(extra)}</b> more than if every share cost $26.00.`, `${num(n)} acciones cuestan ${usd(cost)}, un promedio de <b>${usd(avg, 3)}</b>. Son <b>${usd(extra)}</b> más que si cada acción costara $26.00.`);
    m.dataset.tone = extra < 50 ? "good" : "warn";
    fillRange(nEl);
  };
  nEl.addEventListener("input", drawOb);
  drawOb();

  // ---------- Play it: trading desk ----------
  const ROUNDS = [
    { facts: [T("Best bid: $49.90", "Mejor precio de compra: $49.90"), T("Best ask: $50.00", "Mejor precio de venta: $50.00")], q: T("What's the spread?", "¿Cuál es el diferencial?"),
      opts: ["$0.10", "$0.01", "$99.90", "$1.00"], a: 0,
      why: "$50.00 − $49.90 = $0.10." },
    { facts: [T("Best ask: $20.05", "Mejor precio de venta: $20.05"), T("You place a limit order to buy at $19.90", "Pones una orden límite para comprar a $19.90")], q: T("What happens?", "¿Qué pasa?"),
      opts: [T("It waits in the order book", "Espera en el libro de órdenes"), T("It buys right away at $20.05", "Compra de inmediato a $20.05"), T("It buys right away at $19.90", "Compra de inmediato a $19.90")], a: 0,
      why: T("No seller is that low, so your order joins the book and waits.", "Nadie vende tan barato, así que tu orden se suma al libro y espera.") },
    { facts: [T("Two buyers both bid $30.00", "Dos compradores ofrecen $30.00"), T("Buyer A was first, at 10:00:01", "El comprador A llegó primero, a las 10:00:01"), T("Buyer B came at 10:00:02", "El comprador B llegó a las 10:00:02")], q: T("A seller arrives. Who trades first?", "Llega un vendedor. ¿Quién compra primero?"),
      opts: [T("Buyer A", "El comprador A"), T("Buyer B", "El comprador B"), T("They split it", "Se lo reparten")], a: 0,
      why: T("Price-time priority: same price, so the first in line goes first.", "Prioridad de precio y tiempo: mismo precio, así que el primero en la fila va primero.") },
    { facts: [T("Sellers: 200 at $10.00 and 200 at $10.10", "Vendedores: 200 a $10.00 y 200 a $10.10"), T("You buy 400 at market", "Compras 400 a mercado")], q: T("What's your average price?", "¿Cuál es tu precio promedio?"),
      opts: ["$10.05", "$10.00", "$10.10", "$10.20"], a: 0,
      why: `200 × $10.00 + 200 × $10.10 = $4,040. ${fr("$4,040", "400")} = $10.05.` },
    { facts: [T("Stock A: spread 1 cent, 50 million shares a day", "Acción A: diferencial de 1 centavo, 50 millones de acciones al día"), T("Stock B: spread 40 cents, 20,000 shares a day", "Acción B: diferencial de 40 centavos, 20,000 acciones al día")], q: T("Which is more liquid?", "¿Cuál es más líquida?"),
      opts: [T("Stock A", "La acción A"), T("Stock B", "La acción B"), T("The same", "Igual")], a: 0,
      why: T("A tight spread and lots of trading mean you can trade without moving the price.", "Un diferencial pequeño y mucho volumen significan que puedes operar sin mover el precio.") },
    { facts: [T("A market maker buys at $15.00 and sells at $15.04", "Un creador de mercado compra a $15.00 y vende a $15.04"), T("It does 10,000 round trips", "Hace 10,000 idas y vueltas")], q: T("What does it earn if the price holds still?", "¿Cuánto gana si el precio no se mueve?"),
      opts: ["$400", "$40", "$4,000", "$150,400"], a: 0,
      why: "10,000 × $0.04 = $400." },
    { facts: [T("You short 100 shares at $40", "Vendes en corto 100 acciones a $40"), T("The price rises to $55", "El precio sube a $55")], q: T("What's your loss if you buy back now?", "¿Cuánto pierdes si recompras ahora?"),
      opts: ["$1,500", "$5,500", "$4,000", "$150"], a: 0,
      why: T("Buy back for 100 × $55 = $5,500, after selling for $4,000: $5,500 − $4,000 = $1,500 lost.", "Recompras en 100 × $55 = $5,500, después de vender en $4,000: $5,500 − $4,000 = $1,500 de pérdida.") },
    { facts: [T("You buy a U.S. stock on Thursday", "Compras una acción de EE. UU. el jueves")], q: T("When does it settle?", "¿Cuándo se liquida?"),
      opts: [T("Friday", "El viernes"), T("Thursday", "El jueves"), T("Next Monday", "El lunes siguiente"), T("Next Thursday", "El jueves siguiente")], a: 0,
      why: T("T+1: one business day after the trade.", "T+1: un día hábil después de la operación.") },
  ];
  const N = ROUNDS.length;
  const G = { i: 0, done: false, score: 0, n: 0 };
  const whyEl = $("#tr-why"), nextB = $("#tr-next");
  const start = () => {
    const r = ROUNDS[G.i];
    G.done = false;
    $("#tr-round").textContent = T(`Question ${G.i + 1} of ${N}`, `Pregunta ${G.i + 1} de ${N}`);
    $("#tr-q").textContent = r.q;
    $("#tr-facts").innerHTML = r.facts.map((f) => `<li>${f}</li>`).join("");
    $("#tr-opts").innerHTML = shuffle(r.opts.map((o, j) => [o, j])).map(([o, j]) => `<button type="button" class="sm-btn" data-k="${j}">${o}</button>`).join("");
    $("#tr-opts").dataset.n = r.opts.length;
    whyEl.classList.add("hidden");
    nextB.disabled = true;
    nextB.innerHTML = `${T("Next question", "Siguiente pregunta")} <span class="arrow">→</span>`;
  };
  $("#tr-opts").addEventListener("click", (e) => {
    const b = e.target.closest(".sm-btn"); if (!b || G.done) return;
    G.done = true;
    const r = ROUNDS[G.i], ok = +b.dataset.k === r.a;
    G.n++; if (ok) G.score++;
    $$("#tr-opts .sm-btn").forEach((x) => { x.disabled = true; if (+x.dataset.k === r.a) x.classList.add(ok ? "right" : "alt"); });
    if (!ok) b.classList.add("wrong");
    whyEl.innerHTML = `<b>${ok ? T("Right.", "Correcto.") : T("Not quite.", "No exactamente.")}</b> ${r.why}`;
    whyEl.dataset.tone = ok ? "good" : "warn";
    whyEl.classList.remove("hidden");
    $("#tr-score").textContent = T(`${G.score} of ${G.n}`, `${G.score} de ${G.n}`);
    nextB.disabled = false;
    if (G.i === N - 1) nextB.innerHTML = `${T("See your results", "Ver tus resultados")} <span class="arrow">→</span>`;
  });
  nextB.addEventListener("click", () => {
    if (!G.done) return;
    if (G.i < N - 1) { G.i++; start(); return; }
    const res = $("#tr-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/${N}</span><div><b>${G.score === N ? T("Market mover", "Mueve el mercado") : G.score >= 6 ? T("Ready for the trading desk", "Ya puedes operar") : T("Review the order book", "Repasa el libro de órdenes")}</b><p>${T("Every buyer needs a seller. The order book, the spread and liquidity decide what you really pay.", "Todo comprador necesita un vendedor. El libro de órdenes, el diferencial y la liquidez deciden lo que pagas de verdad.")}</p></div></div>
      <div style="margin-top:16px"><button class="btn line" type="button" id="tr-again">${T("Play again", "Jugar otra vez")} <span class="arrow">→</span></button></div>`;
    $("#tr-again").addEventListener("click", () => {
      Object.assign(G, { i: 0, score: 0, n: 0 });
      $("#tr-score").textContent = T("0 of 0", "0 de 0");
      res.classList.add("hidden");
      start();
      $("#tr").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, Math.round((G.score / N) * 100));
    if (first) FH.addXP(50, T("Made eight trading calls", "Tomaste ocho decisiones de operación"));
    if (G.score === N) FH.badge("market-mover");
    FH.save();
  });
  start();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "What is an order book?", opts: ["The list of all waiting buy and sell orders for a stock at each price", "A company's list of its shareholders", "A broker's record of your past trades", "The exchange's list of companies"], a: 0, why: "It holds every limit order still waiting, sorted by price." },
    { q: "A stock's best bid is $34.95 and its best ask is $35.00. What is the spread?", opts: ["$0.05", "$0.50", "$69.95", "$35.00"], a: 0, why: "$35.00 − $34.95 = $0.05." },
    { q: "How does a market maker mainly earn money?", opts: ["By buying at the bid and selling at the ask, earning the spread", "By charging companies to list", "By lending to buyers", "By collecting dividends"], a: 0, why: "It always quotes both sides and keeps the gap, a few cents a share, many times a day." },
    { q: "You buy 400 shares at market. The book has 200 at $10.00 and 200 at $10.10. What is your average price?", opts: ["$10.05", "$10.00", "$10.10", "$10.15"], a: 0, why: `200 × $10.00 + 200 × $10.10 = $4,040; ${fr("$4,040", "400")} = $10.05.` },
    { q: "What does it mean for a stock to be highly liquid?", opts: ["You can trade it quickly without moving its price much", "It pays a large dividend", "Its price never changes", "It trades only once a day"], a: 0, why: "Lots of orders and a tight spread make it easy to trade." },
    { q: "You short 100 shares at $50 and buy them back at $40. What is your profit?", opts: ["$1,000", "$4,000", "$5,000", "$100"], a: 0, why: "Sell for $5,000, buy back for $4,000: $1,000 profit." },
    { q: "What is the biggest risk of short selling?", opts: ["Losses have no limit, because a price can keep rising", "You can lose at most what you paid", "You must hold the shares forever", "You can't sell until settlement"], a: 0, why: "You must buy back later at whatever the price is, and a price can rise without limit." },
    { q: "How do many zero-commission brokers make money from your trades?", opts: ["Payment for order flow from market makers", "Taxes on your gains", "Fees from the companies you buy", "Interest on the stocks"], a: 0, why: "Market makers pay brokers to send them customer orders." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué es un libro de órdenes?", opts: ["La lista de todas las órdenes de compra y venta en espera de una acción en cada precio", "La lista de accionistas de una empresa", "El registro de tus operaciones pasadas en tu broker", "La lista de empresas de la bolsa"], a: 0, why: "Guarda cada orden límite que sigue esperando, ordenada por precio." },
    { q: "El mejor precio de compra de una acción es $34.95 y el mejor precio de venta es $35.00. ¿Cuál es el diferencial?", opts: ["$0.05", "$0.50", "$69.95", "$35.00"], a: 0, why: "$35.00 − $34.95 = $0.05." },
    { q: "¿Cómo gana dinero principalmente un creador de mercado?", opts: ["Comprando al precio de compra y vendiendo al de venta, ganando el diferencial", "Cobrando a las empresas por cotizar", "Prestando a los compradores", "Cobrando dividendos"], a: 0, why: "Siempre cotiza los dos lados y se queda con la diferencia, unos centavos por acción, muchas veces al día." },
    { q: "Compras 400 acciones a mercado. El libro tiene 200 a $10.00 y 200 a $10.10. ¿Cuál es tu precio promedio?", opts: ["$10.05", "$10.00", "$10.10", "$10.15"], a: 0, why: `200 × $10.00 + 200 × $10.10 = $4,040; ${fr("$4,040", "400")} = $10.05.` },
    { q: "¿Qué significa que una acción sea muy líquida?", opts: ["Que puedes comprarla o venderla rápido sin mover mucho su precio", "Que paga un dividendo grande", "Que su precio nunca cambia", "Que solo se opera una vez al día"], a: 0, why: "Muchas órdenes y un diferencial pequeño la hacen fácil de operar." },
    { q: "Vendes en corto 100 acciones a $50 y las recompras a $40. ¿Cuánto ganas?", opts: ["$1,000", "$4,000", "$5,000", "$100"], a: 0, why: "Vendes en $5,000 y recompras en $4,000: $1,000 de ganancia." },
    { q: "¿Cuál es el mayor riesgo de vender en corto?", opts: ["Las pérdidas no tienen límite, porque el precio puede seguir subiendo", "Puedes perder como máximo lo que pagaste", "Tienes que quedarte con las acciones para siempre", "No puedes vender hasta la liquidación"], a: 0, why: "Tienes que recomprar después al precio que esté, y un precio puede subir sin límite." },
    { q: "¿Cómo ganan dinero con tus operaciones muchos brokers sin comisión?", opts: ["Con el pago por flujo de órdenes de los creadores de mercado", "Con impuestos sobre tus ganancias", "Con cuotas de las empresas que compras", "Con intereses sobre las acciones"], a: 0, why: "Los creadores de mercado les pagan a los brokers por enviarles las órdenes de sus clientes." },
  ];

  FHLesson.init({ id: LESSON, short: "trading", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
