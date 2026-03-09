# 📝 XHWrites - 小红书文案生成器

一键生成爆款小红书文案，种草、干货、情感风格任选。

## ✨ 功能特点

- 🎯 **三种文案风格**：种草安利、干货分享、情感共鸣
- ✨ **AI 智能生成**：基于 DeepSeek API，一键生成 5 条文案
- 🆓 **免费使用**：每日 3 次免费额度
- 📱 **移动端友好**：完美适配手机浏览器
- 📋 **一键复制**：快速复制文案到剪贴板
- 👤 **会员系统**：用户注册、登录、会员管理
- 🔐 **密码加密**：使用 bcrypt 加密存储
- 💳 **支付宝支付**：扫码支付开通会员

## 🚀 快速开始

### 在线使用
直接访问 [https://xhwrites.com](https://xhwrites.com)

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Poison8327/xhwrites.git
cd xhwrites

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，配置 DEEPSEEK_API_KEY 和 DATABASE_URL

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: DeepSeek API
- **数据库**: Neon Postgres
- **密码加密**: bcryptjs
- **部署**: Vercel

## 📁 项目结构

```
xhwrites/
├── app/
│   ├── page.tsx              # 主页面
│   ├── layout.tsx            # 布局
│   ├── globals.css           # 全局样式
│   ├── xhwrites-ad/          # 管理后台
│   │   └── page.tsx
│   ├── components/
│   │   └── OrderModals.tsx   # 订单弹窗组件
│   └── api/
│       ├── auth/             # 认证接口
│       ├── admin/            # 管理接口
│       ├── orders/           # 订单接口
│       └── generate/         # 文案生成
├── lib/
│   ├── db.ts                 # 数据库操作
│   └── auth.ts               # 密码加密/验证
├── scripts/
│   └── init-db.ts            # 数据库初始化
├── public/
│   └── alipay-qr.jpg         # 支付宝收款码
└── package.json
```

## 🔑 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | ✅ |
| `DATABASE_URL` | Neon Postgres 连接字符串 | ✅ |
| `ADMIN_PASSWORD` | 管理员密码 | ❌ (默认 xhwrites2024) |

## 🔐 安全特性

- **密码加密**: 使用 bcryptjs (SALT_ROUNDS=10) 加密存储
- **SQL 注入防护**: 使用参数化查询
- **XSS 防护**: Next.js 自动转义

## 📄 License

MIT

---

Made with ❤️ by [Poison8327](https://github.com/Poison8327)
