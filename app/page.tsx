"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Zap, Heart, BookOpen, LucideIcon } from "lucide-react";

interface StyleOption {
  id: string;
  name: string;
  icon: LucideIcon;
  desc: string;
}

const STYLES: StyleOption[] = [
  { id: "zhongcao", name: "种草安利", icon: Sparkles, desc: "适合产品推荐、好物分享" },
  { id: "ganhuo", name: "干货分享", icon: BookOpen, desc: "适合教程、攻略、知识科普" },
  { id: "qinggan", name: "情感共鸣", icon: Heart, desc: "适合故事、感悟、生活记录" },
];

export default function Home() {
  const [product, setProduct] = useState("");
  const [style, setStyle] = useState("zhongcao");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("xhwrites_date");
    const savedCount = localStorage.getItem("xhwrites_count");
    
    if (savedDate === today && savedCount) {
      const count = parseInt(savedCount);
      setDailyCount(count);
      setLimitReached(count >= 3);
    } else {
      localStorage.setItem("xhwrites_date", today);
      localStorage.setItem("xhwrites_count", "0");
    }
  }, []);

  const handleGenerate = async () => {
    if (!product.trim()) {
      alert("请输入产品或服务描述");
      return;
    }

    if (limitReached) {
      alert("今日免费次数已用完，请明天再来或升级会员");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: product.trim(), style }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results);

      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      localStorage.setItem("xhwrites_count", newCount.toString());
      setLimitReached(newCount >= 3);
    } catch (error) {
      console.error(error);
      alert("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <header className="gradient-bg text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            ✨ 小红书文案生成器
          </h1>
          <p className="text-white/90 text-lg">
            一键生成爆款文案，让创作更简单
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            今日剩余次数：<span className={limitReached ? "text-red-500 font-bold" : "text-pink-500 font-bold"}>{3 - dailyCount}</span> / 3
          </div>
          {limitReached && (
            <button className="btn-primary text-sm py-2 px-4">
              升级会员 💎
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <label className="block text-gray-700 font-medium mb-3">
            产品/服务描述
          </label>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="例如：一款可以自动记录每日开支的记账APP，界面简洁，支持语音输入..."
            className="input-field min-h-[120px] resize-none"
          />
          
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-3">
              文案风格
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STYLES.map((s) => {
                const IconComponent = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`style-btn flex items-center gap-2 p-3 ${
                      style === s.id ? "active" : ""
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || limitReached}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                生成文案
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl card-shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              生成结果
            </h2>
            <div className="space-y-4">
              {results.map((text, index) => (
                <div
                  key={index}
                  className="relative bg-gray-50 rounded-xl p-4 group hover:bg-gray-100 transition-colors"
                >
                  <p className="text-gray-700 whitespace-pre-wrap pr-10">
                    {text}
                  </p>
                  <button
                    onClick={() => handleCopy(text, index)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white hover:bg-pink-50 transition-colors"
                    title="复制"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-pink-50 rounded-xl p-4 text-sm text-gray-600">
          <p className="font-medium text-pink-600 mb-2">💡 使用技巧</p>
          <ul className="list-disc list-inside space-y-1">
            <li>描述越具体，生成的文案越精准</li>
            <li>可以包含产品特点、目标人群、使用场景</li>
            <li>生成后可根据需要微调，加入个人风格</li>
          </ul>
        </div>
      </div>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2024 XHWrites.com - 让创作更简单</p>
      </footer>
    </main>
  );
}
