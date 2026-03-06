"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Zap, Heart, BookOpen, Crown, X } from "lucide-react";
import { LucideIcon } from "lucide-react";

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
  const [showPayment, setShowPayment] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberExpiry, setMemberExpiry] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("xhwrites_date");
    const savedCount = localStorage.getItem("xhwrites_count");
    const savedExpiry = localStorage.getItem("xhwrites_member_expiry");
    
    const hasMembership = savedExpiry ? new Date(savedExpiry) > new Date() : false;
    setIsMember(hasMembership);
    setMemberExpiry(hasMembership ? savedExpiry : null);
    
    if (savedDate === today && savedCount) {
      setDailyCount(parseInt(savedCount));
    } else {
      localStorage.setItem("xhwrites_date", today);
      localStorage.setItem("xhwrites_count", "0");
    }
  }, []);

  const canGenerate = isMember || dailyCount < 3;

  const handleGenerate = async () => {
    if (!product.trim()) {
      alert("请输入产品或服务描述");
      return;
    }

    if (!canGenerate) {
      setShowPayment(true);
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

      if (!isMember) {
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem("xhwrites_count", newCount.toString());
      }
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">✨ 小红书文案生成器</h1>
          <p className="text-white/90 text-lg">一键生成爆款文案，让创作更简单</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {isMember ? (
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 font-bold">会员用户</span>
                <span className="text-gray-500">(有效期至 {memberExpiry})</span>
              </span>
            ) : (
              <>
                今日剩余次数：
                <span className={canGenerate ? "text-pink-500 font-bold" : "text-red-500 font-bold"}>
                  {3 - dailyCount}
                </span>{" "}
                / 3
              </>
            )}
          </div>
          {!isMember && (
            <button onClick={() => setShowPayment(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              升级会员
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
          <label className="block text-gray-700 font-medium mb-3">产品/服务描述</label>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="例如：一款可以自动记录每日开支的记账APP，界面简洁，支持语音输入..."
            className="input-field min-h-[120px] resize-none"
          />
          
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-3">文案风格</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STYLES.map((s) => {
                const IconComponent = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`style-btn flex items-center gap-2 p-3 ${style === s.id ? "active" : ""}`}
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
            disabled={loading}
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">生成结果</h2>
            <div className="space-y-4">
              {results.map((text, index) => (
                <div key={index} className="relative bg-gray-50 rounded-xl p-4 group hover:bg-gray-100 transition-colors">
                  <p className="text-gray-700 whitespace-pre-wrap pr-10">{text}</p>
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

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              升级会员
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="border-2 border-pink-500 rounded-xl p-4 bg-pink-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">月度会员</span>
                  <span className="text-2xl font-bold text-pink-500">¥9.9</span>
                </div>
                <p className="text-sm text-gray-600">30天无限次使用</p>
              </div>
              
              <div className="border-2 border-yellow-500 rounded-xl p-4 bg-yellow-50 relative">
                <span className="absolute -top-2 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded">推荐</span>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">年度会员</span>
                  <span className="text-2xl font-bold text-yellow-600">¥99</span>
                </div>
                <p className="text-sm text-gray-600">365天无限次使用，省¥19.8</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">支付方式</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">支</div>
                  <div>
                    <p className="font-medium">支付宝</p>
                    <p className="text-gray-500">扫码支付</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">微</div>
                  <div>
                    <p className="font-medium">微信支付</p>
                    <p className="text-gray-500">扫码支付</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>支付说明：</strong><br />
                1. 扫码支付后，请截图保存<br />
                2. 发送截图到客服微信：xorpay_com<br />
                3. 客服确认后手动开通会员<br />
                4. 开通时间：9:00-22:00（通常10分钟内）
              </p>
            </div>
            
            <button
              onClick={() => {
                alert("请联系客服开通会员：xorpay_com");
                setShowPayment(false);
              }}
              className="btn-primary w-full"
            >
              联系客服开通
            </button>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2024 XHWrites.com - 让创作更简单</p>
      </footer>
    </main>
  );
}
