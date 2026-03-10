# XHWrites - Xiaohongshu Copy Generator

Generate viral Xiaohongshu (Little Red Book) copy with one click. Choose from seeding, educational, or emotional styles.

## Features

- **3 Copy Styles**: Seeding/Recommendation, Educational/Dry Goods, Emotional Resonance
- **AI Powered**: Based on DeepSeek API, generates 5 copies at once
- **Free Tier**: 3 free generations per day
- **Mobile Friendly**: Perfectly adapted for mobile browsers
- **One-Click Copy**: Quickly copy copy to clipboard
- **Member System**: User registration, login, membership management
- **Password Encryption**: Secure storage with bcrypt
- **Alipay Payment**: Scan QR code to activate membership

## Quick Start

### Online Use
Visit [https://xhwrites.com](https://xhwrites.com)

### Local Development

```bash
# Clone repository
git clone https://github.com/Poison8327/xhwrites.git
cd xhwrites

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local, configure DEEPSEEK_API_KEY and DATABASE_URL

# Start development server
npm run dev
```

Visit http://localhost:3000

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: DeepSeek API
- **Database**: Neon Postgres
- **Password Encryption**: bcryptjs
- **Deployment**: Vercel

## Project Structure

```
xhwrites/
├── app/
│   ├── page.tsx              # Main page
│   ├── layout.tsx            # Layout
│   ├── globals.css           # Global styles
│   ├── xhwrites-ad/          # Admin panel
│   │   └── page.tsx
│   ├── components/
│   │   └── OrderModals.tsx   # Order modal component
│   └── api/
│       ├── auth/             # Auth endpoints
│       ├── admin/            # Admin endpoints
│       ├── orders/           # Order endpoints
│       └── generate/         # Copy generation
├── lib/
│   ├── db.ts                 # Database operations
│   └── auth.ts               # Password encryption/verification
├── scripts/
│   └── init-db.ts            # Database initialization
├── public/
│   └── alipay-qr.jpg         # Alipay QR code
└── package.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek API key | Yes |
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `ADMIN_PASSWORD` | Admin panel password | No (default: xhwrites2024) |

## Security Features

- **Password Encryption**: bcryptjs with SALT_ROUNDS=10
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Next.js auto-escaping

## License

MIT

---

Made with love by [Poison8327](https://github.com/Poison8327)
