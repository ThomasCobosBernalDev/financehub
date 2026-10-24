// Shared page behavior: theme toggle, scroll reveals, reading progress, section rail.
(function () {
  const root = document.documentElement;

  // Theme: light unless the reader picked dark.
  document.querySelectorAll(".theme-toggle").forEach((btn) =>
    btn.addEventListener("click", () => {
      const dark = root.dataset.theme !== "dark";
      if (dark) root.dataset.theme = "dark";
      else delete root.dataset.theme;
      try { localStorage.setItem("fh-theme", dark ? "dark" : "light"); } catch (e) { /* storage blocked */ }
    })
  );

  // Fade elements up as they scroll into view.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  // Thin reading-progress line under the header.
  const bar = document.querySelector(".read-progress");
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  // Section rail: highlight the chapter currently on screen.
  const rail = document.querySelector(".rail");
  if (rail) {
    const links = [...rail.querySelectorAll("a")];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("current", a.getAttribute("href") === `#${e.target.id}`));
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); if (t) io.observe(t); });
  }
})();
