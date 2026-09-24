import { listConcerts } from "@/lib/content";
import { concertDateParts } from "@/lib/format";
import { history, type HistoryItem } from "@/lib/history";

// 공연 이력 = 합창단이 제공한 이력(history.ts) + 관리자 '공연 일정'에 등록한 지난 공연(자동 추가)
// 같은 날짜에 같은 제목(띄어쓰기 무시)이 이미 있으면 중복으로 보고 넣지 않습니다.
const norm = (s: string) => s.replace(/\s/g, "");

export function mergeHistory(
  base: { year: number; items: HistoryItem[] }[],
  concerts: { title: string; starts_at: string; venue: string | null }[],
) {
  const years = new Map(base.map((y) => [y.year, [...y.items]]));
  for (const c of concerts) {
    const { year, month, day } = concertDateParts(c.starts_at);
    const y = Number(year);
    const date = `${Number(month)}.${Number(day)}`;
    const items = years.get(y) ?? [];
    if (items.some((i) => i.date === date && norm(i.title) === norm(c.title))) continue;
    items.push({ date, title: c.title, place: c.venue ?? undefined });
    years.set(y, items);
  }
  const toNum = (d: string) => (d ? Number(d.split(".")[0]) * 100 + Number(d.split(".")[1]) : 0);
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items: [...items].sort((a, b) => toNum(a.date) - toNum(b.date)) }));
}

export async function getHistory() {
  return mergeHistory(history, await listConcerts("past"));
}
