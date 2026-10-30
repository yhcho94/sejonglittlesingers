import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { EventAlbums } from "@/components/EventAlbums";
import { listEventAlbums } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "사진 갤러리",
  description: "세종리틀싱어즈의 공연·행사 사진첩입니다. 무대 위의 순간과 함께 노래한 시간들을 담았습니다.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  // 관리자가 올린 공개 앨범 + 블로그 사진첩, 날짜 최신순
  const albums = await listEventAlbums();

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
          <EventAlbums albums={albums} />
        </div>
      </section>

    </>
  );
}
