// 하위 페이지 상단 제목 영역
export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <div className="border-b border-line bg-ivory">
      <div className="container-page py-12 md:py-20">
        {eyebrow && <p className="eyebrow animate-rise text-gold-deep">{eyebrow}</p>}
        <h1 style={{ "--rise-delay": "100ms" } as React.CSSProperties} className="animate-rise mt-3 text-3xl font-bold text-navy md:text-5xl">
          {title}
        </h1>
        <span style={{ "--rise-delay": "200ms" } as React.CSSProperties} className="gold-rule animate-rise mt-5 md:mt-7" />
        {description && (
          <p
            style={{ "--rise-delay": "280ms" } as React.CSSProperties}
            className="animate-rise mt-5 max-w-2xl leading-relaxed text-ink-soft md:text-lg"
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
