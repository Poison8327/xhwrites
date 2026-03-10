# 订单系统部署指南

## ✅ 已完成的工作

### 后端（100%完成）
1. ✅ 数据库表结构（`scripts/init-db.ts`）
2. ✅ 数据库操作函数（`lib/db.ts`）
3. ✅ 用户 API 接口（`/api/orders`, `/api/orders/pay`）
4. ✅ 管理员 API 接口（`/api/admin/orders`）
5. ✅ 订单弹窗组件（`app/components/OrderModals.tsx`）

### 前端（90%完成）
1. ✅ 主页用户认证功能
2. ✅ 主页订单创建和支付流程
3. ✅ 订单弹窗集成
4. ⚠️ 管理后台订单管理标签页（需要手动添加）

## 📝 部署步骤

### 1. 初始化数据库
```bash
cd C:\Users\Administrator\.openclaw\workspace\projects\xhwrites
npm run db:init
```

### 2. 测试编译
```bash
npm run build
```

### 3. 部署到 GitHub

由于系统没有安装 Git，请按以下步骤手动操作：

#### 方法一：使用 GitHub Desktop
1. 打开 GitHub Desktop
2. 选择 `File` -> `Add Local Repository`
3. 选择项目目录：`C:\Users\Administrator\.openclaw\workspace\projects\xhwrites`
4. 如果提示创建仓库，点击 `Create a repository`
5. 提交所有更改
6. 点击 `Publish repository` 推送到 GitHub

#### 方法二：安装 Git 后使用命令行
1. 下载并安装 Git：https://git-scm.com/download/win
2. 打开 PowerShell 或 Git Bash
3. 执行以下命令：
```bash
cd C:\Users\Administrator\.openclaw\workspace\projects\xhwrites

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 添加订单系统

- 添加订单数据库表结构
- 添加订单 API 接口
- 添加用户认证功能
- 添加订单创建和支付流程
- 添加订单弹窗组件
- 更新主页用户界面"

# 连接到 GitHub 仓库（替换为你的仓库地址）
git remote add origin https://github.com/Poison8327/xhwrites.git

# 推送到 GitHub
git push -u origin main
```

### 4. 部署到 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 `New Project`
4. 选择 `xhwrites` 仓库
5. 点击 `Deploy`
6. 等待部署完成

### 5. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：
```
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=xhwrites
DEEPSEEK_API_KEY=your_deepseek_api_key
ADMIN_PASSWORD=xhwrites2024
```

## 🔧 管理后台订单管理

由于文件编辑限制，管理后台的订单管理标签页需要手动添加。

### 添加位置
在 `app/admin/page.tsx` 文件中，找到用户管理表格的结束位置，添加订单管理标签页。

### 需要添加的代码
参考文件：`ORDER_SYSTEM_UPDATE.md` 中的"管理后台订单管理"部分

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
- ⚠️ 订单管理标签页（需要手动添加）

## 🎯 支付流程

1. 用户点击"升级会员"
2. 选择套餐（月度/年度）
3. 创建订单
4. 填写支付凭证
5. 提交支付凭证
6. 管理员确认订单
7. 系统自动开通会员

## 📞 联系方式

如有问题，请联系：
- GitHub: https://github.com/Poison8327/xhwrites
- 客服微信: xorpay_com

---

**创建时间**: 2026-03-09 13:20
**创建者**: 2B (AI 金融分析师)
