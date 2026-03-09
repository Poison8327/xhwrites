"use client";

import { useState, useEffect } from "react";
import { Crown, Users, Search, Check, X, Trash2, TrendingUp, UserPlus, Clock, RefreshCw } from "lucide-react";

interface User {
  id: string;
  email: string;
  isMember: boolean;
  memberExpiry: string | null;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newUsersToday: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberFilter, setMemberFilter] = useState<"all" | "member" | "normal">("all");

  const fetchUsers = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?password=${password}`);
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        setIsLoggedIn(false);
      } else {
        setUsers(data.users);
      }
    } catch (error) {
      alert("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!password) return;
    try {
      const response = await fetch(`/api/admin/stats?password=${password}`);
      const data = await response.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (error) {
      console.error("获取统计失败", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
      fetchStats();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!password) {
      alert("请输入管理员密码");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?password=${password}`);
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setUsers(data.users);
        setIsLoggedIn(true);
      }
    } catch (error) {
      alert("登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantMember = async (userId: string, days: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password, userId, days }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setUsers(users.map(u => u.id === userId ? { ...u, isMember: true, memberExpiry: data.user.memberExpiry } : u));
        fetchStats();
        alert(`已开通 ${days} 天会员！`);
      }
    } catch (error) {
      alert("开通失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`确定要删除用户 ${email} 吗？此操作不可恢复！`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?password=${password}&userId=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setUsers(users.filter(u => u.id !== userId));
        fetchStats();
        alert("用户已删除");
      }
    } catch (error) {
      alert("删除失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  // 过滤用户
  const filteredUsers = users.filter(u => {
    const matchEmail = searchEmail ? u.email.toLowerCase().includes(searchEmail.toLowerCase()) : true;
    const matchMember = memberFilter === "all" ? true : 
      memberFilter === "member" ? u.isMember : !u.isMember;
    return matchEmail && matchMember;
  });

  // 判断会员是否过期
  const isMemberActive = (user: User) => {
    if (!user.isMember || !user.memberExpiry) return false;
    return new Date(user.memberExpiry) > new Date();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔐 管理后台登录
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入管理员密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              XHWrites 管理后台
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                退出
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">总用户</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Crown className="w-4 h-4" />
                <span className="text-sm">会员总数</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalMembers}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Check className="w-4 h-4" />
                <span className="text-sm">有效会员</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.activeMembers}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">已过期</span>
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.expiredMembers}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">今日新增</span>
              </div>
              <div className="text-2xl font-bold text-pink-500">{stats.newUsersToday}</div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="搜索用户邮箱..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMemberFilter("all")}
                className={`px-4 py-2 rounded-lg ${memberFilter === "all" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                全部
              </button>
              <button
                onClick={() => setMemberFilter("member")}
                className={`px-4 py-2 rounded-lg ${memberFilter === "member" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                会员
              </button>
              <button
                onClick={() => setMemberFilter("normal")}
                className={`px-4 py-2 rounded-lg ${memberFilter === "normal" ? "bg-gray-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                普通用户
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>共 {filteredUsers.length} 个用户</span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {users.length === 0 ? "暂无用户数据" : "未找到匹配的用户"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">邮箱</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">会员状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">到期时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">注册时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        {isMemberActive(user) ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="w-4 h-4" />
                            有效会员
                          </span>
                        ) : user.isMember ? (
                          <span className="flex items-center gap-1 text-red-500">
                            <X className="w-4 h-4" />
                            已过期
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <X className="w-4 h-4" />
                            普通用户
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.memberExpiry || "-"}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGrantMember(user.id, 30)}
                            disabled={loading}
                            className="px-3 py-1 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 disabled:opacity-50"
                          >
                            月度
                          </button>
                          <button
                            onClick={() => handleGrantMember(user.id, 365)}
                            disabled={loading}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50"
                          >
                            年度
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💡 使用说明</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 用户注册后，会出现在用户列表中</li>
            <li>• 点击「月度」开通 30 天会员</li>
            <li>• 点击「年度」开通 365 天会员</li>
            <li>• 点击删除按钮可删除用户</li>
            <li>• 管理员密码：<code className="bg-gray-100 px-2 py-1 rounded">xhwrites2024</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}