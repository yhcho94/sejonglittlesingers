import Image from "next/image";
import Link from "next/link";
import { ConcertCard } from "@/components/ConcertCard";
import { CountUp } from "@/components/CountUp";
import { NoticeList } from "@/components/NoticeList";
import { getRecruitment, listConcerts, listPublishedPress, pressSource } from "@/lib/content";
import { history } from "@/lib/history";
import { listPublishedNotices } from "@/lib/notices";
import { site, smsHref } from "@/lib/site";
import { organization } from "@/lib/staff";
import heroImage from "../../public/images/hero.jpg";

// 합창단이 제공한 소개 글의 수치
const STATS: { value: string; unit?: string; label: string; count?: boolean }[] = [
  { value: "2023", label: "창단" },
  { value: "150", unit: "명", label: "단원", count: true },
  { value: "20", unit: "회", label: "연간 공연 (내외)", count: true },
  { value: "4", unit: "회", label: "연간 주최 음악회", count: true },
];

// 공연 이력에서 장소가 있는 최근 무대 3개 (최신순)
const RECENT_STAGES = history
  .flatMap((y) => [...y.items].reverse().map((item) => ({ ...item, year: y.year })))
  .filter((item) => item.place)
  .slice(0, 3);

function SectionTitle({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div data-reveal className="mb-8 flex items-end justify-between gap-4 md:mb-12">
      <div>
        <p className="eyebrow text-gold-deep">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-bold text-navy md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 pb-1 text-sm text-ink-soft transition hover:text-navy">
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [notices, concerts, recruitment, press] = await Promise.all([
    listPublishedNotices(4),
    listConcerts("upcoming", 3),
    getRecruitment(),
    listPublishedPress(),
  ]);

  return (
    <>
      {/* ── 대표 영역 ───────────────────────────── */}
      {/* 휴대폰·태블릿: 사진 아래에 글자 / PC: 왼쪽 글자, 오른쪽 사진 (아이들을 가리지 않도록) */}
      <section className="bg-navy-dark text-white lg:grid lg:min-h-[min(calc(100svh-var(--header-h)-var(--util-h)),820px)] lg:grid-cols-[calc(max(2rem,(100vw-72rem)/2+2rem)+28rem)_1fr]">
        <div className="relative aspect-[16/9] overflow-hidden lg:order-2 lg:aspect-auto">
          <Image
            src={heroImage}
            alt="세종리틀싱어즈 단원들이 무대에서 노래하는 모습"
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 65vw, 100vw"
            className="animate-hero-zoom object-cover object-[50%_85%] lg:object-[50%_60%]"
          />
          {/* 사진과 글자 영역이 자연스럽게 이어지도록 */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy-dark to-transparent lg:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-navy-dark to-transparent lg:block" />
        </div>

        <div className="flex items-center lg:order-1">
          <div className="w-full px-5 pb-12 pt-6 sm:px-8 md:pb-16 lg:py-20 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))] lg:pr-10">
            <p className="eyebrow animate-rise text-gold">
              {site.nameEn}
              <span className="hidden sm:inline">
                <span className="mx-2 text-white/40">·</span> Since 2023
              </span>
            </p>
            <h1 style={{ "--rise-delay": "120ms" } as React.CSSProperties} className="animate-rise mt-4 whitespace-nowrap text-[2.4rem] font-bold leading-[1.15] sm:text-6xl lg:mt-6 lg:text-[3.5rem]">{site.name}</h1>
            <span style={{ "--rise-delay": "240ms" } as React.CSSProperties} className="gold-rule animate-rise mt-5 w-14 lg:mt-8" />
            <p style={{ "--rise-delay": "320ms" } as React.CSSProperties} className="animate-rise mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg lg:mt-6">
              음악을 통해 아이들의 감성과 협동심을 키우는
              <br className="hidden sm:block lg:hidden" /> 세종시 어린이 합창단
            </p>
            <div style={{ "--rise-delay": "440ms" } as React.CSSProperties} className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row lg:mt-10">
              <Link href="/join" className="btn-gold px-8 py-3.5">
                입단 안내
              </Link>
              <Link href="/concerts" className="btn-ghost-light px-8 py-3.5">
                공연 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 모집 배너 (관리자 > 입단 안내에서 '모집 중' 체크 시) ── */}
      {recruitment?.is_open && (
        <Link href="/join" className="group block bg-gold text-navy-dark">
          <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-4">
            <p className="font-medium">
              <span className="eyebrow mr-3 text-[10px]">Now Recruiting</span>
              단원 모집 중{recruitment.period ? ` · ${recruitment.period}` : ""}
            </p>
            <span className="text-sm font-medium">
              모집 요강 보기 <span className="inline-block transition group-hover:translate-x-1">→</span>
            </span>
          </div>
        </Link>
      )}

      {/* ── 소개 ─────────────────────────────── */}
      <section className="section-y bg-ivory">
        <div className="container-page grid gap-10 md:grid-cols-12 md:gap-16">
          <div data-reveal className="md:col-span-5">
            <p className="eyebrow text-gold-deep">About</p>
            <h2 className="mt-4 text-3xl font-bold leading-snug text-navy md:text-[2.75rem] md:leading-tight">
              ‘즐거운 합창’
              <br />
              노래로 자라는 아이들
            </h2>
            <span className="gold-rule mt-8" />
          </div>
          <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties} className="md:col-span-7">
            <p className="text-lg leading-relaxed text-ink md:text-xl md:leading-relaxed">
              세종리틀싱어즈는 2023년 창단된 세종시 어린이 합창단으로, 음악을 통해 아이들의 감성과 협동심을 키우는 전문
              합창 교육단체입니다.
            </p>
            <p className="mt-5 leading-relaxed text-ink-soft">
              지휘자, 부지휘자, 반주자, 이론 강사, 사무국장 등 총 13명의 전문 강사진과 운영진이 함께하며, 12년 경력의
              어린이 합창 전문가인 단장이 직접 수업을 이끕니다.
            </p>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-navy">
              합창단 소개 <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="container-page mt-14 md:mt-24">
          <dl data-reveal className="grid grid-cols-2 border-y border-line md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col-reverse items-center py-8 text-center md:py-10 ${
                  i % 2 === 1 ? "border-l border-line" : ""
                } ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
              >
                <dt className="mt-2 text-xs tracking-wide text-ink-soft md:text-sm">{s.label}</dt>
                <dd className="font-[family-name:var(--font-display)] text-4xl font-semibold text-navy md:text-5xl">
                  {s.count ? <CountUp value={Number(s.value)} /> : s.value}
                  {s.unit && (
                    <span className="ml-0.5 font-[family-name:var(--font-sans)] text-base font-medium text-ink-soft">
                      {s.unit}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 반 구성 ──────────────────────────── */}
      <section className="section-y">
        <div className="container-page">
          <SectionTitle eyebrow="Classes" title="세 개의 반, 하나의 하모니" href="/about" linkLabel="강사진" />
          <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {organization.classes.map((c, i) => (
              <div
                key={c.name}
                data-reveal
                style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
                className="group relative bg-white p-8 transition-colors duration-500 hover:bg-ivory md:p-10"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: c.color }}
                />
                <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-gold-deep">
                  0{i + 1}
                </p>
                <p className="mt-4 font-[family-name:var(--font-serif)] text-2xl font-bold" style={{ color: c.color }}>
                  {c.name}
                </p>
                <p className="mt-6 text-sm text-ink-soft">
                  부지휘자{" "}
                  <span className="ml-1 font-medium text-ink">
                    {c.members.find((m) => m.role === "부지휘자")?.name}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 공연: 예정 공연이 없으면 최근 무대 ─────────── */}
      <section className="section-y bg-ivory">
        <div className="container-page">
          {concerts.length ? (
            <>
              <SectionTitle eyebrow="Upcoming" title="다가오는 공연" href="/concerts" linkLabel="전체" />
              <div className="grid gap-4 md:grid-cols-3">
                {concerts.map((c, i) => (
                  <div key={c.id} data-reveal style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}>
                    <ConcertCard concert={c} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <SectionTitle eyebrow="Stage" title="최근 무대" href="/concerts#history" linkLabel="공연 이력" />
              <ul className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
                {RECENT_STAGES.map((s, i) => (
                  <li
                    key={`${s.year}-${s.date}-${s.title}`}
                    data-reveal
                    style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
                    className="flex flex-col bg-white p-7 transition-colors duration-500 hover:bg-cream/60 md:p-8"
                  >
                    <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-gold-deep">
                      {s.year}. {s.date}
                    </p>
                    <p className="mt-3 font-medium leading-snug text-ink">{s.title}</p>
                    <p className="mt-auto pt-4 text-sm text-ink-soft">{s.place}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* ── 소식 ─────────────────────────────── */}
      <section className="section-y">
        <div className="container-page grid gap-16 md:grid-cols-2 md:gap-12">
          <div data-reveal className="min-w-0">
            <SectionTitle eyebrow="Notice" title="공지사항" href="/notices" linkLabel="전체" />
            <div className="border-t border-navy">
              <NoticeList notices={notices} />
            </div>
          </div>
          <div data-reveal style={{ "--reveal-delay": "120ms" } as React.CSSProperties} className="min-w-0">
            <SectionTitle eyebrow="Press" title="언론 보도" href="/press" linkLabel="전체" />
            <ul className="divide-y divide-line border-t border-navy">
              {press.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate group-hover:text-navy">{p.title}</span>
                      <span className="mt-1 block text-xs text-ink-soft">
                        {p.published_on ? `${p.published_on.replaceAll("-", ".")} · ` : ""}
                        {pressSource(p)}
                      </span>
                    </span>
                    <span className="shrink-0 text-gold-deep" aria-hidden>
                      ↗
                    </span>
                  </a>
                </li>
              ))}
              {press.length === 0 && <li className="py-10 text-center text-ink-soft">등록된 보도자료가 없습니다.</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 입단 안내 ─────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(195,162,102,0.18),transparent_60%)]" />
        <div data-reveal className="container-page flex flex-col items-start gap-10 py-20 md:flex-row md:items-end md:justify-between md:py-28">
          <div>
            <p className="eyebrow text-gold">Audition</p>
            <h2 className="mt-4 text-3xl font-bold leading-snug md:text-5xl md:leading-tight">
              노래를 사랑하는
              <br />
              어린이 단원을 기다립니다
            </h2>
            <p className="mt-6 text-white/70">
              입단 · 공연 문의{" "}
              <a href={smsHref} className="whitespace-nowrap text-white underline decoration-gold underline-offset-4">
                단장 {site.contact.phone}
              </a>{" "}
              (문자 메시지)
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/join" className="btn-gold px-8 py-3.5">
              입단 안내
            </Link>
            <Link href="/apply" className="btn-ghost-light px-8 py-3.5">
              온라인 신청
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
