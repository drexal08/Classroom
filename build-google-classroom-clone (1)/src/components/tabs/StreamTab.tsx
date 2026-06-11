"use client";

import { useState, useEffect } from "react";
import { Avatar } from "../Avatar";
import { useAuth } from "../AuthProvider";
import { CommentSection } from "../CommentSection";
import { IconChat, IconEye, IconEyeOff, IconGraduation } from "../Icons";
import { apiGet, apiPost } from "@/lib/api";

interface ClassInfo {
  id: string;
  name: string;
  section: string | null;
  subject: string | null;
  code: string;
  themeColor: string;
  teacherName: string;
}

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorColor: string;
}

export function StreamTab({
  classInfo,
  role,
}: {
  classInfo: ClassInfo;
  role: string;
}) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAnnouncements();
  }, [classInfo.id]);

  const fetchAnnouncements = async () => {
    const res = await apiGet(`/api/classes/${classInfo.id}/announcements`);
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data.announcements);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    const res = await apiPost(`/api/classes/${classInfo.id}/announcements`, { content });
    if (res.ok) {
      setContent("");
      setShowInput(false);
      fetchAnnouncements();
    }
    setPosting(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Banner */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ backgroundColor: classInfo.themeColor }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-medium text-white">{classInfo.name}</h1>
          {classInfo.section && (
            <p className="text-white/80 mt-1">{classInfo.section}</p>
          )}
        </div>
        <div className="absolute right-4 bottom-4 opacity-10">
          <IconGraduation className="w-32 h-32 text-white" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar */}
        <div className="hidden md:block w-52 shrink-0 space-y-4">
          {role === "teacher" && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Class code</h3>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  {showCode ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                </button>
              </div>
              {showCode ? (
                <p
                  className="text-2xl font-mono font-bold tracking-wider"
                  style={{ color: classInfo.themeColor }}
                >
                  {classInfo.code}
                </p>
              ) : (
                <p className="text-2xl font-mono tracking-wider text-gray-300">•••••••</p>
              )}
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Upcoming</h3>
            <p className="text-sm text-gray-400">No work due soon</p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Post input */}
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-sm transition-shadow flex items-center gap-3"
            >
              <Avatar name={user?.name || "?"} color={user?.avatarColor || "#ccc"} />
              <span className="text-gray-400">Announce something to your class...</span>
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-4 animate-fade-in">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Announce something to your class..."
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none resize-none min-h-[100px]"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => { setShowInput(false); setContent(""); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!content.trim() || posting}
                  className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: classInfo.themeColor }}
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          )}

          {/* Announcements */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>This is where you can talk to your class. Post announcements, assignments, or questions.</p>
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-gray-200 animate-fade-in"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={a.authorName} color={a.authorColor} />
                    <div>
                      <p className="font-medium text-sm">{a.authorName}</p>
                      <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                </div>

                {/* Comments */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [a.id]: !prev[a.id],
                      }))
                    }
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2 rounded-b-xl"
                  >
                    <IconChat className="w-4 h-4" />
                    Add class comment
                  </button>
                  {expandedComments[a.id] && (
                    <CommentSection announcementId={a.id} themeColor={classInfo.themeColor} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
