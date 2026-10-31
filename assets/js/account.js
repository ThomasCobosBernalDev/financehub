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
    if (!f.age.checked) return msg(T("You need to be 13 or older to create an account.", "Necesitas tener 13 años o más para crear una cuenta."), true);
    if (!f.terms.checked) return msg(T("Please agree to the terms and privacy policy to continue.", "Para continuar, acepta los términos y la política de privacidad."), true);
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
    if (!f.age.checked) return say(T("You need to be 13 or older to create an account.", "Necesitas tener 13 años o más para crear una cuenta."), true);
    if (!f.terms.checked) return say(T("Please agree to the terms and privacy policy to continue.", "Para continuar, acepta los términos y la política de privacidad."), true);
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
  const pickView = () => $("#acct-in").classList.toggle("is-profile", location.hash === "#profile");
  addEventListener("hashchange", pickView);
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
    // Profile view (account/#profile): avatar, name and progress. Everything else is Settings.
    const nm = name || user.email.split("@")[0];
    $("#prof-avatar").textContent = nm[0].toUpperCase();
    $("#prof-name").textContent = nm;
    $("#prof-email").textContent = user.email;
    const f = $("#form-name");
    if (document.activeElement !== f.username) f.username.value = name;
    f.lang.value = FH.lang;
    const s = FH.state;
    $("#acct-xp").textContent = s.xp;
    $("#acct-badges").textContent = s.badges.length;
    $("#acct-lessons").textContent = Object.values(s.lessons).filter((l) => l.completedAt).length;
    const dark = document.documentElement.dataset.theme === "dark";
    document.querySelectorAll('input[name="theme"]').forEach((r) => { r.checked = (r.value === "dark") === dark; });
    $("#set-motion").checked = FH.still();
  };
  FHAuth.onChange(render);
  document.addEventListener("fh:save", () => FHAuth.user && render(FHAuth.user));
})();
