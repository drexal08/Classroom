"use client";

import { useState, useEffect } from "react";
import { Avatar } from "../Avatar";
import { apiGet } from "@/lib/api";

interface GradeAssignment {
  id: string;
  title: string;
  points: number | null;
  dueDate: string | null;
  type: string;
}

interface StudentGrade {
  assignment: GradeAssignment;
  submission: {
    id: string;
    grade: number | null;
    status: string;
    feedback: string | null;
  } | null;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

interface TeacherSubmission {
  submissions: {
    id: string;
    grade: number | null;
    status: string;
    studentId: string;
    assignmentId: string;
  };
  assignments: {
    id: string;
  };
}

export function GradesTab({
  classId,
  role,
  themeColor,
}: {
  classId: string;
  role: string;
  themeColor: string;
}) {
  const [loading, setLoading] = useState(true);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<GradeAssignment[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [teacherSubmissions, setTeacherSubmissions] = useState<TeacherSubmission[]>([]);

  useEffect(() => {
    fetchGrades();
  }, [classId]);

  const fetchGrades = async () => {
    const res = await apiGet(`/api/classes/${classId}/grades`);
    if (res.ok) {
      const data = await res.json();
      if (data.role === "student") {
        setStudentGrades(data.grades);
      } else {
        setTeacherAssignments(data.assignments);
        setStudents(data.students);
        setTeacherSubmissions(data.submissions);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Student view
  if (role === "student") {
    const totalPoints = studentGrades
      .filter((g) => g.assignment.points && g.submission?.grade !== null && g.submission?.grade !== undefined)
      .reduce((sum, g) => sum + (g.submission?.grade || 0), 0);
    const maxPoints = studentGrades
      .filter((g) => g.assignment.points && g.submission?.grade !== null && g.submission?.grade !== undefined)
      .reduce((sum, g) => sum + (g.assignment.points || 0), 0);

    return (
      <div className="max-w-3xl mx-auto">
        {maxPoints > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-light" style={{ color: themeColor }}>
                {Math.round((totalPoints / maxPoints) * 100)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {totalPoints}/{maxPoints} points
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Assignment</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Due</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Grade</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">No assignments yet</td>
                </tr>
              ) : (
                studentGrades.map((g) => (
                  <tr key={g.assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={`/class/${classId}/assignment/${g.assignment.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: themeColor }}
                      >
                        {g.assignment.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {g.assignment.dueDate
                        ? new Date(g.assignment.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={g.submission?.status || "assigned"} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {g.submission?.grade !== null && g.submission?.grade !== undefined ? (
                        <span className="font-medium">
                          {g.submission.grade}
                          {g.assignment.points ? `/${g.assignment.points}` : ""}
                        </span>
                      ) : g.assignment.points ? (
                        <span className="text-gray-400">—/{g.assignment.points}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Teacher view - grade overview table
  return (
    <div className="overflow-x-auto">
      <div className="bg-white rounded-xl border border-gray-200 min-w-[600px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 sticky left-0 bg-white min-w-[200px]">
                Student
              </th>
              {teacherAssignments.map((a) => (
                <th key={a.id} className="text-center px-3 py-3 text-sm font-medium text-gray-500 min-w-[100px]">
                  <div className="truncate max-w-[100px]" title={a.title}>
                    {a.title}
                  </div>
                  {a.points && (
                    <div className="text-xs text-gray-400 font-normal">/{a.points}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={teacherAssignments.length + 1}
                  className="text-center py-8 text-gray-400"
                >
                  No students enrolled
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Avatar name={s.name} color={s.avatarColor} size="sm" />
                      <span className="text-sm">{s.name}</span>
                    </div>
                  </td>
                  {teacherAssignments.map((a) => {
                    const sub = teacherSubmissions.find(
                      (ts) =>
                        ts.submissions.studentId === s.id &&
                        ts.submissions.assignmentId === a.id
                    );
                    return (
                      <td key={a.id} className="text-center px-3 py-3 text-sm">
                        {sub ? (
                          <span
                            className={
                              sub.submissions.grade !== null
                                ? "font-medium"
                                : "text-gray-400"
                            }
                          >
                            {sub.submissions.grade !== null
                              ? sub.submissions.grade
                              : sub.submissions.status === "turned_in"
                              ? "✓"
                              : "—"}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || styles.assigned}`}>
      {labels[status] || status}
    </span>
  );
}
