# 📝 XHWrites - 小红书文案生成器

一键生成爆款小红书文案，种草、干货、情感风格任选。

## ✨ 功能特点

- 🎯 **三种文案风格**：种草安利、干货分享、情感共鸣
- ✨ **AI 智能生成**：基于 DeepSeek API，一键生成 5 条文案
- 🆓 **免费使用**：每日 3 次免费额度
- 📱 **移动端友好**：完美适配手机浏览器
- 📋 **一键复制**：快速复制文案到剪贴板

## 🚀 快速开始

### 在线使用
直接访问 [https://xhwrites.com](https://xhwrites.com)

### 本地开发

\`\`\`bash
# 克隆仓库
git clone https://github.com/Poison8327/xhwrites.git
cd xhwrites

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，添加你的 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev
\`\`\`

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: DeepSeek API
- **部署**: Vercel

## 📁 项目结构

\`\`\`
xhwrites/
├── app/
│   ├── page.tsx          # 主页面
│   ├── layout.tsx        # 布局
│   ├── globals.css       # 全局样式
│   └── api/
│       └── generate/
│           └── route.ts  # API 接口
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
\`\`\`

## 🔑 环境变量

创建 \`.env.local\` 文件：

\`\`\`
DEEPSEEK_API_KEY=your_api_key_here
\`\`\`

## 📄 License

MIT

---

Made with ❤️ by [Poison8327](https://github.com/Poison8327)
