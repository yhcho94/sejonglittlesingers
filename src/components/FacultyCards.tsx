import { organization, type BioSection, type StaffMember } from "@/lib/staff";

// 강사진 소개 카드 (단장 칸 · 강사 카드)
// 사진이 있으면 세로 3:4 로, 얼굴이 잘리지 않게 위쪽 기준으로 채워 표시
export function FacultyHead({ member }: { member: StaffMember }) {
  return (
    <article className="border border-line bg-white">
      <div className="flex flex-wrap items-end justify-between gap-4 bg-navy px-4 py-5 text-white md:px-6 md:py-6">
        <div className="flex items-end gap-4 md:gap-5">
          {member.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo}
              alt={`${member.name} 사진`}
              className="aspect-[3/4] w-24 shrink-0 rounded-sm object-cover object-top ring-2 ring-gold/60 md:w-32"
            />
          )}
          <div>
            <p className="eyebrow text-gold">{member.role}</p>
            <h2 className="mt-1 font-[family-name:var(--font-serif)] text-2xl font-semibold md:text-3xl">{member.name}</h2>
          </div>
        </div>
        {member.website && (
          <a href={member.website} target="_blank" rel="noopener noreferrer" className="btn-ghost-light px-4 py-2 text-xs">
            개인 홈페이지 ↗
          </a>
        )}
      </div>
      <div className="grid gap-x-8 gap-y-4 p-4 md:grid-cols-2 md:p-6">
        {member.sections.map((section) => (
          <BioList key={section.title} section={section} />
        ))}
      </div>
    </article>
  );
}

export function FacultyCard({ member }: { member: StaffMember }) {
  const color = organization.classes.find((c) => c.name === member.className)?.color;
  return (
    <article className="border border-line bg-white p-4 md:p-5">
      <div className="flex items-start gap-3">
        {member.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt={`${member.name} 사진`}
            loading="lazy"
            className="aspect-[3/4] w-20 shrink-0 rounded-sm border border-line object-cover object-top md:w-24"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs text-ink-soft">{member.role}</p>
            <h3 className="mt-1 font-[family-name:var(--font-serif)] text-xl font-bold">{member.name}</h3>
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-navy underline"
              >
                개인 홈페이지 ↗
              </a>
            )}
          </div>
          {member.className && (
            <span className="border px-2.5 py-0.5 text-xs font-medium" style={{ color, borderColor: color }}>
              {member.className}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-4">
        {member.sections.map((section) => (
          <BioList key={section.title} section={section} />
        ))}
      </div>
    </article>
  );
}

function BioList({ section }: { section: BioSection }) {
  return (
    <div>
      <h4 className="border-b border-line pb-1.5 text-xs font-bold tracking-wider text-gold-deep">{section.title}</h4>
      <ul className="mt-2 space-y-1 text-sm leading-snug">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-gold" aria-hidden>
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
