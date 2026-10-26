// Unit 1, Lesson 1: Scarcity and trade-offs
(function () {
  const LESSON = "u1-scarcity";
  const { $, $$, fillRange, wait, shuffle } = FHLesson;
  const money = FH.money;
  const NS = "http://www.w3.org/2000/svg";

  // ---------- See it: the price of an hour ----------
  const slider = $("#oc-slider");
  const strip = $("#oc-strip");
  for (let i = 0; i < 10; i++) strip.appendChild(document.createElement("span"));
  const renderOC = () => {
    const h = +slider.value;
    fillRange(slider);
    $("#oc-hours").textContent = h;
    $("#oc-earn").textContent = money(h * 15);
    $("#oc-free").textContent = `${10 - h} h`;
    $("#oc-cost").textContent = money((10 - h) * 15);
    [...strip.children].forEach((s, i) => { s.className = i < h ? "k-mow" : "k-friends"; s.textContent = i < h ? "$15" : "fun"; });
  };
  slider.addEventListener("input", renderOC);
  renderOC();

  // ---------- See it: production possibilities frontier ----------
  // Lawns 0..10 on x (80..600), bikes 0..5 on y (360..40).
  const X = (l) => 80 + l * 52, Y = (b) => 360 - b * 64;
  let bMax = 2.5, grown = false;
  const frontier = (l, bm = bMax) => bm * Math.sqrt(Math.max(0, 1 - (l / 10) ** 2));
  const pathFor = (bm) => {
    let d = "";
    for (let i = 0; i <= 50; i++) { const l = i / 5; d += `${i ? "L" : "M"}${X(l).toFixed(1)} ${Y(frontier(l, bm)).toFixed(1)} `; }
    return d;
  };
  const drawPPF = () => {
    const d = pathFor(bMax);
    $("#ppf-line").setAttribute("d", d);
    $("#ppf-area").setAttribute("d", `${d} L${X(0)} ${Y(0)} Z`);
  };
  const ticks = $("#ppf-ticks");
  for (let l = 0; l <= 10; l += 2) { const t = document.createElementNS(NS, "text"); t.setAttribute("x", X(l)); t.setAttribute("y", 380); t.setAttribute("text-anchor", "middle"); t.textContent = l; ticks.appendChild(t); }
  for (let b = 1; b <= 4; b++) { const t = document.createElementNS(NS, "text"); t.setAttribute("x", 66); t.setAttribute("y", Y(b) + 4); t.setAttribute("text-anchor", "end"); t.textContent = b; ticks.appendChild(t); }
  drawPPF();

  const ppf = $("#ppf"), pin = $("#ppf-pin"), msg = $("#ppf-msg");
  let tested = new Set();
  $("#ppf-hit").addEventListener("click", (e) => {
    const pt = ppf.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(ppf.getScreenCTM().inverse());
    const l = Math.max(0, Math.min(10, (p.x - 80) / 52));
    const b = Math.max(0, (360 - p.y) / 64);
    const edge = frontier(l);
    pin.setAttribute("transform", `translate(${X(l)} ${Y(b)})`);
    pin.setAttribute("opacity", 1);
    const c = pin.querySelector("circle");
    const plan = `${l.toFixed(1)} lawns and ${b.toFixed(1)} bikes`;
    let kind;
    if (Math.abs(b - edge) < 0.18) {
      kind = "on"; c.setAttribute("fill", "var(--savings)"); c.setAttribute("stroke", "var(--ink)");
      msg.innerHTML = `<b class="c-good">Efficient.</b> ${plan} uses every hour. To get more of one, you have to give up some of the other.`;
    } else if (b < edge) {
      kind = "in"; c.setAttribute("fill", "var(--paper)"); c.setAttribute("stroke", "var(--ink-3)");
      msg.innerHTML = `<b>Possible, but wasteful.</b> ${plan} leaves hours unused. You could have more of both.`;
    } else {
      kind = "out"; c.setAttribute("fill", "none"); c.setAttribute("stroke", "var(--danger)");
      msg.innerHTML = `<b class="c-danger">Impossible, for now.</b> ${plan} needs more hours or better tools than you have.`;
    }
    tested.add(kind);
    if (tested.size === 3) FH.badge("ppf-explorer", "Frontier Explorer");
  });
  $("#ppf-grow").addEventListener("click", () => {
    const old = $("#ppf-old");
    if (grown) {
      grown = false; bMax = 2.5; old.setAttribute("opacity", 0);
      $("#ppf-grow").textContent = "Buy a $60 repair stand";
      msg.textContent = "Back to your old tools.";
    } else {
      old.setAttribute("d", pathFor(2.5)); old.setAttribute("opacity", 1);
      grown = true; bMax = 4;
      $("#ppf-grow").textContent = "Go back to old tools";
      msg.innerHTML = "<b>The frontier shifted out.</b> Same 10 hours, but now up to 4 bikes. Plans that were impossible are possible. That's what economic growth looks like, for you or a whole country.";
    }
    ppf.classList.add("growing");
    animatePPF(grown ? 2.5 : 4, bMax);
  });
  const animatePPF = (from, to) => {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700), e = 1 - (1 - k) ** 3;
      const bm = from + (to - from) * e;
      const d = pathFor(bm);
      $("#ppf-line").setAttribute("d", d);
      $("#ppf-area").setAttribute("d", `${d} L${X(0)} ${Y(0)} Z`);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---------- Play it: Ten Free Hours ----------
  const GOAL_MONEY = 200, GOAL_STUDY = 12;
  const ACTS = [
    { id: "mow", name: "Mow lawns", unit: 1, desc: "$15 an hour. Tiring.", color: "var(--savings)" },
    { id: "bike", name: "Fix a bike to resell", unit: 4, desc: "4 hours each. About $70 profit.", color: "var(--needs)" },
    { id: "gig", name: "Help a neighbor move", unit: 1, desc: "$25 an hour, this weekend only. Exhausting.", color: "var(--accent)", eventOnly: true },
    { id: "study", name: "SAT practice", unit: 1, desc: "1 hour of practice. Draining.", color: "#7a5bb5" },
    { id: "friends", name: "Friends and rest", unit: 1, desc: "Recharges your energy.", color: "var(--wants)" },
  ];
  const EVENTS = [
    { id: "rain", text: "It's raining all weekend. No lawns can be mowed.", apply: (w) => { w.noMow = true; } },
    { id: "gig", text: "A neighbor is moving and will pay $25 an hour, up to 4 hours.", apply: (w) => { w.gig = true; } },
    { id: "parts", text: "A garage sale has cheap parts. Each bike you fix earns $95 this weekend.", apply: (w) => { w.bikePay = 95; } },
  ];
  const S = { week: 0, money: 0, study: 0, energy: 70, log: [] };
  let W, plan, busy = false;
  const deck = [null, ...shuffle([...EVENTS])];

  const newWeekend = () => {
    W = { hours: S.energy < 30 ? 7 : 10, noMow: false, gig: false, bikePay: 70, event: deck[S.week] };
    if (W.event) W.event.apply(W);
    plan = { mow: 0, bike: 0, gig: 0, study: 0, friends: 0 };
    $("#g-week").textContent = `Weekend ${S.week + 1} of 4`;
    const notes = [];
    if (W.event) notes.push(W.event.text);
    if (W.hours < 10) notes.push("You're burned out, so you only have 7 useful hours this weekend.");
    $("#g-event-note").innerHTML = notes.map((n) => `<b>${n}</b>`).join(" ");
    renderActs();
  };
  const used = () => Object.values(plan).reduce((a, b) => a + b, 0);
  const rates = () => ({ mow: W.noMow ? 0 : 15, bike: W.bikePay / 4, gig: W.gig ? 25 : 0 });
  const bestPaid = () => Math.max(...Object.values(rates()));

  const renderActs = () => {
    const box = $("#g-acts");
    box.innerHTML = "";
    ACTS.forEach((a) => {
      if (a.eventOnly && !W.gig) return;
      const off = a.id === "mow" && W.noMow;
      const row = document.createElement("div");
      row.className = "act" + (off ? " off" : "");
      row.style.setProperty("--c", a.color);
      const desc = a.id === "bike" ? `4 hours each. About $${W.bikePay} profit.` : a.desc;
      row.innerHTML = `<div class="act-name"><i></i><div><b>${a.name}</b><small>${off ? "Rained out" : desc}</small></div></div>
        <div class="stepper"><button aria-label="Less ${a.name}" data-d="-1">−</button><output>${plan[a.id]} h</output><button aria-label="More ${a.name}" data-d="1">+</button></div>`;
      $$("button", row).forEach((b) => b.addEventListener("click", () => {
        if (busy || off) return;
        const d = +b.dataset.d * a.unit;
        const next = plan[a.id] + d;
        if (next < 0) return;
        if (d > 0 && used() + d > W.hours) { FH.toast(a.id === "bike" ? "A bike needs 4 free hours." : "No hours left. Take some from somewhere else."); return; }
        if (a.id === "gig" && next > 4) { FH.toast("The move only needs 4 hours."); return; }
        plan[a.id] = next;
        $("output", row).textContent = `${next} h`;
        renderStrip();
      }));
      box.appendChild(row);
    });
    renderStrip();
  };
  const gStrip = $("#g-strip");
  const renderStrip = () => {
    gStrip.innerHTML = "";
    const order = ["mow", "bike", "gig", "study", "friends"];
    let n = 0;
    order.forEach((k) => { for (let i = 0; i < plan[k]; i++, n++) { const s = document.createElement("span"); s.style.background = ACTS.find((a) => a.id === k).color; s.className = "filled"; gStrip.appendChild(s); } });
    for (; n < W.hours; n++) gStrip.appendChild(document.createElement("span"));
    for (; n < 10; n++) { const s = document.createElement("span"); s.className = "lost"; gStrip.appendChild(s); }
    const left = W.hours - used();
    $("#g-left").textContent = left ? `${left} hour${left === 1 ? "" : "s"} left` : "Every hour has a job";
    $("#g-left").style.color = left ? "" : "var(--good)";
    $("#g-go").disabled = left !== 0;
  };
  const renderGauges = () => {
    $("#s-money").textContent = money(S.money);
    $("#m-money").style.width = `${Math.min(100, (S.money / GOAL_MONEY) * 100)}%`;
    $("#s-study").textContent = `${S.study} h`;
    $("#m-study").style.width = `${Math.min(100, (S.study / GOAL_STUDY) * 100)}%`;
    $("#s-energy").textContent = Math.round(S.energy);
    $("#m-energy").style.width = `${S.energy}%`;
    $("#s-energy").style.color = S.energy < 30 ? "var(--danger)" : "";
  };
  const log = (html, cls = "") => { const li = document.createElement("li"); li.className = cls; li.innerHTML = html; $("#g-log").prepend(li); };

  $("#g-go").addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    $("#g-go").disabled = true;
    const earned = plan.mow * 15 + (plan.bike / 4) * W.bikePay + plan.gig * 25;
    const energyDelta = -3 * plan.mow - 2 * plan.bike - 5 * plan.gig - 4 * plan.study + 9 * plan.friends;
    // Animate the hour blocks being "spent".
    for (const s of $$("span.filled", gStrip)) { s.classList.add("spent"); await wait(90); }
    S.money += earned;
    S.study += plan.study;
    S.energy = Math.max(0, Math.min(100, S.energy + energyDelta));
    renderGauges();
    const best = bestPaid();
    const parts = [];
    if (earned) parts.push(`earned <b>${money(earned)}</b>`);
    if (plan.study) parts.push(`studied <b>${plan.study} h</b>`);
    if (plan.friends) parts.push(`rested <b>${plan.friends} h</b>`);
    const unpaid = plan.study + plan.friends;
    const oc = unpaid ? ` Those ${unpaid} unpaid hours had an opportunity cost of <b>${money(unpaid * best)}</b>, at your best rate of ${money(best)} an hour.` : " You didn't rest or study at all. Watch your energy.";
    log(`Weekend ${S.week + 1}: you ${parts.join(", ") || "did nothing"}.${oc}`, energyDelta < -15 ? "bad" : "good");
    S.week++;
    await wait(500);
    busy = false;
    if (S.week < 4) newWeekend();
    else finish();
  });

  const finish = () => {
    $("#g-acts").innerHTML = "";
    $("#g-strip").innerHTML = "";
    $("#g-event-note").textContent = "";
    $("#g-go").classList.add("hidden");
    $("#g-left").textContent = "Summer's over";
    $("#g-week").textContent = "Final results";
    const mScore = Math.min(1, S.money / GOAL_MONEY) * 40;
    const sScore = Math.min(1, S.study / GOAL_STUDY) * 40;
    const eScore = S.energy >= 40 ? 20 : (S.energy / 40) * 20;
    const score = Math.round(mScore + sScore + eScore);
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
    const hit = [S.money >= GOAL_MONEY && "the money goal", S.study >= GOAL_STUDY && "the SAT goal", S.energy >= 40 && "your energy"].filter(Boolean);
    const lesson = hit.length === 3
      ? "You hit all three. You found the mix where each hour went to whatever it was worth most."
      : `You protected ${hit.length ? hit.join(" and ") : "nothing fully"}. Every goal you missed is the opportunity cost of the goals you chased. There's no plan that maxes everything, only trade-offs you choose on purpose.`;
    const r = $("#g-result");
    r.classList.remove("hidden");
    r.innerHTML = `<div class="result-grade"><span class="grade">${grade}</span><div><b>${score} / 100</b><p>${lesson}</p></div></div>
      <p class="small muted">${money(S.money)} saved goes into your savings for the rest of the course.</p>
      <button class="btn line" id="g-again">Play again</button>`;
    const l = FH.lesson(LESSON);
    const first = l.gameBest === null;
    l.gameBest = Math.max(l.gameBest || 0, score);
    if (first) FH.updateCharacter({ checking: FH.state.character.checking + S.money });
    FH.addXP(first ? 50 : 15, first ? "Finished Ten Free Hours" : "Another summer down");
    if (grade === "A") FH.badge("ten-hours-a", "Ten Free Hours: A");
    $("#g-again").addEventListener("click", () => {
      Object.assign(S, { week: 0, money: 0, study: 0, energy: 70 });
      deck.splice(1, 3, ...shuffle([...EVENTS]));
      $("#g-log").innerHTML = "";
      r.classList.add("hidden");
      $("#g-go").classList.remove("hidden");
      renderGauges();
      newWeekend();
    });
  };
  renderGauges();
  newWeekend();

  // ---------- Check ----------
  const QUIZ = [
    { q: "Jada can work a $16-an-hour shift or tutor for $20 an hour on Saturday. She goes to the beach instead. What's the opportunity cost of her beach day for a 4-hour block?",
      opts: ["$80", "$64", "$144", "$0, because she enjoyed it"], a: 0,
      why: "Opportunity cost is the value of the best alternative given up: tutoring at $20 × 4 = $80. You don't add the shift too, because she could only have done one." },
    { q: "On a production possibilities frontier, a point inside the curve represents:",
      opts: ["An impossible combination", "An efficient use of resources", "Unused or wasted resources", "Economic growth"], a: 2,
      why: "Inside the frontier, you could make more of at least one good without giving up any of the other, so resources are being wasted." },
    { q: "A country can produce either 100 tons of wheat or 50 cars. Assuming a straight-line PPF, what's the opportunity cost of one car?",
      opts: ["0.5 tons of wheat", "2 tons of wheat", "50 tons of wheat", "100 tons of wheat"], a: 1,
      why: "Giving up all 100 tons gets 50 cars, so each car costs 100 ÷ 50 = 2 tons of wheat." },
    { q: "Why is a PPF usually bowed outward?",
      opts: ["Prices rise over time", "Resources aren't equally suited to producing both goods", "Technology improves", "People prefer one good"], a: 1,
      why: "Think of Maya, Leo and Jordan. To get more bikes, you switch the best bike fixer first, so the first bikes cost few lawns. Then you have to switch people who are worse at bikes, so each extra bike costs more lawns. Costs that keep rising make the curve bulge outward. If everyone were equally good, it would be a straight line." },
    { q: "Which of these would shift a country's PPF outward?",
      opts: ["Unemployment falls", "A new technology makes factories more productive", "Prices of goods fall", "People buy more cars and less wheat"], a: 1,
      why: "The curve only moves when the most a country could make goes up. New technology does that: the same workers and machines now produce more. Lower unemployment just puts idle people to work, moving the country from inside up to the curve it already had. Buying more cars and less wheat slides along the same curve. And prices don't change how much can be made at all." },
    { q: "You paid $40 for a concert ticket you can't resell. On the day, you feel sick and would rather stay home. What should you base your decision on?",
      opts: ["The $40, so it isn't wasted", "Only how you feel now, since the $40 is a sunk cost", "Whether the band is popular", "Splitting the difference and leaving early"], a: 1,
      why: "The $40 is gone either way. A rational choice compares only future costs and benefits: going sick versus staying home." },
    { q: "A factory has 10 workers and one building. Each new machine costs $4,000. Machines 1 to 4 each add $5,000 of output. A 5th machine would add only $3,500, because the same 10 workers can't keep five machines busy. How many machines should the factory buy?",
      opts: ["As many as possible", "Four", "Five", "None"], a: 1,
      why: "Buy one more as long as what it adds is bigger than what it costs. Machines 1 to 4 add $5,000 and cost $4,000, so each one gains $1,000. Machine 5 adds $3,500 but costs $4,000, so buying it loses $500. Stop at four. This is the repair-stand example from the lesson: more machines with the same workers means each extra one adds less (diminishing returns)." },
  ];

  FHLesson.init({ id: LESSON, short: "scarcity", quiz: QUIZ });
})();
