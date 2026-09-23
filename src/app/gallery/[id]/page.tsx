import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { galleryUrl, getAlbum } from "@/lib/gallery";
import { PhotoGrid } from "./PhotoGrid";

async function load(id: string) {
  const data = await getAlbum(Number(id));
  // 관리자로 로그인해 있어도 비공개 앨범은 공개 화면에 보이지 않게
  return data && data.album.is_published ? data : null;
}

export async function generateMetadata({ params }: PageProps<"/gallery/[id]">): Promise<Metadata> {
  const data = await load((await params).id);
  if (!data) return { title: "사진 갤러리" };
  const cover = data.photos.find((p) => p.id === data.album.cover_photo_id) ?? data.photos[0];
  return {
    title: `${data.album.title} · 사진 갤러리`,
    description: data.album.description ?? undefined,
    openGraph: cover ? { images: [{ url: galleryUrl(cover.path), width: cover.width, height: cover.height }] } : undefined,
  };
}

export default async function AlbumPage({ params }: PageProps<"/gallery/[id]">) {
  const data = await load((await params).id);
  if (!data) notFound();
  const { album, photos } = data;

  return (
    <>
      <PageHeader
        eyebrow={album.taken_on ? album.taken_on.replaceAll("-", ". ") : "Gallery"}
        title={album.title}
        description={album.description ?? undefined}
      />
      <section className="py-10 md:py-16">
        <div className="container-page">
          <div className="mb-8 flex items-center justify-between text-sm">
            <Link href="/gallery" className="text-ink-soft hover:text-navy">
              ← 전체 앨범
            </Link>
            <span className="text-ink-soft">사진 {photos.length}장</span>
          </div>
          <PhotoGrid
            title={album.title}
            photos={photos.map((p) => ({
              id: p.id,
              src: galleryUrl(p.path),
              thumb: galleryUrl(p.thumb_path),
              width: p.width,
              height: p.height,
              caption: p.caption,
            }))}
          />
        </div>
      </section>
    </>
  );
}
