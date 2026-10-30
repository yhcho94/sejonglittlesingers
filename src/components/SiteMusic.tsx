import { getSiteMusic } from "@/lib/content";
import { musicFileUrl } from "@/lib/site-music";
import { SiteMusicPlayer } from "./SiteMusicPlayer";

// 배경음악 (최상위 관리자가 켜고 곡을 올렸을 때만)
export async function SiteMusic() {
  const { settings, tracks } = await getSiteMusic();
  const list = tracks.filter((t) => t.is_active).map((t) => ({ title: t.title, src: musicFileUrl(t.file_path) }));
  if (!settings.enabled || !list.length) return null;
  return <SiteMusicPlayer tracks={list} volume={settings.volume} />;
}
