import React from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
  title?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  icon,
  children,
  ...props
}) => {
  const variantStyles = {
    info: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
    warning: "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]",
    error: "bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]",
    success: "bg-[#DCFCE7] border-[#BBF7D0] text-[#166534]",
  };

  const defaultIcons = {
    info: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="pt-0.5">{icon || defaultIcons[variant]}</div>
      <div className="space-y-0.5 flex-1">
        {title && <h5 className="font-semibold text-[14px] leading-tight">{title}</h5>}
        <div className="text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};
