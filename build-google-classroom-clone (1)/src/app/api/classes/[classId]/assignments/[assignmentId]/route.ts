import { db } from "@/db";
import { assignments, enrollments, submissions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string; assignmentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, assignmentId } = await params;

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      type: assignments.type,
      points: assignments.points,
      dueDate: assignments.dueDate,
      topicId: assignments.topicId,
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
      authorName: users.name,
      authorColor: users.avatarColor,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.authorId, users.id))
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = enrollment[0].role;

  // If student, get their submission
  let submission = null;
  if (role === "student") {
    const [sub] = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.assignmentId, assignmentId),
          eq(submissions.studentId, user.id)
        )
      )
      .limit(1);
    submission = sub || null;
  }

  // If teacher, get all submissions
  let allSubmissions: Array<{
    id: string;
    content: string | null;
    status: string;
    grade: number | null;
    feedback: string | null;
    turnedInAt: Date | null;
    studentName: string;
    studentId: string;
    studentColor: string;
  }> = [];
  if (role === "teacher") {
    allSubmissions = await db
      .select({
        id: submissions.id,
        content: submissions.content,
        status: submissions.status,
        grade: submissions.grade,
        feedback: submissions.feedback,
        turnedInAt: submissions.turnedInAt,
        studentName: users.name,
        studentId: submissions.studentId,
        studentColor: users.avatarColor,
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.studentId, users.id))
      .where(eq(submissions.assignmentId, assignmentId));
  }

  return NextResponse.json({ assignment, role, submission, submissions: allSubmissions });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ classId: string; assignmentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, assignmentId } = await params;

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0 || enrollment[0].role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.points !== undefined) updateData.points = body.points ? parseInt(body.points as string) : null;
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate as string) : null;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(assignments)
    .set(updateData)
    .where(eq(assignments.id, assignmentId))
    .returning();

  return NextResponse.json({ assignment: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classId: string; assignmentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, assignmentId } = await params;

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0 || enrollment[0].role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(assignments).where(eq(assignments.id, assignmentId));
  return NextResponse.json({ success: true });
}
