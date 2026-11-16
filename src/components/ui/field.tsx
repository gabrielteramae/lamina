import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {children}
      {error ? (
        <span className="mt-2 block text-sm text-danger" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-2 block text-sm text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

const control =
  "w-full rounded-lg border border-line bg-bg px-3 text-base text-fg outline-none placeholder:text-faint focus-visible:ring-2 focus-visible:ring-bone";

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-11", className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 py-3", className)} {...rest} />;
}
