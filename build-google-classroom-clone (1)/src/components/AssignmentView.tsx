"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Avatar } from "./Avatar";
import { CommentSection } from "./CommentSection";
import { useAuth } from "./AuthProvider";
import { Modal } from "./Modal";
import { IconChevronLeft, IconEdit, IconTrash, IconClipboard } from "./Icons";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

interface AssignmentInfo {
  id: string;
  title: string;
  description: string | null;
  type: string;
  points: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorColor: string;
}

interface Submission {
  id: string;
  content: string | null;
  status: string;
  grade: number | null;
  feedback: string | null;
  turnedInAt: string | null;
  studentName?: string;
  studentId?: string;
  studentColor?: string;
}

export function AssignmentView({
  classId,
  assignmentId,
}: {
  classId: string;
  assignmentId: string;
}) {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [role, setRole] = useState("student");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Grading
  const [showGrade, setShowGrade] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");

  // Edit
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editDue, setEditDue] = useState("");

  useEffect(() => {
    fetchAssignment();
  }, [classId, assignmentId]);

  const fetchAssignment = async () => {
    const res = await apiGet(`/api/classes/${classId}/assignments/${assignmentId}`);
    if (res.ok) {
      const data = await res.json();
      setAssignment(data.assignment);
      setRole(data.role);
      setSubmission(data.submission);
      setAllSubmissions(data.submissions || []);
      if (data.submission?.content) {
        setContent(data.submission.content);
      }
      if (data.assignment) {
        setEditTitle(data.assignment.title);
        setEditDesc(data.assignment.description || "");
        setEditPoints(data.assignment.points?.toString() || "");
        setEditDue(data.assignment.dueDate ? new Date(data.assignment.dueDate).toISOString().slice(0, 16) : "");
      }
    } else {
      setError("Assignment not found");
    }
    setLoading(false);
  };

  const handleSubmit = async (action: string) => {
    setSubmitting(true);
    const res = await apiPost(`/api/classes/${classId}/assignments/${assignmentId}/submit`, { content, action });
    if (res.ok) {
      fetchAssignment();
    }
    setSubmitting(false);
  };

  const handleGrade = async (action: string) => {
    if (!selectedSub) return;
    const res = await apiPost(`/api/classes/${classId}/assignments/${assignmentId}/grade`, {
      submissionId: selectedSub.id,
      grade: gradeValue,
      feedback: feedbackValue,
      action,
    });
    if (res.ok) {
      setShowGrade(false);
      fetchAssignment();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiPatch(`/api/classes/${classId}/assignments/${assignmentId}`, {
      title: editTitle,
      description: editDesc,
      points: editPoints,
      dueDate: editDue,
    });
    if (res.ok) {
      setShowEdit(false);
      fetchAssignment();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this assignment?")) return;
    const res = await apiDelete(`/api/classes/${classId}/assignments/${assignmentId}`);
    if (res.ok) {
      window.location.href = `/class/${classId}`;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl text-gray-600">{error || "Assignment not found"}</h2>
          <a href={`/class/${classId}`} className="mt-4 inline-block text-classroom-blue hover:underline">
            ← Back to class
          </a>
        </div>
      </div>
    );
  }

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const turnedIn = submission?.status === "turned_in";
  const returned = submission?.status === "returned" || submission?.status === "graded";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <a
          href={`/class/${classId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <IconChevronLeft className="w-4 h-4" />
          Back to class
        </a>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-classroom-blue flex items-center justify-center text-white shrink-0">
                  <IconClipboard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-medium text-classroom-blue">{assignment.title}</h1>
                      <p className="text-sm text-gray-500 mt-1">
                        {assignment.authorName} • {formatShortDate(assignment.createdAt)}
                      </p>
                    </div>
                    {role === "teacher" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowEdit(true)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit"
                        >
                          <IconEdit className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Delete"
                        >
                          <IconTrash className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 border-b border-gray-200 pb-4">
                    {assignment.points !== null && (
                      <span>{assignment.points} points</span>
                    )}
                    <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                      {formatDate(assignment.dueDate)}
                    </span>
                  </div>

                  {assignment.description && (
                    <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {assignment.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Class comments */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Class comments</h3>
              <CommentSection assignmentId={assignmentId} />
            </div>

            {/* Teacher: All submissions */}
            {role === "teacher" && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4 text-gray-700">
                  Student work ({allSubmissions.filter((s) => s.status === "turned_in").length}/{allSubmissions.length} turned in)
                </h3>
                {allSubmissions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-2">
                    {allSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedSub(sub);
                          setGradeValue(sub.grade?.toString() || "");
                          setFeedbackValue(sub.feedback || "");
                          setShowGrade(true);
                        }}
                      >
                        <Avatar
                          name={sub.studentName || "?"}
                          color={sub.studentColor || "#ccc"}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{sub.studentName}</p>
                          <p className="text-xs text-gray-400">
                            {sub.status === "turned_in"
                              ? `Turned in ${sub.turnedInAt ? formatShortDate(sub.turnedInAt) : ""}`
                              : sub.status === "graded" || sub.status === "returned"
                              ? "Graded"
                              : "Assigned"}
                          </p>
                        </div>
                        <div className="text-right">
                          {sub.grade !== null ? (
                            <span className="text-lg font-medium">
                              {sub.grade}
                              {assignment.points ? `/${assignment.points}` : ""}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              {sub.status === "turned_in" ? "Grade" : "—"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Student: Submission panel */}
          {role === "student" && assignment.type !== "material" && (
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-36">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Your work</h3>
                  <StatusBadge status={submission?.status || "assigned"} />
                </div>

                {returned && submission?.grade !== null && submission?.grade !== undefined && (
                  <div className="mb-4 p-3 bg-green-50 rounded-xl text-center">
                    <div className="text-2xl font-medium text-green-700">
                      {submission.grade}
                      {assignment.points ? `/${assignment.points}` : ""}
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-green-600 mt-1">{submission.feedback}</p>
                    )}
                  </div>
                )}

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add your work here..."
                  disabled={turnedIn}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none resize-none min-h-[120px] disabled:bg-gray-50 disabled:text-gray-500"
                />

                <div className="mt-3 space-y-2">
                  {!turnedIn ? (
                    <>
                      <button
                        onClick={() => handleSubmit("turn_in")}
                        disabled={submitting}
                        className="w-full py-2.5 bg-classroom-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Turn in"}
                      </button>
                      {content && (
                        <button
                          onClick={() => handleSubmit("save_draft")}
                          disabled={submitting}
                          className="w-full py-2 text-classroom-blue text-sm hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Save draft
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleSubmit("unsubmit")}
                      disabled={submitting}
                      className="w-full py-2.5 border border-classroom-blue text-classroom-blue rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      Unsubmit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      <Modal open={showGrade} onClose={() => setShowGrade(false)} title="Grade submission">
        <div className="p-6 space-y-4">
          {selectedSub && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  name={selectedSub.studentName || "?"}
                  color={selectedSub.studentColor || "#ccc"}
                />
                <div>
                  <p className="font-medium">{selectedSub.studentName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedSub.status === "turned_in" ? "Turned in" : selectedSub.status}
                  </p>
                </div>
              </div>

              {selectedSub.content && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Student&apos;s work</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedSub.content}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade {assignment.points ? `(out of ${assignment.points})` : ""}
                </label>
                <input
                  type="number"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  min="0"
                  max={assignment.points || 100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
                  placeholder="Enter grade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Private feedback</label>
                <textarea
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none resize-none min-h-[80px]"
                  placeholder="Add feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowGrade(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGrade("return")}
                  className="px-5 py-2 bg-classroom-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit assignment">
        <form onSubmit={handleEdit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none resize-none min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
              <input
                type="datetime-local"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-classroom-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    assigned: "bg-gray-100 text-gray-600",
    turned_in: "bg-green-50 text-green-700",
    returned: "bg-blue-50 text-blue-700",
    graded: "bg-purple-50 text-purple-700",
  };

  const labels: Record<string, string> = {
    assigned: "Assigned",
    turned_in: "Turned in",
    returned: "Returned",
    graded: "Graded",
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || styles.assigned}`}>
      {labels[status] || status}
    </span>
  );
}
