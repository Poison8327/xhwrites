# 订单系统更新说明

## ✅ 已完成的工作

### 1. 数据库层
- **文件**: `scripts/init-db.ts`
- **更新**: 添加了订单表结构
- **字段**:
  - id: 订单ID
  - order_no: 订单号（唯一）
  - user_id: 用户ID（外键）
  - product_type: 产品类型（monthly/yearly）
  - amount: 金额
  - status: 状态（pending/paid/confirmed/cancelled）
  - payment_proof: 支付凭证
  - admin_remark: 管理员备注
  - created_at, paid_at, confirmed_at: 时间戳

### 2. 数据库操作库
- **文件**: `lib/db.ts`
- **新增函数**:
  - `generateOrderNo()` - 生成订单号
  - `createOrder()` - 创建订单
  - `getOrderByNo()` - 通过订单号查询
  - `getOrderById()` - 通过ID查询
  - `getOrdersByUserId()` - 获取用户订单
  - `getAllOrders()` - 获取所有订单（管理员）
  - `updateOrderStatus()` - 更新订单状态
  - `getOrderStats()` - 获取订单统计

### 3. API 接口

#### 用户接口
- **`/api/orders` (POST)** - 创建订单
  - 参数: userId, productType
  - 返回: 订单信息

- **`/api/orders` (GET)** - 获取用户订单
  - 参数: userId
  - 返回: 订单列表

- **`/api/orders/pay` (POST)** - 提交支付凭证
  - 参数: orderNo, paymentProof
  - 返回: 更新后的订单信息

#### 管理员接口
- **`/api/admin/orders` (GET)** - 获取所有订单
  - 参数: password, status（可选）
  - 返回: 订单列表（含用户邮箱）

- **`/api/admin/orders` (POST)** - 确认/取消订单
  - 参数: adminPassword, orderId, action, remark
  - action: confirm（确认并开通会员）或 cancel（取消订单）
  - 返回: 更新后的订单和用户信息

- **`/api/admin/orders` (PUT)** - 获取订单统计
  - 参数: adminPassword
  - 返回: 订单统计数据

### 4. 前端组件
- **文件**: `app/components/OrderModals.tsx`
- **功能**:
  - 支付弹窗（选择套餐、创建订单、提交支付凭证）
  - 订单列表弹窗（查看用户订单历史）

## 📝 需要手动完成的工作

### 1. 初始化数据库
```bash
cd C:\Users\Administrator\.openclaw\workspace\projects\xhwrites
npm run db:init
```

### 2. 更新主页 (`app/page.tsx`)

在文件开头添加导入:
```tsx
import { FileText } from "lucide-react";
import { OrderModals } from "./components/OrderModals";
```

在组件中添加状态:
```tsx
const [showOrders, setShowOrders] = useState(false);
const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
const [paymentProof, setPaymentProof] = useState("");
const [userOrders, setUserOrders] = useState<Order[]>([]);
```

添加订单相关函数（在 `handleCopy` 函数后添加）:
```tsx
// 创建订单
const handleCreateOrder = async () => {
  if (!user) {
    alert("请先登录");
    setShowAuth(true);
    setShowPayment(false);
    return;
  }
  setLoading(true);
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, productType: selectedPlan }),
    });
    const data = await response.json();
    if (data.error) alert(data.error);
    else {
      setCurrentOrder(data.order);
      alert(`订单创建成功！订单号：${data.order.orderNo}`);
    }
  } catch (error) {
    alert("创建订单失败");
  } finally {
    setLoading(false);
  }
};

// 提交支付凭证
const handleSubmitPayment = async () => {
  if (!currentOrder || !paymentProof.trim()) {
    alert("请填写支付凭证");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch("/api/orders/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNo: currentOrder.orderNo,
        paymentProof: paymentProof.trim()
      }),
    });
    const data = await response.json();
    if (data.error) alert(data.error);
    else {
      alert("支付凭证已提交，请等待管理员确认");
      setCurrentOrder(null);
      setPaymentProof("");
      setShowPayment(false);
    }
  } catch (error) {
    alert("提交失败");
  } finally {
    setLoading(false);
  }
};

// 获取用户订单
const handleGetOrders = async () => {
  if (!user) return;
  setLoading(true);
  try {
    const response = await fetch(`/api/orders?userId=${user.id}`);
    const data = await response.json();
    if (data.orders) {
      setUserOrders(data.orders);
      setShowOrders(true);
    }
  } catch (error) {
    alert("获取订单失败");
  } finally {
    setLoading(false);
  }
};
```

在用户信息区域添加"我的订单"按钮:
```tsx
<button onClick={handleGetOrders} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
  <FileText className="w-4 h-4" />我的订单
</button>
```

在 `</main>` 标签前添加订单弹窗组件:
```tsx
<OrderModals
  showPayment={showPayment}
  setShowPayment={setShowPayment}
  showOrders={showOrders}
  setShowOrders={setShowOrders}
  selectedPlan={selectedPlan}
  setSelectedPlan={setSelectedPlan}
  currentOrder={currentOrder}
  setCurrentOrder={setCurrentOrder}
  paymentProof={paymentProof}
  setPaymentProof={setPaymentProof}
  userOrders={userOrders}
  loading={loading}
  onCreateOrder={handleCreateOrder}
  onSubmitPayment={handleSubmitPayment}
/>
```

### 3. 更新管理后台 (`app/admin/page.tsx`)

添加订单管理标签页和表格（参考 `orders-tab.tsx` 文件中的代码）

## 🔄 支付流程

### 用户端流程
1. 用户点击"升级会员"
2. 选择套餐（月度/年度）
3. 点击"创建订单"
4. 填写支付凭证（交易单号/截图链接）
5. 提交支付凭证
6. 等待管理员确认

### 管理员端流程
1. 查看订单列表
2. 筛选"待确认"状态的订单
3. 核实支付凭证
4. 点击"确认"按钮
5. 系统自动开通会员
6. 用户收到会员开通通知

## 📊 订单状态说明

- **pending**: 待支付 - 订单已创建，等待用户支付
- **paid**: 已支付，待确认 - 用户已提交支付凭证，等待管理员确认
- **confirmed**: 已确认 - 管理员已确认，会员已开通
- **cancelled**: 已取消 - 订单已取消

## 🎯 下一步

1. 运行 `npm run db:init` 初始化数据库
2. 手动更新 `app/page.tsx` 和 `app/admin/page.tsx`
3. 测试完整流程
4. 部署到生产环境

## 📝 注意事项

- 订单号格式：XH + 时间戳 + 随机字符（如：XHABC123XYZ）
- 支付凭证可以是交易单号或截图链接
- 管理员确认订单后会自动开通会员
- 订单创建后30分钟未支付会自动取消（需要添加定时任务）

---

**创建时间**: 2026-03-09 12:45
**创建者**: 2B (AI 金融分析师)
