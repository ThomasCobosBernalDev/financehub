// Unit 5, Lesson 5: Buy your first $10
(function () {
  const LESSON = "u5-first-trade";
  const { $, $$, fillRange } = FHLesson;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgEl = (tag, attrs, text) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text != null) el.textContent = text;
    return el;
  };
  const cents = (n) => `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const price = (n) => (n >= 100 ? cents(n) : `$${n.toFixed(2)}`);
  const sh = (n) => n.toFixed(6);
  const shTrim = (n) => { const t = String(parseFloat(n.toFixed(6))); return t.includes(".") && t.split(".")[1].length >= 2 ? t : n.toFixed(2); };
  const alas = (t) => (t.startsWith("1:") ? "a la " : "a las ") + t; // Spanish: "a la 1:05", "a las 2:00"
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const pct = (n, d = 1) => `${(n * 100).toFixed(d)}%`;
  const wedge = (f, r = 96) => {
    if (f >= 0.9999) return `M0 ${-r} A${r} ${r} 0 1 1 -0.01 ${-r} Z`;
    const a = f * Math.PI * 2;
    return `M0 0 L0 ${-r} A${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${(Math.sin(a) * r).toFixed(2)} ${(-Math.cos(a) * r).toFixed(2)} Z`;
  };

  // ---------- See it: slice calculator ----------
  const slAmt = $("#sl-amt"), slMove = $("#sl-move");
  let slPrice = 700;
  const drawSlice = () => {
    const amt = +slAmt.value, move = +slMove.value / 100;
    const shares = amt / slPrice, after = amt * (1 + move), newP = slPrice * (1 + move);
    $("#sl-amt-v").textContent = `$${amt}`;
    $("#sl-move-v").textContent = `${move > 0 ? "+" : ""}${Math.round(move * 100)}%`;
    $("#sl-wedge").setAttribute("d", wedge(Math.min(shares, 1)));
    $("#sl-pie-p").textContent = `$${slPrice}`;
    $("#sl-out").innerHTML = `
      <div><dt>${T("Shares you get", "Acciones que recibes")}</dt><dd><span class="frac"><span>$${amt}</span><span>$${slPrice}</span></span> = <b>${shTrim(shares)}</b></dd></div>
      <div><dt>${T("Part of one share", "Parte de una acción")}</dt><dd><b>${shares >= 1 ? T("more than one whole share", "más de una acción completa") : pct(shares, 2)}</b></dd></div>
      <div><dt>${T("Worth after the move", "Vale después del cambio")}</dt><dd>${shTrim(shares)} × ${price(newP)} = <b>${cents(after)}</b></dd></div>`;
    const msg = $("#sl-msg");
    if (move === 0) {
      msg.innerHTML = shares >= 1
        ? T(`$${amt} buys ${shares.toFixed(2)} shares at $${slPrice}. With dollar orders, the leftover piece still gets invested.`, `$${amt} compran ${shares.toFixed(2)} acciones a $${slPrice}. Con órdenes en dólares, el pedazo que sobra también se invierte.`)
        : T(`Your $${amt} buys ${pct(shares, 2)} of one share. Now move the price and watch your slice.`, `Tus $${amt} compran ${pct(shares, 2)} de una acción. Ahora mueve el precio y mira tu pedazo.`);
      msg.dataset.tone = "";
    } else {
      msg.innerHTML = T(
        `The share went from $${slPrice} to ${price(newP)}, ${move > 0 ? "up" : "down"} ${Math.abs(Math.round(move * 100))}%. Your $${amt} became ${cents(after)}: the same ${Math.abs(Math.round(move * 100))}%.`,
        `La acción pasó de $${slPrice} a ${price(newP)}, ${move > 0 ? "subió" : "bajó"} ${Math.abs(Math.round(move * 100))}%. Tus $${amt} se volvieron ${cents(after)}: el mismo ${Math.abs(Math.round(move * 100))}%.`);
      msg.dataset.tone = move > 0 ? "good" : "warn";
    }
    fillRange(slAmt); fillRange(slMove);
  };
  slAmt.addEventListener("input", drawSlice);
  slMove.addEventListener("input", drawSlice);
  $$("#sl-price .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#sl-price .chip").forEach((x) => x.classList.toggle("on", x === c));
    slPrice = +c.dataset.p;
    drawSlice();
  }));
  drawSlice();

  // ---------- See it: market hours ----------
    const clockTxt = (min) => {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "a.m." : "p.m."}`;
  };
  let hrDay = 1;
  const hrTime = $("#hr-time");
  const drawHours = () => {
    const t = +hrTime.value * 30;
    $("#hr-et").textContent = clockTxt(t);
    $("#hr-pt").textContent = T(`(${clockTxt((t + 1440 - 180) % 1440)} in California)`, `(${clockTxt((t + 1440 - 180) % 1440)} en California)`);
    $("#hr-mark").setAttribute("x1", (t / 1440) * 600);
    $("#hr-mark").setAttribute("x2", (t / 1440) * 600);
    const weekend = hrDay >= 5;
    const nextOpen = () => {
      if (!weekend && t < 570) return T("today at 9:30 a.m.", "hoy a las 9:30 a.m.");
      if (hrDay < 4) return T("tomorrow at 9:30 a.m.", "mañana a las 9:30 a.m.");
      return T("Monday at 9:30 a.m.", "el lunes a las 9:30 a.m.");
    };
    let state, msg, tone;
    if (!weekend && t >= 570 && t < 960) {
      state = "open";
      msg = T("A market order fills in about a second at the current ask, and dollar orders for pieces of shares work now.", "Una orden a mercado se llena en un segundo más o menos al precio de venta actual, y las órdenes en dólares por pedazos de acciones funcionan ahora.");
      tone = "good";
    } else if (!weekend && ((t >= 240 && t < 570) || (t >= 960 && t < 1200))) {
      state = "ext";
      msg = T(`At brokers that offer it, you can trade now with a limit order, but fewer people are trading, so spreads are wider and prices jump more. A regular market order waits until ${nextOpen()}`, `En los brokers que lo ofrecen, puedes operar ahora con una orden límite, pero hay menos gente comprando y vendiendo, así que los diferenciales son más grandes y los precios brincan más. Una orden a mercado normal espera hasta ${nextOpen()}`);
      tone = "warn";
    } else {
      state = "closed";
      msg = T(`An order for whole shares waits until ${nextOpen()} and fills at whatever the price is then. Many brokers won't take a dollar order for a piece of a share until the market opens.`, `Una orden por acciones completas espera hasta ${nextOpen()} y se llena al precio que haya en ese momento. Muchos brokers no aceptan órdenes en dólares por un pedazo de acción hasta que abre el mercado.`);
      tone = "warn";
    }
    if (weekend) msg = T("The market is closed all weekend. ", "El mercado está cerrado todo el fin de semana. ") + msg;
    $("#hr-status").textContent = { open: T("Open", "Abierto"), ext: T("Extended hours", "Horario extendido"), closed: T("Closed", "Cerrado") }[state];
    $("#hr-dot").dataset.s = state;
    const m = $("#hr-msg");
    m.innerHTML = msg;
    m.dataset.tone = tone;
    fillRange(hrTime);
  };
  hrTime.addEventListener("input", drawHours);
  $$("#hr-day .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#hr-day .chip").forEach((x) => x.classList.toggle("on", x === c));
    hrDay = +c.dataset.d;
    drawHours();
  }));
  drawHours();

  // ---------- Play it: the order desk ----------
  // A smooth, repeatable made-up trading day: straight lines between anchor prices plus gentle wiggles.
  const day = (anchors, wig, seed) => {
    const out = [];
    for (let m = 0; m <= 390; m++) {
      let k = 0;
      while (k < anchors.length - 2 && anchors[k + 1][0] < m) k++;
      const [m0, p0] = anchors[k], [m1, p1] = anchors[k + 1];
      const base = p0 + ((p1 - p0) * (m - m0)) / (m1 - m0);
      const w = wig * (0.55 * Math.sin(m / 9 + seed) + 0.3 * Math.sin(m / 3.7 + seed * 2) + 0.15 * Math.sin(m / 1.6 + seed * 3));
      out.push(base + w);
    }
    anchors.forEach(([m, p]) => (out[m] = p)); // pin the anchors exactly
    return out;
  };
  const steps = (pts) => { // a thinly traded stock: the ask jumps in steps
    const out = [];
    for (let m = 0; m <= 390; m++) { let p = pts[0][1]; pts.forEach(([pm, pp]) => { if (m >= pm) p = pp; }); out.push(p); }
    return out;
  };
  const DAY1 = day([[0, 696.5], [40, 698.2], [95, 700], [110, 700], [150, 697.4], [190, 694.8], [230, 692.2], [262, 690], [290, 688.4], [330, 691.6], [390, 693.1]], 0.45, 1.3);
  const DAY2 = day([[0, 731.2], [20, 733.4], [45, 735], [60, 735], [200, 736.2], [390, 734.6]], 0.35, 4.1);
  const CB = steps([[0, 4.45], [30, 4.40], [150, 4.35], [190, 4.30], [215, 4.20], [232, 4.25], [300, 4.30]]);

  const SYM = {
    VOO: { name: T("Vanguard S&P 500 ETF", "Vanguard S&P 500 ETF"), note: T("ETF · all 500 companies", "ETF · las 500 empresas") },
    VOOG: { name: T("Vanguard S&P 500 Growth ETF", "Vanguard S&P 500 Growth ETF"), note: T("ETF · only the faster-growing ones", "ETF · solo las que crecen más rápido") },
    VFIAX: { name: T("Vanguard 500 Index Fund Admiral Shares", "Vanguard 500 Index Fund Admiral Shares"), note: T("mutual fund · $3,000 minimum", "fondo mutuo · mínimo de $3,000") },
    CBLK: { name: T("Cobble Bikes Inc.", "Cobble Bikes Inc."), note: T("small company · whole shares only", "empresa pequeña · solo acciones completas") },
    CBLE: { name: T("Cable Line Co.", "Cable Line Co."), note: T("small company", "empresa pequeña") },
  };
  const wrongSym = (s, want) => {
    if (s === "VFIAX") return T("VFIAX is Vanguard's S&P 500 mutual fund. It asks for $3,000 to start and is priced once a day after the close, so $10 can't buy it. Pick the ETF, VOO.", "VFIAX es el fondo mutuo del S&P 500 de Vanguard. Pide $3,000 para empezar y su precio se fija una vez al día, después del cierre, así que con $10 no alcanza. Elige el ETF, VOO.");
    if (s === "VOOG") return T("VOOG holds only the faster-growing companies in the S&P 500, not all 500. Read the full name, then pick VOO.", "VOOG solo tiene las empresas del S&P 500 que crecen más rápido, no las 500. Lee el nombre completo y elige VOO.");
    if (s === "CBLE") return T("CBLE is Cable Line Co., a different company. Cobble Bikes is CBLK. One letter matters.", "CBLE es Cable Line Co., otra empresa. Cobble Bikes es CBLK. Una letra hace la diferencia.");
    return T(`Pick ${want}.`, `Elige ${want}.`);
  };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;

  const MISSIONS = [
    { clock: T("Tuesday · 11:05 a.m. Eastern · market open", "Martes · 11:05 a.m., hora del Este · mercado abierto"),
      goal: T("Buy <b>$10</b> of the S&P 500 fund <b>VOO</b> right now.", "Compra <b>$10</b> del fondo del S&P 500 <b>VOO</b> ahora mismo."),
      syms: ["VOOG", "VOO", "VFIAX"], quote: { sym: "VOO", bid: 699.98, ask: 700 }, path: DAY1, now: 95, range: [684, 704], when: T("Tuesday", "martes"), settle: T("Wednesday", "miércoles"),
      check(o, S) {
        if (o.sym !== "VOO") return { msg: wrongSym(o.sym, "VOO") };
        if (o.side === "sell") return { msg: T("You don't own any VOO yet, so there's nothing to sell. Choose Buy.", "Todavía no tienes VOO, así que no hay nada que vender. Elige Comprar.") };
        const cost = o.unit === "usd" ? o.amt : o.amt * 700;
        if (cost > S.cash + 0.005) return { msg: T(`That order would cost about ${cents(cost)}, but you have ${cents(S.cash)} of buying power, so the app rejects it.${o.unit === "sh" ? ` ${o.amt} × $700.00 = ${cents(cost)}. To buy a piece of a share, choose Dollars.` : ""}`, `Esa orden costaría unos ${cents(cost)}, pero tienes ${cents(S.cash)} de saldo disponible, así que la app la rechaza.${o.unit === "sh" ? ` ${o.amt} × $700.00 = ${cents(cost)}. Para comprar un pedazo de acción, elige Dólares.` : ""}`) };
        if (!near(cost, 10, 0.1)) return { msg: T(`The mission is $10. This order is about ${cents(cost)}.`, `La misión es de $10. Esta orden es de unos ${cents(cost)}.`) };
        if (o.type === "lim" && o.lim < 700) return { msg: T(`A ${price(o.lim)} limit is below the $700.00 ask, so the order would wait for the price to fall, and it might never fill. The mission says right now: use a market order.`, `Un límite de ${price(o.lim)} está debajo del precio de venta de $700.00, así que la orden esperaría a que baje el precio, y podría nunca llenarse. La misión dice ahora mismo: usa una orden a mercado.`) };
        return { ok: true, at: 700, atMin: 95, note: o.type === "lim" ? T("A limit at or above the ask fills right away, just like a market order.", "Un límite igual o mayor que el precio de venta se llena de inmediato, igual que una orden a mercado.") : T("A market order fills right away at the ask.", "Una orden a mercado se llena de inmediato al precio de venta.") };
      } },
    { clock: T("Tuesday · 11:20 a.m. Eastern · market open", "Martes · 11:20 a.m., hora del Este · mercado abierto"),
      goal: T("VOO is bouncing around today. Buy another <b>$10</b> of VOO, but only if the price falls to <b>$690</b> or lower before the close.", "VOO está brincando hoy. Compra otros <b>$10</b> de VOO, pero solo si el precio baja a <b>$690</b> o menos antes del cierre."),
      syms: ["VOO", "VFIAX", "VOOG"], quote: { sym: "VOO", bid: 699.98, ask: 700 }, path: DAY1, now: 110, range: [684, 704], when: T("Tuesday", "martes"), settle: T("Wednesday", "miércoles"),
      check(o) {
        if (o.sym !== "VOO") return { msg: wrongSym(o.sym, "VOO") };
        if (o.side === "sell") return { msg: T("You want more VOO, so choose Buy.", "Quieres más VOO, así que elige Comprar.") };
        const cost = o.unit === "usd" ? o.amt : o.amt * 690;
        if (!near(cost, 10, 0.1)) return { msg: T(`The mission is $10. This order is about ${cents(cost)}.`, `La misión es de $10. Esta orden es de unos ${cents(cost)}.`) };
        if (o.type === "mkt") return { msg: T("A market order buys right now at the $700.00 ask, not $690. Choose Limit and set the limit price to $690.", "Una orden a mercado compra ahora mismo al precio de venta de $700.00, no a $690. Elige Límite y pon el precio límite en $690.") };
        if (o.lim > 690.004) return { msg: T(`With a ${price(o.lim)} limit, you could pay up to ${price(o.lim)}, more than the $690 you wanted. Set the limit at $690.`, `Con un límite de ${price(o.lim)}, podrías pagar hasta ${price(o.lim)}, más de los $690 que querías. Pon el límite en $690.`) };
        if (o.lim < 689.996) return { msg: T(`With a ${price(o.lim)} limit, you'd only buy at ${price(o.lim)} or less. If VOO stops falling at $689, you'd miss the price you wanted. Set the limit at exactly $690.`, `Con un límite de ${price(o.lim)}, solo comprarías a ${price(o.lim)} o menos. Si VOO deja de bajar en $689, te perderías el precio que querías. Pon el límite exactamente en $690.`) };
        return { ok: true, lim: 690, note: T("Your limit order waits. Watch the rest of the day.", "Tu orden límite espera. Mira el resto del día.") };
      } },
    { clock: T("Four weeks later · Wednesday · 10:15 a.m. Eastern", "Cuatro semanas después · miércoles · 10:15 a.m., hora del Este"),
      goal: T("You need <b>$5</b> back for a concert ticket. Sell <b>$5</b> of your VOO.", "Necesitas <b>$5</b> para un boleto de concierto. Vende <b>$5</b> de tu VOO."),
      syms: ["VOO", "VOOG", "VFIAX"], quote: { sym: "VOO", bid: 734.98, ask: 735 }, path: DAY2, now: 45, range: [728, 739], when: T("Wednesday", "miércoles"), settle: T("Thursday", "jueves"),
      check(o, S) {
        if (o.sym !== "VOO") return { msg: T(`You own VOO, not ${o.sym}. Pick VOO to sell some of it.`, `Tienes VOO, no ${o.sym}. Elige VOO para vender una parte.`) };
        if (o.side === "buy") return { msg: T("Buying adds more VOO and spends cash. To get $5 back, choose Sell.", "Comprar agrega más VOO y gasta efectivo. Para recuperar $5, elige Vender.") };
        if (o.unit === "sh" && o.amt > S.voo + 1e-7) return { msg: T(`You own ${sh(S.voo)} shares of VOO, not ${o.amt}. To sell $5 worth, choose Dollars.`, `Tienes ${sh(S.voo)} acciones de VOO, no ${o.amt}. Para vender $5, elige Dólares.`) };
        const got = o.unit === "usd" ? o.amt : o.amt * 734.98;
        if (!near(got, 5, 0.1)) return { msg: T(`The mission is $5. This order is about ${cents(got)}.`, `La misión es de $5. Esta orden es de unos ${cents(got)}.`) };
        if (o.type === "lim" && o.lim > 734.98) return { msg: T(`A sell limit at ${price(o.lim)} waits for the price to climb to ${price(o.lim)}, and it might not get there today. The mission is to sell now: use a market order.`, `Un límite de venta en ${price(o.lim)} espera a que el precio suba a ${price(o.lim)}, y podría no llegar hoy. La misión es vender ahora: usa una orden a mercado.`) };
        return { ok: true, at: 734.98, atMin: 45, note: T("A market sell fills right away at the bid.", "Una venta a mercado se llena de inmediato al precio de compra.") };
      } },
    { clock: T("Same day · 10:30 a.m. Eastern", "El mismo día · 10:30 a.m., hora del Este"),
      goal: T("A friend swears by a tiny company, Cobble Bikes. The quote shows bid <b>$4.00</b>, ask <b>$4.40</b>. Buy <b>2 shares</b>, but don't pay more than <b>$4.20</b> a share.", "Un amigo jura por una empresa pequeñita, Cobble Bikes. La cotización dice precio de compra <b>$4.00</b> y precio de venta <b>$4.40</b>. Compra <b>2 acciones</b>, pero no pagues más de <b>$4.20</b> por acción."),
      syms: ["CBLE", "CBLK"], quote: { sym: "CBLK", bid: 4.00, ask: 4.40 }, path: CB, now: 60, range: [4.0, 4.5], ask: true, when: T("Wednesday", "miércoles"), settle: T("Thursday", "jueves"),
      check(o) {
        if (o.sym !== "CBLK") return { msg: wrongSym(o.sym, "CBLK") };
        if (o.side === "sell") return { msg: T("You don't own any Cobble Bikes. Choose Buy.", "No tienes acciones de Cobble Bikes. Elige Comprar.") };
        if (o.unit === "usd") return { msg: T("Oakline only sells pieces of shares for big companies and funds. For Cobble Bikes, choose Shares and buy 2 whole shares.", "Oakline solo vende pedazos de acciones de empresas y fondos grandes. Para Cobble Bikes, elige Acciones y compra 2 acciones completas.") };
        if (!near(o.amt, 2, 1e-9)) return { msg: T(`The mission is 2 shares, not ${o.amt}.`, `La misión es de 2 acciones, no ${o.amt}.`) };
        if (o.type === "mkt") return { msg: T("A market order pays the $4.40 ask: 2 × $4.40 = $8.80. Sell right away at the $4.00 bid and you'd get only $8.00 back. That 40-cent spread per share is a real cost. Use a limit order at $4.20.", "Una orden a mercado paga el precio de venta de $4.40: 2 × $4.40 = $8.80. Si vendes de inmediato al precio de compra de $4.00, solo recuperas $8.00. Ese diferencial de 40 centavos por acción es un costo real. Usa una orden límite en $4.20.") };
        if (o.lim > 4.2004) return { msg: T(`With a ${price(o.lim)} limit, you could pay up to ${price(o.lim)} a share, more than $4.20. Set the limit at $4.20.`, `Con un límite de ${price(o.lim)}, podrías pagar hasta ${price(o.lim)} por acción, más de $4.20. Pon el límite en $4.20.`) };
        if (o.lim < 4.1996) return { msg: T(`With a ${price(o.lim)} limit, you'd only buy at ${price(o.lim)} or less, and a seller might never come down that far. The mission says up to $4.20, so set the limit at $4.20.`, `Con un límite de ${price(o.lim)}, solo comprarías a ${price(o.lim)} o menos, y puede que ningún vendedor baje tanto. La misión dice hasta $4.20, así que pon el límite en $4.20.`) };
        return { ok: true, lim: 4.2, note: T("Your limit order waits for a seller who will take $4.20.", "Tu orden límite espera a un vendedor que acepte $4.20.") };
      } },
  ];

  const G = { m: 0, score: 0, tries: 0, done: false, busy: false };
  const S = { cash: 50, voo: 0, vooBasis: 0, cblk: 0, cblkBasis: 0, vooPrice: 700, cblkPrice: 4.4 };
  const O = { sym: null, side: "buy", unit: "usd", type: "mkt" };
  const amtEl = $("#dk-amt"), limEl = $("#dk-lim"), whyEl = $("#dk-why"), nextBtn = $("#dk-next"), submitBtn = $("#dk-submit");
  const chart = $("#dk-chart");
  const num = (s) => { const v = parseFloat(String(s).replace(/[$,\s]/g, "")); return Number.isFinite(v) ? v : NaN; };

  // The chart redraws in a narrower box on phones so its labels stay readable.
  let W = 600, H = 230;
  const X = (m) => 52 + (m / 390) * (W - 68);
  let Y = () => 0;
  const drawChart = (mi, upTo, extra) => {
    const ms = MISSIONS[mi], [lo, hi] = ms.range;
    const narrow = chart.getBoundingClientRect().width < 480;
    W = narrow ? 380 : 600; H = narrow ? 250 : 230;
    chart.setAttribute("viewBox", `0 0 ${W} ${H}`);
    Y = (p) => H - 34 - ((p - lo) / (hi - lo)) * (H - 54);
    chart.innerHTML = "";
    const g = svgEl("g", { "font-size": 12, fill: "var(--ink-3)" });
    const tick = hi - lo > 5 ? (hi - lo > 12 ? 5 : 2) : 0.1;
    for (let p = Math.ceil(lo / tick) * tick; p <= hi + 1e-9; p += tick) {
      g.appendChild(svgEl("line", { x1: 52, x2: W - 16, y1: Y(p), y2: Y(p), stroke: "var(--line)", "stroke-width": 1 }));
      g.appendChild(svgEl("text", { x: 46, y: Y(p) + 4, "text-anchor": "end" }, hi < 10 ? `$${p.toFixed(2)}` : `$${Math.round(p)}`));
    }
    [[0, "9:30"], [150, "12:00"], [270, "2:00"], [390, "4:00"]].forEach(([m, l]) => g.appendChild(svgEl("text", { x: X(m), y: H - 12, "text-anchor": m === 390 ? "end" : m === 0 ? "start" : "middle" }, l)));
    g.appendChild(svgEl("text", { x: W - 16, y: 14, "text-anchor": "end", "font-weight": 700 }, `${ms.quote.sym} · ${ms.ask ? T("ask price", "precio de venta") : T("price", "precio")}`));
    chart.appendChild(g);
    if (extra && extra.lim != null) {
      chart.appendChild(svgEl("line", { x1: 52, x2: W - 16, y1: Y(extra.lim), y2: Y(extra.lim), stroke: "var(--accent)", "stroke-width": 2, "stroke-dasharray": "6 6" }));
      chart.appendChild(svgEl("text", { x: 58, y: Y(extra.lim) + 16, fill: "var(--accent)", "font-size": 12, "font-weight": 700 }, T(`your limit ${price(extra.lim)}`, `tu límite ${price(extra.lim)}`)));
    }
    const pts = ms.path.slice(0, upTo + 1).map((p, m) => `${X(m).toFixed(1)},${Y(p).toFixed(1)}`).join(" ");
    chart.appendChild(svgEl("line", { x1: X(ms.now), x2: X(ms.now), y1: 20, y2: H - 30, stroke: "var(--ink-3)", "stroke-width": 1, "stroke-dasharray": "2 4" }));
    chart.appendChild(svgEl("text", { x: X(ms.now) + 4, y: 30, "font-size": 12, fill: "var(--ink-3)" }, T("now", "ahora")));
    // The price line draws in up to "now", with a glowing live tip, a price tag riding it, and a fill that fades out below.
    const line = svgEl("path", { d: "M" + pts.replace(/ /g, " L").replace(/,/g, " "), fill: "none", stroke: "var(--accent)", "stroke-width": 2.4, "stroke-linejoin": "round", id: "dk-line" });
    chart.appendChild(line);
    // Re-run on each step of a price move too (see animateTo), so the tip and tag follow the new price.
    chart._tip = (n, animate) => {
      const at = (x) => ms.path[Math.max(0, Math.min(n, Math.round(((x - 52) / (W - 68)) * 390)))];
      FHLesson.fx.run(chart, {
        lines: [{ el: line, color: "var(--accent)", r: 5 }],
        tag: { line: 0, label: ms.quote.sym, value: (x) => price(at(x)), box: { x0: 52, y0: H - 34, big: narrow ? 1.1 : .9 } },
        area: { line: 0, baseY: H - 34, strength: .28 },
        animate, dur: 1600,
      });
      chart.querySelector(".fx-layer").classList.add("fx-live");
    };
    chart._tip(upTo, !(extra && extra.lim != null));
  };
  const dot = (m, p, label) => {
    chart.appendChild(svgEl("circle", { cx: X(m), cy: Y(p), r: 7, fill: "var(--savings)", stroke: "var(--card)", "stroke-width": 3, class: "dk-dot" }));
    const right = X(m) + label.length * 7 < W - 8;
    chart.appendChild(svgEl("text", { x: X(m) + (right ? 12 : -12), y: Y(p) - 12, "text-anchor": right ? "start" : "end", "font-size": 13, "font-weight": 700, fill: "var(--savings)" }, label));
  };

  const renderHold = () => {
    const vVal = S.voo * S.vooPrice, gain = vVal - S.vooBasis;
    let h = `<div class="dk-row"><span>${T("Buying power", "Saldo disponible")}</span><b>${cents(S.cash)}</b></div>`;
    h += `<div class="dk-row"><span>VOO · ${sh(S.voo)} ${T("sh", "acc.")}</span><b>${cents(vVal)}</b></div>`;
    if (S.voo > 0) h += `<div class="dk-row sub"><span>${T("Cost basis", "Costo base")} ${cents(S.vooBasis)}</span><span class="${gain >= 0 ? "up" : "down"}">${T("Gain", "Ganancia")} ${gain >= 0 ? "+" : ""}${cents(gain)}${S.vooBasis ? ` (${gain >= 0 ? "+" : ""}${pct(gain / S.vooBasis)})` : ""}</span></div>`;
    if (G.m === 3 || S.cblk > 0) h += `<div class="dk-row"><span>CBLK · ${S.cblk} ${T("sh", "acc.")}</span><b>${cents(S.cblk * S.cblkPrice)}</b></div>`;
    $("#dk-hold").innerHTML = `<small>${T("Your Oakline account", "Tu cuenta de Oakline")}</small>${h}`;
  };

  const setSeg = (id, v) => $$(`#${id} button`).forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === v ? "true" : "false"));
  const estimate = () => {
    const ms = MISSIONS[G.m], q = ms.quote;
    $("#dk-lim-row").classList.toggle("hidden", O.type !== "lim");
    $("label[for='dk-amt']").textContent = O.unit === "usd" ? T("Amount ($)", "Monto ($)") : T("Number of shares", "Número de acciones");
    amtEl.placeholder = O.unit === "usd" ? "0.00" : "0";
    const amt = num(amtEl.value), lim = num(limEl.value);
    const est = $("#dk-est");
    if (!O.sym) { est.textContent = T("Pick a symbol to start.", "Elige un símbolo para empezar."); return; }
    if (O.sym !== q.sym) { est.textContent = `${O.sym}: ${SYM[O.sym].name} · ${SYM[O.sym].note}`; return; }
    if (!(amt > 0)) { est.textContent = T(`Bid ${price(q.bid)} · Ask ${price(q.ask)}`, `Compra ${price(q.bid)} · Venta ${price(q.ask)}`); return; }
    const px = O.type === "lim" && lim > 0 ? lim : O.side === "buy" ? q.ask : q.bid;
    est.textContent = O.unit === "usd"
      ? T(`≈ ${sh(amt / px)} shares at ${price(px)}`, `≈ ${sh(amt / px)} acciones a ${price(px)}`)
      : T(`≈ ${cents(amt * px)} at ${price(px)} a share`, `≈ ${cents(amt * px)} a ${price(px)} por acción`);
  };

  const renderMission = () => {
    const ms = MISSIONS[G.m], q = ms.quote;
    G.tries = 0; G.busy = false;
    Object.assign(O, { sym: null, side: "buy", unit: "usd", type: "mkt" });
    setSeg("dk-side", "buy"); setSeg("dk-unit", "usd"); setSeg("dk-type", "mkt");
    amtEl.value = ""; limEl.value = "";
    $("#dk-round").textContent = T(`Mission ${G.m + 1} of ${MISSIONS.length}`, `Misión ${G.m + 1} de ${MISSIONS.length}`);
    $("#dk-clock").textContent = ms.clock;
    $("#dk-goal").innerHTML = ms.goal;
    $("#dk-quote").innerHTML = `<b>${q.sym}</b><span>${T("Bid", "Compra")} <b>${price(q.bid)}</b></span><span>${T("Ask", "Venta")} <b>${price(q.ask)}</b></span><span>${T("Spread", "Diferencial")} <b>${price(q.ask - q.bid)}</b></span>`;
    $("#dk-sym").innerHTML = ms.syms.map((s) => `<button type="button" class="dk-symb" data-s="${s}" aria-pressed="false"><b>${s}</b><small>${SYM[s].name} · ${SYM[s].note}</small></button>`).join("");
    if (G.m === 2) S.vooPrice = 735;
    if (G.m === 3) S.cblkPrice = 4.4;
    whyEl.classList.add("hidden"); whyEl.innerHTML = "";
    submitBtn.disabled = false;
    $$("#dk-ticket button, #dk-ticket input").forEach((b) => (b.disabled = false));
    nextBtn.disabled = true;
    nextBtn.innerHTML = `${G.m === MISSIONS.length - 1 ? T("See your results", "Ver tus resultados") : T("Next mission", "Siguiente misión")} <span class="arrow">→</span>`;
    drawChart(G.m, ms.now);
    renderHold();
    estimate();
  };

  $("#dk-sym").addEventListener("click", (e) => {
    const b = e.target.closest(".dk-symb");
    if (!b || b.disabled) return;
    O.sym = b.dataset.s;
    $$("#dk-sym .dk-symb").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    estimate();
  });
  [["dk-side", "side"], ["dk-unit", "unit"], ["dk-type", "type"]].forEach(([id, key]) => $(`#${id}`).addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    O[key] = b.dataset.v; setSeg(id, b.dataset.v); estimate();
  }));
  amtEl.addEventListener("input", estimate);
  limEl.addEventListener("input", estimate);

  const say = (tone, html) => { whyEl.classList.remove("hidden"); whyEl.dataset.tone = tone; whyEl.innerHTML = html; };
  const lock = () => { $$("#dk-ticket button, #dk-ticket input").forEach((b) => (b.disabled = true)); };

  const confirm = (ms, side, shares, at, total, extra) => `
    <div class="dk-conf"><small>${T("Trade confirmation", "Confirmación de la operación")}</small>
      <b>${side === "buy" ? T("Bought", "Compraste") : T("Sold", "Vendiste")} ${Number.isInteger(shares) ? shares : sh(shares)} ${ms.quote.sym} ${T("at", "a")} ${price(at)}</b>
      <span>${T("Total", "Total")} ${cents(total)} · ${T("Trade date", "Fecha de operación")} ${ms.when} · ${T("Settles", "Se liquida el")} ${ms.settle} (T+1)</span></div>${extra ? `<p>${extra}</p>` : ""}`;

  const finishMission = (first) => {
    if (first) G.score++;
    $("#dk-score").textContent = T(`${G.score} of ${G.m + 1}`, `${G.score} de ${G.m + 1}`);
    renderHold();
    nextBtn.disabled = false;
    G.busy = false;
  };

  const animateTo = async (ms, from, to, fillAt, lim) => {
    const line = $("#dk-line");
    const show = (n) => { line.setAttribute("d", "M" + ms.path.slice(0, n + 1).map((p, m) => `${X(m).toFixed(1)} ${Y(p).toFixed(1)}`).join(" L")); chart._tip(n, false); };
    if (reduced) { show(to); return; }
    const dur = 1800, start = performance.now();
    await new Promise((res) => {
      const step = (t) => {
        const k = Math.min(1, (t - start) / dur);
        show(Math.round(from + (to - from) * k));
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  };

  submitBtn.addEventListener("click", async () => {
    if (G.busy || G.done) return;
    const ms = MISSIONS[G.m];
    const o = { ...O, amt: num(amtEl.value), lim: num(limEl.value) };
    if (!o.sym) { say("warn", T("Pick a symbol first.", "Primero elige un símbolo.")); return; }
    if (!(o.amt > 0)) { say("warn", T("Type an amount first.", "Primero escribe un monto.")); return; }
    if (o.type === "lim" && !(o.lim > 0)) { say("warn", T("Type a limit price, or choose Market.", "Escribe un precio límite, o elige A mercado.")); return; }
    G.tries++;
    const r = ms.check(o, S);
    if (!r.ok) { say("warn", `<b>${T("Not quite.", "No exactamente.")}</b> ${r.msg} ${T("Fix the ticket and submit again.", "Corrige la orden y envíala otra vez.")}`); return; }
    const first = G.tries === 1;
    G.busy = true; lock(); submitBtn.disabled = true;
    const head = `<b>${first ? T("Right on the first submit.", "Correcto al primer intento.") : T("That's it.", "Eso es.")}</b> `;
    if (G.m === 0) {
      const shares = 10 / 700;
      S.cash -= 10; S.voo += shares; S.vooBasis += 10;
      dot(95, ms.path[95], T(`bought at $700.00`, `compraste a $700.00`));
      say("good", head + r.note + confirm(ms, "buy", shares, 700, 10, T("You own 0.014286 shares, about 1.4% of one share.", "Tienes 0.014286 acciones, como 1.4% de una acción.")));
    } else if (G.m === 2) {
      const shares = 5 / 734.98, frac = shares / S.voo;
      S.vooBasis -= S.vooBasis * frac; S.voo -= shares; S.cash += 5;
      dot(45, ms.path[45], T(`sold at $734.98`, `vendiste a $734.98`));
      say("good", head + r.note + confirm(ms, "sell", shares, 734.98, 5, T("The $5 shows up as buying power right away, and you can move it to your bank once the trade settles on Thursday.", "Los $5 aparecen como saldo disponible de inmediato, y puedes pasarlos a tu banco cuando la operación se liquide el jueves.")));
    } else {
      say("good", head + r.note);
      drawChart(G.m, ms.now, { lim: r.lim });
      const fillMin = ms.path.findIndex((p, m) => m > ms.now && p <= r.lim + 1e-9);
      await animateTo(ms, ms.now, fillMin, fillMin, r.lim);
      const t = clockTxt(570 + fillMin);
      dot(fillMin, ms.path[fillMin], T(`filled at ${price(r.lim)}, ${t}`, `se llenó a ${price(r.lim)}, ${t}`));
      await animateTo(ms, fillMin, 390);
      if (G.m === 1) {
        const shares = 10 / 690;
        S.cash -= 10; S.voo += shares; S.vooBasis += 10; S.vooPrice = ms.path[390];
        say("good", head + confirm(ms, "buy", shares, 690, 10, T(`VOO fell to $690 at ${t}, so your order filled at your limit. $10 bought ${sh(shares)} shares, more than the 0.014286 you got at $700. VOO closed at ${price(ms.path[390])}.`, `VOO bajó a $690 ${alas(t)}, así que tu orden se llenó a tu límite. Con $10 compraste ${sh(shares)} acciones, más que las 0.014286 que te tocaron a $700. VOO cerró en ${price(ms.path[390])}.`)));
      } else {
        S.cash -= 8.4; S.cblk += 2; S.cblkBasis += 8.4; S.cblkPrice = ms.path[390];
        say("good", head + confirm(ms, "buy", 2, 4.2, 8.4, T(`At ${t}, a seller came down to $4.20. You paid 2 × $4.20 = $8.40 instead of $8.80 at the ask. With a spread this wide, a limit order saved you 40 cents.`, `${cap(alas(t))}, un vendedor bajó a $4.20. Pagaste 2 × $4.20 = $8.40 en vez de $8.80 al precio de venta. Con un diferencial tan grande, la orden límite te ahorró 40 centavos.`)));
      }
    }
    finishMission(first);
  });

  nextBtn.addEventListener("click", () => {
    if (G.done) { // play again
      G.m = 0; G.score = 0; G.done = false;
      Object.assign(S, { cash: 50, voo: 0, vooBasis: 0, cblk: 0, cblkBasis: 0, vooPrice: 700, cblkPrice: 4.4 });
      $("#dk-score").textContent = T("0 of 0", "0 de 0");
      $("#dk-result").classList.add("hidden");
      renderMission();
      return;
    }
    if (G.m < MISSIONS.length - 1) { G.m++; renderMission(); return; }
    G.done = true;
    const res = $("#dk-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.score}/4</span><div><b>${G.score === 4 ? T("Every order, first try", "Todas las órdenes al primer intento") : T("All four orders placed", "Hiciste las cuatro órdenes")}</b><p>${T(
      `You bought a piece of a $700 share with a market order, waited for a better price with a limit order, sold exactly $5, and dodged a wide spread. Your account ends with ${cents(S.cash)} of buying power, ${sh(S.voo)} shares of VOO and 2 shares of Cobble Bikes.`,
      `Compraste un pedazo de una acción de $700 con una orden a mercado, esperaste un mejor precio con una orden límite, vendiste exactamente $5 y esquivaste un diferencial grande. Tu cuenta termina con ${cents(S.cash)} de saldo disponible, ${sh(S.voo)} acciones de VOO y 2 acciones de Cobble Bikes.`)}</p></div></div>`;
    nextBtn.innerHTML = `${T("Play again", "Jugar otra vez")} <span class="arrow">→</span>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, G.score * 25);
    if (first) FH.addXP(50, T("Worked the order desk", "Trabajaste en la mesa de órdenes"));
    if (G.score === 4) FH.badge("order-pro", T("Order Desk Pro", "Pro de las órdenes"));
    FH.save();
  });
  renderMission();

  // ---------- Check ----------
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "One share of an ETF costs $700. You place a dollar order for $14. About how many shares do you get?",
      opts: ["0.02 shares", "0.2 shares", "2 shares", "Nothing, since $14 is less than one share"], a: 0,
      why: `Shares = ${F("dollars you invest", "share price")} = ${F("$14", "$700")} = 0.02 shares. Fractional shares let you buy a piece.` },
    { q: "A stock's quote shows bid $50.00 and ask $50.10. You place a market order to buy. About what price do you pay?",
      opts: ["$50.10, the ask", "$50.00, the bid", "$50.05, halfway between", "Whatever price you type in"], a: 0,
      why: "Buyers pay the ask, the lowest price a seller will take right now. Sellers get the bid. The 10-cent gap is the spread." },
    { q: "You place a limit order to buy at $95 while the stock trades at $100. Its lowest price that day is $96. It's a day order. What happens?",
      opts: ["It doesn't fill and expires at the close", "It fills at $96, the day's low", "It fills at $100 when the market closes", "It turns into a market order at 4:00 p.m."], a: 0,
      why: "A limit buy only fills at your price or lower. The price never reached $95, so nothing happened, and a day order expires at the close." },
    { q: "What is the main trade-off between a market order and a limit order?",
      opts: ["A market order almost always fills but the price isn't guaranteed; a limit order guarantees the price but might not fill", "A market order costs a commission and a limit order doesn't", "A limit order fills faster but at a worse price", "There's no difference during market hours"], a: 0,
      why: "A market order fills right away at the best price available. A limit order sets your price, so it only fills if the market reaches it." },
    { q: "On Saturday you place a market order for one whole share. When does it fill?",
      opts: ["When the market opens Monday at 9:30 a.m. Eastern, at that moment's price", "Right away, at Friday's closing price", "Saturday at noon, when weekend trading starts", "Never, because weekend orders are canceled"], a: 0,
      why: "U.S. markets are closed on weekends. The order waits for the next open, Monday at 9:30 a.m. Eastern, and fills at whatever the price is then." },
    { q: "You bought $10 of a fund at $700 a share. It rises to $770. What's your slice worth?",
      opts: ["$11.00", "$10.70", "$17.00", "$77.00"], a: 0,
      why: `You own ${F("$10", "$700")} ≈ 0.014286 shares. 0.014286 × $770 = $11.00, a 10% gain, the same percent as a whole share.` },
    { q: "You sell shares on a Wednesday. Under U.S. rules, when does the trade settle?",
      opts: ["Thursday, one business day later", "The same Wednesday, instantly", "The next Wednesday, a week later", "Monday, after the weekend"], a: 0,
      why: "U.S. trades settle one business day after the trade date, a rule called T+1. Wednesday's trade settles Thursday." },
  ];
  const QUIZ_ES = [
    { q: "Una acción de un ETF cuesta $700. Haces una orden en dólares por $14. ¿Más o menos cuántas acciones recibes?",
      opts: ["0.02 acciones", "0.2 acciones", "2 acciones", "Nada, porque $14 es menos que una acción"], a: 0,
      why: `Acciones = ${F("dólares que inviertes", "precio por acción")} = ${F("$14", "$700")} = 0.02 acciones. Las acciones fraccionadas te dejan comprar un pedazo.` },
    { q: "La cotización de una acción dice precio de compra $50.00 y precio de venta $50.10. Haces una orden a mercado para comprar. ¿Más o menos a qué precio compras?",
      opts: ["$50.10, el precio de venta", "$50.00, el precio de compra", "$50.05, a la mitad", "El precio que tú escribas"], a: 0,
      why: "Quien compra paga el precio de venta, lo menos que un vendedor acepta ahora. Quien vende recibe el precio de compra. La diferencia de 10 centavos es el diferencial." },
    { q: "Haces una orden límite para comprar a $95 cuando la acción está en $100. Su precio más bajo ese día es $96. Es una orden del día. ¿Qué pasa?",
      opts: ["No se llena y vence al cierre", "Se llena a $96, el precio más bajo del día", "Se llena a $100 cuando cierra el mercado", "Se vuelve una orden a mercado a las 4:00 p.m."], a: 0,
      why: "Una compra límite solo se llena a tu precio o menos. El precio nunca llegó a $95, así que no pasó nada, y una orden del día vence al cierre." },
    { q: "¿Cuál es la principal diferencia entre una orden a mercado y una orden límite?",
      opts: ["La orden a mercado casi siempre se llena pero el precio no está garantizado; la orden límite garantiza el precio pero puede no llenarse", "La orden a mercado cobra comisión y la orden límite no", "La orden límite se llena más rápido pero a peor precio", "No hay diferencia durante el horario del mercado"], a: 0,
      why: "Una orden a mercado se llena de inmediato al mejor precio disponible. Una orden límite fija tu precio, así que solo se llena si el mercado llega a él." },
    { q: "El sábado haces una orden a mercado por una acción completa. ¿Cuándo se llena?",
      opts: ["Cuando abre el mercado el lunes a las 9:30 a.m., hora del Este, al precio de ese momento", "De inmediato, al precio de cierre del viernes", "El sábado al mediodía, cuando empieza la operación del fin de semana", "Nunca, porque las órdenes de fin de semana se cancelan"], a: 0,
      why: "Los mercados de Estados Unidos cierran los fines de semana. La orden espera a la siguiente apertura, el lunes a las 9:30 a.m., hora del Este, y se llena al precio que haya." },
    { q: "Compraste $10 de un fondo a $700 por acción. Sube a $770. ¿Cuánto vale tu pedazo?",
      opts: ["$11.00", "$10.70", "$17.00", "$77.00"], a: 0,
      why: `Tienes ${F("$10", "$700")} ≈ 0.014286 acciones. 0.014286 × $770 = $11.00, una ganancia de 10%, el mismo porcentaje que una acción completa.` },
    { q: "Vendes acciones un miércoles. Con las reglas de Estados Unidos, ¿cuándo se liquida la operación?",
      opts: ["El jueves, un día hábil después", "El mismo miércoles, al instante", "El siguiente miércoles, una semana después", "El lunes, después del fin de semana"], a: 0,
      why: "En Estados Unidos las operaciones se liquidan un día hábil después de la fecha de operación, una regla llamada T+1. La operación del miércoles se liquida el jueves." },
  ];

  FHLesson.init({ id: LESSON, short: "first-trade", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
