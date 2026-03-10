import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrdersByUserId } from "@/lib/db";

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const { userId, productType } = await request.json();

    if (!userId || !productType) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    if (productType !== 'monthly' && productType !== 'yearly') {
      return NextResponse.json({ error: "无效的产品类型" }, { status: 400 });
    }

    const order = await createOrder(userId, productType);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNo: order.order_no,
        productType: order.product_type,
        amount: order.amount,
        status: order.status,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}

// 获取用户订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    const orders = await getOrdersByUserId(parseInt(userId));

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        orderNo: o.order_no,
        productType: o.product_type,
        amount: o.amount,
        status: o.status,
        createdAt: o.created_at,
        paidAt: o.paid_at,
        confirmedAt: o.confirmed_at,
      })),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
  }
}
