import Image from "next/image";
import Link from "next/link";
import { ConcertCard } from "@/components/ConcertCard";
import { NoticeList } from "@/components/NoticeList";
import { getRecruitment, listConcerts, listPublishedPress, pressSource } from "@/lib/content";
import { history } from "@/lib/history";
import { listPublishedNotices } from "@/lib/notices";
import { site, smsHref } from "@/lib/site";
import { organization } from "@/lib/staff";
import heroImage from "../../public/images/hero.jpg";

// 합창단이 제공한 소개 글의 수치
const STATS = [
  { value: "2023", label: "창단" },
  { value: "150", unit: "명", label: "단원" },
  { value: "20", unit: "회", label: "연간 공연 (내외)" },
  { value: "4", unit: "회", label: "연간 주최 음악회" },
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
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
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
      <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] items-end overflow-hidden bg-navy-dark text-white md:min-h-[min(calc(100svh-var(--header-h)),860px)]">
        <Image
          src={heroImage}
          alt="세종리틀싱어즈 단원들이 무대에서 노래하는 모습"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-10 object-cover object-[55%_45%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-navy-dark/20" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-navy-dark/80 via-navy-dark/25 to-transparent md:block" />

        <div className="container-page pb-14 pt-32 md:pb-24">
          <p className="eyebrow text-gold">
            {site.nameEn}
            <span className="hidden sm:inline">
              <span className="mx-2 text-white/40">·</span> Since 2023
            </span>
          </p>
          <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.15] sm:text-6xl md:text-7xl">{site.name}</h1>
          <span className="gold-rule mt-6 w-14 md:mt-8" />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-xl">
            음악을 통해 아이들의 감성과 협동심을 키우는
            <br className="hidden sm:block" /> 세종시 어린이 합창단
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/join" className="btn-gold px-8 py-3.5">
              입단 안내
            </Link>
            <Link href="/concerts" className="btn-ghost-light px-8 py-3.5">
              공연 보기
            </Link>
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
          <div className="md:col-span-5">
            <p className="eyebrow text-gold-deep">About</p>
            <h2 className="mt-4 text-3xl font-bold leading-snug text-navy md:text-[2.75rem] md:leading-tight">
              ‘즐거운 합창’
              <br />
              노래로 자라는 아이들
            </h2>
            <span className="gold-rule mt-8" />
          </div>
          <div className="md:col-span-7">
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
          <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col-reverse items-center py-8 text-center md:py-10 ${
                  i % 2 === 1 ? "border-l border-line" : ""
                } ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
              >
                <dt className="mt-2 text-xs tracking-wide text-ink-soft md:text-sm">{s.label}</dt>
                <dd className="font-[family-name:var(--font-display)] text-4xl font-semibold text-navy md:text-5xl">
                  {s.value}
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
              <div key={c.name} className="bg-white p-8 md:p-10">
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
                {concerts.map((c) => (
                  <ConcertCard key={c.id} concert={c} />
                ))}
              </div>
            </>
          ) : (
            <>
              <SectionTitle eyebrow="Stage" title="최근 무대" href="/concerts#history" linkLabel="공연 이력" />
              <ul className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
                {RECENT_STAGES.map((s) => (
                  <li key={`${s.year}-${s.date}-${s.title}`} className="flex flex-col bg-white p-7 md:p-8">
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
          <div className="min-w-0">
            <SectionTitle eyebrow="Notice" title="공지사항" href="/notices" linkLabel="전체" />
            <div className="border-t border-navy">
              <NoticeList notices={notices} />
            </div>
          </div>
          <div className="min-w-0">
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
        <div className="container-page flex flex-col items-start gap-10 py-20 md:flex-row md:items-end md:justify-between md:py-28">
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
