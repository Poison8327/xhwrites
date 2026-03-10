/**
 * 数据库初始化脚本 (Neon Postgres)
 * 
 * 使用方法:
 * 1. 在 Vercel 控制台创建 Neon Postgres 数据库
 * 2. 将 DATABASE_URL 添加到 .env.local
 * 3. 运行: npx ts-node scripts/init-db.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function initDatabase() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ 未找到 DATABASE_URL 或 POSTGRES_URL 环境变量');
    console.log('\n请在 Vercel 控制台创建 Neon Postgres 数据库，然后将连接字符串添加到 .env.local');
    process.exit(1);
  }

  const sql = neon(connectionString);

  try {
    console.log('🔗 连接到 Neon Postgres...');

    // 创建用户表
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
    console.log('✅ 用户表 "users" 已就绪');

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_member ON users(is_member, member_expiry)`;

    // 创建订单表
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_no VARCHAR(50) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_type VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'manual',
        payment_proof TEXT NULL,
        admin_remark TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        confirmed_at TIMESTAMP NULL,
        confirmed_by INTEGER NULL
      )
    `;
    console.log('✅ 订单表 "orders" 已就绪');

    // 创建订单索引
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`;

    // 检查现有数据
    const rows = await sql`SELECT COUNT(*) as count FROM users`;
    const count = rows[0].count;
    console.log(`📊 当前用户数: ${count}`);

    console.log('\n🎉 数据库初始化完成！');
    console.log('\n下一步:');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 访问 http://localhost:3000 测试');

  } catch (error: any) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

initDatabase();
