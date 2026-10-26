// Unit 1, Lesson 2: Supply and demand
(function () {
  const LESSON = "u1-supply-demand";
  const { $, $$, fillRange, wait, shuffle } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  // ---------- See it: the bike market ----------
  // Price 0..200 on y (380..60), quantity 0..100 on x (70..570).
  const X = (q) => 70 + q * 5, Y = (p) => 380 - p * 1.6;
  const BASE = { a: 100, s0: 0 };
  let mk = { ...BASE };
  const qd = (p, m = mk) => Math.max(0, m.a - p / 2);
  const qs = (p, m = mk) => Math.max(0, (p - 20) / 2 + m.s0);
  const eq = (m = mk) => { const p = (2 * m.a + 20 - 2 * m.s0) / 2; return { p, q: qd(p, m) }; };
  const curve = (f, m) => {
    let d = "";
    for (let p = 0; p <= 200; p += 5) { const q = f(p, m); if (q <= 0 || q > 100) continue; d += `${d ? "L" : "M"}${X(q).toFixed(1)} ${Y(p).toFixed(1)} `; }
    return d;
  };
  const ticks = $("#sd-ticks");
  for (let p = 50; p <= 200; p += 50) el("text", { x: 60, y: Y(p) + 4, "text-anchor": "end" }, ticks).textContent = `$${p}`;
  for (let q = 0; q <= 100; q += 20) el("text", { x: X(q), y: 398, "text-anchor": "middle" }, ticks).textContent = q;

  const slider = $("#sd-slider");
  const renderSD = () => {
    fillRange(slider);
    const p = +slider.value;
    $("#sd-price").textContent = money(p);
    $("#sd-d").setAttribute("d", curve(qd, mk));
    $("#sd-s").setAttribute("d", curve(qs, mk));
    const e = eq();
    $("#sd-eq").setAttribute("cx", X(e.q)); $("#sd-eq").setAttribute("cy", Y(e.p));
    const d = qd(p), s = qs(p);
    $("#sd-pline").setAttribute("d", `M70 ${Y(p)} H570`);
    $("#sd-qd").setAttribute("cx", X(Math.min(100, d))); $("#sd-qd").setAttribute("cy", Y(p));
    $("#sd-qs").setAttribute("cx", X(Math.min(100, s))); $("#sd-qs").setAttribute("cy", Y(p));
    $("#sd-qd-n").textContent = Math.round(d);
    $("#sd-qs-n").textContent = Math.round(s);
    const gap = $("#sd-gap");
    gap.setAttribute("d", `M${X(Math.min(100, d))} ${Y(p)} H${X(Math.min(100, s))}`);
    const m = $("#sd-msg");
    if (Math.abs(d - s) < 2) {
      gap.setAttribute("stroke", "var(--accent)");
      m.innerHTML = T(`<b class="c-good">Equilibrium.</b> At ${money(p)}, about ${Math.round(d)} bikes are wanted and ${Math.round(s)} are for sale. Nobody's left waiting and nothing's left over.`, `<b class="c-good">Equilibrio.</b> A ${money(p)}, se quieren unas ${Math.round(d)} bicicletas y hay ${Math.round(s)} a la venta. Nadie se queda esperando y no sobra nada.`);
      FH.badge("found-equilibrium", T("Found the Equilibrium", "Encontraste el equilibrio"));
    } else if (d > s) {
      gap.setAttribute("stroke", "var(--needs)");
      m.innerHTML = T(`<b>Shortage of ${Math.round(d - s)}.</b> At ${money(p)}, more people want bikes than sellers bring. Lines form, bikes sell out, and sellers raise prices.`, `<b>Escasez de ${Math.round(d - s)}.</b> A ${money(p)}, más gente quiere bicicletas de las que traen los vendedores. Se forman filas, las bicicletas se agotan y los vendedores suben los precios.`);
    } else {
      gap.setAttribute("stroke", "var(--wants)");
      m.innerHTML = T(`<b>Surplus of ${Math.round(s - d)}.</b> At ${money(p)}, sellers bring more bikes than people want. Bikes sit unsold, so sellers cut prices.`, `<b>Excedente de ${Math.round(s - d)}.</b> A ${money(p)}, los vendedores traen más bicicletas de las que la gente quiere. Las bicicletas se quedan sin vender, así que bajan los precios.`);
    }
  };
  slider.addEventListener("input", renderSD);
  const SHOCKS = {
    school: { f: (m) => { m.a += 20; }, msg: T("<b>Demand shifted right.</b> Students need bikes to get to class, so more people want one at every price. The new equilibrium has a higher price and more bikes sold.", "<b>La demanda se desplazó a la derecha.</b> Los estudiantes necesitan bicicletas para ir a clase, así que más gente quiere una a cualquier precio. El nuevo equilibrio tiene un precio más alto y más bicicletas vendidas.") },
    bigbox: { f: (m) => { m.a -= 25; }, msg: T("<b>Demand shifted left.</b> New bikes at a big-box store are a substitute, so fewer people want used ones. Price and quantity both fall.", "<b>La demanda se desplazó a la izquierda.</b> Las bicicletas nuevas de una gran tienda son un sustituto, así que menos gente quiere usadas. Bajan el precio y la cantidad.") },
    parts: { f: (m) => { m.s0 += 15; }, msg: T("<b>Supply shifted right.</b> Cheaper parts make fixing bikes more profitable, so sellers bring more at every price. Price falls, quantity rises.", "<b>La oferta se desplazó a la derecha.</b> Piezas más baratas hacen más rentable arreglar bicicletas, así que los vendedores traen más a cualquier precio. Baja el precio y sube la cantidad.") },
  };
  $$("[data-shock]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.shock;
    const oldD = $("#sd-d-old"), oldS = $("#sd-s-old");
    if (k === "reset") { mk = { ...BASE }; oldD.setAttribute("opacity", 0); oldS.setAttribute("opacity", 0); $$("[data-shock]").forEach((x) => x.classList.remove("on")); renderSD(); return; }
    oldD.setAttribute("d", curve(qd, mk)); oldS.setAttribute("d", curve(qs, mk));
    oldD.setAttribute("opacity", k === "parts" ? 0 : 1); oldS.setAttribute("opacity", k === "parts" ? 1 : 0);
    SHOCKS[k].f(mk);
    b.classList.add("on");
    const e = eq();
    slider.value = Math.round(e.p / 5) * 5;
    renderSD();
    $("#sd-msg").innerHTML = SHOCKS[k].msg + T(` New equilibrium: about <b>${money(e.p)}</b> and <b>${Math.round(e.q)}</b> bikes.`, ` Nuevo equilibrio: unos <b>${money(e.p)}</b> y <b>${Math.round(e.q)}</b> bicicletas.`);
  }));
  renderSD();

  // ---------- Play it: Market Stall ----------
  const COST = 30, WEEKS = 6;
  const EVENTS = [
    { id: "school", news: T("School starts Monday. Lots of students are shopping for bikes.", "Las clases empiezan el lunes. Muchos estudiantes buscan bicicleta."), n: 16, lo: 60, hi: 190 },
    { id: "rain", news: T("Rain all morning. Only a few shoppers will show up.", "Llueve toda la mañana. Vendrán pocos compradores."), n: 5, lo: 50, hi: 170 },
    { id: "bigbox", news: T("A big-box store opened nearby selling new bikes for $120. Nobody will pay more than that for a used one.", "Abrió cerca una gran tienda que vende bicicletas nuevas a $120. Nadie pagará más que eso por una usada."), n: 10, lo: 50, hi: 170, cap: 120 },
    { id: "news", news: T("The local news ran a story on biking to work. Shoppers will pay about $30 more than usual.", "Las noticias locales hablaron de ir en bicicleta al trabajo. Los compradores pagarán unos $30 más de lo normal."), n: 11, lo: 80, hi: 200 },
  ];
  const NORMAL = { news: T("A normal Saturday. About 10 shoppers expected.", "Un sábado normal. Se esperan unos 10 compradores."), n: 10, lo: 50, hi: 170 };
  const G = { week: 0, stock: 4, rev: 0, opt: 0, sold: 0, fixed: 4, busy: false };
  let deck, wk;
  const newDeck = () => [NORMAL, ...shuffle([...EVENTS]), { ...NORMAL, news: T("Last Saturday of the summer. A normal crowd of about 10.", "Último sábado del verano. Un público normal de unos 10.") }];
  deck = newDeck();

  const priceIn = $("#m-price");
  const renderPrice = () => { fillRange(priceIn); $("#m-price-v").textContent = money(+priceIn.value); $("#stall-price").textContent = money(+priceIn.value); };
  priceIn.addEventListener("input", renderPrice);

  const bikesG = $("#stall-bikes");
  const drawBikes = () => {
    bikesG.innerHTML = "";
    const n = Math.min(G.stock, 10);
    for (let i = 0; i < n; i++) {
      const g = el("g", { transform: `translate(${8 + (i % 5) * 36} ${i < 5 ? 84 : 66}) scale(.42)`, class: "mini-bike" }, bikesG);
      el("circle", { cx: 0, cy: 18, r: 16, fill: "none", stroke: "var(--ink)", "stroke-width": 4 }, g);
      el("circle", { cx: 52, cy: 18, r: 16, fill: "none", stroke: "var(--ink)", "stroke-width": 4 }, g);
      el("path", { d: "M0 18 L16 -6 H42 L52 18 M16 -6 L28 18 L42 -6 M10 -14 H22", fill: "none", stroke: ["var(--needs)", "var(--savings)", "var(--wants)", "var(--accent)"][i % 4], "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    }
  };
  const startWeek = () => {
    wk = deck[G.week];
    $("#m-week").textContent = T(`Saturday ${G.week + 1} of ${WEEKS}`, `Sábado ${G.week + 1} de ${WEEKS}`);
    $("#m-stock").textContent = T(`${G.stock} bike${G.stock === 1 ? "" : "s"} ready`, `${G.stock} bicicleta${G.stock === 1 ? "" : "s"} lista${G.stock === 1 ? "" : "s"}`);
    $("#m-news").innerHTML = `<b>${wk.news}</b>`;
    $("#m-open").disabled = false;
    $("#crowd").innerHTML = "";
    drawBikes();
  };
  const makeBuyers = () => Array.from({ length: wk.n + Math.round(Math.random() * 2 - 1) }, () => {
    let r = wk.lo + Math.random() * (wk.hi - wk.lo);
    if (wk.cap) r = Math.min(r, wk.cap);
    return Math.round(r);
  });
  const bestRevenue = (buyers, stock) => {
    let best = 0, bestP = 0;
    for (const p of new Set(buyers)) { const r = Math.min(stock, buyers.filter((b) => b >= p).length) * p; if (r > best) { best = r; bestP = p; } }
    return { best, bestP };
  };
  const person = (i) => {
    const g = el("g", { class: "buyer" }, $("#crowd"));
    const hue = ["var(--needs)", "var(--wants)", "var(--savings)", "#7a5bb5", "var(--accent)"][i % 5];
    el("circle", { cx: 0, cy: -38, r: 9, fill: "#f2c9a5", stroke: "var(--ink)", "stroke-width": 1.5 }, g);
    el("path", { d: "M-10 0 C-11 -24 11 -24 10 0 Z", fill: hue, stroke: "var(--ink)", "stroke-width": 1.5 }, g);
    const tag = el("text", { y: -54, "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: "var(--ink)", opacity: 0 }, g);
    return { g, tag };
  };
  const move = (g, from, to, ms, delay = 0) => g.animate([{ transform: `translate(${from[0]}px, ${from[1]}px)` }, { transform: `translate(${to[0]}px, ${to[1]}px)` }], { duration: ms, delay, easing: "ease-in-out", fill: "forwards" }).finished;

  $("#m-open").addEventListener("click", async () => {
    if (G.busy) return;
    G.busy = true;
    $("#m-open").disabled = true;
    priceIn.disabled = true;
    const p = +priceIn.value;
    const buyers = makeBuyers();
    const willing = buyers.filter((b) => b >= p).length;
    const sold = Math.min(G.stock, willing);
    const { best, bestP } = bestRevenue(buyers, G.stock);
    // Walk the crowd in.
    const people = buyers.map((r, i) => ({ r, i, ...person(i) }));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let left = sold;
    await Promise.all(people.map((pp, i) => {
      pp.spot = [270 + (i % 9) * 30 + (Math.floor(i / 9) % 2) * 15, 284 + (Math.floor(i / 9) % 2) * 14];
      return move(pp.g, [-30 - i * 20, pp.spot[1]], pp.spot, reduce ? 1 : 900 + i * 60);
    }));
    for (const pp of shuffle(people)) {
      const buys = pp.r >= p && left > 0;
      pp.tag.textContent = buys ? T("Sold!", "¡Vendida!") : pp.r >= p ? T("Sold out", "Agotado") : T("Too much", "Muy cara");
      pp.tag.setAttribute("fill", buys ? "var(--good)" : "var(--danger)");
      pp.tag.setAttribute("opacity", 1);
      pp.tag.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 1400, fill: "forwards" });
      if (buys) {
        left--;
        G.stock--;
        drawBikes();
        move(pp.g, pp.spot, [600 + Math.random() * 120, 288], reduce ? 1 : 500).then(() => move(pp.g, [660, 288], [860, 288], reduce ? 1 : 700));
      } else move(pp.g, pp.spot, [-60, pp.spot[1]], reduce ? 1 : 1100, 200);
      await wait(reduce ? 20 : 160);
    }
    await wait(reduce ? 50 : 900);

    const rev = sold * p;
    G.rev += rev; G.opt += best; G.sold += sold;
    const shortBy = willing - sold;
    const unsold = G.stock;
    let verdict, cls = "";
    if (shortBy > 0) { verdict = T(`${shortBy} shopper${shortBy === 1 ? "" : "s"} who'd pay your price left empty-handed. That's a <b>shortage</b>: you could have charged more.`, `${shortBy} comprador${shortBy === 1 ? "" : "es"} que pagaría${shortBy === 1 ? "" : "n"} tu precio se fue${shortBy === 1 ? "" : "ron"} con las manos vacías. Eso es <b>escasez</b>: podrías haber cobrado más.`); cls = "bad"; }
    else if (unsold > 0 && sold < buyers.length) { verdict = T(`${unsold} bike${unsold === 1 ? "" : "s"} didn't sell while ${buyers.length - sold} shoppers walked away. That's a <b>surplus</b>: a lower price would have moved more.`, `${unsold} bicicleta${unsold === 1 ? "" : "s"} no se vendi${unsold === 1 ? "ó" : "eron"} mientras ${buyers.length - sold} compradores se iban. Eso es <b>excedente</b>: un precio más bajo habría vendido más.`); }
    else { verdict = T("You priced it right on the edge.", "Pusiste el precio justo en el límite."); cls = "good"; }
    const li = document.createElement("li");
    li.className = cls || (rev >= best * 0.9 ? "good" : "");
    li.innerHTML = T(`Saturday ${G.week + 1}: sold <b>${sold}</b> at ${money(p)} for <b>${money(rev)}</b>. ${verdict} Best price in hindsight: ${money(bestP)} (${money(best)}).`, `Sábado ${G.week + 1}: vendiste <b>${sold}</b> a ${money(p)} por <b>${money(rev)}</b>. ${verdict} Mejor precio visto ahora: ${money(bestP)} (${money(best)}).`);
    $("#m-log").prepend(li);
    $("#m-profit").textContent = money(G.rev - G.fixed * COST);
    $("#m-sold").textContent = G.sold;
    $("#m-score").textContent = `${Math.round((G.rev / G.opt) * 100)}%`;

    G.week++;
    G.busy = false;
    priceIn.disabled = false;
    if (G.week < WEEKS) { G.stock += 3; G.fixed += 3; startWeek(); }
    else finish();
  });

  const finish = () => {
    const score = Math.round((G.rev / G.opt) * 100);
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
    const profit = G.rev - G.fixed * COST;
    $("#m-open").classList.add("hidden");
    $("#m-news").textContent = "";
    $("#m-stock").textContent = T("Season's over", "Se acabó la temporada");
    $("#m-week").textContent = T("Final results", "Resultados finales");
    const r = $("#m-result");
    r.classList.remove("hidden");
    r.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${T(`${score}% of the best possible revenue`, `${score}% del mejor ingreso posible`)}</b><p>${score >= 90 ? T("You read the crowd like a pricing analyst. Every week you found the price where your bikes and your buyers matched up.", "Leíste al público como un analista de precios. Cada semana encontraste el precio en el que tus bicicletas y tus compradores coincidían.") : T("The weeks you missed were the ones where the crowd changed. Prices aren't fixed: when demand shifts, the right price shifts with it.", "Las semanas que fallaste fueron las que cambió el público. Los precios no son fijos: cuando se desplaza la demanda, el precio correcto se mueve con ella.")}</p></div></div>
      <p class="small muted">${T("Profit after parts", "Ganancia después de piezas")}: ${money(profit)}. ${profit > 0 ? T("It goes into your savings for the rest of the course.", "Va a tus ahorros para el resto del curso.") : ""}</p>
      <button class="btn line" id="m-again">${T("Play again", "Jugar otra vez")}</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    if (first && profit > 0) FH.updateCharacter({ checking: FH.state.character.checking + profit });
    FH.addXP(first ? 50 : 15, first ? T("Finished Market Stall", "Terminaste Puesto del mercado") : T("Another season at the market", "Otra temporada en el mercado"));
    if (grade === "A") FH.badge("market-stall-a", T("Market Stall: A", "Puesto del mercado: A"));
    $("#m-again").addEventListener("click", () => {
      Object.assign(G, { week: 0, stock: 4, rev: 0, opt: 0, sold: 0, fixed: 4 });
      deck = newDeck();
      $("#m-log").innerHTML = "";
      ["#m-profit", "#m-sold"].forEach((s) => ($(s).textContent = s === "#m-profit" ? "$0" : "0"));
      $("#m-score").textContent = "–";
      r.classList.add("hidden");
      $("#m-open").classList.remove("hidden");
      startWeek();
    });
  };
  renderPrice();
  startWeek();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "Demand for coffee is Q = 120 − 10P and supply is Q = 20P − 30. What is the equilibrium price?",
      opts: ["$3", "$5", "$7.50", "$15"], a: 1,
      why: "Set them equal: 120 − 10P = 20P − 30, so 150 = 30P and P = $5. Quantity is 120 − 50 = 70." },
    { q: "The price of gasoline rises sharply. What happens in the market for electric cars?",
      opts: ["Supply of electric cars shifts left", "Demand for electric cars shifts right", "Demand for electric cars shifts left", "Movement down along the demand curve"], a: 1,
      why: "Gas cars and electric cars are substitutes. Pricier gas makes electric cars more attractive at every price, so demand shifts right." },
    { q: "Which of these causes a movement along the demand curve for pizza, rather than a shift?",
      opts: ["A fall in the price of pizza", "A rise in consumer incomes", "A fall in the price of soda, a complement", "A news report that pizza is healthy"], a: 0,
      why: "Only a change in the good's own price moves you along its demand curve. Everything else shifts the curve." },
    { q: "A city caps apartment rents below the equilibrium rent. The most likely result is:",
      opts: ["A surplus of apartments", "A shortage of apartments", "No change in the market", "Higher rents"], a: 1,
      why: "A binding price ceiling raises quantity demanded and lowers quantity supplied, so more people want apartments than are available." },
    { q: "A new machine cuts the cost of producing smartphones. What happens to price and quantity?",
      opts: ["Price up, quantity up", "Price down, quantity up", "Price down, quantity down", "Price up, quantity down"], a: 1,
      why: "Lower costs shift supply right. Along a downward-sloping demand curve, that means a lower price and a higher quantity." },
    { q: "At a price of $50, quantity demanded is 300 and quantity supplied is 180. The market has:",
      opts: ["A surplus of 120, so price will fall", "A shortage of 120, so price will rise", "A shortage of 480", "Reached equilibrium"], a: 1,
      why: "Demand exceeds supply by 300 − 180 = 120. In a shortage, buyers compete and push the price up toward equilibrium." },
    { q: "Raising the price of a good from $10 to $11 cuts quantity demanded from 100 to 80. Demand for this good is:",
      opts: ["Inelastic, since buyers barely react", "Elastic, since quantity falls 20% on a 10% price rise", "Perfectly inelastic", "Upward sloping"], a: 1,
      why: "Elasticity = −20% ÷ 10% = −2. A magnitude above 1 means elastic: buyers react strongly, so the price rise lowers total revenue." },
  ];

  const QUIZ_ES = [
    { q: "La demanda de café es Q = 120 − 10P y la oferta es Q = 20P − 30. ¿Cuál es el precio de equilibrio?",
      opts: ["$3", "$5", "$7.50", "$15"], a: 1,
      why: "Iguálalas: 120 − 10P = 20P − 30, así que 150 = 30P y P = $5. La cantidad es 120 − 50 = 70." },
    { q: "El precio de la gasolina sube mucho. ¿Qué pasa en el mercado de carros eléctricos?",
      opts: ["La oferta de carros eléctricos se desplaza a la izquierda", "La demanda de carros eléctricos se desplaza a la derecha", "La demanda de carros eléctricos se desplaza a la izquierda", "Un movimiento hacia abajo sobre la curva de demanda"], a: 1,
      why: "Los carros de gasolina y los eléctricos son sustitutos. La gasolina más cara hace los eléctricos más atractivos a cualquier precio, así que la demanda se desplaza a la derecha." },
    { q: "¿Cuál de estas causa un movimiento sobre la curva de demanda de pizza, y no un desplazamiento?",
      opts: ["Una bajada del precio de la pizza", "Una subida de los ingresos de los consumidores", "Una bajada del precio del refresco, un complemento", "Una noticia de que la pizza es sana"], a: 0,
      why: "Solo un cambio en el precio del propio bien te mueve sobre su curva de demanda. Todo lo demás desplaza la curva." },
    { q: "Una ciudad fija un tope a los alquileres por debajo del alquiler de equilibrio. El resultado más probable es:",
      opts: ["Un excedente de apartamentos", "Una escasez de apartamentos", "Ningún cambio en el mercado", "Alquileres más altos"], a: 1,
      why: "Un precio máximo que obliga sube la cantidad demandada y baja la cantidad ofrecida, así que más gente quiere apartamentos de los que hay." },
    { q: "Una máquina nueva reduce el costo de producir teléfonos inteligentes. ¿Qué pasa con el precio y la cantidad?",
      opts: ["Sube el precio, sube la cantidad", "Baja el precio, sube la cantidad", "Baja el precio, baja la cantidad", "Sube el precio, baja la cantidad"], a: 1,
      why: "Costos más bajos desplazan la oferta a la derecha. Con una curva de demanda con pendiente negativa, eso significa un precio más bajo y una cantidad más alta." },
    { q: "A un precio de $50, la cantidad demandada es 300 y la ofrecida es 180. El mercado tiene:",
      opts: ["Un excedente de 120, así que el precio bajará", "Una escasez de 120, así que el precio subirá", "Una escasez de 480", "Llegado al equilibrio"], a: 1,
      why: "La demanda supera a la oferta en 300 − 180 = 120. Con escasez, los compradores compiten y empujan el precio hacia el equilibrio." },
    { q: "Subir el precio de un bien de $10 a $11 baja la cantidad demandada de 100 a 80. La demanda de este bien es:",
      opts: ["Inelástica, porque los compradores apenas reaccionan", "Elástica, porque la cantidad baja un 20% con una subida del 10% en el precio", "Perfectamente inelástica", "Con pendiente positiva"], a: 1,
      why: "Elasticidad = −20% ÷ 10% = −2. Un valor mayor que 1 significa elástica: los compradores reaccionan mucho, así que la subida de precio baja el ingreso total." },
  ];

  FHLesson.init({ id: LESSON, short: "supply-demand", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
