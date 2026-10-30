// Shared lesson behavior: progress rail, learning-style picker, narration player,
// fill-in-the-blanks, private reflections and the exam-style quiz.
// Each lesson calls FHLesson.init({ id, title, quiz }) after its own lesson.js setup.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fillRange = (r) => r.style.setProperty("--fill", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);

  function init({ id, short, quiz = [], passMark }) {
    const T = FH.t;
    const chapters = $$("main .chapter");
    const slug = short || id;

    // ---------- XP, rail and learning style ----------
    const renderProgress = () => {
      const xp = $("#xp"); if (xp) xp.textContent = FH.state.xp;
      const seen = FH.lesson(id).sections;
      $$(".rail a").forEach((a) => a.classList.toggle("seen", !!seen[a.getAttribute("href").slice(1)]));
    };
    document.addEventListener("fh:save", renderProgress);

    // ---------- Learning-style filter ----------
    // Chapters outside the learner's picked styles fold down to one line; "Show anyway" opens them.
    const opened = new Set();
    chapters.forEach((c) => {
      if (!c.dataset.style) return;
      const k = c.querySelector(".kicker");
      const b = document.createElement("button");
      b.className = "unfold";
      b.type = "button";
      b.textContent = T("Show anyway", "Mostrar igual");
      b.addEventListener("click", () => { opened.add(c.id); applyStyle(); });
      k.appendChild(b);
    });
    const applyStyle = () => {
      const picks = FH.styles;
      chapters.forEach((c) => {
        const st = c.dataset.style;
        const mine = !!picks && !!st && picks.includes(st);
        c.classList.toggle("is-preferred", mine);
        c.classList.toggle("is-folded", !!picks && !!st && !mine && !opened.has(c.id));
      });
      $$(".rail a").forEach((a) => {
        const st = a.dataset.style;
        a.classList.toggle("pref", !!picks && !!st && picks.includes(st));
        a.classList.toggle("folded", !!picks && !!st && !picks.includes(st) && !opened.has(a.getAttribute("href").slice(1)));
      });
      renderFilter();
    };
    $$(".rail a").forEach((a) => a.addEventListener("click", () => {
      const id = a.getAttribute("href").slice(1);
      if (a.classList.contains("folded")) { opened.add(id); applyStyle(); }
    }));

    const filter = document.createElement("div");
    filter.className = "style-filter";
    filter.innerHTML = `<button class="sf-toggle" type="button" aria-expanded="false" aria-controls="sf-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span></span></button>
      <div class="sf-panel" id="sf-panel" hidden>
        <b>${T("How you learn best", "Cómo aprendes mejor")}</b>
        <p>${T("Your picks stay open. The rest fold down so you can skip them.", "Lo que elegiste queda abierto. Lo demás se pliega para que puedas saltarlo.")}</p>
        <div class="sf-opts">${FH.STYLES.map((x) => `<label><input type="checkbox" value="${x.id}"><span>${x.label}<small>${x.chapter}</small></span></label>`).join("")}</div>
        <button class="btn sm line sf-all" type="button">${T("Show every part", "Mostrar todas las partes")}</button>
      </div>`;
    document.body.appendChild(filter);
    const toggle = $(".sf-toggle", filter), panel = $(".sf-panel", filter);
    const renderFilter = () => {
      const picks = FH.styles;
      $("span", toggle).textContent = picks ? T(`Your styles · ${picks.length} of 8`, `Tus estilos · ${picks.length} de 8`) : T("All learning styles", "Todos los estilos");
      $$("input", filter).forEach((i) => { i.checked = !picks || picks.includes(i.value); });
    };
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
    });
    document.addEventListener("click", (e) => { if (!filter.contains(e.target) && !panel.hidden) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); } });
    $$("input", filter).forEach((i) => i.addEventListener("change", () => {
      const list = $$("input", filter).filter((x) => x.checked).map((x) => x.value);
      FH.setStyles(list);
      opened.clear();
      applyStyle();
    }));
    $(".sf-all", filter).addEventListener("click", () => { FH.setStyles(FH.STYLES.map((x) => x.id)); opened.clear(); applyStyle(); });

    const seenIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting && FH.markSection(id, e.target.id)) FH.addXP(5); }),
      { threshold: 0.3 }
    );
    chapters.forEach((c) => seenIO.observe(c));

    // ---------- Hear it: recorded narration ----------
    const audio = $("#narration");
    if (audio) {
      const playBtn = $("#play-btn"), player = $("#player"), transcript = $("#transcript");
      for (let i = 0; i < 32; i++) {
        const bar = document.createElement("i");
        bar.style.animationDelay = `${(i * 137) % 900}ms`;
        bar.style.height = `${20 + ((i * 53) % 60)}%`;
        $("#wave").appendChild(bar);
      }
      let lines = [], current = -1, playing = false;
      const setPlaying = (on) => { playing = on; playBtn.classList.toggle("playing", on); player.classList.toggle("on", on); };
      const playLine = (i) => {
        if (i >= lines.length) { setPlaying(false); current = -1; $$("p", transcript).forEach((p) => p.classList.remove("now")); FH.badge(`listened-${slug}`, T("Good Listener", "Buen oyente")); return; }
        current = i;
        $$("p", transcript).forEach((p, j) => p.classList.toggle("now", j === i));
        audio.src = `audio/line-${String(i + 1).padStart(2, "0")}.mp3`;
        audio.playbackRate = +$(".speed .on").dataset.rate;
        audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      };
      audio.addEventListener("ended", () => playLine(current + 1));
      playBtn.addEventListener("click", () => {
        if (playing) { audio.pause(); setPlaying(false); }
        else if (current >= 0 && audio.src) { audio.play(); setPlaying(true); }
        else playLine(0);
      });
      $$(".speed button").forEach((b) => b.addEventListener("click", () => {
        $$(".speed button").forEach((x) => x.classList.toggle("on", x === b));
        audio.playbackRate = +b.dataset.rate;
      }));
      fetch("narration.json").then((r) => r.json()).then((spec) => {
        lines = spec.lines;
        lines.forEach((t, i) => {
          const p = document.createElement("p");
          p.textContent = t;
          p.tabIndex = 0;
          p.setAttribute("role", "button");
          p.setAttribute("aria-label", T(`Play from line ${i + 1}: ${t}`, `Reproducir desde la línea ${i + 1}: ${t}`));
          p.addEventListener("click", () => playLine(i));
          p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playLine(i); } });
          transcript.appendChild(p);
        });
      }).catch(() => { transcript.innerHTML = T("<p>The narration couldn't load. Try refreshing the page.</p>", "<p>No se pudo cargar la narración. Intenta recargar la página.</p>"); });
    }

    // ---------- Key terms: tap or hover to see what they mean ----------
    $$(".term[data-def]").forEach((t) => { t.tabIndex = 0; t.setAttribute("aria-label", `${t.textContent}: ${t.dataset.def}`); });

    // ---------- Notes: fill in the blanks ----------
    // "$20", "20 dollars", "twenty" and "veinte" all count as 20. Accents don't matter.
    const plain = (v) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanBlank = (v) => plain(v.trim().toLowerCase()).replace(/[$,%!]/g, "").replace(/\.$/, "").replace(/\s+(dollars?|percent|bucks|dolares|por ciento)$/, "").replace(/\s+/g, " ").trim();
    const NUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
      cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
      veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
      treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500 };
    const wordsToNumber = (t) => {
      const words = t.replace(/-/g, " ").split(" ").filter((w) => w && w !== "and" && w !== "y");
      if (!words.length) return t;
      let total = 0, cur = 0;
      for (const w of words) {
        if (w in NUM) cur += NUM[w];
        else if (w === "hundred") cur = (cur || 1) * 100;
        else if (w === "thousand" || w === "mil") { total += (cur || 1) * 1000; cur = 0; }
        else return t;
      }
      return String(total + cur);
    };
    const blanksBtn = $("#blanks-check");
    if (blanksBtn) blanksBtn.addEventListener("click", () => {
      const blanks = $$("#blanks .blank");
      let right = 0;
      blanks.forEach((b) => {
        const answers = plain(b.dataset.answer.toLowerCase()).split("|");
        const typed = cleanBlank(b.value);
        const ok = answers.includes(typed) || answers.includes(wordsToNumber(typed));
        b.classList.toggle("right", ok);
        b.classList.toggle("wrong", !ok);
        if (ok) right++;
        // Show the correct answer next to any blank that was missed.
        let ans = b.nextElementSibling && b.nextElementSibling.classList.contains("blank-ans") ? b.nextElementSibling : null;
        if (!ok) {
          if (!ans) { ans = document.createElement("span"); ans.className = "blank-ans"; b.after(ans); }
          ans.textContent = T(`(answer: ${b.dataset.answer.split("|")[0]})`, `(respuesta: ${b.dataset.answer.split("|")[0]})`);
        } else if (ans) ans.remove();
      });
      $("#blanks-result").textContent = T(`${right} of ${blanks.length} right`, `${right} de ${blanks.length} correctas`);
      if (right === blanks.length) FH.badge(`blanks-${slug}`, T("Note Taker", "Buenos apuntes"));
    });

    // ---------- On your own: reflections stay on this device ----------
    $$("[data-reflect]").forEach((t) => {
      const key = `fh-reflect-${id}-${t.dataset.reflect}`;
      try { t.value = localStorage.getItem(key) || ""; } catch (e) { /* storage blocked */ }
      t.addEventListener("input", () => {
        try { localStorage.setItem(key, t.value); $("#reflect-saved").textContent = T("Saved on this device.", "Guardado en este dispositivo."); } catch (e) { /* storage blocked */ }
      });
    });

    // ---------- Check: quiz ----------
    const quizEl = $("#quiz");
    if (quizEl && quiz.length) {
      const pass = passMark || Math.ceil(quiz.length * 0.8);
      let correct = 0, answered = 0;
      quiz.forEach((item, qi) => {
        const div = document.createElement("div");
        div.className = "question reveal in";
        div.innerHTML = `<div class="stem"><small>${T(`Question ${qi + 1} of ${quiz.length}`, `Pregunta ${qi + 1} de ${quiz.length}`)}</small>${item.q}</div><div class="opts"></div><div class="why"></div>`;
        // Shuffle the options so the right answer isn't always in the same spot.
        const order = shuffle(item.opts.map((_, i) => i));
        const answerPos = order.indexOf(item.a);
        order.forEach((oi, pos) => {
          const b = document.createElement("button");
          b.className = "opt";
          b.innerHTML = `<span class="letter">${"ABCD"[pos]}</span><span>${item.opts[oi]}</span>`;
          b.addEventListener("click", () => {
            if (div.classList.contains("answered")) return;
            div.classList.add("answered");
            const ok = pos === answerPos;
            b.classList.add(ok ? "right" : "wrong");
            $$(".opt", div)[answerPos].classList.add("right");
            $(".why", div).innerHTML = (ok ? T("Right. ", "Correcto. ") : T("Not quite. ", "No exactamente. ")) + item.why;
            answered++;
            if (ok) { correct++; FH.addXP(10, T("Correct", "Correcto")); }
            if (answered === quiz.length) {
              const l = FH.lesson(id);
              l.quizBest = Math.max(l.quizBest, correct);
              if (correct === quiz.length) FH.badge(`quiz-${slug}-perfect`, T("Perfect Quiz", "Examen perfecto"));
              if (!l.completedAt) { l.completedAt = new Date().toISOString(); FH.addXP(25, T("Lesson complete", "Lección completa")); }
              FH.save();
              const done = document.createElement("div");
              done.className = "quiz-score";
              done.textContent = T(`${correct} of ${quiz.length}. ${correct >= pass ? "You're ready for the next lesson." : "Look back at Break it down, then reload to try again."}`,
                `${correct} de ${quiz.length}. ${correct >= pass ? "Ya puedes pasar a la siguiente lección." : "Repasa Paso a paso y recarga la página para intentarlo de nuevo."}`);
              quizEl.appendChild(done);
            }
          });
          $(".opts", div).appendChild(b);
        });
        quizEl.appendChild(div);
      });
    }

    applyStyle();
    renderProgress();
  }

  // Chart touches shared by the money charts: a glowing dot for the tip of a line, and a tag that rides
  // next to it with a label and a running value. Colors come from --c (set per line).
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (parent) parent.appendChild(el);
    return el;
  };
  const fx = {
    head(parent, color, r = 6) {
      const g = mk("g", { class: "fx-head", style: `--c: ${color}` }, parent);
      mk("circle", { r: r * 2.4, class: "fx-halo" }, g);
      mk("circle", { r, class: "fx-dot" }, g);
      return g;
    },
    tip(parent, color) {
      const g = mk("g", { class: "fx-tip", style: `--c: ${color}` }, parent);
      mk("rect", { rx: 8 }, g);
      mk("text", { x: 12, class: "fx-tip-k" }, g);
      mk("text", { x: 12, class: "fx-tip-v" }, g);
      return g;
    },
    // Put a tag beside (x, y): to the left and above by default, flipped to stay inside the chart.
    place(tip, x, y, label, value, box, below) {
      const [k, v] = tip.querySelectorAll("text"), svg = tip.ownerSVGElement;
      // Same on-screen size in every chart: scale by how much this SVG is shrunk or stretched.
      const vb = svg.viewBox.baseVal, big = vb && vb.width && svg.clientWidth ? vb.width / svg.clientWidth : box.big || 1;
      k.textContent = label; v.textContent = value;
      k.setAttribute("y", 19 * big); v.setAttribute("y", 39 * big);
      k.style.fontSize = 12 * big + "px"; v.style.fontSize = 17 * big + "px";
      const w = Math.max(k.getComputedTextLength(), v.getComputedTextLength()) + 24 * big, h = 48 * big;
      const r = tip.querySelector("rect");
      r.setAttribute("width", w); r.setAttribute("height", h);
      let tx = x - w - 16 * big, ty = below ? y + 14 * big : y - h - 14 * big;
      if (tx < box.x0) tx = x + 16 * big;
      if (ty < 0) ty = y + 14 * big;
      if (ty + h > box.y0) ty = y - h - 14 * big;
      tip.setAttribute("transform", `translate(${tx} ${ty})`);
    },
    // A gradient that fades a fill from the line's color down to nothing.
    fade(svg, id, color, strength = .38) {
      let defs = svg.querySelector("defs") || mk("defs", {}, null);
      if (!defs.parentNode) svg.prepend(defs);
      const old = defs.querySelector("#" + id);
      if (old) old.remove();
      const gr = mk("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      mk("stop", { offset: 0, "stop-color": color, "stop-opacity": strength }, gr);
      mk("stop", { offset: 1, "stop-color": color, "stop-opacity": 0 }, gr);
      return `url(#${id})`;
    },
    ease: (p) => (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    // Draw lines in left to right with a glowing tip on each. Optional: a tag riding one line
    // ({ line, label, value: (x) => text, box }) and a fading fill under one line ({ line, baseY }).
    run(svg, { lines, tag, area, dur = 2400, animate = true, heads: withHeads = true }) {
      const run = (svg._fxRun || 0) + 1;
      svg._fxRun = run;
      let layer = svg.querySelector(":scope > .fx-layer");
      if (layer) layer.innerHTML = ""; else layer = mk("g", { class: "fx-layer" }, svg);
      const L = lines.filter((l) => l.el && l.el.getAttribute("d") !== "" && l.el.getTotalLength).map((l) => ({ ...l, len: l.el.getTotalLength() }));
      if (!L.length) return;
      let fill = null, clip = null;
      if (area && L[area.line]) {
        const a = L[area.line], p0 = a.el.getPointAtLength(0), p1 = a.el.getPointAtLength(a.len);
        const cid = (svg.id || "fx") + "-clip";
        let defs = svg.querySelector("defs");
        if (!defs) { defs = mk("defs", {}, null); svg.prepend(defs); }
        const oldClip = defs.querySelector("#" + cid);
        if (oldClip) oldClip.remove();
        const cp = mk("clipPath", { id: cid }, defs);
        clip = mk("rect", { x: 0, y: -2000, width: 0, height: 6000 }, cp);
        const d = a.el.getAttribute("d") || "M" + a.el.getAttribute("points");
        fill = mk("path", { d: `${d} L${p1.x} ${area.baseY} L${p0.x} ${area.baseY} Z`, fill: fx.fade(svg, (svg.id || "fx") + "-fade", a.color, area.strength || .34), "clip-path": `url(#${cid})` }, null);
        a.el.parentNode.insertBefore(fill, a.el);
        if (svg._fxFill && svg._fxFill !== fill) svg._fxFill.remove();
        svg._fxFill = fill;
      }
      const heads = L.map((l) => (withHeads ? fx.head(layer, l.color, l.r || 6) : null));
      const t1 = tag && L[tag.line] ? fx.tip(layer, L[tag.line].color) : null;
      const frame = (t) => {
        L.forEach((l, i) => {
          const pt = l.el.getPointAtLength(l.len * t);
          if (!l.dashed) {
            l.el.style.transition = "none";
            l.el.style.strokeDasharray = `${l.len} ${l.len}`;
            l.el.style.strokeDashoffset = l.len * (1 - t);
          }
          if (heads[i]) heads[i].setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          l.pt = pt;
        });
        if (clip) clip.setAttribute("width", L[area.line].pt.x);
        if (t1) { const pt = L[tag.line].pt; fx.place(t1, pt.x, pt.y, tag.label, tag.value(pt.x), tag.box, tag.below); }
      };
      // Once drawn, drop the dash trick so later edits to the line (new data, dragging) show in full.
      const done = () => L.forEach((l) => { if (!l.dashed) { l.el.style.strokeDasharray = ""; l.el.style.strokeDashoffset = ""; } });
      if (!animate || fx.still()) { frame(1); done(); return; }
      const t0 = performance.now();
      const step = (now) => {
        if (svg._fxRun !== run) return;
        const p = Math.min(1, (now - t0) / dur);
        frame(fx.ease(p));
        if (p < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    },
    still: () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  };

  window.FHLesson = { init, shuffle, fillRange, $, $$, fx, wait: (ms) => new Promise((r) => setTimeout(r, ms)) };
})();
