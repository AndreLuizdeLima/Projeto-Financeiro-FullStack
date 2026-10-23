import { cn } from "@/lib/utils";
import "./loading.css";

type LoadingProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function Loading({
  title = "Carregando…",
  description = "Aguarde um momento.",
  className,
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "flex flex-col items-center gap-8 px-6 text-center",
        className,
      )}
    >
      <div className="banter-loader" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="banter-loader__box" />
        ))}
      </div>
      <div className="flex flex-col gap-2 motion-safe:animate-pulse">
        <p className="text-lg font-bold text-primary">{title}</p>
        {description && (
          <p className="text-sm text-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
