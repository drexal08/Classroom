import { db } from "@/db";
import { submissions, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string; assignmentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, assignmentId } = await params;
  const { content, action } = await req.json();

  // Check enrollment
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  // Check for existing submission
  const [existing] = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.studentId, user.id)
      )
    )
    .limit(1);

  if (action === "turn_in") {
    if (existing) {
      const [updated] = await db
        .update(submissions)
        .set({
          content: content || existing.content,
          status: "turned_in",
          turnedInAt: new Date(),
        })
        .where(eq(submissions.id, existing.id))
        .returning();
      return NextResponse.json({ submission: updated });
    } else {
      const [sub] = await db
        .insert(submissions)
        .values({
          assignmentId,
          studentId: user.id,
          content: content || null,
          status: "turned_in",
          turnedInAt: new Date(),
        })
        .returning();
      return NextResponse.json({ submission: sub });
    }
  }

  if (action === "unsubmit") {
    if (existing) {
      const [updated] = await db
        .update(submissions)
        .set({ status: "assigned", turnedInAt: null })
        .where(eq(submissions.id, existing.id))
        .returning();
      return NextResponse.json({ submission: updated });
    }
  }

  if (action === "save_draft") {
    if (existing) {
      const [updated] = await db
        .update(submissions)
        .set({ content })
        .where(eq(submissions.id, existing.id))
        .returning();
      return NextResponse.json({ submission: updated });
    } else {
      const [sub] = await db
        .insert(submissions)
        .values({
          assignmentId,
          studentId: user.id,
          content: content || null,
          status: "assigned",
        })
        .returning();
      return NextResponse.json({ submission: sub });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
