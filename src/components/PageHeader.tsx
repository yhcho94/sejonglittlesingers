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
        {eyebrow && <p className="eyebrow text-gold-deep">{eyebrow}</p>}
        <h1 className="mt-3 text-3xl font-bold text-navy md:text-5xl">{title}</h1>
        <span className="gold-rule mt-5 md:mt-7" />
        {description && <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft md:text-lg">{description}</p>}
      </div>
    </div>
  );
}
