import { NextRequest, NextResponse } from "next/server";
import { getUserById, setMember } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "xhwrites2024";

export async function POST(request: NextRequest) {
  try {
    const { adminPassword, userId, days } = await request.json();

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    const userIdNum = parseInt(userId);
    const user = await getUserById(userIdNum);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 计算会员到期时间
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const updatedUser = await setMember(userIdNum, expiryDate);

    if (!updatedUser) {
      return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isMember: updatedUser.is_member,
        memberExpiry: updatedUser.member_expiry,
      },
    });
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json({ error: "开通会员失败" }, { status: 500 });
  }
}
