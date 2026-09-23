"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/types";

export function SubmitButton({
  children,
  pendingText = "처리 중...",
  className = "btn-primary w-full",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
        {state.success}
      </p>
    );
  }
  return null;
}
