// Account page: sign in, sign up, password reset, username and account deletion.
// Shared by the English and Spanish pages; text comes from FH.t.
(function () {
  const $ = (s) => document.querySelector(s);
  const T = FH.t;
  const show = (id) => ["#acct-loading", "#acct-out", "#acct-sent", "#acct-finish", "#acct-in"].forEach((x) => $(x).classList.toggle("hidden", x !== id));
  // Password rules: 8+ characters and at least one special character.
  const RULES = { len: (p) => p.length >= 8, special: (p) => /[^A-Za-z0-9]/.test(p) };
  const pwOk = (p) => Object.values(RULES).every((r) => r(p));
  document.querySelectorAll("[data-rules]").forEach((inp) => inp.addEventListener("input", () => {
    inp.closest("form").querySelectorAll(".pw-rules li").forEach((li) => li.classList.toggle("ok", RULES[li.dataset.rule](inp.value)));
  }));
  const USERNAME = /^[A-Za-z0-9_.]{3,20}$/;
  let pendingEmail = "";
  const forms = ["#form-in", "#form-up", "#form-reset", "#form-newpw"];
  const showForm = (id) => {
    forms.forEach((f) => $(f).classList.toggle("hidden", f !== id));
    $("#tab-in").setAttribute("aria-selected", id === "#form-in");
    $("#tab-up").setAttribute("aria-selected", id === "#form-up");
    $(".auth-tabs").classList.toggle("hidden", id === "#form-reset" || id === "#form-newpw");
    $("#oauth").classList.toggle("off", id === "#form-reset" || id === "#form-newpw");
    $("#acct-title").textContent = id === "#form-up" ? T("Create your account", "Crea tu cuenta") : id === "#form-in" ? T("Sign in", "Iniciar sesión") : T("Reset your password", "Restablece tu contraseña");
    msg("");
  };
  const msg = (text, bad) => { const m = $("#acct-msg"); m.textContent = text; m.classList.toggle("bad", !!bad); };
  const friendly = (e) => {
    const t = (e && e.message) || String(e);
    if (/invalid login/i.test(t)) return T("That email and password don't match.", "Ese correo y esa contraseña no coinciden.");
    if (/already registered/i.test(t)) return T("There's already an account with that email. Try signing in.", "Ya hay una cuenta con ese correo. Intenta iniciar sesión.");
    if (/rate limit/i.test(t)) return T("Too many tries. Wait a few minutes and try again.", "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.");
    if (/not confirmed/i.test(t)) return T("Check your email and click the confirmation link first.", "Primero revisa tu correo y haz clic en el enlace de confirmación.");
    return t;
  };

  if (!window.FHAuth) { show("#acct-out"); msg(T("Accounts couldn't load. Check your connection and refresh.", "No se pudieron cargar las cuentas. Revisa tu conexión y recarga la página."), true); return; }

  $("#tab-in").addEventListener("click", () => showForm("#form-in"));
  $("#tab-up").addEventListener("click", () => showForm("#form-up"));
  $("#forgot").addEventListener("click", () => showForm("#form-reset"));
  $("#reset-back").addEventListener("click", () => showForm("#form-in"));

  $("#form-in").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    msg(T("Signing in…", "Iniciando sesión…"));
    try { sessionStorage.setItem("fh-just-signed-in", "1"); } catch (err) { /* storage blocked */ }
    const { error } = await FHAuth.signIn(f.email.value.trim(), f.password.value);
    if (error) { try { sessionStorage.removeItem("fh-just-signed-in"); } catch (err) { /* storage blocked */ } msg(friendly(error), true); } else msg(T("Signed in. Taking you to your course…", "Listo. Te llevamos a tu curso…"));
  });

  $("#form-up").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const username = f.username.value.trim();
    if (!USERNAME.test(username)) return msg(T("Usernames are 3 to 20 letters, numbers, dots or underscores.", "El nombre de usuario debe tener de 3 a 20 letras, números, puntos o guiones bajos."), true);
    if (!f.email.value.includes("@")) return msg(T("Enter a valid email address.", "Escribe un correo válido."), true);
    if (!pwOk(f.password.value)) return msg(T("Your password needs at least 8 characters and one special character.", "Tu contraseña necesita al menos 8 caracteres y un carácter especial."), true);
    if (!f.terms.checked) return msg(T("Please agree to the terms and privacy policy to continue (you need to be 13 or older).", "Para continuar, acepta los términos y la política de privacidad (necesitas tener 13 años o más)."), true);
    msg(T("Creating your account…", "Creando tu cuenta…"));
    const { data, error } = await FHAuth.signUp(f.email.value.trim(), f.password.value, {
      username, age_confirmed: true, terms_accepted_at: new Date().toISOString(),
    });
    if (error) return msg(friendly(error), true);
    msg("");
    if (!data.session) {
      pendingEmail = f.email.value.trim();
      $("#sent-email").textContent = pendingEmail;
      $("#sent-msg").textContent = "";
      show("#acct-sent");
      $(".auth-card").scrollIntoView({ block: "start", behavior: "smooth" });
    }
  });

  // Google: the button only appears once Google is switched on in Supabase.
  FHAuth.providers().then((p) => $("#oauth").classList.toggle("hidden", !p.google));
  $("#google").addEventListener("click", async () => {
    msg(T("Opening Google…", "Abriendo Google…"));
    const { error } = await FHAuth.signInWithGoogle();
    if (error) msg(friendly(error), true);
  });
  // Coming back from Google with an error (for example, the learner pressed Cancel).
  const back = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
  if (back.get("error")) {
    history.replaceState(null, "", location.pathname);
    setTimeout(() => msg(back.get("error") === "access_denied" ? T("Google sign-in was cancelled.", "Se canceló el inicio de sesión con Google.") : T("Google sign-in didn't work. Try again, or use your email.", "No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu correo."), true));
  }

  // Finish a Google sign-up: username plus the same age and terms boxes as the email form.
  $("#form-finish").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, out = $("#finish-msg");
    const say = (t, bad) => { out.textContent = t; out.classList.toggle("bad", !!bad); };
    const username = f.username.value.trim();
    if (!USERNAME.test(username)) return say(T("Usernames are 3 to 20 letters, numbers, dots or underscores.", "El nombre de usuario debe tener de 3 a 20 letras, números, puntos o guiones bajos."), true);
    if (!f.terms.checked) return say(T("Please agree to the terms and privacy policy to continue (you need to be 13 or older).", "Para continuar, acepta los términos y la política de privacidad (necesitas tener 13 años o más)."), true);
    say(T("Saving…", "Guardando…"));
    try { await FHAuth.finishSignup(username); say(T("All set. Taking you to your course…", "Listo. Te llevamos a tu curso…")); }
    catch (err) { say(friendly(err), true); }
  });
  $("#finish-out").addEventListener("click", () => FHAuth.signOut());

  $("#sent-signin").addEventListener("click", () => {
    show("#acct-out");
    showForm("#form-in");
    $("#form-in").email.value = pendingEmail;
    $("#form-in").password.focus();
  });
  $("#sent-back").addEventListener("click", () => { show("#acct-out"); showForm("#form-up"); });
  $("#sent-resend").addEventListener("click", async () => {
    const { error } = await FHAuth.resendConfirmation(pendingEmail);
    $("#sent-msg").textContent = error ? friendly(error) : T("Sent again. It can take a minute to arrive.", "Enviado otra vez. Puede tardar un minuto en llegar.");
  });

  // Settings: username and language.
  $("#form-name").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, name = f.username.value.trim();
    if (!USERNAME.test(name)) return FH.toast(T("Usernames are 3 to 20 letters, numbers, dots or underscores.", "El nombre de usuario debe tener de 3 a 20 letras, números, puntos o guiones bajos."));
    if (name !== ((FHAuth.user.user_metadata || {}).username || "")) {
      const { data, error } = await FHAuth.setUsername(name);
      if (error) return FH.toast(friendly(error));
      render(data.user);
    }
    if (f.lang.value !== FH.lang) return FH.setLang(f.lang.value);
    FH.toast(T("Saved.", "Guardado."));
  });

  // Settings: theme and motion.
  document.querySelectorAll('input[name="theme"]').forEach((r) => r.addEventListener("change", () => {
    const dark = r.value === "dark";
    if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("fh-theme", dark ? "dark" : "light"); } catch (err) { /* storage blocked */ }
  }));
  $("#set-motion").addEventListener("change", (e) => FH.setMotion(e.target.checked));

  // Settings: change password.
  $("#form-pw").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, out = $("#pw-msg");
    const say = (t, bad) => { out.textContent = t; out.classList.toggle("bad", !!bad); };
    if (!pwOk(f.password.value)) return say(T("Use at least 8 characters and one special character.", "Usa al menos 8 caracteres y un carácter especial."), true);
    if (f.password.value !== f.again.value) return say(T("The two passwords don't match.", "Las dos contraseñas no coinciden."), true);
    const { error } = await FHAuth.setPassword(f.password.value);
    if (error) return say(friendly(error), true);
    f.reset();
    f.querySelectorAll(".pw-rules li").forEach((li) => li.classList.remove("ok"));
    say(T("Password changed.", "Contraseña cambiada."));
  });

  $("#form-reset").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await FHAuth.resetPassword(e.target.email.value.trim());
    msg(error ? friendly(error) : T("If that email has an account, a reset link is on its way.", "Si ese correo tiene una cuenta, ya va en camino un enlace para restablecerla."), !!error);
  });

  document.addEventListener("fh:recovery", () => { show("#acct-out"); showForm("#form-newpw"); });
  $("#form-newpw").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = e.target.password.value;
    if (!pwOk(pw)) return msg(T("Use at least 8 characters and one special character.", "Usa al menos 8 caracteres y un carácter especial."), true);
    const { error } = await FHAuth.setPassword(pw);
    if (error) return msg(friendly(error), true);
    msg(T("Password updated.", "Contraseña actualizada."));
    setTimeout(() => render(FHAuth.user), 800);
  });

  $("#sign-out").addEventListener("click", () => FHAuth.signOut());
  // account/#profile shows the profile (#achievements too, scrolled down to them); plain account/ shows Settings.
  let jumped = false;
  const pickView = () => { $("#acct-in").classList.toggle("is-profile", location.hash === "#profile" || location.hash === "#achievements"); jumped = false; };
  const jump = () => { if (location.hash === "#achievements" && !jumped && !$("#acct-in").classList.contains("hidden")) { jumped = true; $("#achievements").scrollIntoView({ behavior: FH.still() ? "auto" : "smooth" }); } };
  addEventListener("hashchange", () => { pickView(); jump(); });
  pickView();
  $("#delete-confirm").addEventListener("input", (e) => ($("#delete-account").disabled = e.target.value.trim().toUpperCase() !== T("DELETE", "BORRAR")));
  $("#delete-account").addEventListener("click", async () => {
    $("#delete-account").disabled = true;
    try {
      await FHAuth.deleteAccount();
      $("#delete-msg").textContent = T("Your account has been deleted.", "Tu cuenta fue eliminada.");
    } catch (err) {
      $("#delete-msg").textContent = T("Something went wrong: ", "Algo salió mal: ") + friendly(err);
      $("#delete-account").disabled = false;
    }
  });

  const render = (user) => {
    const finishing = FHAuth.needsFinish(user);
    $(".auth-shell").classList.toggle("signed-in", !!user && !finishing);
    if (finishing) {
      show("#acct-finish");
      $("#finish-email").textContent = user.email;
      const f = $("#form-finish"), meta = user.user_metadata || {};
      // Suggest a username from the Google name, e.g. "Ana María López" becomes "AnaMariaLopez".
      if (!f.username.value) f.username.value = meta.username || (meta.full_name || meta.name || "").normalize("NFD").replace(/[^A-Za-z0-9_.]/g, "").slice(0, 20);
      return;
    }
    if (!user) { if (!$("#acct-sent").classList.contains("hidden")) return; show("#acct-out"); if ($("#form-newpw").classList.contains("hidden")) showForm(location.hash === "#create" ? "#form-up" : "#form-in"); return; }
    show("#acct-in");
    $("#acct-email").textContent = user.email;
    $("#acct-email-2").textContent = user.email;
    const name = (user.user_metadata || {}).username || "";
    // Profile view (account/#profile): photo banner with avatar and name, four stat cards, your path, then badges by tab.
    const nm = name || user.email.split("@")[0];
    FHAuth.paintAvatar($("#prof-avatar"), nm);
    $("#pic-remove").hidden = !FH.state.avatar;
    $("#prof-name").textContent = nm;
    paintBanner();
    $("#prof-since").textContent = user.created_at ? T("Learning since ", "Aprendiendo desde ") + new Date(user.created_at).toLocaleDateString(FH.lang === "es" ? "es-MX" : "en-US", { month: "long", year: "numeric" }) : "";
    const f = $("#form-name");
    if (document.activeElement !== f.username) f.username.value = name;
    f.lang.value = FH.lang;
    const s = FH.state;
    $("#acct-xp").textContent = s.xp;
    $("#acct-badges").textContent = s.badges.filter(FH.badgeInfo).length;
    $("#acct-lessons").textContent = Object.values(s.lessons).filter((l) => l.completedAt).length;
    $("#streak-days").textContent = FH.streak();
    $("#streak-best").textContent = Math.max(s.streak.best || 0, FH.streak());
    $(".streak-big").classList.toggle("lit", FH.streak() > 0);
    const pathLessons = FH.path.items.filter((x) => x.lesson).map((x) => x.lesson), pathDone = pathLessons.filter((l) => FH.done(l.id)).length;
    $("#prof-path-line").innerHTML = FH.path.setUp ? T(`<b>${pathDone} of ${pathLessons.length}</b> lessons done`, `<b>${pathDone} de ${pathLessons.length}</b> lecciones hechas`)
      : T("No path yet. Answer a few quick questions and we'll pick only the lessons you need.", "Aún no tienes camino. Responde unas preguntas rápidas y elegimos solo las lecciones que necesitas.");
    $("#prof-path-bar").style.width = `${pathLessons.length ? (pathDone / pathLessons.length) * 100 : 0}%`;
    paintBadges();
    requestAnimationFrame(jump);
    const dark = document.documentElement.dataset.theme === "dark";
    document.querySelectorAll('input[name="theme"]').forEach((r) => { r.checked = (r.value === "dark") === dark; });
    $("#set-motion").checked = FH.still();
  };
  // Badges, one group at a time: course badges and game badges (gray until earned, with how to get them), then lesson badges you've earned.
  let tab = "course";
  const paintBadges = () => {
    const s = FH.state, has = (b) => s.badges.includes(b.id);
    const tile = (b) => `<li class="${has(b) ? "got" : ""}">${FH.medal(b, has(b))}<b>${b.name}</b><small>${b.how}</small></li>`;
    const seen = new Set(), games = FH.GAME_BADGES.filter((b) => !seen.has(b.id) && seen.add(b.id));
    const lessons = s.badges.map(FH.badgeInfo).filter((b) => b && b.kind === "lesson");
    const groups = {
      course: [T("Course", "Curso"), FH.ACHIEVEMENTS, `${FH.ACHIEVEMENTS.filter(has).length}/${FH.ACHIEVEMENTS.length}`, T("Earn them by finishing lessons, building your path and showing up.", "Gánalas terminando lecciones, armando tu camino y entrando seguido.")],
      game: [T("Games", "Juegos"), games, `${games.filter(has).length}/${games.length}`, T("Won inside a lesson's game or activity.", "Se ganan en el juego o la actividad de una lección.")],
      lesson: [T("Lessons", "Lecciones"), lessons, lessons.length, T("Every lesson has three: listen to all of it, fill in every blank, and get every quiz question right.", "Cada lección tiene tres: escúchala completa, llena todos los espacios y acierta todo el examen.")],
    };
    $("#badge-tabs").innerHTML = Object.entries(groups).map(([k, [label, , n]]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${k === tab}">${label} <small>${n}</small></button>`).join("");
    const [, list, , note] = groups[tab];
    $("#badge-wall").innerHTML = `<p class="set-p">${note}</p>` + (list.length ? `<ul class="badge-wall">${list.map(tile).join("")}</ul>` : "");
  };
  $("#badge-tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; paintBadges(); } });
  // Profile banner: the skyline by default, or one of these photos. Saved with your progress.
  const BANNERS = ["1486406146926-c627a92ad1ab", "1534469650761-fce6cc26ac0d", "1556742031-c6961e8560b0", "1460925895917-afdab827c52f",
    "1611974789855-9c2a0a7236a3", "1633158829556-6ea20ad39b4f", "1745270917233-65e776a47547", "1457369804613-52c61a468e7d",
    "1501504905252-473c47e087f8", "1529078155058-5d716f45d604", "1560221328-12fe60f83ab8", "1501324682324-0d8d7c4b9706",
    "1526628953301-3e589a6a8b74", "1517048676732-d65bc937f952", "1579532537598-459ecdaf39cc"];
  const bannerUrl = (id, w, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
  const paintBanner = () => {
    const cur = BANNERS.includes(FH.state.banner) ? FH.state.banner : BANNERS[0];
    $("#prof-banner").src = bannerUrl(cur, 1600, 580);
    $("#banner-list").innerHTML = BANNERS.map((id, i) => `<li><button type="button" data-banner="${id}" aria-pressed="${id === cur}" aria-label="${T("Banner", "Portada")} ${i + 1}"><img src="${bannerUrl(id, 320, 120)}" alt="" loading="lazy" onerror="this.closest('li').remove()"></button></li>`).join("");
  };
  const toggleBanners = (open) => { $("#banner-pick").hidden = !open; $("#banner-btn").setAttribute("aria-expanded", String(open)); };
  $("#banner-btn").addEventListener("click", () => toggleBanners($("#banner-pick").hidden));
  $("#banner-done").addEventListener("click", () => toggleBanners(false));
  // Clicking anywhere outside the picker (or pressing Escape) closes it too.
  document.addEventListener("click", (e) => { if (!$("#banner-pick").hidden && !e.composedPath().some((n) => n.id === "banner-pick" || n.id === "banner-btn")) toggleBanners(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { toggleBanners(false); picMenu(false); } });
  $("#banner-list").addEventListener("click", (e) => { const b = e.target.closest("[data-banner]"); if (b) FH.setBanner(b.dataset.banner === BANNERS[0] ? null : b.dataset.banner); });
  // Profile picture: pick a photo, crop it to a centered square and shrink it so it's small enough to save with your progress.
  const pickPic = () => $("#pic-file").click();
  // Tapping your picture opens a small menu: upload a new photo, or remove the one you have.
  const picMenu = (open) => { $("#pic-menu").hidden = !open; $("#prof-avatar").setAttribute("aria-expanded", String(open)); };
  $("#prof-avatar").addEventListener("click", (e) => { e.stopPropagation(); picMenu($("#pic-menu").hidden); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#pic-menu")) picMenu(false); });
  $("#pic-change").addEventListener("click", () => { picMenu(false); pickPic(); });
  $("#pic-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => {
      const size = 192, c = document.createElement("canvas"), side = Math.min(img.width, img.height);
      c.width = c.height = size;
      c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      FH.setAvatar(c.toDataURL("image/jpeg", .82));
      FH.toast(FH.t("Profile picture updated.", "Foto de perfil actualizada."));
    };
    img.onerror = () => FH.toast(FH.t("That file couldn't be opened. Try a JPG or PNG.", "No se pudo abrir ese archivo. Prueba con JPG o PNG."));
    img.src = URL.createObjectURL(file);
  });
  $("#pic-remove").addEventListener("click", () => { picMenu(false); FH.setAvatar(null); });
  $("#streak-share").addEventListener("click", () => window.FHShareStreak && window.FHShareStreak());
  FHAuth.onChange(render);
  document.addEventListener("fh:save", () => FHAuth.user && render(FHAuth.user));
})();
