import { deleteSiteLogo } from "@/app/actions/site-logo";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SiteLogo } from "@/components/SiteLogo";
import { requireAdmin } from "@/lib/auth";
import { getSiteLogo } from "@/lib/content";
import { formatDate } from "@/lib/format";
import {
  BUILTIN_LOGOS,
  LOGO_BUCKET,
  LOGO_DIR,
  isUploadedLogoPath,
  siteLogoValue,
  type SiteLogo as SiteLogoValue,
} from "@/lib/site-logo";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { LogoChoiceForm, type LogoOption } from "./LogoChoiceForm";
import { LogoUploader } from "./LogoUploader";

// 머리글(밝은 바탕)·바닥글(어두운 바탕) 미리보기
function Preview({ logo }: { logo: SiteLogoValue }) {
  return (
    <span className="grid grid-cols-2 overflow-hidden rounded-sm border border-line text-xs">
      <span className="flex items-center gap-2 bg-ivory p-3">
        <SiteLogo logo={logo} variant="header" />
        <span className="font-bold text-navy">{site.name}</span>
      </span>
      <span className="flex items-center justify-center bg-navy-dark p-3">
        <SiteLogo logo={logo} variant="footer" />
      </span>
    </span>
  );
}

// 최상위 관리자: 머리글·바닥글 로고 고르기 · 새 로고 올리기
export default async function SiteLogoPage() {
  await requireAdmin("members");
  const supabase = await createClient();
  const [current, listed] = await Promise.all([
    getSiteLogo(),
    supabase.storage.from(LOGO_BUCKET).list(LOGO_DIR, { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
  ]);
  const uploads = (listed.data ?? [])
    .map((f) => ({ path: `${LOGO_DIR}/${f.name}`, created: f.created_at }))
    .filter((f) => isUploadedLogoPath(f.path));
  const currentValue = siteLogoValue(current);

  const options: LogoOption[] = [
    ...BUILTIN_LOGOS.map((b) => ({ value: b.id, label: b.label, note: b.note, preview: <Preview logo={{ kind: b.id }} /> })),
    ...uploads.map((u, i) => ({
      value: u.path,
      label: `올린 로고 ${uploads.length - i}`,
      note: u.created ? `${formatDate(u.created)} 올림` : undefined,
      preview: <Preview logo={{ kind: "upload", path: u.path }} />,
    })),
  ];

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-navy">로고</h1>
      <p className="mb-6 text-sm text-ink-soft">
        모든 화면의 머리글(맨 위)과 바닥글(맨 아래)에 나오는 로고입니다. 고른 뒤 저장하면 바로 바뀝니다. 앱 아이콘·공유
        미리보기 이미지는 바뀌지 않습니다.
      </p>
      {listed.error && (
        <p className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-800">
          올린 로고 목록을 읽지 못했습니다. 0027_site_logo.sql 을 실행했는지 확인해 주세요.
        </p>
      )}

      <section className="card mb-6">
        <LogoChoiceForm options={options} current={currentValue} />
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-lg font-semibold text-navy">새 로고 올리기</h2>
        <LogoUploader />
      </section>

      {uploads.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-navy">올린 로고 지우기</h2>
          <ul className="divide-y divide-line text-sm">
            {uploads.map((u, i) => (
              <li key={u.path} className="flex items-center justify-between gap-3 py-2">
                <span className="flex items-center gap-3">
                  <SiteLogo logo={{ kind: "upload", path: u.path }} variant="header" />
                  올린 로고 {uploads.length - i}
                </span>
                {u.path === currentValue ? (
                  <span className="text-xs text-ink-soft">사용 중이라 지울 수 없음</span>
                ) : (
                  <form action={deleteSiteLogo}>
                    <input type="hidden" name="path" value={u.path} />
                    <ConfirmButton message="이 로고 파일을 지울까요?" className="text-xs text-red-700 underline">
                      지우기
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
