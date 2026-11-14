"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { Table } from "@/components/shared/Table";
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  HelpCircle,
  ExternalLink,
  Award,
} from "lucide-react";

export default function StudentLmsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"MATERIALS" | "ASSIGNMENTS" | "QUIZZES">("MATERIALS");

  // Assignment submission modal
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [textContent, setTextContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quiz modal
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const fetchLms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/lms");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLms();
  }, []);

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ASSIGNMENT_SUBMISSION",
          assignmentId: selectedAssignment.id,
          textContent,
          fileUrl: `https://apex.edu/submissions/student_${Date.now()}.pdf`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Assignment submitted successfully!");
        setSelectedAssignment(null);
        setTextContent("");
        fetchLms();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitting(true);
    try {
      const res = await fetch("/api/student/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "QUIZ_SUBMIT",
          quizId: selectedQuiz.id,
          answers: quizAnswers,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setQuizResult(json.data);
        fetchLms();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout portalType="STUDENT" pageTitle="Learning Management System">
        <div className="py-20 text-center text-sm text-[#64748B]">Loading LMS courses...</div>
      </PortalLayout>
    );
  }

  const { materials, assignments, quizzes } = data || {};

  return (
    <PortalLayout portalType="STUDENT" pageTitle="Learning Management System (LMS)">
      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <button
          onClick={() => setTab("MATERIALS")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "MATERIALS"
              ? "bg-[#153B66] text-white"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-white"
          }`}
        >
          Study Materials & Notes ({materials?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("ASSIGNMENTS")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "ASSIGNMENTS"
              ? "bg-[#153B66] text-white"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-white"
          }`}
        >
          Assignments & Submissions ({assignments?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("QUIZZES")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "QUIZZES"
              ? "bg-[#153B66] text-white"
              : "text-[#64748B] hover:text-[#1E293B] hover:bg-white"
          }`}
        >
          Practice Quizzes ({quizzes?.length ?? 0})
        </button>
      </div>

      {tab === "MATERIALS" && (
        <Card title="Course Modules & Study Materials">
          <div className="space-y-3">
            {materials?.map((m: any) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#2563EB]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#DBEAFE] text-[#2563EB]">
                        {m.subjectCode}
                      </span>
                      <h4 className="text-sm font-bold text-[#1E293B]">{m.title}</h4>
                      {m.unitNumber && (
                        <Badge variant="neutral" size="sm">Unit {m.unitNumber}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{m.description}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      Uploaded on {new Date(m.uploadedAt).toLocaleDateString()} • {m.fileType}
                    </p>
                  </div>
                </div>

                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 self-start sm:self-center"
                >
                  <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Download
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "ASSIGNMENTS" && (
        <Card title="Course Assignments & Evaluation Status">
          <div className="space-y-4">
            {assignments?.map((a: any) => {
              const hasSubmitted = !!a.submission;

              return (
                <div
                  key={a.id}
                  className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2563EB]">{a.subjectCode}</span>
                        <h4 className="text-sm font-bold text-[#1E293B]">{a.title}</h4>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Due: {new Date(a.dueDate).toLocaleString()} • Total Points: {a.totalPoints}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={hasSubmitted ? "success" : "warning"}>
                        {hasSubmitted ? a.submission.status : "Pending Submission"}
                      </Badge>
                      {!hasSubmitted && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedAssignment(a)}
                          icon={<Upload className="w-3.5 h-3.5" />}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#1E293B] leading-relaxed">{a.description}</p>

                  {hasSubmitted && (
                    <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Submitted at:</span>
                        <span className="font-semibold">
                          {new Date(a.submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      {a.submission.score !== null && (
                        <div className="flex justify-between items-center text-emerald-700 font-bold">
                          <span>Faculty Score:</span>
                          <span>{a.submission.score} / {a.totalPoints} pts</span>
                        </div>
                      )}
                      {a.submission.feedback && (
                        <p className="text-[11px] text-[#64748B] italic">
                          Feedback: "{a.submission.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "QUIZZES" && (
        <Card title="Subject Practice Quizzes">
          <div className="space-y-4">
            {quizzes?.map((q: any) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2563EB]">{q.subjectCode}</span>
                    <h4 className="text-sm font-bold text-[#1E293B]">{q.title}</h4>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {q.questionCount} Questions • Duration: {q.durationMinutes} mins • {q.totalPoints} Points
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {q.attempt ? (
                    <div className="text-right">
                      <Badge variant="success" size="sm">Completed</Badge>
                      <span className="block text-xs font-bold text-[#1E293B] mt-1">
                        Score: {q.attempt.score} / {q.totalPoints}
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedQuiz(q);
                        setQuizAnswers({});
                        setQuizResult(null);
                      }}
                      icon={<HelpCircle className="w-4 h-4" />}
                    >
                      Take Quiz
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit Assignment: ${selectedAssignment.title}`}
          subtitle={`${selectedAssignment.subjectName} • Due: ${new Date(selectedAssignment.dueDate).toLocaleDateString()}`}
        >
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1E293B] mb-1">
                Submission Notes & Answers
              </label>
              <textarea
                className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:outline-none"
                rows={4}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Explain your approach or paste repository/document links..."
                required
              />
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1] text-center text-xs text-[#64748B]">
              <Upload className="w-5 h-5 mx-auto text-[#64748B] mb-1" />
              <span>Project Artifact / Code Report (PDF attachment simulation verified)</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Submit to Faculty
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Interactive Quiz Modal */}
      {selectedQuiz && (
        <Modal
          isOpen={!!selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          title={`Practice Quiz: ${selectedQuiz.title}`}
          subtitle={`${selectedQuiz.subjectName} • ${selectedQuiz.questions.length} questions`}
          maxWidth="xl"
        >
          {quizResult ? (
            <div className="text-center py-6 space-y-3">
              <Award className="w-12 h-12 text-[#16A34A] mx-auto" />
              <h3 className="text-lg font-bold text-[#1E293B]">Quiz Submitted Successfully!</h3>
              <p className="text-2xl font-extrabold text-[#2563EB]">
                Your Score: {quizResult.score} / {selectedQuiz.totalPoints}
              </p>
              <Button variant="primary" size="sm" onClick={() => setSelectedQuiz(null)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleQuizSubmit} className="space-y-6">
              {selectedQuiz.questions.map((q: any, idx: number) => (
                <div key={q.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                  <p className="text-xs font-bold text-[#1E293B]">
                    Q{idx + 1}. {q.questionText} ({q.points} pts)
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {["A", "B", "C", "D"].map((opt) => {
                      const optText = q[`option${opt}`];
                      if (!optText) return null;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            quizAnswers[q.id] === opt
                              ? "bg-blue-50 border-[#2563EB] text-[#2563EB] font-semibold"
                              : "bg-white border-[#E2E8F0] text-[#1E293B] hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz_${q.id}`}
                            value={opt}
                            checked={quizAnswers[q.id] === opt}
                            onChange={() =>
                              setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            className="text-[#2563EB]"
                            required
                          />
                          <span>
                            ({opt}) {optText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setSelectedQuiz(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={quizSubmitting}>
                  Submit Answers
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </PortalLayout>
  );
}

