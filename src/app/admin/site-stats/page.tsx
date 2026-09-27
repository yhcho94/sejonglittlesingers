import { requireAdmin } from "@/lib/auth";
import { getActiveSingerCount, getSiteStats, getStaffCount } from "@/lib/content";
import { SITE_STAT_FIELDS, statValue, type SiteStatKey } from "@/lib/site-stats";
import { SiteStatsForm } from "./SiteStatsForm";

// 최상위 관리자: 첫 화면·합창단 소개의 수치 입력
export default async function SiteStatsPage() {
  await requireAdmin("members");
  const [stats, singerCount, staffCount] = await Promise.all([getSiteStats(), getActiveSingerCount(), getStaffCount()]);
  const auto: Partial<Record<SiteStatKey, number | null>> = { singers: singerCount, staff: staffCount };
  // 비워 두면 표시될 값 (자동값 또는 기본값)
  const fallback = Object.fromEntries(SITE_STAT_FIELDS.map((f) => [f.key, statValue(f.key, {}, auto[f.key])])) as Record<
    SiteStatKey,
    string
  >;
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-navy">소개 수치</h1>
      <p className="mb-6 text-sm text-ink-soft">
        첫 화면과 합창단 소개에 나오는 수치입니다. 입력한 값이 그대로 표시되고, 비워 두면 자동값(활동 단원은 단원 명부,
        강사진·운영진은 조직도 인원)이나 기본값으로 표시됩니다. 숫자만 입력하면 첫 화면에서 숫자가 올라가는 효과가 나옵니다.
      </p>
      <div className="card max-w-2xl">
        <SiteStatsForm stats={stats} fallback={fallback} />
      </div>
    </>
  );
}
