import clsx from "clsx";

interface ProductImageProps {
  emoji: string;
  bgColor: string;
  bgColor2?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  rounded?: string;
  className?: string;
  src?: string;
  alt?: string;
  parodyLabel?: string;
}

export function ProductImage({
  emoji,
  bgColor,
  bgColor2,
  size = "md",
  rounded = "rounded-2xl",
  className,
  src,
  alt,
  parodyLabel,
}: ProductImageProps) {
  const sizes: Record<string, string> = {
    sm: "text-3xl",
    md: "h-40 w-full text-6xl",
    lg: "h-56 w-full text-7xl",
    xl: "h-72 w-full text-8xl",
    hero: "h-96 w-full text-9xl",
  };
  const gradient =
    bgColor2 != null
      ? `linear-gradient(135deg, ${bgColor} 0%, ${bgColor2} 100%)`
      : `linear-gradient(135deg, ${bgColor} 0%, ${bgColor} 100%)`;

  if (src) {
    return (
      <div
        className={clsx("relative overflow-hidden flex items-center justify-center", rounded, sizes[size], className)}
        style={{ background: gradient }}
      >
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative overflow-hidden flex items-center justify-center select-none",
        rounded,
        sizes[size],
        className,
      )}
      style={{ background: gradient }}
      aria-label={alt}
    >
      {/* decorative dots */}
      <span
        aria-hidden
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/30 blur-xl"
      />
      <span
        aria-hidden
        className="absolute bottom-2 left-3 h-12 w-12 rounded-full bg-white/20 blur-md"
      />
      <span aria-hidden className="relative drop-shadow-[0_4px_10px_rgba(0,0,0,.18)]">{emoji}</span>
      {parodyLabel && (
        <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-white/70 text-ink-700 px-1.5 py-0.5 rounded-md">
          {parodyLabel}
        </span>
      )}
    </div>
  );
}
