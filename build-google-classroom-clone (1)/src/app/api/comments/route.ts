import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq, desc, or, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const announcementId = searchParams.get("announcementId");
  const assignmentId = searchParams.get("assignmentId");
  const submissionId = searchParams.get("submissionId");

  let condition;
  if (announcementId) condition = eq(comments.announcementId, announcementId);
  else if (assignmentId) condition = eq(comments.assignmentId, assignmentId);
  else if (submissionId) condition = eq(comments.submissionId, submissionId);
  else return NextResponse.json({ error: "Missing filter" }, { status: 400 });

  const result = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorColor: users.avatarColor,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(condition)
    .orderBy(comments.createdAt);

  return NextResponse.json({ comments: result });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, announcementId, assignmentId, submissionId } = body;

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const [comment] = await db
    .insert(comments)
    .values({
      authorId: user.id,
      content,
      announcementId: announcementId || null,
      assignmentId: assignmentId || null,
      submissionId: submissionId || null,
    })
    .returning();

  return NextResponse.json({
    comment: { ...comment, authorName: user.name, authorColor: user.avatarColor },
  });
}
