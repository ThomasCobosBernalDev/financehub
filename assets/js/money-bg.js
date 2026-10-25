// Background scene: 48 pieces that rebuild themselves as you scroll the page,
// from stacks of coins to a bar chart, a rising line, a pie and finally a dollar sign.
(function () {
  const N = 48, W = 600;
  const svgNS = "http://www.w3.org/2000/svg";
  const box = document.createElement("div");
  box.className = "money-bg";
  box.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${W}`);
  box.appendChild(svg);
  document.body.prepend(box);

  const pieces = Array.from({ length: N }, () => {
    const e = document.createElementNS(svgNS, "ellipse");
    svg.appendChild(e);
    return e;
  });

  // Each shape is a list of N pieces: position, radii, and c (0 = green, 1 = gold).
  const coins = () => {
    const stacks = [8, 11, 13, 16], out = [];
    stacks.forEach((h, s) => { for (let k = 0; k < h; k++) out.push({ x: 135 + s * 110, y: 500 - k * 15, rx: 44, ry: 12, c: 1 }); });
    return out;
  };
  const bars = () => {
    const hs = [4, 6, 5, 9, 11, 13], out = [];
    hs.forEach((h, b) => { for (let k = 0; k < h; k++) out.push({ x: 100 + b * 80, y: 505 - k * 31, rx: 13, ry: 13, c: b > 3 ? 1 : 0 }); });
    return out;
  };
  const line = () => Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    return { x: 60 + t * 480, y: 470 - t * 330 - Math.sin(t * Math.PI * 3) * 38, rx: 7 + t * 5, ry: 7 + t * 5, c: t > 0.75 ? 1 : 0 };
  });
  const pie = () => Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const ring = i % 2 ? 175 : 140;
    return { x: 300 + Math.cos(a) * ring, y: 300 + Math.sin(a) * ring, rx: 12, ry: 12, c: i < N * 0.62 ? 0 : 1 };
  });
  const dollar = () => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", "M392 196 C 372 150, 236 136, 222 206 C 206 286, 384 276, 384 372 C 384 450, 244 466, 206 404");
    svg.appendChild(p);
    const len = p.getTotalLength(), out = [];
    for (let i = 0; i < 36; i++) { const pt = p.getPointAtLength((i / 35) * len); out.push({ x: pt.x, y: pt.y, rx: 11, ry: 11, c: 1 }); }
    p.remove();
    for (let i = 0; i < 12; i++) out.push({ x: 300, y: 96 + i * (408 / 11), rx: 8, ry: 8, c: 0 });
    return out;
  };
  const SHAPES = [coins(), bars(), line(), pie(), dollar()];

  const GOLD = [214, 164, 58];
  let green = [31, 111, 92];
  const readGreen = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const m = v.match(/^#([0-9a-f]{6})$/i);
    if (m) green = [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16));
  };
  readGreen();
  new MutationObserver(readGreen).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cur = pieces.map((_, i) => Object.assign({}, SHAPES[0][i]));

  const frame = (now) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(scrollY / max) : 0;
    const k = p * (SHAPES.length - 1);
    const from = Math.min(Math.floor(k), SHAPES.length - 2), frac = k - from;
    pieces.forEach((e, i) => {
      // Pieces leave one after another, so the change ripples through the shape.
      const t = ease(clamp((frac - 0.42 - 0.2 * (i / N)) / 0.22));
      const a = SHAPES[from][i], b = SHAPES[from + 1][i];
      const goal = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, rx: a.rx + (b.rx - a.rx) * t, ry: a.ry + (b.ry - a.ry) * t, c: a.c + (b.c - a.c) * t };
      const c = cur[i];
      for (const key in goal) c[key] += (goal[key] - c[key]) * (calm ? 1 : 0.14);
      const bob = calm ? 0 : Math.sin(now / 900 + i * 0.7) * 3;
      e.setAttribute("cx", c.x.toFixed(1));
      e.setAttribute("cy", (c.y + bob).toFixed(1));
      e.setAttribute("rx", c.rx.toFixed(1));
      e.setAttribute("ry", c.ry.toFixed(1));
      e.setAttribute("fill", `rgb(${green.map((g, j) => Math.round(g + (GOLD[j] - g) * c.c)).join(",")})`);
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
