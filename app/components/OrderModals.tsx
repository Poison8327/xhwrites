"use client";

import { X, Crown, CreditCard, CheckCircle, Clock } from "lucide-react";

interface Order {
  id: string;
  orderNo: string;
  productType: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface OrderModalsProps {
  showPayment: boolean;
  setShowPayment: (show: boolean) => void;
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  selectedPlan: 'monthly' | 'yearly';
  setSelectedPlan: (plan: 'monthly' | 'yearly') => void;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  paymentProof: string;
  setPaymentProof: (proof: string) => void;
  userOrders: Order[];
  loading: boolean;
  onCreateOrder: () => void;
  onSubmitPayment: () => void;
}

export function OrderModals({
  showPayment,
  setShowPayment,
  showOrders,
  setShowOrders,
  selectedPlan,
  setSelectedPlan,
  currentOrder,
  setCurrentOrder,
  paymentProof,
  setPaymentProof,
  userOrders,
  loading,
  onCreateOrder,
  onSubmitPayment,
}: OrderModalsProps) {
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待支付';
      case 'paid': return '已支付，待确认';
      case 'confirmed': return '已确认';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'paid': return 'text-blue-600';
      case 'confirmed': return 'text-green-600';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowPayment(false); setCurrentOrder(null); setPaymentProof(""); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Crown className="w-6 h-6 text-yellow-500" />升级会员</h2>
            
            {!currentOrder ? (
              <>
                <div className="space-y-4 mb-6">
                  <button onClick={() => setSelectedPlan('monthly')} className={`w-full border-2 rounded-xl p-4 text-left ${selectedPlan === 'monthly' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2"><span className="font-bold text-gray-800">月度会员</span><span className="text-2xl font-bold text-pink-500">¥9.9</span></div>
                    <p className="text-sm text-gray-600">30天无限次使用</p>
                  </button>
                  <button onClick={() => setSelectedPlan('yearly')} className={`w-full border-2 rounded-xl p-4 text-left relative ${selectedPlan === 'yearly' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
                    <span className="absolute -top-2 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded">推荐</span>
                    <div className="flex justify-between items-center mb-2"><span className="font-bold text-gray-800">年度会员</span><span className="text-2xl font-bold text-yellow-600">¥99</span></div>
                    <p className="text-sm text-gray-600">365天无限次使用，省¥19.8</p>
                  </button>
                </div>
                <button onClick={onCreateOrder} disabled={loading} className="btn-primary w-full mb-4">{loading ? "创建中..." : "创建订单"}</button>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800"><strong>订单信息</strong><br />订单号：{currentOrder.orderNo}<br />金额：¥{currentOrder.amount}<br />类型：{currentOrder.productType === 'monthly' ? '月度会员' : '年度会员'}</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800"><strong>支付流程：</strong><br />1. 扫码支付（微信/支付宝）<br />2. 填写支付凭证（交易单号/截图链接）<br />3. 等待管理员确认<br />4. 确认后自动开通会员</p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">支付凭证</label>
                  <textarea value={paymentProof} onChange={(e) => setPaymentProof(e.target.value)} placeholder="请填写支付交易单号或截图链接..." className="input-field min-h-[100px] resize-none" />
                </div>

                <button onClick={onSubmitPayment} disabled={loading || !paymentProof.trim()} className="btn-primary w-full mb-4 disabled:opacity-50">{loading ? "提交中..." : "提交支付凭证"}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowOrders(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-6 h-6 text-blue-500" />我的订单</h2>
            
            {userOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">暂无订单记录</div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{order.orderNo}</p>
                        <p className="text-sm text-gray-600">{order.productType === 'monthly' ? '月度会员' : '年度会员'} - ¥{order.amount}</p>
                      </div>
                      <span className={`font-bold ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                    </div>
                    <p className="text-xs text-gray-500">创建时间：{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
