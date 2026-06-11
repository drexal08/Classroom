import { db } from "@/db";
import { announcements, enrollments, users } from "@/db/schema";
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

  const posts = await db
    .select({
      id: announcements.id,
      content: announcements.content,
      createdAt: announcements.createdAt,
      authorId: announcements.authorId,
      authorName: users.name,
      authorColor: users.avatarColor,
    })
    .from(announcements)
    .innerJoin(users, eq(announcements.authorId, users.id))
    .where(eq(announcements.classId, classId))
    .orderBy(desc(announcements.createdAt));

  return NextResponse.json({ announcements: posts });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;
  const { content } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, classId), eq(enrollments.userId, user.id)))
    .limit(1);

  if (enrollment.length === 0) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const [post] = await db
    .insert(announcements)
    .values({
      classId,
      authorId: user.id,
      content,
    })
    .returning();

  return NextResponse.json({ announcement: { ...post, authorName: user.name, authorColor: user.avatarColor } });
}
