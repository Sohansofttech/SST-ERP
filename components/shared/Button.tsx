import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-[14px]";

  const variantClasses = {
    primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white focus:ring-[#2563EB] shadow-sm",
    secondary: "bg-[#14B8A6] hover:bg-[#0D9488] text-white focus:ring-[#14B8A6] shadow-sm",
    outline: "border border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F8FAFC] focus:ring-[#2563EB]",
    danger: "bg-[#DC2626] hover:bg-[#B91C1C] text-white focus:ring-[#DC2626] shadow-sm",
    ghost: "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] focus:ring-[#64748B]",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-[14px] gap-2",
    lg: "px-5 py-2.5 text-[15px] gap-2.5",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
