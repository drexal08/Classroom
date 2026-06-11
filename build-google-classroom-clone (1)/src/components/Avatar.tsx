"use client";

export function Avatar({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}
