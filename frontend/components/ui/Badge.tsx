import React from "react";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "amber" | "emerald" | "stone";
  size?: "sm" | "md";
  className?: string;
  icon?: LucideIcon;
}

/**
 * Badge component for displaying status indicators and labels
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon: Icon,
}) => {
  const variantStyles = {
    default:
      "bg-stone-100 text-stone-600 border-stone-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    stone: "bg-stone-50 text-stone-500 border-stone-100",
  };

  const sizeStyles = {
    sm: "text-[9px] px-2 py-0.5",
    md: "text-[10px] px-3 py-1",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border font-bold uppercase tracking-[0.2em] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </div>
  );
};
