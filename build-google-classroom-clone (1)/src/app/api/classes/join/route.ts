import { db } from "@/db";
import { classes, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Class code required" }, { status: 400 });

  const [cls] = await db.select().from(classes).where(eq(classes.code, code.toLowerCase().trim())).limit(1);
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Check if already enrolled
  const existing = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, cls.id), eq(enrollments.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Already enrolled in this class" }, { status: 400 });
  }

  await db.insert(enrollments).values({
    classId: cls.id,
    userId: user.id,
    role: "student",
  });

  return NextResponse.json({ class: cls });
}
