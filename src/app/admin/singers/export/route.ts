import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { applyFilter, groupSingers, parseFilter, rosterRow, todayKst, VIEWS } from "@/lib/singers";
import { guardianMap, listSingers } from "@/lib/singers-data";
import { rosterWorkbook } from "@/lib/singers-xlsx";

// 단원 명부 엑셀 다운로드 (명부 화면과 같은 조건·보기)
export async function GET(request: NextRequest) {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return new Response("관리자만 내려받을 수 있습니다.", { status: 403 });

  const filter = parseFilter(Object.fromEntries(request.nextUrl.searchParams));
  const { singers, error } = await listSingers();
  if (error) return new Response("단원 정보를 불러오지 못했습니다.", { status: 500 });

  const filtered = applyFilter(singers, filter);
  const guardians = await guardianMap(filtered.map((s) => s.guardian_id));
  const now = new Date();
  const groups = groupSingers(filtered, filter.view, now).map((g) => ({
    label: g.label,
    rows: g.singers.map((s, i) => ({
      No: i + 1,
      ...rosterRow(s, s.guardian_id ? guardians.get(s.guardian_id) : null, now),
    })),
  }));
  const columns = Object.keys(groups[0]?.rows[0] ?? { No: 0, ...rosterRow(emptySinger, null, now) });
  const body = await rosterWorkbook(groups, columns, filter.view === "all" ? undefined : VIEWS[filter.view]);

  const { year, month, day } = todayKst(now);
  const date = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const name = `세종리틀싱어즈_단원명부_${VIEWS[filter.view]}${filter.className ? `_${filter.className}` : ""}_${date}.xlsx`;

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="singers_${date}.xlsx"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
    },
  });
}

// 단원이 한 명도 없을 때 머리글만 있는 파일을 만들기 위한 빈 값
const emptySinger = {
  id: 0,
  name: "",
  birthdate: "2000-01-01",
  gender: null,
  school: null,
  grade_override: null,
  class_name: null,
  part: null,
  cohort: null,
  joined_on: null,
  left_on: null,
  status: "active",
  guardian_id: null,
  guardian_name: null,
  guardian_phone: null,
  photo_path: null,
  name_public: false,
  application_id: null,
  notes: null,
} as const;
