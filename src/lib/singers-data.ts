import { createClient } from "@/lib/supabase/server";
import { SINGER_COLUMNS, type Singer } from "@/lib/singers";

// 관리자 화면 전용 조회 (RLS 가 관리자만 허용)

export type GuardianProfile = { id: string; guardian_name: string; phone: string; email: string; created_at: string };

// error 가 있으면 대개 0005_singers.sql 을 아직 실행하지 않은 경우입니다.
export async function listSingers(): Promise<{ singers: Singer[]; error: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("singers").select(SINGER_COLUMNS).returns<Singer[]>();
  return { singers: data ?? [], error: Boolean(error) };
}

// 한 보호자(회원)에게 연결된 단원들 (형제·자매 확인용)
export async function singersOfGuardian(guardianId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("singers")
    .select("id, name, class_name, status")
    .eq("guardian_id", guardianId)
    .order("name")
    .returns<Pick<Singer, "id" | "name" | "class_name" | "status">[]>();
  return data ?? [];
}

export async function getSinger(id: number): Promise<Singer | null> {
  if (!Number.isSafeInteger(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("singers").select(SINGER_COLUMNS).eq("id", id).maybeSingle<Singer>();
  return data;
}

export async function guardianMap(ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((v): v is string => Boolean(v)))];
  const map = new Map<string, GuardianProfile>();
  if (!unique.length) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, guardian_name, phone, email, created_at")
    .in("id", unique)
    .returns<GuardianProfile[]>();
  for (const g of data ?? []) map.set(g.id, g);
  return map;
}

// 보호자 연결용 회원 목록
export async function listGuardianOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, guardian_name, phone, email, created_at")
    .order("guardian_name")
    .returns<GuardianProfile[]>();
  return data ?? [];
}

// 비공개 사진을 잠시 볼 수 있는 링크 (기본 1시간: 사진 명부 인쇄 시간 고려)
export async function signedPhotoUrls(paths: (string | null)[], expiresIn = 3600) {
  const list = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  const map = new Map<string, string>();
  if (!list.length) return map;
  const supabase = await createClient();
  const { data } = await supabase.storage.from("singer-photos").createSignedUrls(list, expiresIn);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}
