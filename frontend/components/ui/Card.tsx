import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "dark" | "outlined" | "elevated";
  padding?: "sm" | "md" | "lg";
  rounded?: "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * Card component for containing content sections
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  rounded = "2xl",
  className = "",
  onClick,
  hoverable = false,
}) => {
  const variantStyles = {
    default: "bg-white border border-stone-200 shadow-sm",
    dark: "bg-stone-950 text-stone-400 shadow-2xl",
    outlined: "bg-white border border-stone-100 shadow-xl shadow-stone-200/40",
    elevated: "bg-white border border-stone-100 shadow-xl shadow-stone-200/50",
  };

  const paddingStyles = {
    sm: "p-6",
    md: "p-8",
    lg: "p-10",
  };

  const roundedStyles = {
    md: "rounded-xl",
    lg: "rounded-[1.5rem]",
    xl: "rounded-[1.8rem]",
    "2xl": "rounded-[2rem]",
    "3xl": "rounded-[2.5rem]",
  };

  const hoverStyles = hoverable
    ? "hover:border-stone-900 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
    : "";

  return (
    <div
      className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${roundedStyles[rounded]}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
