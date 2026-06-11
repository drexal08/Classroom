"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { AuthPage } from "@/components/AuthPage";
import { AssignmentView } from "@/components/AssignmentView";
import { use } from "react";

function AssignmentContent({
  classId,
  assignmentId,
}: {
  classId: string;
  assignmentId: string;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <AssignmentView classId={classId} assignmentId={assignmentId} />;
}

export default function AssignmentPage({
  params,
}: {
  params: Promise<{ classId: string; assignmentId: string }>;
}) {
  const { classId, assignmentId } = use(params);
  return (
    <AuthProvider>
      <AssignmentContent classId={classId} assignmentId={assignmentId} />
    </AuthProvider>
  );
}
