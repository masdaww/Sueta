import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gradient-to-r from-ink-100 via-ink-50 to-ink-100 rounded-xl",
        className,
      )}
    />
  );
}
