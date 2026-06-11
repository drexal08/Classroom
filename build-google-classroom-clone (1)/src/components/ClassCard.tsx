"use client";

import { Avatar } from "./Avatar";

interface ClassInfo {
  id: string;
  name: string;
  section: string | null;
  subject: string | null;
  room: string | null;
  themeColor: string;
  teacherName: string;
  role: string;
}

export function ClassCard({
  cls,
  onClick,
}: {
  cls: ClassInfo;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div
        className="h-24 px-4 pt-3 relative overflow-hidden"
        style={{ backgroundColor: cls.themeColor }}
      >
        <div className="relative z-10">
          <h3 className="text-white font-medium text-lg truncate group-hover:underline">
            {cls.name}
          </h3>
          {cls.section && (
            <p className="text-white/80 text-sm truncate">{cls.section}</p>
          )}
          <p className="text-white/70 text-sm truncate mt-0.5">{cls.teacherName}</p>
        </div>
        <div className="absolute right-4 top-3">
          <Avatar name={cls.teacherName} color="rgba(255,255,255,0.3)" size="lg" />
        </div>
      </div>
      <div className="h-28 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {cls.subject && <span>{cls.subject}</span>}
          {cls.room && <span>• Room {cls.room}</span>}
        </div>
        <div className="mt-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              cls.role === "teacher"
                ? "bg-blue-50 text-blue-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {cls.role === "teacher" ? "Teaching" : "Enrolled"}
          </span>
        </div>
      </div>
    </div>
  );
}
