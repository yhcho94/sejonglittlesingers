import { site } from "@/lib/site";

// 공식 채널 아이콘 (상표 로고 대신 단순한 기호 사용)
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="2.5" y="5" width="19" height="14" rx="3.5" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BlogIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" strokeLinejoin="round" />
      <path d="M14 7l3 3" />
    </svg>
  );
}
function CafeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" strokeLinejoin="round" />
      <path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H16.5" />
      <path d="M8 3.5v2.5M11.5 3.5v2.5" strokeLinecap="round" />
    </svg>
  );
}

export const CHANNELS = [
  { href: site.links.youtube, label: "유튜브", Icon: VideoIcon },
  { href: site.links.blog, label: "네이버 블로그", Icon: BlogIcon },
  { href: site.links.cafe, label: "네이버 카페", Icon: CafeIcon },
];

export function SocialLinks({
  className = "",
  itemClassName = "",
  showLabel = false,
}: {
  className?: string;
  itemClassName?: string;
  showLabel?: boolean;
}) {
  return (
    <ul className={`flex items-center ${className}`}>
      {CHANNELS.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (새 창)`}
            title={label}
            className={`inline-flex items-center gap-2 transition ${itemClassName}`}
          >
            <Icon />
            {showLabel && <span>{label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
