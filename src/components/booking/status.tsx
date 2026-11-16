import { cn } from "@/lib/cn";
import { PAY_LABEL, STATUS_LABEL } from "@/lib/shop/labels";
import type { BookingStatus, PayStatus } from "@/lib/shop/types";

function pill(tone: string, label: string) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border border-line px-2 text-xs",
        tone,
      )}
    >
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: BookingStatus }) {
  const tone =
    status === "completed"
      ? "text-ok"
      : status === "no_show"
        ? "text-danger"
        : status === "cancelled"
          ? "text-faint"
          : "text-fg";
  return pill(tone, STATUS_LABEL[status]);
}

export function PayPill({ status }: { status: PayStatus }) {
  const tone =
    status === "paid" ? "text-ok" : status === "declined" ? "text-danger" : "text-faint";
  return pill(tone, PAY_LABEL[status]);
}
