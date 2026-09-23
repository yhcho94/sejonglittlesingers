// YouTube 주소에서 영상 ID 를 뽑아 개인정보 보호 모드(youtube-nocookie) 임베드 주소로 바꿉니다.
// 지원 형식: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/live/, youtube.com/embed/
export function youtubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = parsed.pathname.slice(1);
  else if (host === "youtube.com") {
    id = parsed.searchParams.get("v");
    const match = parsed.pathname.match(/^\/(shorts|live|embed)\/([^/]+)/);
    if (!id && match) id = match[2];
  }
  if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
