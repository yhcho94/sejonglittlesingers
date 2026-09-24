// 로고 표식: 파스텔 무지개 + 샴페인 골드 음표 (앱 아이콘 src/app/icon.svg 와 같은 모양)
// sls: 약칭 SLS 넣는 방식. inside = 가장 안쪽 무지개 선을 빼고 빈 공간에, overlay = 네 줄 위에 겹쳐서(halo 는 글자 테두리 색)
export function LogoMark({
  className = "",
  sls = "none",
  textColor = "#121a3a",
  halo = "#faf8f4",
}: {
  className?: string;
  sls?: "none" | "inside" | "overlay";
  textColor?: string;
  halo?: string;
}) {
  return (
    <svg viewBox="5 8 42 37" className={className} aria-hidden>
      <g fill="none" strokeLinecap="round" strokeWidth="2.4">
        <path d="M10 35 A18 18 0 0 1 46 35" stroke="#eab2b6" />
        <path d="M14 35 A14 14 0 0 1 42 35" stroke="#eccb7f" />
        <path d="M18 35 A10 10 0 0 1 38 35" stroke="#abc8a6" />
        {sls !== "inside" && <path d="M22 35 A6 6 0 0 1 34 35" stroke="#a9c1e0" />}
      </g>
      <g fill="#b08d4f">
        <ellipse cx="11.5" cy="38.5" rx="4.6" ry="3.4" transform="rotate(-22 11.5 38.5)" />
        <rect x="14.6" y="12" width="2" height="26.5" rx="1" />
        <path d="M15.6 12 C19 15.5 24.5 16.5 23.5 24.5 C22.6 20 19.6 18.6 15.6 18.2 Z" />
      </g>
      {sls === "inside" && (
        <text
          x="28"
          y="35.6"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          letterSpacing="0.4"
          fill={textColor}
          style={{ fontFamily: "var(--font-cormorant), var(--font-noto-serif-kr), serif" }}
        >
          SLS
        </text>
      )}
      {sls === "overlay" && (
        <text
          x="30.5"
          y="36"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="0.6"
          fill={textColor}
          stroke={halo}
          strokeWidth="2.2"
          strokeLinejoin="round"
          paintOrder="stroke"
          style={{ fontFamily: "var(--font-cormorant), var(--font-noto-serif-kr), serif" }}
        >
          SLS
        </text>
      )}
    </svg>
  );
}

// 로고 표식(SLS 포함) + 아래 창단 연도
export function LogoBadge({
  markClassName = "",
  sinceClassName = "",
  textColor,
  halo,
  sls = "inside",
}: {
  markClassName?: string;
  sinceClassName?: string;
  textColor?: string;
  halo?: string;
  sls?: "inside" | "overlay";
}) {
  return (
    <span className="inline-flex shrink-0 flex-col items-center leading-none">
      <LogoMark className={markClassName} sls={sls} textColor={textColor} halo={halo} />
      <span className={`font-[family-name:var(--font-display)] tracking-[0.14em] whitespace-nowrap uppercase ${sinceClassName}`}>
        Since 2023
      </span>
    </span>
  );
}
