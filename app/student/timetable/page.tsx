"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Table } from "@/components/shared/Table";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function TimetablePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [selectedDay, setSelectedDay] = useState("MONDAY");

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch("/api/student/timetable");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          const currentDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()];
          setSelectedDay(days.includes(currentDay) ? currentDay : "MONDAY");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Class Timetable">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading class schedule...</div>
      </PortalLayout>
    );
  }

  const { semester, section, weeklySchedule, dailySchedule } = data || {};
  const currentDaySlots = weeklySchedule?.[selectedDay] || [];

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Timetable & Class Schedule">
      {/* View Switcher & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="brand">Semester {semester}</Badge>
          <Badge variant="neutral">Section {section}</Badge>
        </div>

        <div className="flex items-center bg-white border border-[#E2E8F0] rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setViewMode("DAILY")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "DAILY"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Daily Timetable
          </button>
          <button
            onClick={() => setViewMode("WEEKLY")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "WEEKLY"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Weekly Schedule
          </button>
        </div>
      </div>

      {viewMode === "DAILY" ? (
        <div className="space-y-6">
          {/* Day selection tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedDay === d
                    ? "bg-[#153B66] text-white border-[#153B66] shadow-sm"
                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <Card title={`${selectedDay} Class Schedule`}>
            {currentDaySlots.length === 0 ? (
              <p className="text-xs text-[#64748B]">No classes scheduled for {selectedDay}.</p>
            ) : (
              <div className="space-y-3">
                {currentDaySlots.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-2 bg-white rounded-lg border border-[#E2E8F0] text-center min-w-[90px]">
                        <span className="text-xs font-bold text-[#153B66] block">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">60 Minutes</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB]">
                            {slot.subjectCode}
                          </span>
                          <h4 className="text-sm font-semibold text-[#1E293B]">
                            {slot.subjectName}
                          </h4>
                          {slot.isElective && (
                            <Badge variant="brand" size="sm">Elective</Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>Faculty: {slot.teacherName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#1E293B] bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] self-start sm:self-center">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{slot.roomNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Weekly Grid View */
        <Card title="Complete Weekly Timetable Matrix">
          <div className="space-y-6">
            {days.map((day) => {
              const slots = weeklySchedule?.[day] || [];
              return (
                <div key={day} className="border-b border-[#E2E8F0] pb-4 last:border-b-0">
                  <h4 className="text-sm font-bold text-[#153B66] uppercase tracking-wider mb-2">
                    {day}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {slots.map((s: any) => (
                      <div key={s.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs">
                        <div className="flex justify-between items-center text-[#64748B] mb-1">
                          <span className="font-semibold text-[#153B66]">{s.startTime} - {s.endTime}</span>
                          <span className="text-[11px] font-medium">{s.roomNumber}</span>
                        </div>
                        <p className="font-bold text-[#1E293B] truncate">{s.subjectCode}</p>
                        <p className="text-[#64748B] text-[11px] truncate">{s.subjectName}</p>
                        <p className="text-[11px] text-[#2563EB] mt-1">{s.teacherName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PortalLayout>
  );
}
