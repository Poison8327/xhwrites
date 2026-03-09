import { NextRequest, NextResponse } from "next/server";
import { 
  getAllOrders, 
  getOrderStats, 
  updateOrderStatus, 
  getOrderById,
  setMember,
  getUserById 
} from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "xhwrites2024";

// 获取所有订单
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const status = searchParams.get("status");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    const orders = await getAllOrders(status || undefined);

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        orderNo: o.order_no,
        userId: o.user_id,
        userEmail: o.user_email,
        productType: o.product_type,
        amount: o.amount,
        status: o.status,
        paymentProof: o.payment_proof,
        adminRemark: o.admin_remark,
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

// 确认订单（开通会员）
export async function POST(request: NextRequest) {
  try {
    const { adminPassword, orderId, action, remark } = await request.json();

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (action === 'confirm') {
      // 确认订单
      if (order.status !== 'paid') {
        return NextResponse.json({ error: "订单未支付" }, { status: 400 });
      }

      // 计算会员到期时间
      const days = order.product_type === 'monthly' ? 30 : 365;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      // 开通会员
      await setMember(order.user_id, expiryDate);

      // 更新订单状态
      const updatedOrder = await updateOrderStatus(orderId, 'confirmed', {
        admin_remark: remark,
      });

      // 获取用户信息
      const user = await getUserById(order.user_id);

      return NextResponse.json({
        success: true,
        order: {
          id: updatedOrder?.id,
          orderNo: updatedOrder?.order_no,
          status: updatedOrder?.status,
          confirmedAt: updatedOrder?.confirmed_at,
        },
        user: user ? {
          id: user.id,
          email: user.email,
          isMember: user.is_member,
          memberExpiry: user.member_expiry,
        } : null,
      });
    } else if (action === 'cancel') {
      // 取消订单
      const updatedOrder = await updateOrderStatus(orderId, 'cancelled', {
        admin_remark: remark,
      });

      return NextResponse.json({
        success: true,
        order: {
          id: updatedOrder?.id,
          orderNo: updatedOrder?.order_no,
          status: updatedOrder?.status,
        },
      });
    } else {
      return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }
  } catch (error) {
    console.error("Confirm order error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

// 获取订单统计
export async function PUT(request: NextRequest) {
  try {
    const { adminPassword } = await request.json();

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "管理员密码错误" }, { status: 401 });
    }

    const stats = await getOrderStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Get order stats error:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
