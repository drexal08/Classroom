"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { AuthPage } from "@/components/AuthPage";
import { ClassView } from "@/components/ClassView";
import { use } from "react";

function ClassContent({ classId }: { classId: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-classroom-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <ClassView classId={classId} />;
}

export default function ClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params);
  return (
    <AuthProvider>
      <ClassContent classId={classId} />
    </AuthProvider>
  );
}
