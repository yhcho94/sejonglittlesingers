// 실제 내용이 아직 없는 자리. 눈에 띄게 표시해 배포 전에 빠짐없이 채우도록 합니다.
export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-dashed border-gold bg-gold-soft px-1.5 py-0.5 text-sm text-ink">
      {children}
    </span>
  );
}
