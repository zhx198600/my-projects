import { useEffect, useState } from 'react';
import { Server, Database, Clock, Hash, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import type { HealthCheckResponse, ApiResponse } from '@shared/types';

export default function HealthCheck() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health');
      const result: ApiResponse<HealthCheckResponse> = await response.json();
      
      if (result.success && result.data) {
        setHealthData(result.data);
      } else {
        setError(result.error || 'Failed to fetch health data');
      }
    } catch (err) {
      setError('Cannot connect to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const StatusBadge = ({ status }: { status: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
      status 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      {status ? (
        <><CheckCircle className="w-4 h-4" /> Online</>
      ) : (
        <><XCircle className="w-4 h-4" /> Offline</>
      )}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            个人网盘系统 - 健康检查
          </h1>
          <p className="text-slate-600">
            实时监控前后端连接状态
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">系统状态</h2>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading && !healthData && (
              <div className="text-center py-12 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                正在连接服务器...
              </div>
            )}

            {healthData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-slate-700">服务器</span>
                      </div>
                      <StatusBadge status={healthData.server} />
                    </div>
                    <p className="text-sm text-slate-500">Express 后端服务状态</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-slate-700">数据库</span>
                      </div>
                      <StatusBadge status={healthData.database} />
                    </div>
                    <p className="text-sm text-slate-500">SQLite 数据库连接状态</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">运行时间</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-800">
                      {formatUptime(healthData.uptime)}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">版本号</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">
                      v{healthData.version}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-medium text-cyan-700">最后检查</span>
                    </div>
                    <p className="text-lg font-bold text-cyan-800">
                      {new Date(healthData.timestamp).toLocaleTimeString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      {healthData.server && healthData.database 
                        ? '✅ 前后端通信正常，系统运行良好！' 
                        : '⚠️ 部分服务异常，请检查'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>每 5 秒自动刷新状态 | 前端端口: 5173 | 后端端口: 3001</p>
        </div>
      </div>
    </div>
  );
}
