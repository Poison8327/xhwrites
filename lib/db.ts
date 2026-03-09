import { neon } from '@neondatabase/serverless';

// Neon 数据库连接
const getSql = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }
  return neon(connectionString);
};

// 用户数据结构
export interface User {
  id: number;
  email: string;
  password: string;
  is_member: boolean;
  member_expiry: Date | null;
  created_at: Date;
  updated_at: Date;
}

// 初始化数据库表
export async function initDatabase(): Promise<void> {
  const sql = getSql();
  
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      is_member BOOLEAN DEFAULT FALSE,
      member_expiry TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // 创建索引
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_member ON users(is_member, member_expiry)`;
  
  // 创建订单表
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_no VARCHAR(50) NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      product_type VARCHAR(20) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(50),
      payment_proof TEXT,
      admin_remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      paid_at TIMESTAMP NULL,
      confirmed_at TIMESTAMP NULL,
      confirmed_by INTEGER
    )
  `;
  
  // 创建订单索引
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
  
  console.log('✅ 数据库表初始化成功');
}

// 创建用户
export async function createUser(email: string, hashedPassword: string): Promise<User> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (email, password) 
    VALUES (${email.toLowerCase()}, ${hashedPassword})
    RETURNING *
  `;
  return rows[0] as User;
}

// 通过 ID 获取用户
export async function getUserById(id: number): Promise<User | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return (rows[0] as User) || null;
}

// 通过邮箱获取用户
export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
  return (rows[0] as User) || null;
}

// 更新用户
export async function updateUser(id: number, data: Partial<User>): Promise<User | null> {
  const sql = getSql();
  
  if (data.email !== undefined) {
    await sql`UPDATE users SET email = ${data.email.toLowerCase()}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  }
  if (data.password !== undefined) {
    await sql`UPDATE users SET password = ${data.password}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  }
  if (data.is_member !== undefined) {
    await sql`UPDATE users SET is_member = ${data.is_member}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  }
  if (data.member_expiry !== undefined) {
    await sql`UPDATE users SET member_expiry = ${data.member_expiry}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  }
  
  return getUserById(id);
}

// 获取所有用户
export async function getAllUsers(): Promise<User[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM users ORDER BY created_at DESC`;
  return rows as User[];
}

// 删除用户
export async function deleteUser(id: number): Promise<boolean> {
  const sql = getSql();
  const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// 获取统计信息
export async function getStats(): Promise<{
  totalUsers: number;
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newUsersToday: number;
}> {
  const sql = getSql();
  const rows = await sql`
    SELECT 
      COUNT(*) as "totalUsers",
      SUM(CASE WHEN is_member = TRUE THEN 1 ELSE 0 END) as "totalMembers",
      SUM(CASE WHEN is_member = TRUE AND member_expiry > NOW() THEN 1 ELSE 0 END) as "activeMembers",
      SUM(CASE WHEN is_member = TRUE AND member_expiry <= NOW() THEN 1 ELSE 0 END) as "expiredMembers",
      SUM(CASE WHEN created_at >= CURRENT_DATE THEN 1 ELSE 0 END) as "newUsersToday"
    FROM users
  `;

  const stats = rows[0];
  return {
    totalUsers: Number(stats.totalUsers) || 0,
    totalMembers: Number(stats.totalMembers) || 0,
    activeMembers: Number(stats.activeMembers) || 0,
    expiredMembers: Number(stats.expiredMembers) || 0,
    newUsersToday: Number(stats.newUsersToday) || 0,
  };
}

// 设置会员
export async function setMember(id: number, expiryDate: Date): Promise<User | null> {
  return updateUser(id, {
    is_member: true,
    member_expiry: expiryDate,
  });
}

// 取消会员
export async function cancelMember(id: number): Promise<User | null> {
  return updateUser(id, {
    is_member: false,
    member_expiry: null,
  });
}

// ==================== 订单相关 ====================

// 订单数据结构
export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  product_type: 'monthly' | 'yearly';
  amount: number;
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled';
  payment_method: string;
  payment_proof: string | null;
  admin_remark: string | null;
  created_at: Date;
  paid_at: Date | null;
  confirmed_at: Date | null;
  confirmed_by: number | null;
}

// 订单详情（包含用户信息）
export interface OrderWithUser extends Order {
  user_email: string;
}

// 生成订单号
export function generateOrderNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XH${timestamp}${random}`;
}

// 创建订单
export async function createOrder(
  userId: number,
  productType: 'monthly' | 'yearly'
): Promise<Order> {
  const sql = getSql();
  const orderNo = generateOrderNo();
  const amount = productType === 'monthly' ? 9.9 : 99;

  const rows = await sql`
    INSERT INTO orders (order_no, user_id, product_type, amount) 
    VALUES (${orderNo}, ${userId}, ${productType}, ${amount})
    RETURNING *
  `;

  return rows[0] as Order;
}

// 通过订单号获取订单
export async function getOrderByNo(orderNo: string): Promise<Order | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM orders WHERE order_no = ${orderNo}`;
  return (rows[0] as Order) || null;
}

// 通过 ID 获取订单
export async function getOrderById(id: number): Promise<Order | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
  return (rows[0] as Order) || null;
}

// 获取用户的所有订单
export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows as Order[];
}

// 获取所有订单（带用户信息）
export async function getAllOrders(status?: string): Promise<OrderWithUser[]> {
  const sql = getSql();
  
  let rows;
  if (status) {
    rows = await sql`
      SELECT o.*, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.status = ${status}
      ORDER BY o.created_at DESC
    `;
  } else {
    rows = await sql`
      SELECT o.*, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `;
  }
  
  return rows as OrderWithUser[];
}

// 更新订单状态
export async function updateOrderStatus(
  id: number,
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled',
  data?: {
    payment_proof?: string;
    admin_remark?: string;
    confirmed_by?: number;
  }
): Promise<Order | null> {
  const sql = getSql();
  
  if (status === 'paid' && data?.payment_proof) {
    await sql`
      UPDATE orders 
      SET status = ${status}, payment_proof = ${data.payment_proof}, paid_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
  } else if (status === 'confirmed') {
    await sql`
      UPDATE orders 
      SET status = ${status}, confirmed_at = CURRENT_TIMESTAMP,
          confirmed_by = ${data?.confirmed_by || null},
          admin_remark = ${data?.admin_remark || null}
      WHERE id = ${id}
    `;
  } else {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
  }

  return getOrderById(id);
}

// 获取订单统计
export async function getOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  totalAmount: number;
  todayOrders: number;
}> {
  const sql = getSql();
  const rows = await sql`
    SELECT 
      COUNT(*) as "totalOrders",
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as "pendingOrders",
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as "paidOrders",
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as "confirmedOrders",
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as "cancelledOrders",
      SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as "totalAmount",
      SUM(CASE WHEN created_at >= CURRENT_DATE THEN 1 ELSE 0 END) as "todayOrders"
    FROM orders
  `;

  const stats = rows[0];
  return {
    totalOrders: Number(stats.totalOrders) || 0,
    pendingOrders: Number(stats.pendingOrders) || 0,
    paidOrders: Number(stats.paidOrders) || 0,
    confirmedOrders: Number(stats.confirmedOrders) || 0,
    cancelledOrders: Number(stats.cancelledOrders) || 0,
    totalAmount: Number(stats.totalAmount) || 0,
    todayOrders: Number(stats.todayOrders) || 0,
  };
}