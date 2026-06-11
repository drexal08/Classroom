"use client";

import { useState, useEffect } from "react";
import { Avatar } from "../Avatar";
import { useAuth } from "../AuthProvider";
import { IconTrash } from "../Icons";
import { apiGet, apiDelete } from "@/lib/api";

interface Person {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: string;
}

export function PeopleTab({
  classId,
  role,
  themeColor,
}: {
  classId: string;
  role: string;
  themeColor: string;
}) {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, [classId]);

  const fetchPeople = async () => {
    const res = await apiGet(`/api/classes/${classId}/people`);
    if (res.ok) {
      const data = await res.json();
      setTeachers(data.teachers);
      setStudents(data.students);
    }
    setLoading(false);
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this person from the class?")) return;
    const res = await apiDelete(`/api/classes/${classId}/people`, { userId });
    if (res.ok) {
      fetchPeople();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Teachers */}
      <div>
        <h2
          className="text-2xl font-normal pb-3 border-b-2 mb-4"
          style={{ color: themeColor, borderColor: themeColor }}
        >
          Teachers
        </h2>
        <div className="space-y-1">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Avatar name={t.name} color={t.avatarColor} />
              <div className="flex-1">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 mb-4" style={{ borderColor: themeColor }}>
          <h2 className="text-2xl font-normal" style={{ color: themeColor }}>
            Students
          </h2>
          <span className="text-sm text-gray-400">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </span>
        </div>
        {students.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No students enrolled yet</p>
        ) : (
          <div className="space-y-1">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group"
              >
                <Avatar name={s.name} color={s.avatarColor} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                {(role === "teacher" || user?.id === s.id) && (
                  <button
                    onClick={() => handleRemove(s.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-full transition-all"
                    title="Remove"
                  >
                    <IconTrash className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
