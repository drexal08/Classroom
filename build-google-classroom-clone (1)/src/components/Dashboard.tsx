"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { ClassCard } from "./ClassCard";
import { Modal } from "./Modal";
import { IconPlus, IconGraduation } from "./Icons";
import { apiGet, apiPost } from "@/lib/api";

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
  role: string;
}

export function Dashboard() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showPlus, setShowPlus] = useState(false);

  // Create form
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    const res = await apiGet("/api/classes");
    if (res.ok) {
      const data = await res.json();
      setClasses(data.classes.filter((c: ClassInfo) => !c.archived));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await apiPost("/api/classes", { name: className, section, subject, room });
    if (res.ok) {
      setShowCreate(false);
      setClassName("");
      setSection("");
      setSubject("");
      setRoom("");
      fetchClasses();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await apiPost("/api/classes/join", { code: joinCode });
    if (res.ok) {
      setShowJoin(false);
      setJoinCode("");
      fetchClasses();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-normal text-gray-800">
            {loading ? "" : classes.length === 0 ? "Welcome to Classroom" : ""}
          </h2>
          <div className="relative">
            <button
              onClick={() => setShowPlus(!showPlus)}
              className="w-12 h-12 rounded-full bg-classroom-blue text-white flex items-center justify-center hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl"
            >
              <IconPlus className="w-6 h-6" />
            </button>
            {showPlus && (
              <div className="absolute right-0 top-14 bg-white rounded-xl shadow-xl border py-2 w-48 z-50 animate-slide-in">
                <button
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3"
                  onClick={() => { setShowJoin(true); setShowPlus(false); setError(""); }}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                  Join class
                </button>
                <button
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3"
                  onClick={() => { setShowCreate(true); setShowPlus(false); setError(""); }}
                >
                  <IconPlus className="w-5 h-5 text-gray-500" />
                  Create class
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20">
            <IconGraduation className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg text-gray-500 mb-2">No classes yet</h3>
            <p className="text-gray-400 mb-6">Create a class to get started or join one with a class code</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setShowCreate(true); setError(""); }}
                className="px-6 py-2.5 bg-classroom-blue text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <IconPlus className="w-5 h-5" />
                Create a class
              </button>
              <button
                onClick={() => { setShowJoin(true); setError(""); }}
                className="px-6 py-2.5 border border-classroom-blue text-classroom-blue rounded-full hover:bg-blue-50 transition-colors"
              >
                Join a class
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onClick={() => {
                  window.location.href = `/class/${cls.id}`;
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create class">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class name (required)</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              placeholder="e.g. Mathematics 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              placeholder="e.g. Period 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              placeholder="e.g. 203"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-classroom-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Class Modal */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join class">
        <form onSubmit={handleJoin} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <p className="text-sm text-gray-500">
            Ask your teacher for the class code, then enter it here.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none text-lg tracking-wider"
              placeholder="e.g. abc1234"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowJoin(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-classroom-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
