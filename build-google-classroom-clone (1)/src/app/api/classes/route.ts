import { db } from "@/db";
import { classes, enrollments, users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { generateClassCode } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get classes where user is teacher or enrolled
  const teacherClasses = await db
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
      role: enrollments.role,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(users, eq(classes.teacherId, users.id))
    .where(eq(enrollments.userId, user.id));

  return NextResponse.json({ classes: teacherClasses });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, section, subject, room } = await req.json();
  if (!name) return NextResponse.json({ error: "Class name required" }, { status: 400 });

  const THEME_COLORS = ["#1967D2", "#1E8E3E", "#E8710A", "#D93025", "#9334E6", "#185ABC"];
  const themeColor = THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)];

  const code = generateClassCode();

  const [newClass] = await db
    .insert(classes)
    .values({
      name,
      section: section || null,
      subject: subject || null,
      room: room || null,
      code,
      themeColor,
      teacherId: user.id,
    })
    .returning();

  // Auto-enroll teacher
  await db.insert(enrollments).values({
    classId: newClass.id,
    userId: user.id,
    role: "teacher",
  });

  return NextResponse.json({ class: newClass });
}
