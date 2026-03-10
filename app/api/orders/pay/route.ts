import { NextRequest, NextResponse } from "next/server";
import { getOrderByNo, updateOrderStatus } from "@/lib/db";

// 用户提交支付凭证
export async function POST(request: NextRequest) {
  try {
    const { orderNo, paymentProof } = await request.json();

    if (!orderNo || !paymentProof) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const order = await getOrderByNo(orderNo);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: "订单状态不允许支付" }, { status: 400 });
    }

    // 更新订单状态为已支付
    const updatedOrder = await updateOrderStatus(order.id, 'paid', {
      payment_proof: paymentProof,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder?.id,
        orderNo: updatedOrder?.order_no,
        status: updatedOrder?.status,
        paidAt: updatedOrder?.paid_at,
      },
    });
  } catch (error) {
    console.error("Pay order error:", error);
    return NextResponse.json({ error: "提交支付失败" }, { status: 500 });
  }
}
