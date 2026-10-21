import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { PageHeader } from "@/components/PageHeader";
import { joinPageText } from "@/lib/join-page";
import { AuditionSongList } from "@/components/AuditionSongList";
import { getRecruitment, listAuditionSongs, listPublishedFaqs } from "@/lib/content";
import { site, smsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "입단 안내",
  description: "세종리틀싱어즈 단원 모집 안내: 모집 대상, 반 구성(울림반·화음반·선율반), 오디션 자유곡과 온라인 입단 신청 방법.",
  alternates: { canonical: "/join" },
};

// 문구 안의 이메일 주소를 메일 보내기 링크로
function withEmailLinks(text: string) {
  return text.split(/([\w.+-]+@[\w-]+\.[\w.-]+)/g).map((part, i) =>
    i % 2 ? (
      <a key={i} href={`mailto:${part}`} className="font-medium text-navy underline">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default async function JoinPage() {
  const [recruitment, faqs, songs] = await Promise.all([getRecruitment(), listPublishedFaqs(), listAuditionSongs()]);
  // 소개 문구·지원 절차·오디션 곡 안내: 관리자 → 입단 안내에서 수정 (비어 있으면 기본 문구)
  const text = joinPageText(recruitment);

  const overview = [
    { label: "모집 대상", value: recruitment?.target },
    { label: "연습 일정", value: recruitment?.schedule },
    { label: "연습 장소", value: recruitment?.place },
    { label: "회비", value: recruitment?.fee },
  ].filter((item) => item.value);

  return (
    <>
      <PageHeader eyebrow="Audition" title="입단 안내" description={text.page_intro} />

      <div className="mx-auto max-w-4xl space-y-9 px-4 py-8">
        {recruitment?.is_open && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm bg-navy px-6 py-5 text-white">
            <div>
              <p className="text-sm font-medium text-gold">단원 모집 중</p>
              {recruitment.period && <p className="mt-1 text-lg">{recruitment.period}</p>}
            </div>
            <Link href="/apply" className="btn bg-gold text-ink hover:bg-gold/90">
              온라인 신청하기
            </Link>
          </div>
        )}

        <section>
          <h2 className="mb-5 text-xl font-semibold text-navy">모집 요강</h2>
          {overview.length ? (
            <dl className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
              {overview.map((item) => (
                <div key={item.label} className="bg-white p-6">
                  <dt className="text-sm text-ink-soft">{item.label}</dt>
                  <dd className="mt-2 whitespace-pre-wrap">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="rounded-sm border border-line bg-white p-6 text-ink-soft">
              모집 요강을 준비하고 있습니다. 입단 문의: 단장{" "}
              <a href={smsHref} className="underline">{site.contact.phone}</a> (문자 메시지)
            </p>
          )}
        </section>

        {recruitment?.classes && (
          <section>
            <h2 className="mb-5 text-xl font-semibold text-navy">반 구성</h2>
            <div className="card whitespace-pre-wrap leading-relaxed">{recruitment.classes}</div>
          </section>
        )}

        <section>
          <h2 className="mb-5 text-xl font-semibold text-navy">지원 절차</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {text.steps.map((step, i) => (
              <li key={i} className="card relative">
                <span className="eyebrow text-gold-deep">Step {i + 1}</span>
                <p className="mt-2 font-bold">{step.title}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{withEmailLinks(step.body)}</p>
              </li>
            ))}
          </ol>
        </section>

        {songs.length > 0 && (
          <section id="audition-songs" className="scroll-mt-24">
            <h2 className="mb-2 text-xl font-semibold text-navy">{text.songs_title}</h2>
            <p className="mb-4 whitespace-pre-line text-sm text-ink-soft">{withEmailLinks(text.songs_intro)}</p>
            <div className="rounded-sm border border-line bg-white px-4 md:px-6">
              <AuditionSongList songs={songs} />
            </div>
          </section>
        )}

        {recruitment?.audition && (
          <section>
            <h2 className="mb-5 text-xl font-semibold text-navy">오디션 · 심사</h2>
            <div className="card whitespace-pre-wrap leading-relaxed">{recruitment.audition}</div>
          </section>
        )}

        {recruitment?.notes && (
          <section>
            <h2 className="mb-5 text-xl font-semibold text-navy">기타 안내</h2>
            <div className="card whitespace-pre-wrap leading-relaxed">{recruitment.notes}</div>
          </section>
        )}

        {faqs.length > 0 && (
          <section>
            <h2 className="mb-5 text-xl font-semibold text-navy">자주 묻는 질문</h2>
            <FaqList faqs={faqs} />
          </section>
        )}

        <section className="rounded-sm border border-line bg-white p-6 text-center">
          <p className="text-lg font-bold text-navy">입단 신청은 온라인으로 받습니다</p>
          <p className="mt-2 text-sm text-ink-soft">회원가입 없이 보호자가 바로 신청할 수 있습니다.</p>
          <p className="mt-1 text-sm text-ink-soft">
            입단 문의: 단장{" "}
            <a href={smsHref} className="underline">{site.contact.phone}</a> (문자 메시지)
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/apply" className="btn-primary px-6">입단 신청하기</Link>
            <Link href="/signup?type=staff" className="btn-outline px-6">운영진 회원가입</Link>
          </div>
        </section>
      </div>
    </>
  );
}
