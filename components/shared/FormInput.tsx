import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-[#1E293B] mb-1.5"
        >
          {label} {props.required && <span className="text-[#DC2626]">*</span>}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-[14px] bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F1F5F9] disabled:cursor-not-allowed ${
            error
              ? "border-[#DC2626] focus:border-[#DC2626]"
              : "border-[#E2E8F0] focus:border-[#2563EB]"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

