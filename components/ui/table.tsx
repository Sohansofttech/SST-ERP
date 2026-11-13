import React from "react";
import { cn } from "@/lib/utils";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
      <table
        className={cn("w-full text-left border-collapse text-[13px] text-[#1E293B]", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <thead
      className={cn("bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#64748B] uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tbody className={cn("divide-y divide-[#F1F5F9] bg-white", className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[#F8FAFC]/80 group",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <th className={cn("px-4 py-3 font-semibold text-[#64748B]", className)} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <td className={cn("px-4 py-3.5 text-[#1E293B] align-middle", className)} {...props}>
      {children}
    </td>
  );
};

export const TableEmpty: React.FC<{ message?: string; colSpan: number }> = ({
  message = "No records found.",
  colSpan,
}) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-12 text-center text-sm text-[#64748B] italic bg-[#FAFAFA]"
      >
        {message}
      </td>
    </tr>
  );
};
