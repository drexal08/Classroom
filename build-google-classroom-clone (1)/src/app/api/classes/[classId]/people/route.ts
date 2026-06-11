import { db } from "@/db";
import { enrollments, users } from "@/db/schema";
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

  // Check enrollment
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const people = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarColor: users.avatarColor,
      role: enrollments.role,
      joinedAt: enrollments.joinedAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.classId, classId));

  const teachers = people.filter((p) => p.role === "teacher");
  const students = people.filter((p) => p.role === "student");

  return NextResponse.json({ teachers, students });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;
  const { userId } = await req.json();

  // Only teacher or self can remove
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  if (enrollment[0].role !== "teacher" && user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .delete(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, userId)));

  return NextResponse.json({ success: true });
}
