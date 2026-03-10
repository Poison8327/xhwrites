import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, initDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

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

    // 查找用户
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isMember: user.is_member,
        memberExpiry: user.member_expiry,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
