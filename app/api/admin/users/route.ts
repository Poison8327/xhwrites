import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, deleteUser } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "xhwrites2024";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    const users = await getAllUsers();

    // 返回用户列表（不包含密码）
    const safeUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      isMember: user.is_member,
      memberExpiry: user.member_expiry,
      createdAt: user.created_at,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const userId = searchParams.get("userId");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    const success = await deleteUser(parseInt(userId));

    if (!success) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "删除用户失败" }, { status: 500 });
  }
}
