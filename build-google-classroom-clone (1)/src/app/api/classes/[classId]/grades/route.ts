import { db } from "@/db";
import { assignments, submissions, enrollments, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const role = enrollment[0].role;

  // Get all assignments for this class
  const assignmentList = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      points: assignments.points,
      dueDate: assignments.dueDate,
      type: assignments.type,
    })
    .from(assignments)
    .where(eq(assignments.classId, classId));

  if (role === "student") {
    // Get student's submissions
    const subs = await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, user.id));

    const grades = assignmentList.map((a) => {
      const sub = subs.find((s) => s.assignmentId === a.id);
      return {
        assignment: a,
        submission: sub || null,
      };
    });

    return NextResponse.json({ grades, role });
  }

  // Teacher: get all students and their submissions
  const students = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarColor: users.avatarColor,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(enrollments.classId, classId), eq(enrollments.role, "student")));

  const allSubs = await db
    .select()
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .where(eq(assignments.classId, classId));

  return NextResponse.json({
    assignments: assignmentList,
    students,
    submissions: allSubs,
    role,
  });
}
