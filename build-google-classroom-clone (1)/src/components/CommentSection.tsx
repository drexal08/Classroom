"use client";

import { useState, useEffect } from "react";
import { Avatar } from "./Avatar";
import { useAuth } from "./AuthProvider";
import { IconSend } from "./Icons";
import { apiGet, apiPost } from "@/lib/api";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorColor: string;
}

export function CommentSection({
  announcementId,
  assignmentId,
  submissionId,
  themeColor = "#1967D2",
}: {
  announcementId?: string;
  assignmentId?: string;
  submissionId?: string;
  themeColor?: string;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [announcementId, assignmentId, submissionId]);

  const fetchComments = async () => {
    let query = "";
    if (announcementId) query = `announcementId=${announcementId}`;
    else if (assignmentId) query = `assignmentId=${assignmentId}`;
    else if (submissionId) query = `submissionId=${submissionId}`;

    const res = await apiGet(`/api/comments?${query}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    const res = await apiPost("/api/comments", {
      content: newComment,
      announcementId: announcementId || null,
      assignmentId: assignmentId || null,
      submissionId: submissionId || null,
    });
    if (res.ok) {
      setNewComment("");
      fetchComments();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="px-4 pb-3 space-y-3">
      {loading ? (
        <div className="py-2 text-center text-sm text-gray-400">Loading...</div>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex gap-2 animate-fade-in">
            <Avatar name={c.authorName} color={c.authorColor} size="sm" />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{c.authorName}</span>
                <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          </div>
        ))
      )}

      <div className="flex items-center gap-2 pt-1">
        <Avatar name={user?.name || "?"} color={user?.avatarColor || "#ccc"} size="sm" />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Add class comment..."
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-classroom-blue focus:border-transparent outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="p-2 rounded-full transition-colors disabled:opacity-30"
          style={{ color: themeColor }}
        >
          <IconSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
