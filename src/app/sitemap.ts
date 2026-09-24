import type { MetadataRoute } from "next";
import { listConcerts } from "@/lib/content";
import { listAlbums } from "@/lib/gallery";
import { listPublishedNotices } from "@/lib/notices";
import { site } from "@/lib/site";

// 검색엔진(네이버·구글)에 알려 줄 공개 페이지 목록. 로그인·관리자 화면은 넣지 않습니다.
const PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faculty", priority: 0.8, changeFrequency: "monthly" },
  { path: "/singers", priority: 0.7, changeFrequency: "monthly" },
  { path: "/join", priority: 0.9, changeFrequency: "monthly" },
  { path: "/concerts", priority: 0.8, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.8, changeFrequency: "weekly" },
  { path: "/notices", priority: 0.7, changeFrequency: "weekly" },
  { path: "/press", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;
  const entries: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: url(p.path),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // DB 를 읽지 못해도 기본 페이지 목록은 내보냅니다.
  try {
    const [notices, upcoming, past, albums] = await Promise.all([
      listPublishedNotices(),
      listConcerts("upcoming"),
      listConcerts("past"),
      listAlbums(),
    ]);
    for (const n of notices) entries.push({ url: url(`/notices/${n.id}`), lastModified: n.updated_at, priority: 0.5 });
    for (const c of [...upcoming, ...past]) entries.push({ url: url(`/concerts/${c.id}`), priority: 0.5 });
    for (const a of albums.filter((a) => a.is_published && a.count > 0)) {
      entries.push({ url: url(`/gallery/${a.id}`), priority: 0.4 });
    }
  } catch (e) {
    console.error("사이트맵: 게시물 목록을 읽지 못함", e);
  }
  return entries;
}
