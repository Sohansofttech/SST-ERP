import React from "react";
import { Badge } from "./Badge";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeVariant?: "success" | "warning" | "error" | "info" | "brand" | "neutral";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeVariant = "info",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm transition-all hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-[#2563EB]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1E293B]">{value}</span>
            {badgeText && <Badge variant={badgeVariant} size="sm">{badgeText}</Badge>}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#153B66]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
