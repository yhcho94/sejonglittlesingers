import Link from "next/link";
import { NoticeList } from "@/components/NoticeList";
import { Placeholder } from "@/components/Placeholder";
import { listPublishedNotices } from "@/lib/notices";
import { site } from "@/lib/site";

export default async function HomePage() {
  const notices = await listPublishedNotices(5);

  return (
    <>
      {/* 대표 영역 */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="text-sm tracking-[0.2em] text-gold">{site.nameEn.toUpperCase()}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{site.name}</h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            {/* TODO: 합창단 대표 문구로 교체 */}
            [대표 문구 입력 필요]
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/apply" className="btn bg-gold px-6 py-3 text-ink hover:bg-gold/90">
              입단 신청하기
            </Link>
            <Link href="/about" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              합창단 소개
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
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
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-soft">모집 대상</dt>
              <dd><Placeholder>입력 필요</Placeholder></dd>
            </div>
            <div>
              <dt className="text-ink-soft">연습 일정</dt>
              <dd><Placeholder>입력 필요</Placeholder></dd>
            </div>
            <div>
              <dt className="text-ink-soft">연습 장소</dt>
              <dd><Placeholder>입력 필요</Placeholder></dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-ink-soft">
            보호자 회원가입 후 온라인으로 신청할 수 있습니다.
          </p>
          <Link href="/apply" className="btn-primary mt-4">
            온라인 입단 신청
          </Link>
        </section>
      </div>
    </>
  );
}
