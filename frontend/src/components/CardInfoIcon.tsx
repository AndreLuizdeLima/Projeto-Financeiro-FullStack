import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const colors = {
  green: {
    text: "text-green-700",
    bg: "bg-green-500/20",
    border: "border-l-green-500",
  },
  red: {
    text: "text-red-700",
    bg: "bg-red-500/20",
    border: "border-l-red-500",
  },
  blue: {
    text: "text-blue-700",
    bg: "bg-blue-500/20",
    border: "border-l-blue-500",
  },
  gray: {
    text: "text-gray-700",
    bg: "bg-gray-500/20",
    border: "border-l-gray-500",
  },
} as const;

type ColorType = keyof typeof colors;

export interface CardInfoIconProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: ColorType;
  loading?: boolean;
}

const CardInfoIcon = ({
  title,
  value,
  icon,
  color,
  loading = false,
}: CardInfoIconProps) => {
  const colorClasses = colors[color];

  return (
    <Card
      aria-busy={loading}
      className={`border-l-4 bg-card ${colorClasses.border}`}
    >
      <CardContent className="relative">
        <div
          className={`flex items-center justify-between gap-4 ${loading ? "invisible" : ""}`}
        >
          <div className="min-w-0">
            <span className="block text-sm text-muted-foreground">{title}</span>
            <span
              className={`mt-1 block wrap-break-word text-2xl font-semibold ${colorClasses.text}`}
            >
              {value}
            </span>
          </div>
          <div
            aria-hidden="true"
            className={`flex size-14 shrink-0 items-center justify-center rounded-full ${colorClasses.bg} ${colorClasses.text} [&_svg]:size-8`}
          >
            {icon}
          </div>
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner
              aria-label="Carregando"
              className={`size-8 ${colorClasses.text}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardInfoIcon;
