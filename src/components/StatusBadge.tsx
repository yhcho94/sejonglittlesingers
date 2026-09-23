import { STATUS_LABEL, type ApplicationStatus } from "@/lib/types";

const STYLE: Record<ApplicationStatus, string> = {
  pending: "bg-gold-soft text-ink",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
