// 하위 페이지 상단 제목 영역
export function PageHeader({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  // 소개 문구 아래에 덧붙일 내용 (예: 입단 신청 접수 시기)
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-ivory">
      <div className="container-page py-7 md:py-10">
        {eyebrow && <p className="eyebrow animate-rise text-gold-deep">{eyebrow}</p>}
        <h1 style={{ "--rise-delay": "100ms" } as React.CSSProperties} className="animate-rise mt-2 text-2xl font-semibold text-navy md:text-4xl">
          {title}
        </h1>
        <span style={{ "--rise-delay": "200ms" } as React.CSSProperties} className="gold-rule animate-rise mt-4 md:mt-5" />
        {description && (
          <p
            style={{ "--rise-delay": "280ms" } as React.CSSProperties}
            className="animate-rise mt-3 max-w-2xl leading-relaxed text-ink-soft"
          >
            {description}
          </p>
        )}
        {children && (
          <div style={{ "--rise-delay": "360ms" } as React.CSSProperties} className="animate-rise mt-5 max-w-2xl">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
