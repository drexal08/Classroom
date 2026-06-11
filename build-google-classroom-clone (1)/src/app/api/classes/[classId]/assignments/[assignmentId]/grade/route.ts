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

  const { classId } = await params;
  const { submissionId, grade, feedback, action } = await req.json();

  // Check teacher role
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0 || enrollment[0].role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "return") {
    const [updated] = await db
      .update(submissions)
      .set({
        grade: grade !== undefined && grade !== null && grade !== "" ? parseInt(grade as string) : null,
        feedback: feedback || null,
        status: "returned",
        returnedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId))
      .returning();
    return NextResponse.json({ submission: updated });
  }

  if (action === "grade") {
    const [updated] = await db
      .update(submissions)
      .set({
        grade: grade !== undefined && grade !== null && grade !== "" ? parseInt(grade as string) : null,
        feedback: feedback || null,
        status: "graded",
      })
      .where(eq(submissions.id, submissionId))
      .returning();
    return NextResponse.json({ submission: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
