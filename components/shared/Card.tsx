import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = "",
  bodyClassName = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-[18px] font-semibold text-[#1E293B] leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
