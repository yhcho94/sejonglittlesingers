export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-navy md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-ink-soft">{description}</p>}
      </div>
    </div>
  );
}
