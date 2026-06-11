"use client";

import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { IconClipboard, IconQuiz, IconBook, IconQuestion, IconFolder, IconPlus } from "../Icons";
import { apiGet, apiPost } from "@/lib/api";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  type: string;
  points: number | null;
  dueDate: string | null;
  topicId: string | null;
  createdAt: string;
  authorName: string;
}

interface Topic {
  id: string;
  name: string;
  classId: string;
  sortOrder: number;
}

export function ClassworkTab({
  classId,
  role,
  themeColor,
}: {
  classId: string;
  role: string;
  themeColor: string;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showTopic, setShowTopic] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("assignment");
  const [points, setPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    const res = await apiGet(`/api/classes/${classId}/assignments`);
    if (res.ok) {
      const data = await res.json();
      setAssignments(data.assignments);
      setTopics(data.topics);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await apiPost(`/api/classes/${classId}/assignments`, { 
      title, description, type, points: points || null, dueDate: dueDate || null, topicId: topicId || null 
    });
    if (res.ok) {
      setShowCreate(false);
      resetForm();
      fetchAssignments();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiPost(`/api/classes/${classId}/topics`, { name: topicName });
    if (res.ok) {
      setShowTopic(false);
      setTopicName("");
      fetchAssignments();
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("assignment");
    setPoints("");
    setDueDate("");
    setTopicId("");
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "assignment":
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
            <IconClipboard className="w-5 h-5" />
          </div>
        );
      case "quiz":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <IconQuiz className="w-5 h-5" />
          </div>
        );
      case "material":
        return (
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
            <IconBook className="w-5 h-5" />
          </div>
        );
      case "question":
        return (
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
            <IconQuestion className="w-5 h-5" />
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  // Group assignments by topic
  const noTopic = assignments.filter((a) => !a.topicId);
  const grouped = topics.map((t) => ({
    topic: t,
    items: assignments.filter((a) => a.topicId === t.id),
  }));

  return (
    <div>
      {role === "teacher" && (
        <div className="flex justify-end mb-4 relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-5 py-2.5 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            <IconPlus className="w-4 h-4" />
            Create
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border py-2 w-56 z-50 animate-slide-in">
              {[
                { id: "assignment", label: "Assignment", icon: <IconClipboard className="w-5 h-5" /> },
                { id: "quiz", label: "Quiz", icon: <IconQuiz className="w-5 h-5" /> },
                { id: "question", label: "Question", icon: <IconQuestion className="w-5 h-5" /> },
                { id: "material", label: "Material", icon: <IconBook className="w-5 h-5" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3"
                  onClick={() => {
                    setType(t.id);
                    setShowCreate(true);
                    setShowMenu(false);
                    setError("");
                  }}
                >
                  <span className="text-gray-500">{t.icon}</span>
                  {t.label}
                </button>
              ))}
              <hr className="my-1" />
              <button
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3"
                onClick={() => { setShowTopic(true); setShowMenu(false); }}
              >
                <IconFolder className="w-5 h-5 text-gray-500" />
                Topic
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <IconClipboard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No classwork yet</p>
          {role === "teacher" && <p className="text-sm mt-1">Click &quot;+ Create&quot; to add assignments</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {noTopic.length > 0 && (
            <div className="space-y-2">
              {noTopic.map((a) => (
                <a
                  key={a.id}
                  href={`/class/${classId}/assignment/${a.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  {getTypeIcon(a.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(a.dueDate)}
                      {a.points ? ` • ${a.points} points` : ""}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {grouped
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <div key={g.topic.id}>
                <h3
                  className="text-lg font-medium pb-2 mb-3 border-b-2"
                  style={{ color: themeColor, borderColor: themeColor }}
                >
                  {g.topic.name}
                </h3>
                <div className="space-y-2">
                  {g.items.map((a) => (
                    <a
                      key={a.id}
                      href={`/class/${classId}/assignment/${a.id}`}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      {getTypeIcon(a.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(a.dueDate)}
                          {a.points ? ` • ${a.points} points` : ""}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={`Create ${type}`} maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none resize-none min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Ungraded"
                min="0"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              />
            </div>
          </div>
          {topics.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
              >
                <option value="">No topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowCreate(false); resetForm(); }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Topic Modal */}
      <Modal open={showTopic} onClose={() => setShowTopic(false)} title="Create topic">
        <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic name</label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowTopic(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
