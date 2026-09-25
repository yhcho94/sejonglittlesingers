// 보호자 연결 후보: 단원 명부의 보호자 연락처 ↔ 가입 회원 연락처가 같은 짝
// 휴대폰 번호는 가입 때 인증하지 않으므로, 후보는 관리자가 확인한 뒤에만 연결합니다.

// 숫자만 남기고 국가번호(+82)는 0 으로. 9자리 미만이면 비교하지 않음
export function normalizePhone(value: string | null | undefined) {
  let digits = (value ?? "").replace(/\D/g, "");
  if (digits.startsWith("82") && digits.length >= 11) digits = `0${digits.slice(2)}`;
  if (digits.length < 9 || /^0+$/.test(digits)) return null;
  return digits;
}

const normalizeName = (value: string | null | undefined) => (value ?? "").replace(/\s/g, "");

type SingerLike = {
  id: number;
  name: string;
  class_name: string | null;
  status: string;
  guardian_id: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
};
type ProfileLike = { id: string; guardian_name: string; phone: string; email: string; created_at: string };

export type GuardianCandidate<S extends SingerLike, P extends ProfileLike> = {
  singer: S;
  profile: P;
  nameMatches: boolean; // 명부 보호자 이름과 회원 이름도 같음
  ambiguous: boolean; // 같은 번호로 가입한 회원이 여럿
};

export function findGuardianCandidates<S extends SingerLike, P extends ProfileLike>(singers: S[], profiles: P[]) {
  const byPhone = new Map<string, P[]>();
  for (const p of profiles) {
    const phone = normalizePhone(p.phone);
    if (!phone) continue;
    byPhone.set(phone, [...(byPhone.get(phone) ?? []), p]);
  }
  const unlinked = singers.filter((s) => !s.guardian_id);
  const candidates: GuardianCandidate<S, P>[] = [];
  const noPhone: S[] = [];
  const noMatch: S[] = [];
  for (const s of unlinked) {
    const phone = normalizePhone(s.guardian_phone);
    if (!phone) {
      noPhone.push(s);
      continue;
    }
    const matches = byPhone.get(phone) ?? [];
    if (!matches.length) noMatch.push(s);
    for (const p of matches) {
      candidates.push({
        singer: s,
        profile: p,
        nameMatches: !!s.guardian_name && normalizeName(s.guardian_name) === normalizeName(p.guardian_name),
        ambiguous: matches.length > 1,
      });
    }
  }
  return { candidates, unlinked, noPhone, noMatch };
}
