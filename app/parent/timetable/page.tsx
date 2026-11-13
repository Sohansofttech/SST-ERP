"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function ParentTimetablePage() {
  const [selectedChildId, setSelectedChildId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("MONDAY");

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const fetchTimetable = async (childId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/timetable?studentId=${childId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) fetchTimetable(selectedChildId);
  }, [selectedChildId]);

  const { semester, section, weeklySchedule } = data || {};
  const currentSlots = weeklySchedule?.[selectedDay] || [];

  return (
    <PortalLayout
      portalType="PARENT"
      pageTitle="Child Class Timetable & Schedule"
      selectedChildId={selectedChildId}
      onSelectChild={(id) => setSelectedChildId(id)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="brand">Semester {semester}</Badge>
          <Badge variant="neutral">Section {section}</Badge>
        </div>

        {/* Day selection */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedDay === d
                  ? "bg-[#153B66] text-white border-[#153B66]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <Card title={`${selectedDay} Schedule`}>
        {currentSlots.length === 0 ? (
          <p className="text-xs text-[#64748B]">No classes scheduled for {selectedDay}.</p>
        ) : (
          <div className="space-y-3">
            {currentSlots.map((slot: any) => (
              <div
                key={slot.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-white rounded-lg border border-[#E2E8F0] text-center min-w-[80px]">
                    <span className="font-bold text-[#153B66] block">{slot.startTime}</span>
                    <span className="text-[10px] text-[#64748B] block">{slot.endTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2563EB]">{slot.subjectCode}</span>
                      <h4 className="font-semibold text-[#1E293B]">{slot.subjectName}</h4>
                    </div>
                    <p className="text-[#64748B] text-[11px] mt-0.5">Faculty: {slot.teacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-medium text-[#1E293B] bg-white px-2.5 py-1 rounded border border-[#E2E8F0] self-start sm:self-center">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{slot.roomNumber}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalLayout>
  );
}
