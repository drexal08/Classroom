import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateToken, randomAvatarColor } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarColor = randomAvatarColor();

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, avatarColor })
      .returning();

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      path: "/",
      expires: expiresAt,
      sameSite: "lax",
    });

    return response;
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
