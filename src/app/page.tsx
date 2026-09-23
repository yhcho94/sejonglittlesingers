import Image from "next/image";
import Link from "next/link";
import heroImage from "../../public/images/hero.jpg";
import { NoticeList } from "@/components/NoticeList";
import { ConcertCard } from "@/components/ConcertCard";
import { getRecruitment, listConcerts } from "@/lib/content";
import { listPublishedNotices } from "@/lib/notices";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [notices, concerts, recruitment] = await Promise.all([
    listPublishedNotices(5),
    listConcerts("upcoming", 3),
    getRecruitment(),
  ]);
  const overview = [
    { label: "모집 대상", value: recruitment?.target },
    { label: "연습 일정", value: recruitment?.schedule },
    { label: "연습 장소", value: recruitment?.place },
  ].filter((item) => item.value);

  return (
    <>
      {/* 대표 영역 */}
      <section className="relative isolate overflow-hidden bg-navy-dark text-white">
        <Image
          src={heroImage}
          alt="세종리틀싱어즈 단원들이 무대에서 노래하는 모습"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-10 object-cover object-[50%_45%]"
        />
        {/* 글자가 잘 읽히도록 아래쪽을 어둡게 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark via-navy-dark/55 to-navy-dark/10" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-navy-dark/70 via-navy-dark/20 to-transparent md:block" />
        <div className="mx-auto flex min-h-[min(72vh,720px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-40 md:min-h-[min(80vh,820px)] md:pb-20">
          <p className="text-sm tracking-[0.2em] text-gold">{site.nameEn.toUpperCase()}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{site.name}</h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            {/* TODO: 합창단 대표 문구로 교체 */}
            [대표 문구 입력 필요]
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/join" className="btn bg-gold px-6 py-3 text-ink hover:bg-gold/90">
              입단 안내
            </Link>
            <Link href="/concerts" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              공연 일정
            </Link>
          </div>
        </div>
      </section>

      {/* 모집 배너 (관리자 > 입단 안내에서 '모집 중' 체크 시) */}
      {recruitment?.is_open && (
        <div className="bg-gold-soft">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <p className="font-medium">
              <span className="mr-2 font-bold text-navy">단원 모집 중</span>
              {recruitment.period}
            </p>
            <Link href="/join" className="text-sm font-medium text-navy underline underline-offset-4">
              모집 요강 보기
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        {/* 다가오는 공연 */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-navy">다가오는 공연</h2>
            <Link href="/concerts" className="text-sm text-ink-soft hover:underline">
              전체 일정
            </Link>
          </div>
          {concerts.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {concerts.map((c) => (
                <ConcertCard key={c.id} concert={c} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-white p-6 text-ink-soft">예정된 공연이 없습니다.</p>
          )}
        </section>

        <div className="grid gap-8 md:grid-cols-3">
          {/* 공지사항 */}
          <section className="card md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">공지사항</h2>
              <Link href="/notices" className="text-sm text-ink-soft hover:underline">
                전체 보기
              </Link>
            </div>
            <NoticeList notices={notices} />
          </section>

          {/* 입단 안내 */}
          <section className="card flex flex-col">
            <h2 className="text-xl font-bold text-navy">입단 안내</h2>
            {overview.length ? (
              <dl className="mt-4 space-y-3 text-sm">
                {overview.map((item) => (
                  <div key={item.label}>
                    <dt className="text-ink-soft">{item.label}</dt>
                    <dd className="line-clamp-2 whitespace-pre-wrap">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">모집 요강을 준비하고 있습니다.</p>
            )}
            <div className="mt-auto flex flex-col gap-2 pt-6">
              <Link href="/join" className="btn-outline">입단 안내 · FAQ</Link>
              <Link href="/apply" className="btn-primary">온라인 입단 신청</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
