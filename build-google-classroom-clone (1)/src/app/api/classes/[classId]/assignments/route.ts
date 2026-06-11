import { db } from "@/db";
import { assignments, enrollments, topics, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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

  const assignmentList = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      type: assignments.type,
      points: assignments.points,
      dueDate: assignments.dueDate,
      topicId: assignments.topicId,
      createdAt: assignments.createdAt,
      authorName: users.name,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.authorId, users.id))
    .where(eq(assignments.classId, classId))
    .orderBy(desc(assignments.createdAt));

  const topicList = await db
    .select()
    .from(topics)
    .where(eq(topics.classId, classId))
    .orderBy(topics.sortOrder);

  return NextResponse.json({ assignments: assignmentList, topics: topicList, role: enrollment[0].role });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  // Only teacher can create
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0 || enrollment[0].role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, type, points, dueDate, topicId } = body;

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const [assignment] = await db
    .insert(assignments)
    .values({
      classId,
      authorId: user.id,
      title,
      description: description || null,
      type: type || "assignment",
      points: points ? parseInt(points) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      topicId: topicId || null,
    })
    .returning();

  return NextResponse.json({ assignment });
}
