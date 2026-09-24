import { site } from "@/lib/site";

// 공식 채널 아이콘: 한눈에 알아보도록 서비스 색(유튜브 빨강, 네이버 초록)의 단순한 기호 사용
function YoutubeIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#FF0033" />
      <path d="M10 8.6v6.8l5.8-3.4z" fill="#fff" />
    </svg>
  );
}
function NaverBadge({ letter, className }: { letter: string; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#03C75A" />
      <text x="12" y="16.6" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" fill="#fff">
        {letter}
      </text>
    </svg>
  );
}
const BlogIcon = ({ className }: { className: string }) => <NaverBadge letter="b" className={className} />;
const CafeIcon = ({ className }: { className: string }) => <NaverBadge letter="C" className={className} />;

export const CHANNELS = [
  { href: site.links.youtube, label: "유튜브", short: "유튜브", Icon: YoutubeIcon },
  { href: site.links.blog, label: "네이버 블로그", short: "블로그", Icon: BlogIcon },
  { href: site.links.cafe, label: "네이버 카페", short: "카페", Icon: CafeIcon },
];

export function SocialLinks({
  className = "",
  itemClassName = "",
  showLabel = false,
  stacked = false,
}: {
  className?: string;
  itemClassName?: string;
  showLabel?: boolean;
  // 휴대폰 머리글: 아이콘 아래에 짧은 이름(유튜브·블로그·카페)
  stacked?: boolean;
}) {
  return (
    <ul className={`flex items-center ${className}`}>
      {CHANNELS.map(({ href, label, short, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (새 창)`}
            title={label}
            className={`inline-flex items-center transition ${stacked ? "flex-col gap-0.5" : "gap-1.5"} ${itemClassName}`}
          >
            <Icon className={stacked ? "h-5 w-5" : "h-4 w-4"} />
            {stacked ? (
              <span className="text-[10px] leading-none font-medium">{short}</span>
            ) : (
              showLabel && <span>{label}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
