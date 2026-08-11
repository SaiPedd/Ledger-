import type { ReactNode } from "react";

export default function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 text-base font-semibold text-slate-100">{title}</h2>}
      {children}
    </div>
  );
}
