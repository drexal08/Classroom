"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { StreamTab } from "./tabs/StreamTab";
import { ClassworkTab } from "./tabs/ClassworkTab";
import { PeopleTab } from "./tabs/PeopleTab";
import { GradesTab } from "./tabs/GradesTab";
import { apiGet } from "@/lib/api";

interface ClassInfo {
  id: string;
  name: string;
  section: string | null;
  subject: string | null;
  room: string | null;
  code: string;
  themeColor: string;
  teacherId: string;
  archived: boolean;
  teacherName: string;
}

export function ClassView({ classId }: { classId: string }) {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [role, setRole] = useState<string>("student");
  const [activeTab, setActiveTab] = useState("stream");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClass();
  }, [classId]);

  const fetchClass = async () => {
    const res = await apiGet(`/api/classes/${classId}`);
    if (res.ok) {
      const data = await res.json();
      setClassInfo(data.class);
      setRole(data.role);
    } else {
      setError("Class not found or you are not enrolled");
    }
    setLoading(false);
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

  if (error || !classInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl text-gray-600">{error || "Class not found"}</h2>
          <a href="/" className="mt-4 inline-block text-classroom-blue hover:underline">
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "stream", label: "Stream" },
    { id: "classwork", label: "Classwork" },
    { id: "people", label: "People" },
    { id: "grades", label: "Grades" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-classroom-blue text-classroom-blue"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                style={
                  activeTab === tab.id
                    ? { borderBottomColor: classInfo.themeColor, color: classInfo.themeColor }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "stream" && (
          <StreamTab classInfo={classInfo} role={role} />
        )}
        {activeTab === "classwork" && (
          <ClassworkTab classId={classId} role={role} themeColor={classInfo.themeColor} />
        )}
        {activeTab === "people" && (
          <PeopleTab classId={classId} role={role} themeColor={classInfo.themeColor} />
        )}
        {activeTab === "grades" && (
          <GradesTab classId={classId} role={role} themeColor={classInfo.themeColor} />
        )}
      </main>
    </div>
  );
}
