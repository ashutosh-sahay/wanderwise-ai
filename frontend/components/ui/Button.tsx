import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

/**
 * Reusable button component with multiple variants
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variantStyles = {
    primary:
      "bg-stone-950 hover:bg-black text-white shadow-xl shadow-stone-300",
    secondary:
      "bg-white border border-stone-200 text-stone-500 hover:text-stone-950 shadow-sm",
    outline:
      "bg-white border border-stone-100 text-stone-600 hover:border-stone-900",
  };

  const sizeStyles = {
    sm: "px-6 py-3 text-[10px]",
    md: "px-8 py-4 text-[10px]",
    lg: "px-10 py-5 text-[11px]",
  };

  return (
    <button
      className={`
        font-black uppercase tracking-widest rounded-2xl
        transition-all flex items-center justify-center gap-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
};
