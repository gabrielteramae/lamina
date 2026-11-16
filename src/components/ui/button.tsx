import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "line" | "ghost" | "danger";
type Size = "md" | "sm";

export function btnClass(variant: Variant = "solid", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,opacity] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
    size === "md" ? "h-11 px-5 text-sm" : "h-9 px-3 text-sm",
    variant === "solid" && "bg-bone text-ink hover:opacity-90",
    variant === "line" && "border border-line bg-transparent text-fg hover:bg-raised",
    variant === "ghost" && "bg-transparent text-muted hover:text-fg",
    variant === "danger" && "border border-line bg-transparent text-danger hover:bg-raised",
    className,
  );
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={btnClass(variant, size, className)} {...rest} />;
}

export function chipClass(on: boolean, className?: string) {
  return cn(
    "inline-flex h-11 items-center rounded-full border px-4 text-sm transition-colors duration-150",
    on ? "border-bone bg-bone text-ink" : "border-line bg-transparent text-muted hover:text-fg",
    className,
  );
}
