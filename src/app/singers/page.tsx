import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getPublicSingers } from "@/lib/content";
import { site } from "@/lib/site";
import { organization } from "@/lib/staff";

export const metadata: Metadata = {
  title: "단원 소개",
  description: "세종리틀싱어즈의 울림반·화음반·선율반 단원들을 소개합니다.",
  alternates: { canonical: "/singers" },
};

// 공개 화면에는 교사진만 표시 (학부모 임원 이름은 싣지 않음)
const TEACHER_ROLES = ["부지휘자", "반주자", "보컬트레이너", "이론선생님"];

export default async function SingersPage() {
  const data = await getPublicSingers();
  const counts = data?.counts ?? [];
  const total = counts.reduce((sum, c) => sum + c.singers, 0);

  return (
    <>
      <PageHeader
        eyebrow="Our Singers"
        title="단원 소개"
        description="노래를 사랑하는 세종의 아이들이 울림반·화음반·선율반에서 함께 화음을 만들어 갑니다."
      />

      <section className="section-y">
        <div className="container-page">
          {total > 0 && (
            <div className="mb-8 flex flex-wrap items-end gap-x-7 gap-y-4 border-b border-line pb-7">
              <div>
                <p className="eyebrow text-gold-deep">Singers</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-6xl font-semibold text-navy md:text-7xl">
                  {total}
                  <span className="ml-1 font-sans text-xl font-medium text-ink-soft">명</span>
                </p>
              </div>
              <p className="max-w-md pb-2 leading-relaxed text-ink-soft">
                현재 활동 중인 단원 수입니다. 미취학 어린이부터 초·중학생까지, 연령과 수준에 맞춘 3개 반에서 노래합니다.
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {organization.classes.map((c) => {
              const inClass = counts.find((r) => r.class_name === c.name)?.singers ?? 0;
              const names = (data?.names ?? []).filter((n) => n.class_name === c.name);
              const teachers = c.members.filter((m) => TEACHER_ROLES.includes(m.role));
              return (
                <article key={c.name} className="flex flex-col border border-line bg-white">
                  <div className="h-1" style={{ background: c.color }} />
                  <div className="flex flex-1 flex-col p-6 md:p-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-2xl font-semibold text-navy">{c.name}</h2>
                      {inClass > 0 && (
                        <p className="text-sm text-ink-soft">
                          <strong className="text-2xl font-semibold text-ink">{inClass}</strong>명
                        </p>
                      )}
                    </div>
                    <dl className="mt-6 space-y-1.5 border-t border-line pt-5 text-sm">
                      {teachers.map((t) => (
                        <div key={`${t.role}-${t.name}`} className="flex gap-3">
                          <dt className="w-24 shrink-0 text-ink-soft">{t.role}</dt>
                          <dd className="font-medium">{t.name}</dd>
                        </div>
                      ))}
                    </dl>

                    {names.length > 0 && (
                      <div className="mt-6 border-t border-line pt-5">
                        <p className="eyebrow text-gold-deep">Members · {names.length}</p>
                        <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1.5 text-sm sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
                          {names.map((n, i) => (
                            <li key={`${n.name}-${i}`}>{n.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {total === 0 && !data?.names.length && (
            <p className="mt-7 text-center text-sm text-ink-soft">단원 현황은 준비 중입니다.</p>
          )}

          <div className="mt-8 flex flex-col items-start justify-between gap-6 border-t border-line pt-7 md:flex-row md:items-center">
            <p className="max-w-2xl text-xs leading-relaxed text-ink-soft">
              이 화면에는 활동 중인 단원의 이름과 반만 게시하며, 사진·생년월일·학교 등 다른 정보는 공개하지 않습니다. 이름 게시를
              원하지 않으시면 마이페이지 또는 합창단({site.contact.phone})으로 알려 주세요. 바로 게시를 중단합니다.
            </p>
            <Link href="/join" className="btn-primary shrink-0">
              입단 안내 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
