import mysql from 'mysql2/promise';
import { hashPassword, verifyPassword } from './auth';

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'xhwrites',
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

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
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_member BOOLEAN DEFAULT FALSE,
        member_expiry DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_member (is_member, member_expiry)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 数据库表初始化成功');
  } finally {
    connection.release();
  }
}

// 创建用户
export async function createUser(email: string, hashedPassword: string): Promise<User> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO users (email, password) VALUES (?, ?)`,
    [email.toLowerCase(), hashedPassword]
  );

  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users WHERE id = ?`,
    [result.insertId]
  );

  return rows[0] as User;
}

// 通过 ID 获取用户
export async function getUserById(id: number): Promise<User | null> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
  return (rows[0] as User) || null;
}

// 通过邮箱获取用户
export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users WHERE email = ?`,
    [email.toLowerCase()]
  );
  return (rows[0] as User) || null;
}

// 更新用户
export async function updateUser(id: number, data: Partial<User>): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email.toLowerCase());
  }
  if (data.password !== undefined) {
    fields.push('password = ?');
    values.push(data.password);
  }
  if (data.is_member !== undefined) {
    fields.push('is_member = ?');
    values.push(data.is_member);
  }
  if (data.member_expiry !== undefined) {
    fields.push('member_expiry = ?');
    values.push(data.member_expiry);
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id);
  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getUserById(id);
}

// 获取所有用户
export async function getAllUsers(): Promise<User[]> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users ORDER BY created_at DESC`
  );
  return rows as User[];
}

// 删除用户
export async function deleteUser(id: number): Promise<boolean> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

// 获取统计信息
export async function getStats(): Promise<{
  totalUsers: number;
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newUsersToday: number;
}> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(`
    SELECT 
      COUNT(*) as totalUsers,
      SUM(CASE WHEN is_member = TRUE THEN 1 ELSE 0 END) as totalMembers,
      SUM(CASE WHEN is_member = TRUE AND member_expiry > NOW() THEN 1 ELSE 0 END) as activeMembers,
      SUM(CASE WHEN is_member = TRUE AND member_expiry <= NOW() THEN 1 ELSE 0 END) as expiredMembers,
      SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END) as newUsersToday
    FROM users
  `);

  const stats = rows[0];
  return {
    totalUsers: stats.totalUsers || 0,
    totalMembers: stats.totalMembers || 0,
    activeMembers: stats.activeMembers || 0,
    expiredMembers: stats.expiredMembers || 0,
    newUsersToday: stats.newUsersToday || 0,
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

// 关闭连接池
export async function closePool(): Promise<void> {
  await pool.end();
}

export { pool };
