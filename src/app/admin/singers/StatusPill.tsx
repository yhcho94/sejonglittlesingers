import { STATUS_LABEL, type SingerStatus } from "@/lib/singers";

const STYLE: Record<SingerStatus, string> = {
  active: "bg-emerald-50 text-emerald-800",
  paused: "bg-amber-50 text-amber-800",
  left: "bg-gray-100 text-gray-600",
};

export function StatusPill({ status }: { status: SingerStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}
