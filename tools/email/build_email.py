"""Builds the one FinancedHub welcome email in its two flavors from one design:
  tools/email/confirm-signup.html               -> pasted into Supabase (email sign-ups, has a Confirm button)
  supabase/functions/welcome-email/email.ts     -> sent by the edge function (Google sign-ups, Keep learning button)
Run: python3 tools/email/build_email.py  (then re-paste the template / redeploy the function)."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
F = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
SERIF = "Georgia,'Times New Roman',serif"

COPY = {
    "en": dict(
        h1="Welcome to FinancedHub, {name}!",
        p_confirm="Thanks for signing up. Tap the button to confirm your email, and your account is ready.",
        p_google="Thanks for signing up with Google. Your account is all set.",
        btn_confirm="Confirm my email &rarr;", btn_google="Keep learning &rarr;",
        tag="Learn money from zero to Wall Street.",
        h2="Your path, saved",
        p2="Your lessons, XP, streak and path now follow you to any device. Learn on your laptop in class and pick up on your phone on the bus.",
        cols=[("Lessons you can touch", "Drag, build and play your way through banking, taxes, credit and investing."),
              ("Streaks and achievements", "Earn XP every lesson and keep your daily streak alive."),
              ("English and Spanish", "Switch languages any time from the bottom of any page.")],
        wish="We hope your path goes great, from your first bank account all the way to Wall Street.",
        note="<b>Don&rsquo;t worry, this is the only email we&rsquo;ll send you.</b> No newsletters, no marketing, ever. (The one exception: a reset link, if you ever ask us to reset your password.)",
        foot_confirm="Didn&rsquo;t sign up for FinancedHub? You can ignore this email and nothing will happen.",
        foot_google="Didn&rsquo;t sign up for FinancedHub? Reply to this email and let us know.",
        home="https://financedhub.com/home/",
    ),
    "es": dict(
        h1="¡Bienvenido a FinancedHub, {name}!",
        p_confirm="Gracias por registrarte. Toca el botón para confirmar tu correo y tu cuenta queda lista.",
        p_google="Gracias por registrarte con Google. Tu cuenta ya está lista.",
        btn_confirm="Confirmar mi correo &rarr;", btn_google="Seguir aprendiendo &rarr;",
        tag="Aprende de dinero desde cero hasta Wall Street.",
        h2="Tu camino, guardado",
        p2="Tus lecciones, tu XP, tu racha y tu camino ahora te siguen a cualquier dispositivo. Aprende en la laptop en clase y sigue en el celular en el camión.",
        cols=[("Lecciones que puedes tocar", "Arrastra, arma y juega mientras aprendes de bancos, impuestos, crédito e inversiones."),
              ("Rachas y logros", "Gana XP en cada lección y mantén viva tu racha diaria."),
              ("Inglés y español", "Cambia de idioma cuando quieras desde el final de cualquier página.")],
        wish="Esperamos que tu camino vaya increíble, desde tu primera cuenta de banco hasta Wall Street.",
        note="<b>No te preocupes, este es el único correo que te vamos a mandar.</b> Sin boletines y sin publicidad, nunca. (La única excepción: un enlace para cambiar tu contraseña, si algún día lo pides.)",
        foot_confirm="¿No te registraste en FinancedHub? Puedes ignorar este correo y no pasará nada.",
        foot_google="¿No te registraste en FinancedHub? Escríbenos respondiendo a este correo.",
        home="https://financedhub.com/es/home/",
    ),
}

HEAD = f"""<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light">
<style>
@media (max-width:560px){{
  .pad{{padding-left:22px!important;padding-right:22px!important}}
  .col{{display:block!important;width:100%!important;padding:0 0 18px 0!important}}
  .h1{{font-size:28px!important}}
}}
</style></head>
<body style="margin:0;padding:0;background:#ffffff;">"""

def body(lang, kind, name, link):
    c = COPY[lang]
    p, btn, foot = c["p_" + kind], c["btn_" + kind], c["foot_" + kind]
    href = link if kind == "confirm" else c["home"]
    cols = "".join(
        f"""<td class="col" width="33%" valign="top" style="width:33%;padding:0 {14 if i < 2 else 0}px 0 0;">
  <p style="margin:0 0 6px 0;font-family:{F};font-size:15px;font-weight:700;color:#1d1c19;">{t}</p>
  <p style="margin:0;font-family:{F};font-size:14px;line-height:1.55;color:#5a564d;">{d}</p></td>"""
        for i, (t, d) in enumerate(c["cols"]))
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1f6f5c;"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;"><tr><td class="pad" style="padding:30px 40px 40px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td valign="middle" style="padding-right:10px;"><a href="https://financedhub.com"><img src="https://financedhub.com/apple-touch-icon.png" width="34" height="34" alt="" style="display:block;border:0;border-radius:9px;"></a></td>
    <td valign="middle" style="font-family:{SERIF};font-style:italic;font-weight:700;font-size:22px;color:#ffffff;">Financed<span style="color:#cfe5da;">Hub</span></td>
  </tr></table>
  <h1 class="h1" style="margin:34px 0 12px 0;font-family:{SERIF};font-size:34px;line-height:1.18;font-weight:700;color:#ffffff;">{c["h1"].format(name=name)}</h1>
  <p style="margin:0 0 28px 0;font-family:{F};font-size:17px;line-height:1.6;color:#e3f0e9;">{p}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:999px;background:#ffffff;">
    <a href="{href}" style="display:inline-block;padding:15px 30px;font-family:{F};font-size:16px;font-weight:700;color:#1f6f5c;text-decoration:none;border-radius:999px;">{btn}</a>
  </td></tr></table>
</td></tr></table>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;">
<tr><td class="pad" style="padding:36px 40px 8px 40px;">
  <p style="margin:0 0 8px 0;font-family:{SERIF};font-style:italic;font-size:21px;color:#1f6f5c;">{c["h2"]}</p>
  <p style="margin:0 0 28px 0;font-family:{F};font-size:16px;line-height:1.6;color:#4a4740;">{c["p2"]}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e7e3da;"><tr><td style="padding-top:22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cols}</tr></table>
  </td></tr></table>
  <p style="margin:12px 0 0 0;font-family:{F};font-size:16px;line-height:1.6;color:#4a4740;">{c["wish"]}</p>
</td></tr>
<tr><td class="pad" style="padding:26px 40px 10px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px 18px;border-radius:14px;background:#e6efe8;font-family:{F};font-size:15px;line-height:1.55;color:#1f4a3e;">{c["note"]}</td></tr></table>
</td></tr>
<tr><td class="pad" style="padding:18px 40px 36px 40px;">
  <p style="margin:0;font-family:{F};font-size:13px;line-height:1.5;color:#8a857b;">{foot}<br><a href="https://financedhub.com" style="color:#8a857b;">financedhub.com</a></p>
</td></tr>
</table>
</td></tr></table>"""

# Supabase template (Go templates): both languages, picked by the lang saved at sign-up.
tpl = ("<!-- Supabase: Authentication > Emails > Templates > \"Confirm sign up\". Paste everything below into the Body. -->\n"
       "<!-- Subject: Welcome to FinancedHub: confirm your email -->\n"
       "<!-- Generated by tools/email/build_email.py; edit that, not this. -->\n"
       + HEAD + '\n{{ if eq .Data.lang "es" }}' + body("es", "confirm", "{{ .Data.username }}", "{{ .ConfirmationURL }}")
       + "\n{{ else }}" + body("en", "confirm", "{{ .Data.username }}", "{{ .ConfirmationURL }}") + "\n{{ end }}\n</body></html>\n")
(ROOT / "tools/email/confirm-signup.html").write_text(tpl)

# Edge function module: same design, Google flavor. NAME is swapped for the escaped username.
ts = ("// Generated by tools/email/build_email.py; edit that, not this.\n"
      "const T: Record<string, string> = " + json.dumps({l: HEAD + body(l, "google", "%%NAME%%", "") + "\n</body></html>" for l in COPY}, ensure_ascii=False) + ";\n"
      "const SUBJECT: Record<string, string> = { en: \"Welcome to FinancedHub\", es: \"Bienvenido a FinancedHub\" };\n"
      "export function email(lang: string, name: string) {\n  const l = lang === \"es\" ? \"es\" : \"en\";\n"
      "  return { subject: SUBJECT[l], html: T[l].replace(\"%%NAME%%\", name) };\n}\n")
(ROOT / "supabase/functions/welcome-email/email.ts").write_text(ts)
print("ok")
