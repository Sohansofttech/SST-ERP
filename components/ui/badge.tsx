import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "navy" | "teal" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    success: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
    warning: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
    error: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
    info: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    navy: "bg-[#E0E7FF] text-[#153B66] border-[#C7D2FE]",
    teal: "bg-[#CCFBF1] text-[#0D9488] border-[#99F6E4]",
    neutral: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
