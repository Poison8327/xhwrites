# 🚀 Vercel + Neon 部署指南

## ✅ 已完成的改动

### 数据库迁移
- ✅ 从 MySQL 迁移到 Neon Postgres（Vercel 推荐）
- ✅ 移除 mysql2 依赖
- ✅ 添加 @neondatabase/serverless 依赖
- ✅ 更新所有数据库操作代码
- ✅ 项目编译通过

---

## 📋 部署步骤

### 第一步：推送到 GitHub

由于系统没有安装 Git，请按以下步骤操作：

#### 方法一：使用 GitHub Desktop
1. 打开 GitHub Desktop
2. 选择 `File` → `Add Local Repository`
3. 选择项目目录：`C:\Users\Administrator\.openclaw\workspace\projects\xhwrites`
4. 提交所有更改
5. 推送到 GitHub

#### 方法二：安装 Git 后使用命令行
```powershell
# 下载 Git: https://git-scm.com/download/win

cd C:\Users\Administrator\.openclaw\workspace\projects\xhwrites

git init
git add .
git commit -m "feat: 迁移到 Neon Postgres 数据库

- 替换 MySQL 为 Neon Postgres
- 更新数据库操作层
- 移除 mysql2 依赖
- 添加 @neondatabase/serverless"

# 连接到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/Poison8327/xhwrites.git
git push -u origin main
```

---

### 第二步：在 Vercel 创建项目

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 `Add New...` → `Project`
4. 选择 `xhwrites` 仓库
5. **先不要点击 Deploy**，需要先创建数据库

---

### 第三步：创建 Neon Postgres 数据库

1. 在 Vercel 项目页面，点击 `Storage` 标签
2. 点击 `Create Database`
3. 选择 `Neon Postgres`
4. 数据库名称：`xhwrites`
5. 区域：选择离你最近的（如 Singapore）
6. 点击 `Create`
7. 创建完成后，Vercel 会自动添加 `DATABASE_URL` 环境变量

---

### 第四步：配置环境变量

在 Vercel 项目设置 → Environment Variables，添加：

| 变量名 | 值 |
|--------|-----|
| `DEEPSEEK_API_KEY` | `sk-3a77dd249cbc4470bce28f21a61a6c8e` |
| `ADMIN_PASSWORD` | `xhwrites2024` |
| `DATABASE_URL` | （Neon 自动添加） |

---

### 第五步：部署

1. 回到项目页面
2. 点击 `Deploy`
3. 等待部署完成

---

### 第六步：初始化数据库

部署成功后，需要初始化数据库表：

#### 方法一：使用 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
cd C:\Users\Administrator\.openclaw\workspace\projects\xhwrites
vercel link

# 拉取环境变量
vercel env pull .env.local

# 初始化数据库
npm run db:init
```

#### 方法二：使用 Neon 控制台
1. 访问 Neon 控制台：https://console.neon.tech
2. 选择你的数据库
3. 点击 `SQL Editor`
4. 执行以下 SQL：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_member BOOLEAN DEFAULT FALSE,
  member_expiry TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_member ON users(is_member, member_expiry);

-- 创建订单表
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
);

-- 创建订单索引
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
```

---

## 🎉 完成！

部署完成后：
- 网站地址：`https://xhwrites.vercel.app`（或你的自定义域名）
- 管理后台：`https://xhwrites.vercel.app/admin`
- 管理员密码：`xhwrites2024`

---

## 📊 功能清单

### 用户端
- ✅ 用户注册/登录
- ✅ 查看会员状态
- ✅ 创建订单
- ✅ 提交支付凭证
- ✅ 查看订单历史
- ✅ 生成文案（会员无限次，普通用户每日3次）

### 管理端
- ✅ 用户管理（查看、开通会员、删除）
- ✅ 订单管理（查看、确认、取消）
- ✅ 统计数据（用户统计、订单统计）

---

## 💰 Neon 免费额度

- 存储：0.5 GB
- 计算时间：191.9 小时/月
- 足够小型项目使用

---

**创建时间**: 2026-03-09 14:45
**创建者**: 2B (AI 金融分析师)
