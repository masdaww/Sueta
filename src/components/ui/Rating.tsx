import clsx from "clsx";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  outOf?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export function Rating({
  value,
  outOf = 5,
  size = 16,
  className,
  showValue,
  reviewCount,
  interactive,
  onChange,
}: RatingProps) {
  const stars = Array.from({ length: outOf });
  return (
    <div className={clsx("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {stars.map((_, i) => {
          const filled = i + 1 <= Math.floor(value);
          const half = !filled && i + 1 - value < 1 && i + 1 - value > 0;
          const Component = interactive ? "button" : "span";
          return (
            <Component
              key={i}
              type={interactive ? "button" : undefined}
              onClick={interactive ? () => onChange?.(i + 1) : undefined}
              className={clsx(
                "relative inline-flex",
                interactive && "cursor-pointer hover:scale-110 transition-transform",
              )}
              aria-label={interactive ? `Поставить ${i + 1} из ${outOf}` : undefined}
            >
              <Star
                size={size}
                className={clsx(
                  filled ? "fill-accent-sun text-accent-sun" : half ? "text-accent-sun" : "text-ink-200",
                )}
                strokeWidth={1.5}
              />
              {half && (
                <Star
                  size={size}
                  className="absolute inset-0 fill-accent-sun text-accent-sun"
                  strokeWidth={1.5}
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                />
              )}
            </Component>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-ink-700 font-medium">{value.toFixed(1)}</span>
      )}
      {reviewCount != null && (
        <span className="text-xs text-ink-500">{reviewCount} отз.</span>
      )}
    </div>
  );
}
