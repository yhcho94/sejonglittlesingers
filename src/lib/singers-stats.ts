// 단원 통계 계산 (순수 함수)
import { CLASS_NAMES, gradeCode, gradeLabel, singerAge, todayKst, type Singer } from "./singers";

export type Count = { key: string; label: string; value: number };

function countBy(items: Singer[], keyOf: (s: Singer) => { key: string; label: string; order: number }): Count[] {
  const map = new Map<string, Count & { order: number }>();
  for (const s of items) {
    const k = keyOf(s);
    const c = map.get(k.key) ?? { ...k, value: 0 };
    c.value += 1;
    map.set(k.key, c);
  }
  return [...map.values()].sort((a, b) => a.order - b.order).map(({ key, label, value }) => ({ key, label, value }));
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function monthsBetween(from: string, now: Date) {
  const { year, month, day } = todayKst(now);
  const [y, m, d] = from.split("-").map(Number);
  return (year - y) * 12 + (month - m) - (day < d ? 1 : 0);
}

export function singerStats(all: Singer[], now = new Date()) {
  const { year } = todayKst(now);
  const active = all.filter((s) => s.status === "active");
  const tenures = active.filter((s) => s.joined_on).map((s) => Math.max(0, monthsBetween(s.joined_on!, now)));

  const summary = {
    active: active.length,
    paused: all.filter((s) => s.status === "paused").length,
    left: all.filter((s) => s.status === "left").length,
    joinedThisYear: all.filter((s) => s.joined_on?.startsWith(String(year))).length,
    leftThisYear: all.filter((s) => s.left_on?.startsWith(String(year))).length,
    avgTenureMonths: tenures.length ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length) : null,
    photoRate: pct(active.filter((s) => s.photo_path).length, active.length),
    guardianLinkedRate: pct(active.filter((s) => s.guardian_id).length, active.length),
    namePublicRate: pct(active.filter((s) => s.name_public).length, active.length),
  };

  const byClass = countBy(active, (s) =>
    s.class_name
      ? { key: s.class_name, label: s.class_name, order: CLASS_NAMES.indexOf(s.class_name) }
      : { key: "none", label: "반 미지정", order: 99 },
  );
  const byGrade = countBy(active, (s) => {
    const g = gradeCode(s.birthdate, s.grade_override, now);
    return { key: `g${g}`, label: gradeLabel(g), order: g };
  });
  const byAge = countBy(active, (s) => {
    const a = singerAge(s, now);
    return a === null ? { key: "a-none", label: "생일 미입력", order: 999 } : { key: `a${a}`, label: `만 ${a}세`, order: a };
  });
  const byBirthYear = countBy(active, (s) => {
    const y = Number(s.birthdate.slice(0, 4));
    return { key: `y${y}`, label: `${y}년생`, order: y };
  });
  const byJoinSource = countBy(active, (s) => ({ key: s.join_source ?? "", label: s.join_source ?? "미입력", order: 0 }))
    .sort((a, b) => (a.key === "" ? 1 : b.key === "" ? -1 : b.value - a.value));
  const byGender = countBy(active, (s) =>
    s.gender ? { key: s.gender, label: s.gender === "여" ? "여" : "남", order: s.gender === "여" ? 0 : 1 } : { key: "none", label: "미입력", order: 9 },
  );
  const bySchool = countBy(active, (s) => ({ key: s.school ?? "", label: s.school ?? "미입력", order: 0 }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "ko"));

  // 반 × 학년 교차표
  const gradeKeys = byGrade.map((g) => g.key);
  const classKeys = byClass.map((c) => c.key);
  const cross = classKeys.map((ck) => ({
    key: ck,
    label: byClass.find((c) => c.key === ck)!.label,
    cells: gradeKeys.map(
      (gk) =>
        active.filter(
          (s) => (s.class_name ?? "none") === ck && `g${gradeCode(s.birthdate, s.grade_override, now)}` === gk,
        ).length,
    ),
  }));

  // 연도별 입단·퇴단·연말 재적 (입단일이 있는 단원 기준)
  const dated = all.filter((s) => s.joined_on);
  const firstYear = dated.reduce((min, s) => Math.min(min, Number(s.joined_on!.slice(0, 4))), year);
  const yearly = [];
  for (let y = firstYear; y <= year; y++) {
    const end = y === year ? null : `${y}-12-31`;
    yearly.push({
      year: y,
      joined: dated.filter((s) => s.joined_on!.startsWith(String(y))).length,
      left: all.filter((s) => s.left_on?.startsWith(String(y))).length,
      // 올해는 '현재 활동·휴단' 인원, 지난해는 12월 31일 기준 재적 인원
      roster:
        end === null
          ? all.filter((s) => s.status !== "left").length
          : dated.filter((s) => s.joined_on! <= end && (!s.left_on || s.left_on > end)).length,
    });
  }

  const cohorts = countBy(all, (s) =>
    s.cohort ? { key: `c${s.cohort}`, label: `${s.cohort}기`, order: s.cohort } : { key: "none", label: "미입력", order: 999 },
  ).map((c) => ({
    ...c,
    active: all.filter((s) => (s.cohort ? `c${s.cohort}` : "none") === c.key && s.status === "active").length,
  }));

  return {
    summary,
    byClass,
    byGrade,
    byAge,
    byBirthYear,
    byJoinSource,
    byGender,
    bySchool,
    cross: { grades: byGrade.map((g) => g.label), rows: cross },
    yearly,
    undatedCount: all.length - dated.length,
    cohorts,
  };
}
