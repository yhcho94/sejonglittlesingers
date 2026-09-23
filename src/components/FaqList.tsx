import type { Faq } from "@/lib/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-sm border border-line bg-white">
      {faqs.map((faq) => (
        <details key={faq.id} className="group px-6 py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
            <span>
              <span className="mr-2 font-[family-name:var(--font-display)] text-lg font-semibold text-gold-deep">Q.</span>
              {faq.question}
            </span>
            <span className="mt-0.5 shrink-0 text-ink-soft transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 whitespace-pre-wrap pl-6 leading-relaxed text-ink-soft">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
