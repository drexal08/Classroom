import { db } from "@/db";
import { classes, enrollments, users } from "@/db/schema";
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

  const [cls] = await db
    .select({
      id: classes.id,
      name: classes.name,
      section: classes.section,
      subject: classes.subject,
      room: classes.room,
      code: classes.code,
      themeColor: classes.themeColor,
      teacherId: classes.teacherId,
      archived: classes.archived,
      createdAt: classes.createdAt,
      teacherName: users.name,
    })
    .from(classes)
    .innerJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classes.id, classId))
    .limit(1);

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  return NextResponse.json({
    class: cls,
    role: enrollment[0].role,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;
  const body = await req.json();

  // Only teacher can update
  const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!cls || cls.teacherId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.section !== undefined) updateData.section = body.section;
  if (body.subject !== undefined) updateData.subject = body.subject;
  if (body.room !== undefined) updateData.room = body.room;
  if (body.archived !== undefined) updateData.archived = body.archived;

  const [updated] = await db
    .update(classes)
    .set(updateData)
    .where(eq(classes.id, classId))
    .returning();

  return NextResponse.json({ class: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!cls || cls.teacherId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(classes).where(eq(classes.id, classId));
  return NextResponse.json({ success: true });
}
