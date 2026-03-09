import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, initDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// 初始化数据库（首次请求时自动创建表）
let dbInitialized = false;

export async function POST(request: NextRequest) {
  try {
    // 初始化数据库表
    if (!dbInitialized) {
      await initDatabase();
      dbInitialized = true;
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少需要6个字符" }, { status: 400 });
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const newUser = await createUser(email, hashedPassword);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        isMember: newUser.is_member,
        memberExpiry: newUser.member_expiry,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
