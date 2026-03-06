import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小红书文案生成器 - XHWrites",
  description: "一键生成爆款小红书文案，种草、干货、情感风格任选",
  keywords: ["小红书", "文案生成", "AI写作", "种草文案"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
