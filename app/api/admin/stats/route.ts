import { NextRequest, NextResponse } from "next/server";
import { getStats } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "xhwrites2024";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
