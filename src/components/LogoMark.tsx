// 로고 표식: 파스텔 무지개 + 샴페인 골드 음표 (앱 아이콘 src/app/icon.svg 와 같은 모양)
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <g fill="none" strokeLinecap="round" strokeWidth="2.4">
        <path d="M10 35 A18 18 0 0 1 46 35" stroke="#eab2b6" />
        <path d="M14 35 A14 14 0 0 1 42 35" stroke="#eccb7f" />
        <path d="M18 35 A10 10 0 0 1 38 35" stroke="#abc8a6" />
        <path d="M22 35 A6 6 0 0 1 34 35" stroke="#a9c1e0" />
      </g>
      <g fill="#b08d4f">
        <ellipse cx="11.5" cy="38.5" rx="4.6" ry="3.4" transform="rotate(-22 11.5 38.5)" />
        <rect x="14.6" y="12" width="2" height="26.5" rx="1" />
        <path d="M15.6 12 C19 15.5 24.5 16.5 23.5 24.5 C22.6 20 19.6 18.6 15.6 18.2 Z" />
      </g>
    </svg>
  );
}
