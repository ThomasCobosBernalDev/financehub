// Unit 5, Lesson 2: What a stock is
(function () {
  const LESSON = "u5-stocks";
  const { $, $$, fillRange, shuffle, wait } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, text) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text != null) el.textContent = text;
    return el;
  };
  const num = (n) => n.toLocaleString("en-US");
  const pct = (f) => `${+(f * 100).toFixed(1)}%`;
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Fold art: keep the ticker tape scrolling without a seam ----------
  (() => {
    const tape = $(".st-tape");
    const first = tape && tape.querySelector("text");
    if (!first || reduced) return;
    // getBBox counts the gaps between tickers (dx), which getComputedTextLength leaves out.
    const len = first.getBBox().width;
    const cycle = (len > 100 ? len : 620) + 30;
    for (let k = 1; k < 3; k++) {
      const copy = first.cloneNode(true);
      copy.setAttribute("x", 40 + k * cycle);
      copy.setAttribute("aria-hidden", "true");
      tape.appendChild(copy);
    }
    tape.style.setProperty("--tape", `${-cycle}px`);
    tape.classList.add("go");
  })();

  // ---------- See it: Luis buys a slice ----------
  const PRICE = 160, ROSA = 1000, NEED = 40000;
  const dRange = $("#d-range");
  const arc = (f) => {
    if (f <= 0) return "";
    const a = 2 * Math.PI * f, x = 110 + 96 * Math.sin(a), y = 110 - 96 * Math.cos(a);
    return `M110 110 L110 14 A96 96 0 ${f > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z`;
  };
  const renderDeal = () => {
    fillRange(dRange);
    const amt = +dRange.value, n = amt / PRICE, tot = ROSA + n, f = n / tot;
    $("#d-amt").textContent = money(amt);
    $("#d-slice").setAttribute("d", arc(f));
    $("#d-total").textContent = num(tot);
    $("#d-rosa").textContent = pct(1 - f);
    $("#d-luis").textContent = pct(f);
    $("#d-luis-sh").textContent = T(`${num(n)} new shares`, `${num(n)} acciones nuevas`);
    const buys = T(`Luis pays ${money(amt)} for ${F(money(amt), "$160")} = ${num(n)} new shares. He owns ${F(num(n), num(tot))} = ${pct(f)}.`,
      `Luis paga ${money(amt)} por ${F(money(amt), "$160")} = ${num(n)} acciones nuevas. Es dueño de ${F(num(n), num(tot))} = ${pct(f)}.`);
    let msg, tone;
    if (amt === 0) {
      tone = "warn";
      msg = T("No deal. Rosa keeps 100% of the shop, but she has no money for the second one. She'd have to borrow the $40,000 and pay interest.",
        "No hay trato. Rosa se queda con el 100% del taller, pero no tiene dinero para la segunda. Tendría que pedir prestados los $40,000 y pagar intereses.");
    } else if (amt < NEED) {
      tone = "warn";
      msg = buys + T(` Rosa keeps more of her shop, but she's still ${money(NEED - amt)} short of the $40,000 she needs.`,
        ` Rosa se queda con más de su taller, pero todavía le faltan ${money(NEED - amt)} para los $40,000 que necesita.`);
    } else if (amt === NEED) {
      tone = "good";
      msg = buys + T(" Rosa owns 80% of a shop that now has the cash to grow. This is the deal from the story.",
        " Rosa es dueña del 80% de un taller que ahora tiene el dinero para crecer. Este es el trato de la historia.");
    } else if (n < ROSA) {
      tone = "warn";
      msg = buys + T(` Rosa gets ${money(amt - NEED)} more than she needs, but her slice shrinks to ${pct(1 - f)}. Every extra share she sells dilutes her more.`,
        ` Rosa recibe ${money(amt - NEED)} más de lo que necesita, pero su parte baja a ${pct(1 - f)}. Cada acción extra que vende la diluye más.`);
    } else if (n === ROSA) {
      tone = "warn";
      msg = buys + T(" That's as many shares as Rosa has, so they each own half. Rosa can't make big decisions about her own shop alone anymore.",
        " Son tantas acciones como las de Rosa, así que cada uno es dueño de la mitad. Rosa ya no puede tomar sola las decisiones importantes de su propio taller.");
    } else {
      tone = "bad";
      msg = buys + T(" That's more than half. Shareholders usually get one vote per share, so Luis could outvote Rosa on big decisions about her own shop.",
        " Eso es más de la mitad. Normalmente cada acción da un voto, así que Luis podría ganarle a Rosa las votaciones sobre las decisiones importantes de su propio taller.");
    }
    $("#d-msg").innerHTML = msg;
    $("#d-msg").dataset.tone = tone;
  };
  dRange.addEventListener("input", renderDeal);
  renderDeal();

  // ---------- See it: read a stock quote ----------
  const QUOTE = {
    ticker: [T("Ticker symbol", "Símbolo bursátil"),
      T("<b>RBIK</b> is the ticker symbol, the short code for Rosa's Bike Co. on the exchange. You type it into a brokerage app to find the stock, the same way AAPL finds Apple.",
        "<b>RBIK</b> es el símbolo bursátil, el código corto de Rosa's Bike Co. en la bolsa. Lo escribes en una app de inversión para encontrar la acción, igual que AAPL te lleva a Apple.")],
    price: [T("Price", "Precio"),
      T("<b>$54.00</b> is the price of one share right now: the last price a buyer and a seller agreed on. While the market is open, it can change every few seconds.",
        "<b>$54.00</b> es el precio de una acción en este momento: el último precio en que se pusieron de acuerdo un comprador y un vendedor. Mientras el mercado está abierto, puede cambiar cada pocos segundos.")],
    change: [T("Change today", "Cambio de hoy"),
      T(`The price is up <b>$1.08</b> since yesterday's close: $54.00 − $52.92 = $1.08. As a percent, that's ${F("$1.08", "$52.92")} ≈ 0.0204, which is <b>2.04%</b>. Green with ▲ means up, and red with ▼ means down.`,
        `El precio subió <b>$1.08</b> desde el cierre de ayer: $54.00 − $52.92 = $1.08. En porcentaje, es ${F("$1.08", "$52.92")} ≈ 0.0204, o sea <b>2.04%</b>. Verde con ▲ significa que subió, y rojo con ▼ que bajó.`)],
    prev: [T("Previous close", "Cierre anterior"),
      T("<b>$52.92</b> was the last price yesterday, when the market closed at 4 p.m. Eastern time. Today's change is measured from this number.",
        "<b>$52.92</b> fue el último precio de ayer, cuando el mercado cerró a las 4 p.m., hora del Este de Estados Unidos. El cambio de hoy se mide a partir de este número.")],
    cap: [T("Market cap", "Capitalización de mercado"),
      T("Market cap = price × number of shares = $54 × 10,000,000 = <b>$540,000,000</b>. At today's price, the whole company is worth $540 million. Apps write M for million and B for billion.",
        "Capitalización de mercado = precio × número de acciones = $54 × 10,000,000 = <b>$540,000,000</b>. Al precio de hoy, toda la empresa vale 540 millones de dólares. Las apps escriben M para millones y B para miles de millones.")],
    yield: [T("Dividend yield", "Rendimiento por dividendo"),
      T(`RBIK pays <b>$1.00</b> a share in dividends each year. ${F("$1.00", "$54.00")} ≈ 0.0185, which is <b>1.85%</b>. If you owned 100 shares, you'd get 100 × $1.00 = $100 a year in cash.`,
        `RBIK paga <b>$1.00</b> por acción en dividendos cada año. ${F("$1.00", "$54.00")} ≈ 0.0185, o sea <b>1.85%</b>. Si tuvieras 100 acciones, recibirías 100 × $1.00 = $100 al año en efectivo.`)],
  };
  $$("#quote .q-hit").forEach((b) => b.addEventListener("click", () => {
    const [title, body] = QUOTE[b.dataset.p];
    $$("#quote .q-hit").forEach((x) => x.classList.toggle("on", x === b));
    $("#q-explain").innerHTML = `<b>${title}</b><p>${body}</p>`;
    const seen = ($("#quote").dataset.seen || "").split(",").filter(Boolean);
    if (!seen.includes(b.dataset.p)) seen.push(b.dataset.p);
    $("#quote").dataset.seen = seen.join(",");
    if (seen.length === 6) FH.badge("quote-reader", T("Quote Reader", "Lector de cotizaciones"));
  }));

  // ---------- See it: Bessembinder's 100 squares ----------
  (() => {
    const g = $("#waffle");
    if (!g) return;
    for (let i = 0; i < 100; i++) {
      const cls = i < 58 ? "w-lose" : i < 96 ? "w-mid" : "w-star";
      g.appendChild(svgEl("rect", { x: 2 + (i % 10) * 33, y: 2 + Math.floor(i / 10) * 33, width: 29, height: 29, rx: 5, class: cls, style: `--d:${i * 14}ms` }));
    }
    if (reduced || !("IntersectionObserver" in window)) return;
    g.classList.add("pre");
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      g.classList.remove("pre");
      g.classList.add("in");
    }), { threshold: 0.4 });
    io.observe(g);
  })();

  // ---------- Play it: one stock or all ten? ----------
  const CO = [
    { n: "PedalWorks", s: T("E-bikes", "Bicicletas eléctricas"), p: T("Sales doubled last year as cities add bike lanes.", "Sus ventas se duplicaron el año pasado con las nuevas ciclovías.") },
    { n: "Bean Street", s: T("Coffee shops", "Cafeterías"), p: T("1,200 cafés and an app with 9 million regulars.", "1,200 cafeterías y una app con 9 millones de clientes.") },
    { n: "SnapLoop", s: T("Photo app", "App de fotos"), p: T("The fastest-growing app among teenagers.", "La app que más rápido crece entre los adolescentes.") },
    { n: "FreshCart", s: T("Grocery delivery", "Súper a domicilio"), p: T("Delivers groceries in 30 minutes in 40 cities.", "Entrega el súper en 30 minutos en 40 ciudades.") },
    { n: "SkyHop", s: T("Budget airline", "Aerolínea de bajo costo"), p: T("The cheapest fares in the country, and full planes.", "Los boletos más baratos del país y aviones llenos.") },
    { n: "StreamBox", s: T("Streaming", "Streaming"), p: T("Owns the hit show everyone is talking about.", "Tiene la serie de la que todos están hablando.") },
    { n: "SunGrid", s: T("Solar power", "Energía solar"), p: T("Solar panels get cheaper and more popular every year.", "Los paneles solares son más baratos y populares cada año.") },
    { n: "Stride", s: T("Running shoes", "Tenis para correr"), p: T("The shoe the top marathon runners are wearing.", "Los tenis que usan los mejores maratonistas.") },
    { n: "Harbor Bank", s: T("Bank", "Banco"), p: T("Has made a profit 30 years in a row.", "Ha tenido ganancias 30 años seguidos.") },
    { n: "PixelForge", s: T("Video games", "Videojuegos"), p: T("Its last game sold 20 million copies.", "Su último juego vendió 20 millones de copias.") },
  ];
  // Growth per year before noise. Six of the ten end up below Treasury bills, like the 58% in the research.
  const STAR = { k: "star", g: 0.19, sd: 0.24, label: T("Giant winner", "Gran ganadora") };
  const STRONG = { k: "strong", g: 0.11, sd: 0.2, label: T("Strong", "Fuerte") };
  const STEADY = { k: "steady", g: 0.06, sd: 0.16, label: T("Steady", "Estable") };
  const SLOW = { k: "slow", g: 0.02, sd: 0.16, label: T("Slow", "Lenta") };
  const SHRINK = { k: "shrink", g: -0.04, sd: 0.18, label: T("Shrank", "Se encogió") };
  const BUST = { k: "bust", label: T("Bankrupt", "Quebró") };
  const FATES = [STAR, STRONG, STRONG, STEADY, SLOW, SLOW, SHRINK, SHRINK, BUST, BUST];
  const YEARS = 20, ROUNDS = 3;

  const gauss = () => {
    let u = 0;
    while (!u) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
  };
  // A random wobble that starts and ends at 0, so each company lands near its target.
  const bridge = (n, sd) => {
    const w = [0];
    for (let i = 1; i <= n; i++) w.push(w[i - 1] + gauss() * sd);
    return w.map((x, i) => x - (i / n) * w[n]);
  };
  const simulate = (fate) => {
    if (fate.k === "bust") {
      // Often looks good for a while, then slides and goes to $0.
      const d = 4 + Math.floor(Math.random() * 11), last = d - 1, hump = 0.15 + Math.random() * 0.45, b = bridge(last, 0.1);
      return Array.from({ length: YEARS + 1 }, (_, t) => (t >= d ? 0 : 1000 * Math.exp(hump * Math.sin((Math.PI * t) / last) + (t / last) * Math.log(0.12) + b[t])));
    }
    const end = YEARS * Math.log(1 + fate.g) + (Math.random() * 0.36 - 0.18), b = bridge(YEARS, fate.sd);
    return Array.from({ length: YEARS + 1 }, (_, t) => 1000 * Math.exp((t / YEARS) * end + b[t]));
  };

  const G = { round: 0, pick: null, phase: "pick", wins: 0, played: 0, sumPick: 0, sumAll: 0, t: 0, top: 2000, paths: null, fates: null, all: null };
  const C = { x0: 84, x1: 872, y0: 296, y1: 18 };
  const fit = (svg) => {
    const narrow = svg.getBoundingClientRect().width < 560, h = narrow ? 600 : 340;
    svg.setAttribute("viewBox", `0 0 900 ${h}`);
    C.x0 = narrow ? 128 : 84;
    C.y0 = h - (narrow ? 58 : 44);
    C.y1 = narrow ? 24 : 18;
  };
  const niceStep = (max) => {
    const raw = max / 4, pow = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  };
  const short = (n) => (n >= 1e4 ? `$${Math.round(n / 1e3)}k` : n >= 1e3 ? `$${+(n / 1e3).toFixed(1)}k` : money(n));
  const X = (t) => C.x0 + (t / YEARS) * (C.x1 - C.x0);
  const Y = (v) => C.y0 - (v / G.top) * (C.y0 - C.y1);
  const pathOf = (vals, t) => vals.slice(0, t + 1).map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");

  const draw = () => {
    fit($("#p-chart"));
    const g = $("#p-grid");
    g.innerHTML = "";
    const step = niceStep(G.top);
    G.top = Math.ceil(G.top / step) * step;
    for (let v = 0; v <= G.top + 1e-9; v += step) {
      g.appendChild(svgEl("path", { d: `M${C.x0} ${Y(v)} H${C.x1}`, stroke: "var(--line)", "stroke-width": 1 }));
      g.appendChild(svgEl("text", { x: C.x0 - 10, y: Y(v) + 5, "text-anchor": "end" }, short(v)));
    }
    [[0, T("now", "hoy"), "start"], [5, 5], [10, 10], [15, 15], [20, T("year 20", "año 20"), "end"]]
      .forEach(([t, label, anchor]) => g.appendChild(svgEl("text", { x: X(t), y: C.y0 + 30, "text-anchor": anchor || "middle" }, label)));
    const dots = $("#p-dots");
    dots.innerHTML = "";
    if (G.pick === null || !G.paths) {
      $("#p-one").setAttribute("d", ""); $("#p-all").setAttribute("d", "");
      dots.appendChild(svgEl("circle", { cx: X(0), cy: Y(1000), r: 6, fill: "var(--needs)", stroke: "var(--card)", "stroke-width": 2 }));
      return;
    }
    const one = G.paths[G.pick];
    $("#p-all").setAttribute("d", pathOf(G.all, G.t));
    $("#p-one").setAttribute("d", pathOf(one, G.t));
    [[G.all, "var(--needs)"], [one, "var(--wants)"]].forEach(([vals, c]) =>
      dots.appendChild(svgEl("circle", { cx: X(G.t), cy: Y(vals[G.t]), r: 6, fill: c, stroke: "var(--card)", "stroke-width": 2 })));
  };

  const showValues = () => {
    const one = G.pick === null || !G.paths ? 1000 : G.paths[G.pick][G.t];
    $("#p-one-v").textContent = money(one);
    $("#p-all-v").textContent = money(G.paths && G.pick !== null ? G.all[G.t] : 1000);
    $("#p-year").textContent = T(`${G.t} of ${YEARS}`, `${G.t} de ${YEARS}`);
    $("#p-one-v").classList.toggle("zero", G.pick !== null && one === 0);
  };

  const cards = $("#p-cards");
  cards.innerHTML = CO.map((c, i) => `<button type="button" class="pg-card" data-i="${i}" aria-pressed="false"><small>${c.s}</small><b>${c.n}</b><span>${c.p}</span></button>`).join("");
  const goBtn = $("#p-go");
  const setGo = (label, enabled) => {
    goBtn.innerHTML = `${label} <span class="arrow">→</span>`;
    goBtn.disabled = !enabled;
  };

  const newRound = () => {
    G.round++;
    G.phase = "pick"; G.pick = null; G.t = 0; G.top = 2000; G.paths = null;
    G.fates = shuffle(FATES.slice());
    $("#p-round").textContent = T(`Round ${G.round} of ${ROUNDS}`, `Ronda ${G.round} de ${ROUNDS}`);
    $("#p-title").textContent = T("Pick a company", "Elige una empresa");
    $("#p-hint").textContent = G.round === 1
      ? T("Read the ten companies and pick the one you'd bet $1,000 on for the next 20 years.", "Lee las diez empresas y elige en la que apostarías $1,000 durante los próximos 20 años.")
      : T("New round, new 20 years. Same ten companies, but their futures are reshuffled, so last round's winner could go bankrupt this time. Pick again.",
        "Nueva ronda, otros 20 años. Son las mismas diez empresas, pero su futuro se vuelve a repartir, así que la ganadora de la ronda pasada podría quebrar esta vez. Elige otra vez.");
    $$(".pg-card", cards).forEach((b) => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); b.disabled = false; });
    cards.classList.remove("locked");
    $("#p-one-name").textContent = T("Your pick", "Tu elección");
    $("#p-feed").innerHTML = "";
    $("#p-rank").classList.add("hidden");
    $("#p-rank").innerHTML = "";
    setGo(T("Play 20 years", "Jugar 20 años"), false);
    draw(); showValues();
  };

  cards.addEventListener("click", (e) => {
    const b = e.target.closest(".pg-card");
    if (!b || G.phase !== "pick") return;
    G.pick = +b.dataset.i;
    $$(".pg-card", cards).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    const name = CO[G.pick].n;
    $("#p-one-name").textContent = T(`Your pick: ${name}`, `Tu elección: ${name}`);
    $("#p-hint").textContent = T(`You picked ${name}. Press play to see the next 20 years. You can still change your mind.`,
      `Elegiste ${name}. Dale a jugar para ver los próximos 20 años. Todavía puedes cambiar de opinión.`);
    setGo(T("Play 20 years", "Jugar 20 años"), true);
  });

  const feed = (html, tone) => {
    const li = document.createElement("li");
    li.innerHTML = html;
    if (tone) li.className = tone;
    $("#p-feed").appendChild(li);
  };

  const play = async () => {
    G.phase = "run";
    $$(".pg-card", cards).forEach((b) => (b.disabled = true));
    cards.classList.add("locked");
    setGo(T("Playing", "Jugando"), false);
    $("#p-title").textContent = T("20 years playing out…", "Pasan 20 años…");
    G.paths = G.fates.map(simulate);
    G.all = Array.from({ length: YEARS + 1 }, (_, t) => G.paths.reduce((s, p) => s + p[t] / 10, 0));
    const one = G.paths[G.pick], name = CO[G.pick].n;
    G.top = Math.max(...one, ...G.all) * 1.06;

    const events = [];
    G.paths.forEach((p, i) => {
      const d = p.indexOf(0);
      if (d > 0) events.push({ t: d, tone: "bad", html: T(`<b>Year ${d}:</b> ${CO[i].n} went bankrupt. Its shares are now worth $0.`, `<b>Año ${d}:</b> ${CO[i].n} quebró. Sus acciones ahora valen $0.`)
        + (i === G.pick ? T(" That was your pick, so your $1,000 is gone.", " Era tu elección, así que tus $1,000 se perdieron.") : "") });
      const x = p.findIndex((v) => v >= 10000);
      if (x > 0) events.push({ t: x, tone: "good", html: T(`<b>Year ${x}:</b> ${CO[i].n} shares are now worth 10 times what they cost.`, `<b>Año ${x}:</b> las acciones de ${CO[i].n} ya valen 10 veces lo que costaron.`) });
    });
    const dbl = one.findIndex((v) => v >= 2000);
    if (dbl > 0 && one[YEARS] > 0) events.push({ t: dbl, html: T(`<b>Year ${dbl}:</b> your pick, ${name}, doubled your $1,000.`, `<b>Año ${dbl}:</b> tu elección, ${name}, duplicó tus $1,000.`) });
    const allDbl = G.all.findIndex((v) => v >= 2000);
    if (allDbl > 0) events.push({ t: allDbl, html: T(`<b>Year ${allDbl}:</b> all ten together doubled to $2,000.`, `<b>Año ${allDbl}:</b> las diez juntas se duplicaron a $2,000.`) });
    events.sort((a, b) => a.t - b.t);

    const chart = $("#p-chart"), box = chart.getBoundingClientRect();
    if (box.top < 60 || box.bottom > innerHeight) chart.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    for (let t = 0; t <= YEARS; t++) {
      G.t = t;
      draw(); showValues();
      events.filter((ev) => ev.t === t).forEach((ev) => feed(ev.html, ev.tone));
      if (!reduced) await wait(t === 0 ? 450 : 170);
    }
    endRound();
  };

  const endRound = () => {
    G.phase = "done";
    const one = G.paths[G.pick][YEARS], all = G.all[YEARS], name = CO[G.pick].n, fate = G.fates[G.pick];
    const won = one > all;
    G.played++; G.wins += won; G.sumPick += one; G.sumAll += all;
    $("#p-score").textContent = T(`${G.wins} of ${G.played} ${G.played === 1 ? "round" : "rounds"}`, `${G.wins} de ${G.played} ${G.played === 1 ? "ronda" : "rondas"}`);
    $("#p-title").textContent = won ? T("Your pick won", "Ganó tu elección") : T("All ten won", "Ganaron las diez");
    $("#p-hint").textContent = T(`Round ${G.round} is over. Below, see how all ten companies did.`, `Terminó la ronda ${G.round}. Abajo puedes ver cómo les fue a las diez empresas.`);

    const beat = G.paths.filter((p) => p[YEARS] > all).length;
    const si = G.fates.indexOf(STAR), slice = G.paths[si][YEARS] / 10;
    let msg;
    if (fate.k === "star") {
      msg = T(`You picked this round's giant winner. ${name} turned $1,000 into ${money(one)}. All ten turned $1,000 into ${money(all)}, and ${money(slice)} of that was its $100 slice of ${name}. One company made ${pct(slice / all)} of the ten's value.`,
        `Elegiste a la gran ganadora de esta ronda. ${name} convirtió $1,000 en ${money(one)}. Las diez convirtieron $1,000 en ${money(all)}, y ${money(slice)} de eso fue su parte de $100 en ${name}. Una sola empresa hizo el ${pct(slice / all)} del valor de las diez.`);
    } else {
      msg = won
        ? T(`Your pick won this round. ${name} turned $1,000 into ${money(one)}, and all ten turned $1,000 into ${money(all)}. But only ${beat} of the 10 companies beat owning all ten, so a pick like yours wins about ${beat} times in 10.`,
          `Tu elección ganó esta ronda. ${name} convirtió $1,000 en ${money(one)}, y las diez convirtieron $1,000 en ${money(all)}. Pero solo ${beat} de las 10 empresas le ganaron a tener las diez, así que una elección como la tuya gana más o menos ${beat} de cada 10 veces.`)
        : fate.k === "bust"
          ? T(`${name} went bankrupt, so your $1,000 became $0. All ten still turned $1,000 into ${money(all)}, because the bankruptcy only cost them the $100 they had in ${name}.`,
            `${name} quebró, así que tus $1,000 se volvieron $0. Las diez igual convirtieron $1,000 en ${money(all)}, porque la quiebra solo les costó los $100 que tenían en ${name}.`)
          : T(`Owning all ten won this round. Your pick, ${name}, turned $1,000 into ${money(one)}, and all ten turned it into ${money(all)}. Only ${beat} of the 10 companies beat owning all ten.`,
            `Tener las diez ganó esta ronda. Tu elección, ${name}, convirtió $1,000 en ${money(one)}, y las diez los convirtieron en ${money(all)}. Solo ${beat} de las 10 empresas le ganaron a tener las diez.`);
      msg += T(` This round's giant winner was ${CO[si].n}. Its $100 slice alone grew to ${money(slice)}, which is ${pct(slice / all)} of what all ten ended with.`,
        ` La gran ganadora de esta ronda fue ${CO[si].n}. Su parte de $100 sola creció a ${money(slice)}, que es el ${pct(slice / all)} de lo que terminaron valiendo las diez.`);
    }

    const rows = CO.map((c, i) => ({ name: c.n, fate: G.fates[i], v: G.paths[i][YEARS], pick: i === G.pick }));
    rows.push({ name: T("All ten, $100 each", "Las diez, $100 en cada una"), v: all, all: true });
    rows.sort((a, b) => b.v - a.v);
    const max = rows[0].v;
    const rank = $("#p-rank");
    rank.innerHTML = `<p class="split-msg" data-tone="${won ? "good" : "warn"}">${msg}</p>
      <h4>${T("What $1,000 in each one became", "En qué se convirtieron $1,000 en cada una")}</h4>
      <ol class="rank">${rows.map((r) => `<li class="${r.pick ? "pick" : ""}${r.all ? "all" : ""}${!r.all && r.fate.k === "bust" ? "bust" : ""}">
        <span class="rk-name">${r.name}${r.pick ? ` <em>${T("your pick", "tu elección")}</em>` : ""}</span>
        <span class="rk-fate">${r.all ? T("the basket", "la canasta") : r.fate.label}</span>
        <span class="rk-bar"><i style="width:${Math.max(0, (r.v / max) * 100).toFixed(1)}%"></i></span>
        <b>${money(r.v)}</b></li>`).join("")}</ol>`;
    rank.classList.remove("hidden");

    if (G.round < ROUNDS) setGo(T("Next round", "Siguiente ronda"), true);
    else { finish(); setGo(T("Play again", "Jugar otra vez"), true); }
  };

  const finish = () => {
    const rate = Math.pow(G.sumAll / (1000 * ROUNDS), 1 / YEARS) - 1;
    const head = G.wins === 0 ? T("All ten won every round", "Las diez ganaron todas las rondas")
      : G.wins === ROUNDS ? T("Three for three. That's rare luck.", "Tres de tres. Qué suerte tan rara.")
        : T(`Your pick won ${G.wins} of ${ROUNDS} rounds`, `Tu elección ganó ${G.wins} de ${ROUNDS} rondas`);
    const res = $("#p-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${G.wins}/${ROUNDS}</span><div><b>${head}</b><p>${T(
      `Your three picks turned $3,000 into ${money(G.sumPick)}. Owning all ten, three times, turned $3,000 into ${money(G.sumAll)}, about ${(rate * 100).toFixed(1)}% a year. A single pick wins about 3 times in 10, and sometimes it goes to $0. Owning all ten never went to $0, because the giant winner always carried it. An index fund does the same thing with hundreds of companies, and that's the next lesson.`,
      `Tus tres elecciones convirtieron $3,000 en ${money(G.sumPick)}. Tener las diez, tres veces, convirtió $3,000 en ${money(G.sumAll)}, más o menos ${(rate * 100).toFixed(1)}% al año. Una sola empresa gana más o menos 3 de cada 10 veces, y a veces llega a $0. Tener las diez nunca llegó a $0, porque la gran ganadora siempre la sacó adelante. Un fondo indexado hace lo mismo con cientos de empresas, y de eso trata la siguiente lección.`)}</p></div></div>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = 100;
    if (first) FH.addXP(50, T("Played one stock or all ten", "Jugaste una acción o las diez"));
    FH.badge("scatter-hoarder", T("Scatter Hoarder", "Ardilla previsora"));
    FH.save();
  };

  goBtn.addEventListener("click", () => {
    if (G.phase === "pick" && G.pick !== null) play();
    else if (G.phase === "done") {
      if (G.round >= ROUNDS) {
        G.round = 0; G.wins = 0; G.played = 0; G.sumPick = 0; G.sumAll = 0;
        $("#p-result").classList.add("hidden");
        $("#p-score").textContent = T("0 of 0 rounds", "0 de 0 rondas");
      }
      newRound();
      $("#game").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  });
  let resizeT;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(draw, 150); });
  newRound();

  // ---------- Check ----------
  const QUIZ_EN = [
    { q: "When you buy one share of a company's stock, what do you own?",
      opts: ["A small piece of ownership in the company", "A loan the company must pay back with interest", "A coupon for discounts on what the company sells", "A promise of the same payment every single year"], a: 0,
      why: "A share is one of the equal pieces a company's ownership is cut into, so owning one makes you a part owner." },
    { q: "A company has 5,000 shares, and you own 250 of them. What percent of the company do you own?",
      opts: ["5%", "20%", "2.5%", "50%"], a: 0,
      why: `Ownership = ${F("your shares", "total shares")} = ${F(250, "5,000")} = 0.05, which is 5%.` },
    { q: "Years after a company's IPO, you buy one of its shares in an app. Who gets your money?",
      opts: ["The investor who sold you that share", "The company, to help pay for its growth", "The stock exchange, as its fee for the trade", "The government, as a tax on the purchase"], a: 0,
      why: "After the IPO, shares trade between investors on a stock exchange. The company got its money once, at the IPO." },
    { q: "A stock costs $80 a share, and the company has 2,000,000 shares. What is its market cap?",
      opts: ["$160,000,000", "$16,000,000", "$1,600,000,000", "$25,000"], a: 0,
      why: "Market cap = price × number of shares = $80 × 2,000,000 = $160,000,000, or $160M." },
    { q: "A stock costs $50 and pays $2 a share in dividends each year. What is its dividend yield?",
      opts: ["4%", "2%", "25%", "0.4%"], a: 0,
      why: `Dividend yield = ${F("yearly dividend", "price")} = ${F("$2", "$50")} = 0.04, which is 4%.` },
    { q: "You buy a share for $100. A year later it's worth $108, and you got $2 in dividends. What is your total return?",
      opts: ["10%", "8%", "2%", "108%"], a: 0,
      why: `Total return = ${F("price change + dividends", "price you paid")} = ${F("$8 + $2", "$100")} = 0.10, which is 10%.` },
    { q: "From 1926 to 2016, about what share of U.S. stocks did worse over their lifetimes than Treasury bills?",
      opts: ["About 58%", "About 4%", "About 25%", "About 96%"], a: 0,
      why: "Hendrik Bessembinder found that 58% of U.S. stocks did worse than Treasury bills, and about 4% created all of the market's net gains." },
  ];

  const QUIZ_ES = [
    { q: "Cuando compras una acción de una empresa, ¿de qué eres dueño?",
      opts: ["De una pequeña parte de la empresa", "De un préstamo que la empresa te paga con intereses", "De un cupón de descuento en lo que vende la empresa", "De la promesa de un mismo pago todos los años"], a: 0,
      why: "Una acción es una de las partes iguales en que se divide la propiedad de una empresa, así que tener una te hace dueño de una parte." },
    { q: "Una empresa tiene 5,000 acciones y tú tienes 250. ¿Qué porcentaje de la empresa es tuyo?",
      opts: ["5%", "20%", "2.5%", "50%"], a: 0,
      why: `Propiedad = ${F("tus acciones", "total de acciones")} = ${F(250, "5,000")} = 0.05, o sea 5%.` },
    { q: "Años después de la IPO de una empresa, compras una de sus acciones en una app. ¿Quién recibe tu dinero?",
      opts: ["El inversionista que te vendió esa acción", "La empresa, para pagar su crecimiento", "La bolsa de valores, como comisión", "El gobierno, como impuesto por la compra"], a: 0,
      why: "Después de la IPO, las acciones se compran y venden entre inversionistas en la bolsa. La empresa recibió su dinero una vez, en la IPO." },
    { q: "Una acción cuesta $80 y la empresa tiene 2,000,000 de acciones. ¿Cuál es su capitalización de mercado?",
      opts: ["$160,000,000", "$16,000,000", "$1,600,000,000", "$25,000"], a: 0,
      why: "Capitalización de mercado = precio × número de acciones = $80 × 2,000,000 = $160,000,000, o $160M." },
    { q: "Una acción cuesta $50 y paga $2 por acción en dividendos cada año. ¿Cuál es su rendimiento por dividendo?",
      opts: ["4%", "2%", "25%", "0.4%"], a: 0,
      why: `Rendimiento por dividendo = ${F("dividendo anual", "precio")} = ${F("$2", "$50")} = 0.04, o sea 4%.` },
    { q: "Compras una acción en $100. Un año después vale $108 y recibiste $2 en dividendos. ¿Cuál es tu rendimiento total?",
      opts: ["10%", "8%", "2%", "108%"], a: 0,
      why: `Rendimiento total = ${F("cambio de precio + dividendos", "precio que pagaste")} = ${F("$8 + $2", "$100")} = 0.10, o sea 10%.` },
    { q: "De 1926 a 2016, ¿más o menos qué parte de las acciones de Estados Unidos les fue peor en toda su vida que a los bonos del Tesoro?",
      opts: ["Más o menos el 58%", "Más o menos el 4%", "Más o menos el 25%", "Más o menos el 96%"], a: 0,
      why: "Hendrik Bessembinder encontró que al 58% de las acciones de Estados Unidos les fue peor que a los bonos del Tesoro, y que más o menos el 4% creó todas las ganancias netas del mercado." },
  ];

  FHLesson.init({ id: LESSON, short: "stocks", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
