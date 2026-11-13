"use client";

import React, { useState, useEffect } from "react";
import { Users, ChevronDown, Check } from "lucide-react";

interface LinkedChild {
  linkId: string;
  relationship: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    currentSemester: number;
    courseName: string;
  };
}

interface ChildSelectorProps {
  selectedChildId?: string;
  onSelectChild: (childId: string) => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  selectedChildId,
  onSelectChild,
}) => {
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/parent/children");
        const json = await res.json();
        if (json.success && json.data) {
          setChildren(json.data);
          if (!selectedChildId && json.data.length > 0) {
            onSelectChild(json.data[0].student.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch linked children", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const activeChild = children.find((c) => c.student.id === selectedChildId) || children[0];

  if (loading) {
    return <div className="text-xs text-[#64748B]">Loading students...</div>;
  }

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg shadow-sm hover:border-[#2563EB] transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold text-xs">
          {activeChild ? `${activeChild.student.firstName[0]}${activeChild.student.lastName[0]}` : "ST"}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-[#1E293B]">
            {activeChild ? `${activeChild.student.firstName} ${activeChild.student.lastName}` : "Select Child"}
          </p>
          <p className="text-[11px] text-[#64748B]">
            {activeChild ? `Sem ${activeChild.student.currentSemester} • ${activeChild.student.rollNumber}` : ""}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-[#64748B] ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <div className="px-3 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Linked Children ({children.length})
            </p>
          </div>
          {children.map((item) => {
            const isSelected = item.student.id === (activeChild?.student.id);
            return (
              <button
                key={item.student.id}
                onClick={() => {
                  onSelectChild(item.student.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors ${
                  isSelected ? "bg-blue-50/60" : ""
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-[#1E293B]">
                    {item.student.firstName} {item.student.lastName}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {item.student.courseName} • Sem {item.student.currentSemester} ({item.student.rollNumber})
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

