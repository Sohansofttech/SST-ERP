import React from "react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, required, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[13px] font-medium text-[#1E293B]"
          >
            {label}
            {required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={cn(
            "block w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-[14px] text-[#1E293B] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] disabled:bg-[#F1F5F9] disabled:cursor-not-allowed cursor-pointer",
            error && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
