import { timingSafeEqual } from "node:crypto";
import { runRetention } from "@/lib/storage-cleanup";
import { createSecretClient } from "@/lib/supabase/secret";

// Vercel 예약 작업(vercel.json crons)이 매일 호출합니다.
// Vercel 은 CRON_SECRET 환경변수를 "Authorization: Bearer <값>" 으로 보내므로, 값이 맞을 때만 실행합니다.
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const supabase = createSecretClient();
  if (!supabase) return Response.json({ ok: false, error: "SUPABASE_SECRET_KEY 가 설정되지 않았습니다." }, { status: 500 });
  const result = await runRetention(supabase);
  // 기록에는 건수만 남깁니다 (개인정보 없음)
  console.log("retention", JSON.stringify(result));
  return Response.json({ ok: true, ...result });
}
