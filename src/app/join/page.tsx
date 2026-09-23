import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { PageHeader } from "@/components/PageHeader";
import { getRecruitment, listPublishedFaqs } from "@/lib/content";
import { site, smsHref } from "@/lib/site";

export const metadata: Metadata = { title: "입단 안내" };

// 이 사이트의 실제 신청·심사 흐름과 같습니다.
const STEPS = [
  { title: "보호자 회원가입", body: "보호자 명의로 가입하고 이메일 인증을 완료합니다." },
  { title: "온라인 입단 신청", body: "자녀(단원) 정보를 입력해 신청서를 제출합니다." },
  { title: "심사", body: "신청서를 검토하고, 오디션·면접이 있으면 개별 안내합니다." },
  { title: "결과 확인", body: "마이페이지에서 심사 결과와 안내 사항을 확인합니다." },
];

export default async function JoinPage() {
  const [recruitment, faqs] = await Promise.all([getRecruitment(), listPublishedFaqs()]);

  const overview = [
    { label: "모집 대상", value: recruitment?.target },
    { label: "연습 일정", value: recruitment?.schedule },
    { label: "연습 장소", value: recruitment?.place },
    { label: "회비", value: recruitment?.fee },
  ].filter((item) => item.value);

  return (
    <>
      <PageHeader eyebrow="Audition" title="입단 안내" description="노래를 사랑하는 어린이 단원을 기다립니다." />

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-12">
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
          <h2 className="mb-5 text-xl font-bold text-navy">모집 요강</h2>
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
            <h2 className="mb-5 text-xl font-bold text-navy">반 구성</h2>
            <div className="card whitespace-pre-wrap leading-relaxed">{recruitment.classes}</div>
          </section>
        )}

        <section>
          <h2 className="mb-5 text-xl font-bold text-navy">지원 절차</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card relative">
                <span className="eyebrow text-gold-deep">Step {i + 1}</span>
                <p className="mt-2 font-bold">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {recruitment?.audition && (
          <section>
            <h2 className="mb-5 text-xl font-bold text-navy">오디션 · 심사</h2>
            <div className="card whitespace-pre-wrap leading-relaxed">{recruitment.audition}</div>
          </section>
        )}

        {recruitment?.notes && (
          <section>
            <h2 className="mb-5 text-xl font-bold text-navy">기타 안내</h2>
            <div className="card whitespace-pre-wrap leading-relaxed">{recruitment.notes}</div>
          </section>
        )}

        {faqs.length > 0 && (
          <section>
            <h2 className="mb-5 text-xl font-bold text-navy">자주 묻는 질문</h2>
            <FaqList faqs={faqs} />
          </section>
        )}

        <section className="rounded-sm border border-line bg-white p-8 text-center">
          <p className="text-lg font-bold text-navy">입단 신청은 온라인으로 받습니다</p>
          <p className="mt-2 text-sm text-ink-soft">보호자 회원가입 후 신청할 수 있습니다.</p>
          <p className="mt-1 text-sm text-ink-soft">
            입단 문의: 단장{" "}
            <a href={smsHref} className="underline">{site.contact.phone}</a> (문자 메시지)
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/apply" className="btn-primary px-6">입단 신청하기</Link>
            <Link href="/signup" className="btn-outline px-6">보호자 회원가입</Link>
          </div>
        </section>
      </div>
    </>
  );
}
