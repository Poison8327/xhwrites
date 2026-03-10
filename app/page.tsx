"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Zap, Heart, BookOpen, Crown, X, User, LogOut, FileText } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { OrderModals } from "./components/OrderModals";

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
  const [showAuth, setShowAuth] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<{id: string; email: string; isMember: boolean; memberExpiry: string | null} | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberExpiry, setMemberExpiry] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [currentOrder, setCurrentOrder] = useState<{id: string; orderNo: string; productType: string; amount: number; status: string; createdAt: string} | null>(null);
  const [paymentProof, setPaymentProof] = useState("");
  const [userOrders, setUserOrders] = useState<{id: string; orderNo: string; productType: string; amount: number; status: string; createdAt: string}[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("xhwrites_user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsMember(userData.isMember && userData.memberExpiry && new Date(userData.memberExpiry) > new Date());
      setMemberExpiry(userData.memberExpiry);
    }
    
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("xhwrites_date");
    const savedCount = localStorage.getItem("xhwrites_count");
    
    if (savedDate === today && savedCount) {
      setDailyCount(parseInt(savedCount));
    } else {
      localStorage.setItem("xhwrites_date", today);
      localStorage.setItem("xhwrites_count", "0");
    }
  }, []);

  const canGenerate = isMember || dailyCount < 3;

  const handleAuth = async () => {
    if (!email || !password) {
      alert("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setUser(data.user);
        setIsMember(data.user.isMember && data.user.memberExpiry && new Date(data.user.memberExpiry) > new Date());
        setMemberExpiry(data.user.memberExpiry);
        localStorage.setItem("xhwrites_user", JSON.stringify(data.user));
        setShowAuth(false);
        setEmail("");
        setPassword("");
        alert(isLogin ? "登录成功！" : "注册成功！");
      }
    } catch (error) {
      alert("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsMember(false);
    setMemberExpiry(null);
    localStorage.removeItem("xhwrites_user");
    setUserOrders([]);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      alert("请先登录");
      setShowAuth(true);
      setShowPayment(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productType: selectedPlan }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setCurrentOrder(data.order);
        alert(`订单创建成功！订单号：${data.order.orderNo}`);
      }
    } catch (error) {
      alert("创建订单失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!currentOrder || !paymentProof.trim()) {
      alert("请填写支付凭证");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: currentOrder.orderNo,
          paymentProof: paymentProof.trim(),
        }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("支付凭证已提交，请等待管理员确认");
        setCurrentOrder(null);
        setPaymentProof("");
        setShowPayment(false);
      }
    } catch (error) {
      alert("提交失败");
    } finally {
      setLoading(false);
    }
  };

  const handleGetOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?userId=${user.id}`);
      const data = await response.json();
      if (data.orders) {
        setUserOrders(data.orders);
        setShowOrders(true);
      }
    } catch (error) {
      alert("获取订单失败");
    } finally {
      setLoading(false);
    }
  };

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
            {user ? (
              isMember ? (
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600 font-bold">{user.email}</span>
                  <span className="text-gray-500">(会员至 {memberExpiry})</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{user.email}</span>
                  <span className="text-gray-400">|</span>
                  <span>今日剩余：{3 - dailyCount} 次</span>
                </span>
              )
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
          <div className="flex gap-2">
            {user ? (
              <>
                {!isMember && (
                  <button onClick={() => setShowPayment(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    升级会员
                  </button>
                )}
                <button onClick={handleGetOrders} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  我的订单
                </button>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                登录/注册
              </button>
            )}
          </div>
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

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{isLogin ? "登录" : "注册"}</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="input-field mb-3"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="input-field mb-4"
            />
            <button onClick={handleAuth} disabled={loading} className="btn-primary w-full mb-4">
              {loading ? "处理中..." : (isLogin ? "登录" : "注册")}
            </button>
            <p className="text-center text-sm text-gray-600">
              {isLogin ? "没有账号？" : "已有账号？"}
              <button onClick={() => setIsLogin(!isLogin)} className="text-pink-500 ml-1">
                {isLogin ? "注册" : "登录"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Order Modals */}
      <OrderModals
        showPayment={showPayment}
        setShowPayment={setShowPayment}
        showOrders={showOrders}
        setShowOrders={setShowOrders}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        currentOrder={currentOrder}
        setCurrentOrder={setCurrentOrder}
        paymentProof={paymentProof}
        setPaymentProof={setPaymentProof}
        userOrders={userOrders}
        loading={loading}
        onCreateOrder={handleCreateOrder}
        onSubmitPayment={handleSubmitPayment}
      />

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2024 XHWrites.com - 让创作更简单</p>
      </footer>
    </main>
  );
}
