"use client";

export function PrintButton({ label = "인쇄" }: { label?: string }) {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      {label}
    </button>
  );
}
