// Unit 5, Lesson 3: Index funds and the S&P 500
(function () {
  const LESSON = "u5-index-funds";
  const { $, $$, fillRange } = FHLesson;
  const money = FH.money;
  const T = FH.t;
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, text) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text != null) el.textContent = text;
    return el;
  };
  const cents = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Real data: S&P 500 total return by year, 1995 to 2024 (Damodaran, NYU Stern), the same numbers as Unit 5, Lesson 1.
  const SP = [37.20, 22.68, 33.10, 28.34, 20.89, -9.03, -11.85, -21.97, 28.36, 10.74, 4.83, 15.61, 5.48, -36.55, 25.94,
    14.82, 2.10, 15.89, 32.15, 13.52, 1.38, 11.77, 21.61, -4.23, 31.21, 18.02, 28.47, -18.04, 26.06, 24.88];
  // $200 at the start of every month, with each year's return spread evenly over its 12 months, minus the fee.
  const history = (fee) => {
    let b = 0;
    SP.forEach((r) => {
      const m = Math.pow(1 + r / 100 - fee / 100, 1 / 12) - 1;
      for (let k = 0; k < 12; k++) b = (b + 200) * (1 + m);
    });
    return b;
  };

  // ---------- Fold art: $10 split across 500 dots ----------
  (() => {
    const g = $("#if-dots");
    if (!g) return;
    for (let i = 0; i < 500; i++) {
      const c = i % 25, r = Math.floor(i / 25);
      const big = i < 3 ? 7.4 : i < 10 ? 6.2 : 4.4;
      g.appendChild(svgEl("circle", { cx: 66 + c * 16.2, cy: 208 + r * 13.9, r: big, fill: i < 10 ? "var(--wants)" : "var(--needs)", opacity: i < 10 ? 1 : 0.75, style: `--d:${(c + r) * 40}ms` }));
    }
  })();

  // ---------- See it: where your money goes ----------
  const AMTS = [10, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 7500, 10000];
  const SLICES = [
    { n: "Nvidia", w: 8.6, c: "var(--wants)" },
    { n: "Apple", w: 7.3, c: "color-mix(in srgb, var(--wants) 70%, var(--card))" },
    { n: "Microsoft", w: 5.8, c: "color-mix(in srgb, var(--wants) 45%, var(--card))" },
    { n: T("The other 7 of the biggest 10", "Las otras 7 de las 10 más grandes"), w: 17.6, c: "var(--needs)" },
    { n: T("The other 490 or so companies", "Las otras 490 empresas, más o menos"), w: 60.7, c: "color-mix(in srgb, var(--needs) 40%, var(--card))" },
  ];
  const wRange = $("#w-range");
  $("#w-bar").innerHTML = SLICES.map((s) => `<i style="width:${s.w}%;background:${s.c}"></i>`).join("");
  const renderWhere = () => {
    fillRange(wRange);
    const amt = AMTS[+wRange.value];
    $("#w-amt").textContent = money(amt);
    $("#w-list").innerHTML = SLICES.map((s) => `<li><i style="background:${s.c}"></i><span>${s.n}</span><small>${s.w}%</small><b>${cents((amt * s.w) / 100)}</b></li>`).join("");
    const each = (amt * 0.607) / 490;
    const eachTxt = each < 1 ? T(`${+(each * 100).toFixed(1)} cents`, `${+(each * 100).toFixed(1)} centavos`) : cents(each);
    $("#w-msg").textContent = T(`Nvidia, Apple and Microsoft alone get ${cents(amt * 0.217)} of your ${money(amt)}. The other 490 or so companies split ${cents(amt * 0.607)}, about ${eachTxt} each. You still own a piece of every one of them.`,
      `Nvidia, Apple y Microsoft se llevan ${cents(amt * 0.217)} de tus ${money(amt)}. Las otras 490 empresas, más o menos, se reparten ${cents(amt * 0.607)}, unos ${eachTxt} cada una. Aun así, eres dueño de un pedazo de cada una.`);
  };
  wRange.addEventListener("input", renderWhere);
  renderWhere();

  // ---------- See it: what fees cost ----------
  const fAmt = $("#f-amt"), fYrs = $("#f-yrs");
  let feePick = 0.64;
  const grow = (m, n, fee) => {
    const r = Math.pow(1 + 0.10 - fee / 100, 1 / 12) - 1;
    let b = 0;
    for (let k = 0; k < n * 12; k++) b = (b + m) * (1 + r);
    return b;
  };
  const renderFees = () => {
    fillRange(fAmt); fillRange(fYrs);
    const m = +fAmt.value, n = +fYrs.value, paid = m * 12 * n;
    $("#f-amt-v").textContent = money(m);
    $("#f-yrs-v").textContent = n;
    const a = grow(m, n, 0.03), b = grow(m, n, feePick);
    const row = (label, v, cls) => `<div class="fee-row ${cls}"><span>${label}</span><div class="fee-track"><i class="fee-in" style="width:${(paid / a) * 100}%"></i><i class="fee-grow" style="width:${((v - paid) / a) * 100}%"></i></div><b>${money(v)}</b></div>`;
    $("#f-bars").innerHTML = row(T("0.03% fund", "Fondo de 0.03%"), a, "cheap") + row(T(`${feePick.toFixed(2)}% fund`, `Fondo de ${feePick.toFixed(2)}%`), b, "pricey")
      + `<div class="fee-key"><span><i class="fee-in"></i>${T(`you put in ${money(paid)}`, `pusiste ${money(paid)}`)}</span><span><i class="fee-grow"></i>${T("growth", "crecimiento")}</span></div>`;
    $("#f-msg").textContent = T(`Paying ${feePick.toFixed(2)}% instead of 0.03% leaves you with ${money(a - b)} less after ${n} years. That's ${Math.round(((a - b) / a) * 100)}% of what you'd have had, from a fee of just ${feePick.toFixed(2)}% a year.`,
      `Pagar ${feePick.toFixed(2)}% en vez de 0.03% te deja con ${money(a - b)} menos después de ${n} años. Es el ${Math.round(((a - b) / a) * 100)}% de lo que habrías tenido, por una comisión de apenas ${feePick.toFixed(2)}% al año.`);
    $("#f-msg").dataset.tone = (a - b) / a > 0.1 ? "warn" : "good";
  };
  fAmt.addEventListener("input", renderFees);
  fYrs.addEventListener("input", renderFees);
  $$("#f-fee .chip").forEach((b) => b.addEventListener("click", () => {
    feePick = +b.dataset.f;
    $$("#f-fee .chip").forEach((x) => x.classList.toggle("on", x === b));
    renderFees();
  }));
  renderFees();

  // ---------- Nature: one crop vs. a meadow ----------
  (() => {
    const crop = $("#if-crop"), meadow = $("#if-meadow");
    if (!crop) return;
    const plant = (g, x, kind, wilted) => {
      const p = svgEl("g", { transform: `translate(${x} 250)`, class: wilted ? "if-wilt" : "if-ok" });
      const green = ["#4f9a5b", "#6ab04c", "#3f8f7a", "#8bb04a"][kind % 4];
      const col = wilted ? "#b08d57" : green;
      if (kind === 0) { // wheat-like stalk
        p.appendChild(svgEl("path", { d: wilted ? "M0 0 C 0 -40, 10 -70, 34 -78" : "M0 0 V-110", stroke: col, "stroke-width": 4, fill: "none", "stroke-linecap": "round" }));
        p.appendChild(svgEl("ellipse", { cx: wilted ? 36 : 0, cy: wilted ? -76 : -118, rx: 6, ry: 14, fill: col, transform: wilted ? "rotate(70 36 -76)" : "" }));
      } else if (kind === 1) { // round bush
        p.appendChild(svgEl("circle", { cx: 0, cy: wilted ? -16 : -34, r: wilted ? 16 : 30, fill: col }));
      } else if (kind === 2) { // tall flower
        p.appendChild(svgEl("path", { d: wilted ? "M0 0 C 0 -50, 0 -70, 24 -84" : "M0 0 V-140", stroke: col, "stroke-width": 4, fill: "none" }));
        p.appendChild(svgEl("circle", { cx: wilted ? 26 : 0, cy: wilted ? -82 : -148, r: 10, fill: wilted ? "#b08d57" : "#e2a33c" }));
      } else { // grass tuft
        ["M0 0 L-14 -50", "M0 0 L0 -64", "M0 0 L14 -50"].forEach((d) => p.appendChild(svgEl("path", { d: wilted ? d.replace(/-(\d+)$/, (m, v) => `-${Math.round(v / 2.5)}`) : d, stroke: col, "stroke-width": 5, "stroke-linecap": "round" })));
      }
      g.appendChild(p);
    };
    for (let i = 0; i < 9; i++) plant(crop, 50 + i * 44, 0, true);
    [[486, 3, false], [516, 2, false], [552, 1, true], [590, 3, false], [620, 0, false], [650, 2, true], [684, 1, false], [722, 3, false], [752, 2, false], [782, 0, true], [814, 1, false], [850, 3, false], [876, 2, false]]
      .forEach(([x, k, w]) => plant(meadow, x, k, w));
  })();

  // ---------- Play it: shop for a fund ----------
  const SUMMIT = { name: "Summit 500 Index ETF", tk: "SMMT", type: T("Index ETF", "ETF indexado"), holds: T("The S&P 500 · 503 stocks", "El S&P 500 · 503 acciones"), er: 0.03, min: T("$1 · sells pieces of a share", "$1 · vende pedazos de una acción") };
  const TRIPS = [
    { goal: T("You want to own the whole S&P 500 and keep as much of your money as you can.", "Quieres ser dueño de todo el S&P 500 y quedarte con la mayor parte posible de tu dinero."),
      title: T("Same stocks, different fees", "Mismas acciones, distintas comisiones"),
      cards: [
        { name: "Crown 500 Index Fund", tk: "CRWN", type: T("Index mutual fund", "Fondo mutuo indexado"), holds: T("The S&P 500 · 503 stocks", "El S&P 500 · 503 acciones"), er: 0.5, min: "$1,000", tag: T("Most popular!", "¡El más popular!"),
          why: T("Crown owns the exact same 503 stocks as Summit but charges 0.50% a year instead of 0.03%. Popular doesn't mean cheap.", "Crown tiene exactamente las mismas 503 acciones que Summit, pero cobra 0.50% al año en vez de 0.03%. Popular no quiere decir barato.") },
        Object.assign({ ok: true, why: T("Summit and Crown own the exact same 503 stocks, so before fees they earn exactly the same. The fee is the only difference, and Summit's is the lowest.", "Summit y Crown tienen exactamente las mismas 503 acciones, así que antes de comisiones ganan exactamente lo mismo. La comisión es la única diferencia, y la de Summit es la más baja.") }, SUMMIT),
        { name: "Vista Select Large-Cap Fund", tk: "VSTA", type: T("Active mutual fund", "Fondo mutuo activo"), holds: T("About 60 big companies its managers pick", "Unas 60 empresas grandes que eligen sus administradores"), er: 0.85, min: "$2,500", tag: T("Expert picks", "Elegidas por expertos"),
          why: T("Vista's managers pick about 60 stocks and charge 0.85%. Just to tie the S&P 500, they'd have to beat it by 0.85% every year, and most managers don't.", "Los administradores de Vista eligen unas 60 acciones y cobran 0.85%. Solo para empatar con el S&P 500 tendrían que ganarle por 0.85% cada año, y la mayoría no lo logra.") },
      ], bars: "fee" },
    { goal: T("You have $10 today and want to start right now.", "Tienes $10 hoy y quieres empezar ya."),
      title: T("Start with $10", "Empieza con $10"),
      cards: [
        { name: "Harbor 500 Index Admiral Fund", tk: "HRBX", type: T("Index mutual fund", "Fondo mutuo indexado"), holds: T("The S&P 500 · 503 stocks", "El S&P 500 · 503 acciones"), er: 0.04, min: "$3,000",
          why: T("It's a great fund, but you'd need $3,000 to get in. With $10, you'd be waiting years to start.", "Es un gran fondo, pero necesitarías $3,000 para entrar. Con $10, tardarías años en empezar.") },
        { name: "PixelForge Inc.", tk: "PXFG", type: T("Single stock", "Una sola acción"), holds: T("1 company", "1 empresa"), er: null, min: T("$1 · sells pieces of a share", "$1 · vende pedazos de una acción"), tag: T("Trending", "En tendencia"),
          why: T("$10 works here, but it all rides on one company. Remember Lesson 2: most single stocks did worse than Treasury bills.", "Aquí sí alcanzan los $10, pero todo depende de una sola empresa. Acuérdate de la Lección 2: a la mayoría de las acciones individuales les fue peor que a los bonos del Tesoro.") },
        Object.assign({ ok: true, why: T("An ETF trades like a stock, and this app sells pieces of a share, so your $10 buys a slice of all 500 companies today.", "Un ETF se compra y vende como una acción, y esta app vende pedazos de una acción, así que tus $10 compran un pedazo de las 500 empresas hoy mismo.") }, SUMMIT),
      ], bars: "start" },
    { goal: T("You want your money spread over as many U.S. companies as possible.", "Quieres tu dinero repartido entre la mayor cantidad posible de empresas de Estados Unidos."),
      title: T("Spread it widest", "Repártelo lo más posible"),
      cards: [
        { name: "Blue Chip 30 ETF", tk: "BLUE", type: T("Index ETF", "ETF indexado"), holds: T("The Dow · 30 stocks", "El Dow · 30 acciones"), er: 0.16, min: "$1", n: 30,
          why: T("Only 30 companies, and a higher fee. That's the least spread out of the three.", "Solo 30 empresas, y una comisión más alta. Es el menos repartido de los tres.") },
        Object.assign({ n: 503, why: T("Close. 503 stocks is a lot, but a total market fund owns those plus about 3,000 smaller companies.", "Casi. 503 acciones son muchas, pero un fondo de todo el mercado tiene esas y unas 3,000 empresas más pequeñas.") }, SUMMIT),
        { name: "Total Market Index ETF", tk: "TOTL", type: T("Index ETF", "ETF indexado"), holds: T("About 3,600 U.S. stocks, big and small", "Unas 3,600 acciones de EE. UU., grandes y pequeñas"), er: 0.03, min: "$1", n: 3600, ok: true,
          why: T("A total market fund holds the S&P 500 companies plus thousands of smaller ones. The S&P 500 is about 80% of the market's value, so the two usually move almost together, but this one is the most spread out.", "Un fondo de todo el mercado tiene las empresas del S&P 500 más miles de empresas pequeñas. El S&P 500 es como el 80% del valor del mercado, así que los dos casi siempre se mueven juntos, pero este es el más repartido.") },
      ], bars: "count" },
    { goal: T("A coworker says a fund \"crushed the market last year.\" You're investing for 30 years.", "Un compañero de trabajo dice que un fondo \"le ganó por mucho al mercado el año pasado\". Tú vas a invertir por 30 años."),
      title: T("The hot tip", "El dato caliente"),
      cards: [
        { name: "Rocket Growth Fund", tk: "RCKT", type: T("Active mutual fund", "Fondo mutuo activo"), holds: T("About 40 fast-growing companies", "Unas 40 empresas que crecen rápido"), er: 1.1, min: "$1,000", tag: T("Up 41% last year!", "¡Subió 41% el año pasado!"),
          why: T("One great year says little about the next 30. Last year's top funds rarely stay on top, and a 1.10% fee is a big head start to give away.", "Un gran año dice poco sobre los próximos 30. Los mejores fondos del año pasado casi nunca siguen arriba, y una comisión de 1.10% es mucha ventaja para regalar.") },
        Object.assign({ ok: true, tag: T("Up 18% last year", "Subió 18% el año pasado"), why: T("Boring wins. Over the 20 years through 2024, about 92% of active big-company funds did worse than the S&P 500, and Summit is the S&P 500 for 0.03%.", "Lo aburrido gana. En los 20 años hasta 2024, a más o menos el 92% de los fondos activos de empresas grandes les fue peor que al S&P 500, y Summit es el S&P 500 por 0.03%.") }, SUMMIT),
        { name: "Momentum Masters Fund", tk: "MOMO", type: T("Active mutual fund", "Fondo mutuo activo"), holds: T("About 75 stocks its managers pick", "Unas 75 acciones que eligen sus administradores"), er: 0.95, min: "$500", tag: T("Top 10% of funds 3 years running", "Entre el 10% mejor 3 años seguidos"),
          why: T("Three good years still isn't 30. Over 20 years, about 92% of active big-company funds trailed the S&P 500.", "Tres buenos años todavía no son 30. En 20 años, a más o menos el 92% de los fondos activos de empresas grandes les fue peor que al S&P 500.") },
      ], bars: "fee" },
  ];
  const S = { trip: 0, tries: 0, score: 0, done: false };
  const cardsEl = $("#s-cards"), whyEl = $("#s-why"), nextBtn = $("#s-next");
  const fmtEr = (er) => (er == null ? T("No fund fee", "Sin comisión de fondo") : `${er.toFixed(2)}%`);

  const renderTrip = () => {
    const tr = TRIPS[S.trip];
    S.tries = 0;
    $("#s-round").textContent = T(`Trip ${S.trip + 1} of ${TRIPS.length}`, `Compra ${S.trip + 1} de ${TRIPS.length}`);
    $("#s-goal-t").textContent = tr.title;
    $("#s-goal").innerHTML = `<b>${T("Your goal:", "Tu meta:")}</b> ${tr.goal}`;
    cardsEl.innerHTML = tr.cards.map((c, i) => `<button type="button" class="fund-card" data-i="${i}">
      <span class="fc-top"><span class="fc-tk">${c.tk}</span><span class="fc-type">${c.type}</span></span>
      <b class="fc-name">${c.name}</b>${c.tag ? `<span class="fc-tag">${c.tag}</span>` : ""}
      <span class="fc-stats"><span><small>${T("Holds", "Tiene")}</small>${c.holds}</span><span><small>${T("Expense ratio", "Tasa de gastos")}</small>${fmtEr(c.er)}</span><span><small>${T("Minimum", "Mínimo")}</small>${c.min}</span></span>
    </button>`).join("");
    whyEl.classList.add("hidden");
    whyEl.innerHTML = "";
    nextBtn.disabled = true;
    nextBtn.innerHTML = `${S.trip === TRIPS.length - 1 ? T("See your results", "Ver tus resultados") : T("Next trip", "Siguiente compra")} <span class="arrow">→</span>`;
  };

  const barsFor = (tr) => {
    if (tr.bars === "fee") {
      const rows = tr.cards.map((c) => ({ c, v: history(c.er) })).sort((a, b) => b.v - a.v);
      const max = rows[0].v;
      return `<h4>${T("30 years later: $200 a month from 1995 to 2024", "30 años después: $200 al mes de 1995 a 2024")}</h4><div class="sb-rows">${rows.map(({ c, v }) =>
        `<div class="sb-row${c.ok ? " ok" : ""}"><span>${c.name} <small>${fmtEr(c.er)}</small></span><span class="sb-track"><i style="width:${(v / max) * 100}%"></i></span><b>${money(v)}</b></div>`).join("")}</div>
        <p class="small muted">${T(`You'd put in $72,000 either way. The cheapest fund ends ${money(rows[0].v - rows[rows.length - 1].v)} ahead of the priciest, even though all three earned the same before fees.`,
          `En los tres casos pondrías $72,000. El fondo más barato termina ${money(rows[0].v - rows[rows.length - 1].v)} por encima del más caro, aunque los tres ganaron lo mismo antes de comisiones.`)}</p>`;
    }
    if (tr.bars === "count") {
      const rows = tr.cards.slice().sort((a, b) => b.n - a.n);
      return `<h4>${T("How many companies you'd own", "Cuántas empresas tendrías")}</h4><div class="sb-rows">${rows.map((c) =>
        `<div class="sb-row${c.ok ? " ok" : ""}"><span>${c.name}</span><span class="sb-track"><i style="width:${(c.n / 3600) * 100}%"></i></span><b>${c.n.toLocaleString("en-US")}</b></div>`).join("")}</div>`;
    }
    return `<h4>${T("What happens today", "Qué pasa hoy")}</h4><ul class="sb-list">
      <li>${T("<b>Harbor 500 Admiral:</b> can't buy yet. You'd need $2,990 more.", "<b>Harbor 500 Admiral:</b> todavía no puedes comprar. Te faltarían $2,990.")}</li>
      <li>${T("<b>PixelForge:</b> $10 in 1 company.", "<b>PixelForge:</b> $10 en 1 empresa.")}</li>
      <li class="ok">${T("<b>Summit 500 ETF:</b> $10 spread over 503 stocks, starting today.", "<b>Summit 500 ETF:</b> $10 repartidos entre 503 acciones, desde hoy.")}</li></ul>`;
  };

  cardsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".fund-card");
    if (!b || S.done || b.disabled) return;
    const tr = TRIPS[S.trip], c = tr.cards[+b.dataset.i];
    S.tries++;
    whyEl.classList.remove("hidden");
    if (!c.ok) {
      b.classList.add("wrong");
      b.disabled = true;
      whyEl.dataset.tone = "warn";
      whyEl.innerHTML = `<p><b>${T("Not the best fit.", "No es la mejor opción.")}</b> ${c.why} ${T("Try another one.", "Prueba otra.")}</p>`;
      return;
    }
    b.classList.add("right");
    $$(".fund-card", cardsEl).forEach((x) => (x.disabled = true));
    const first = S.tries === 1;
    if (first) S.score++;
    $("#s-score").textContent = T(`${S.score} of ${S.trip + 1}`, `${S.score} de ${S.trip + 1}`);
    whyEl.dataset.tone = "good";
    whyEl.innerHTML = `<p><b>${first ? T("Right on the first try.", "Correcto al primer intento.") : T("That's the one.", "Ese es.")}</b> ${c.why}</p>${barsFor(tr)}`;
    nextBtn.disabled = false;
  });

  nextBtn.addEventListener("click", () => {
    if (S.trip < TRIPS.length - 1) {
      S.trip++;
      renderTrip();
      $("#shop").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      return;
    }
    if (S.done) { // play again
      S.trip = 0; S.score = 0; S.done = false;
      $("#s-result").classList.add("hidden");
      $("#s-score").textContent = T("0 of 0", "0 de 0");
      renderTrip();
      return;
    }
    S.done = true;
    const cheap = history(0.03), pricey = history(1.1);
    const res = $("#s-result");
    res.classList.remove("hidden");
    res.innerHTML = `<div class="result-grade"><span class="grade">${S.score}/4</span><div><b>${S.score === 4 ? T("A sharp fund shopper", "Sabes comprar fondos") : T("Now you know what to look for", "Ya sabes qué buscar")}</b><p>${T(
      `Cheap, broad and boring is the whole trick. With $200 a month from 1995 to 2024, the same S&P 500 stocks grew to ${money(cheap)} at a 0.03% fee and only ${money(pricey)} at 1.10%. Next, you'll open the account you'd buy a fund in.`,
      `Barato, amplio y aburrido: ese es todo el truco. Con $200 al mes de 1995 a 2024, las mismas acciones del S&P 500 crecieron a ${money(cheap)} con una comisión de 0.03% y solo a ${money(pricey)} con 1.10%. Después vas a abrir la cuenta donde comprarías un fondo.`)}</p></div></div>`;
    nextBtn.innerHTML = `${T("Shop again", "Comprar otra vez")} <span class="arrow">→</span>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, S.score * 25);
    if (first) FH.addXP(50, T("Shopped for an index fund", "Compraste un fondo indexado"));
    if (S.score === 4) FH.badge("fund-shopper", T("Fund Shopper", "Comprador de fondos"));
    FH.save();
  });
  renderTrip();

  // ---------- Check ----------
  const F = (a, b) => `<span class='frac'><span>${a}</span><span>${b}</span></span>`;
  const QUIZ_EN = [
    { q: "What does one share of an S&P 500 index fund give you?",
      opts: ["A tiny slice of all of the roughly 500 companies", "One share of each of the 500 companies", "A share of whichever company is biggest that day", "A loan to the 500 companies, paid back with interest"], a: 0,
      why: "An index fund pools money and buys every company in the index, so each share of the fund is a tiny slice of all of them." },
    { q: "Why is an S&P 500 index fund called passive investing?",
      opts: ["It copies an index instead of picking stocks", "It only buys stocks that have stopped moving", "Its managers trade as rarely as once a decade", "It only invests money that is sitting idle"], a: 0,
      why: "Passive investing means copying an index. Active funds have managers who pick stocks to try to beat it." },
    { q: "You have $25,000 in a fund with a 0.04% expense ratio. About how much is the fee each year?",
      opts: ["$10", "$100", "$1,000", "$40"], a: 0,
      why: "Yearly fee = balance × expense ratio = $25,000 × 0.0004 = $10." },
    { q: "A company makes up 7% of the S&P 500. You put $50 into an S&P 500 index fund. How much of it goes to that company?",
      opts: ["$3.50", "$7.00", "$0.35", "$0.07"], a: 0,
      why: "Your money in a company = what you put in × weight = $50 × 0.07 = $3.50." },
    { q: "What is the main difference between an ETF and a mutual fund?",
      opts: ["An ETF trades all day like a stock, and a mutual fund is priced once a day", "An ETF holds only one company, and a mutual fund holds many companies", "An ETF has no fees at all, and a mutual fund always charges a fee", "An ETF is for retirement only, and a mutual fund is for anything"], a: 0,
      why: "Both can be index funds. An ETF trades on an exchange all day, and a mutual fund's price is set once a day after the market closes." },
    { q: "According to S&P's SPIVA scorecard, about what share of active U.S. large-company funds did worse than the S&P 500 over the 20 years through 2024?",
      opts: ["About 92%", "About 50%", "About 25%", "About 8%"], a: 0,
      why: "About 92% of active large-company funds trailed the S&P 500 over those 20 years." },
    { q: "Two funds both hold the S&P 500. One charges 0.03% a year and the other 0.50%. Over 30 years, what should you expect?",
      opts: ["The 0.03% fund ends with more, since the fee is the only difference", "The 0.50% fund ends with more, since a higher fee means better care", "They end the same, since they hold exactly the same stocks", "It's impossible to say, since fees are too small to matter"], a: 0,
      why: "Same stocks means the same return before fees. Return after fees = return − expense ratio, so the cheaper fund keeps more every year." },
  ];
  const QUIZ_ES = [
    { q: "¿Qué te da una acción de un fondo indexado del S&P 500?",
      opts: ["Un pedacito de cada una de las 500 empresas, más o menos", "Una acción completa de cada una de las 500 empresas", "Una acción de la empresa más grande de ese día", "Un préstamo a las 500 empresas, que te pagan con intereses"], a: 0,
      why: "Un fondo indexado junta dinero y compra todas las empresas del índice, así que cada acción del fondo es un pedacito de todas." },
    { q: "¿Por qué a un fondo indexado del S&P 500 se le llama inversión pasiva?",
      opts: ["Porque copia un índice en vez de elegir acciones", "Porque solo compra acciones que dejaron de moverse", "Porque sus administradores operan una vez por década", "Porque solo invierte dinero que estaba parado"], a: 0,
      why: "La inversión pasiva consiste en copiar un índice. Los fondos activos tienen administradores que eligen acciones para intentar ganarle." },
    { q: "Tienes $25,000 en un fondo con una tasa de gastos de 0.04%. ¿Más o menos cuánto pagas al año?",
      opts: ["$10", "$100", "$1,000", "$40"], a: 0,
      why: "Comisión al año = saldo × tasa de gastos = $25,000 × 0.0004 = $10." },
    { q: "Una empresa es el 7% del S&P 500. Pones $50 en un fondo indexado del S&P 500. ¿Cuánto va a esa empresa?",
      opts: ["$3.50", "$7.00", "$0.35", "$0.07"], a: 0,
      why: "Tu dinero en una empresa = lo que pones × peso = $50 × 0.07 = $3.50." },
    { q: "¿Cuál es la principal diferencia entre un ETF y un fondo mutuo?",
      opts: ["Un ETF se opera todo el día como una acción, y el fondo mutuo tiene un precio al día", "Un ETF tiene una sola empresa, y un fondo mutuo tiene muchas empresas", "Un ETF no tiene comisiones, y un fondo mutuo siempre cobra una comisión", "Un ETF es solo para el retiro, y un fondo mutuo sirve para cualquier cosa"], a: 0,
      why: "Los dos pueden ser fondos indexados. Un ETF se compra y vende en la bolsa todo el día, y el precio de un fondo mutuo se fija una vez al día, después del cierre." },
    { q: "Según el reporte SPIVA de S&P, ¿a más o menos qué parte de los fondos activos de empresas grandes de EE. UU. les fue peor que al S&P 500 en los 20 años hasta 2024?",
      opts: ["Más o menos al 92%", "Más o menos al 50%", "Más o menos al 25%", "Más o menos al 8%"], a: 0,
      why: "A más o menos el 92% de los fondos activos de empresas grandes les fue peor que al S&P 500 en esos 20 años." },
    { q: "Dos fondos tienen el S&P 500. Uno cobra 0.03% al año y el otro 0.50%. En 30 años, ¿qué deberías esperar?",
      opts: ["El de 0.03% termina con más, porque la comisión es la única diferencia", "El de 0.50% termina con más, porque más comisión es mejor servicio", "Terminan igual, porque tienen exactamente las mismas acciones", "No se puede saber, porque las comisiones son muy chicas para importar"], a: 0,
      why: "Mismas acciones significa el mismo rendimiento antes de comisiones. Rendimiento después de comisiones = rendimiento − tasa de gastos, así que el fondo más barato se queda con más cada año." },
  ];

  FHLesson.init({ id: LESSON, short: "index-funds", quiz: FH.lang === "es" ? QUIZ_ES : QUIZ_EN });
})();
