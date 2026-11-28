// Làng Yên · gửi email nhận quà Giáng sinh qua Resend (từ noreply@anyen.space).
// Người chơi gọi sau khi mở quà: POST { award_id } kèm Authorization: Bearer <token đăng nhập>.
// Hàm tự kiểm tra token, chỉ gửi quà đã mở của chính người gọi, tới email đã gắn với món quà.
// Cần secret RESEND_API_KEY. SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY có sẵn.
import { createClient } from "npm:@supabase/supabase-js@2";

const FROM = "Làng Yên <noreply@anyen.space>";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const esc = (t: unknown) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const para = (t: unknown) => esc(t).replace(/\n/g, "<br>");

type Gift = { giver: string; gift_name: string; gift_emoji: string; gift_desc?: string | null; redeem?: string | null; code?: string | null; message?: string | null };

function render(g: Gift) {
  const santa = g.giver === "Ông già Noel";
  const subject = `${g.gift_emoji} Món quà Giáng sinh từ ${g.giver} · Làng Yên`;
  const row = (label: string, body: string) => body ? `<tr><td style="padding:10px 0 2px;color:#8a6d4e;font-size:13px">${label}</td></tr><tr><td style="padding:0 0 6px;color:#3b2a1c;font-size:15px;line-height:1.6">${body}</td></tr>` : "";
  const html = `<!DOCTYPE html><html lang="vi"><body style="margin:0;background:#f6efe4;font-family:Georgia,'Times New Roman',serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6efe4;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffaf2;border:1px solid #e6d6bd;border-radius:18px;padding:28px 26px">
<tr><td align="center" style="font-size:54px;line-height:1">${esc(g.gift_emoji)}</td></tr>
<tr><td align="center" style="padding:12px 0 4px;color:#7a3a2c;font-size:21px">${esc(g.gift_name)}</td></tr>
<tr><td align="center" style="padding:0 0 16px;color:#8a6d4e;font-size:14px">${santa ? "Ông già Noel gửi bạn món quà này từ cây thông điều ước" : "Món quà cảm ơn từ " + esc(g.giver)}</td></tr>
${row("Lời nhắn", g.message ? "“" + para(g.message) + "”" : "")}
${row("Về món quà", para(g.gift_desc))}
${g.code ? `<tr><td style="padding:12px 0 4px;color:#8a6d4e;font-size:13px">Mã quà của bạn</td></tr><tr><td style="padding:8px 14px;background:#f1e4cf;border-radius:10px;color:#3b2a1c;font-size:18px;font-family:Menlo,Consolas,monospace;letter-spacing:1px">${esc(g.code)}</td></tr>` : ""}
${row("Cách nhận quà", para(g.redeem))}
<tr><td style="padding:22px 0 0;color:#6b5844;font-size:14px;line-height:1.7">Chúc bạn một mùa Giáng sinh an yên, ấm áp bên những người thương.<br>Làng Yên</td></tr>
<tr><td style="padding:18px 0 0;color:#a8957d;font-size:12px;line-height:1.6">Email này được gửi tự động vì bạn đã mở quà trong Túi An Yên tại anyen.space. Vui lòng không trả lời email này.</td></tr>
</table></td></tr></table></body></html>`;
  const text = [`${g.gift_emoji} ${g.gift_name}`, santa ? "Quà từ Ông già Noel · Làng Yên" : `Quà cảm ơn từ ${g.giver}`, g.message ? `Lời nhắn: ${g.message}` : "", g.gift_desc ? `Về món quà: ${g.gift_desc}` : "", g.code ? `Mã quà: ${g.code}` : "", g.redeem ? `Cách nhận quà: ${g.redeem}` : "", "", "Chúc bạn một mùa Giáng sinh an yên. Làng Yên"].filter((x) => x !== "").join("\n");
  return { subject, html, text };
}

async function send(to: string, g: Gift) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return { ok: false, error: "missing RESEND_API_KEY" };
  const m = render(g);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject: m.subject, html: m.html, text: m.text }),
  });
  const body = await r.text();
  return r.ok ? { ok: true, id: (() => { try { return JSON.parse(body).id; } catch { return null; } })() } : { ok: false, error: `${r.status} ${body.slice(0, 300)}` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const auth = req.headers.get("Authorization") ?? "";
  let body: { award_id?: string } = {};
  try { body = await req.json(); } catch { /* trống */ }

  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: u, error: ue } = await userClient.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
  if (ue || !u?.user || u.user.is_anonymous || !u.user.email) return json({ error: "Cần đăng nhập bằng email" }, 401);
  if (!body.award_id || !/^[0-9a-f-]{36}$/i.test(body.award_id)) return json({ error: "Thiếu mã quà" }, 400);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: a, error: ae } = await admin.from("anyen_gift_awards")
    .select("id,email,status,giver,gift_name,gift_emoji,gift_desc,redeem,code,message,emailed_at")
    .eq("id", body.award_id).eq("user_id", u.user.id).maybeSingle();
  if (ae) return json({ error: "Không đọc được món quà" }, 500);
  if (!a || a.status !== "opened") return json({ error: "Món quà chưa được mở" }, 404);
  if (a.emailed_at && Date.now() - Date.parse(a.emailed_at) < 10 * 60 * 1000) return json({ ok: true, already: true });

  const r = await send(a.email, a as Gift);
  await admin.from("anyen_gift_awards").update(r.ok ? { emailed_at: new Date().toISOString(), email_error: null } : { email_error: r.error }).eq("id", a.id);
  return r.ok ? json({ ok: true }) : json({ error: "Chưa gửi được email, bạn thử lại sau ít phút nhé" }, 502);
});
