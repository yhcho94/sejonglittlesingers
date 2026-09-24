import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { EventAlbums } from "@/components/EventAlbums";
import { EVENT_ALBUMS } from "@/lib/event-albums";
import { listAlbums } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "사진 갤러리",
  description: "세종리틀싱어즈의 공연·행사 사진첩입니다. 무대 위의 순간과 함께 노래한 시간들을 담았습니다.",
};

function dateLabel(d: string | null) {
  return d ? d.replaceAll("-", ". ") : "";
}

export default async function GalleryPage() {
  // 관리자로 로그인해 있어도 공개 화면에는 공개 앨범만
  const albums = (await listAlbums()).filter((a) => a.is_published && a.count > 0);

  return (
    <>
      <PageHeader eyebrow="Gallery" title="사진 갤러리" description="무대 위의 빛나는 순간과 함께 노래한 시간들을 담았습니다." />
      <section className="section-y">
        <div className="container-page">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 md:mb-5">
            <div>
              <p className="eyebrow text-gold-deep">Stage Moments</p>
              <h2 className="mt-1.5 text-xl font-semibold text-navy md:text-2xl">공연·행사 사진첩</h2>
            </div>
            <p className="text-xs text-ink-soft">사진을 누르면 크게 볼 수 있습니다.</p>
          </div>
          <EventAlbums albums={EVENT_ALBUMS} />
        </div>
      </section>

      {/* 관리자가 올린 앨범 (있을 때만) */}
      {albums.length > 0 && (
        <section className="section-y bg-ivory">
          <div className="container-page">
            <h2 className="mb-4 text-xl font-semibold text-navy md:mb-5 md:text-2xl">앨범</h2>
            <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((a, i) => (
                <li key={a.id} data-reveal style={{ "--reveal-delay": `${(i % 3) * 100}ms` } as React.CSSProperties}>
                  <Link href={`/gallery/${a.id}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy-dark">
                      {a.cover && (
                        // eslint-disable-next-line @next/next/no-img-element -- 미리 줄여 둔 공개 사진
                        <img
                          src={a.cover}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      )}
                      <span className="absolute right-3 bottom-3 bg-navy-dark/75 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                        {a.count}장
                      </span>
                    </div>
                    <p className="eyebrow mt-4 text-gold-deep">{dateLabel(a.taken_on)}</p>
                    <h3 className="mt-1.5 text-lg font-bold text-navy transition group-hover:text-gold-deep">{a.title}</h3>
                    {a.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">{a.description}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
