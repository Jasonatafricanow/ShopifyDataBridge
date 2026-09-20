'use client';

import { useEffect, useState, useCallback } from 'react';
import { MigrationProgressBar } from '@/components/migration/progress-bar';
import { authHeaders } from '@/lib/client-auth';

interface MigrationResult {
  migration_id: string;
  type: string;
  total: number;
  success: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

interface MigrationLog {
  id: string;
  migration_type: string;
  status: string;
  source: string;
  records_total: number;
  records_success: number;
  records_failed: number;
  error_details: Array<{ row: number; message: string }> | null;
  created_at: string;
  completed_at: string | null;
}

interface ValidationResult {
  overall: 'pass' | 'warning' | 'fail';
  details: Record<string, { status: string; count: number; details: string[] }>;
  summary: Record<string, number>;
}

export default function MigrationPage() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const headers = authHeaders();
      if (!headers) return;
      const res = await fetch('/api/admin/migration-logs', { headers });
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleUpload = async (type: 'products' | 'customers' | 'orders') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(type);
      try {
        const headers = authHeaders();
        if (!headers) {
          alert('请先登录，或在 localStorage.moveshopify.authToken 写入 Supabase access token');
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`/api/migrate/${type}`, { method: 'POST', headers, body: formData });
        const data = await res.json();
        if (data.error) {
          alert(`迁移失败: ${data.error}`);
        } else {
          setResults(prev => [data, ...prev]);
        }
      } catch (err) {
        alert(`上传失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        setUploading(null);
        loadLogs();
      }
    };
    input.click();
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const headers = authHeaders();
      if (!headers) {
        alert('请先登录，或在 localStorage.moveshopify.authToken 写入 Supabase access token');
        return;
      }
      const res = await fetch('/api/migrate/validate', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (data.error) {
        alert(`验证失败: ${data.error}`);
      } else {
        setValidation(data);
      }
    } catch (err) {
      alert(`验证失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setValidating(false);
    }
  };

  const migrationTypes = [
    {
      type: 'products' as const,
      title: '商品数据迁移',
      desc: '从Shopify导出的products.csv，包含商品信息、变体、分类、图片等',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'blue',
      fields: ['Title', 'Handle', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Variant SKU', 'Variant Price', 'Variant Inventory Qty', 'Image Src'],
    },
    {
      type: 'customers' as const,
      title: '客户数据迁移',
      desc: '从Shopify导出的customers.csv，包含客户信息、地址簿、消费记录',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'green',
      fields: ['Email', 'First Name', 'Last Name', 'Phone', 'State', 'Tags', 'Total Spent', 'Orders Count', 'Address1', 'City'],
    },
    {
      type: 'orders' as const,
      title: '订单数据迁移',
      desc: '从Shopify导出的orders.csv，包含订单、明细、客户关联、物流信息',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      color: 'purple',
      fields: ['Name', 'Email', 'Financial Status', 'Fulfillment Status', 'Total', 'Subtotal', 'Taxes', 'Shipping', 'Lineitem name', 'Lineitem quantity'],
    },
  ];

  const latestMigrationId = results[0]?.migration_id ?? null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">数据迁移</h1>
        <p className="text-gray-500 mt-1">从Shopify导出CSV文件上传迁移，支持商品、客户、订单数据</p>
      </div>

      {latestMigrationId && <MigrationProgressBar migrationId={latestMigrationId} />}

      {/* Migration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {migrationTypes.map((item) => (
          <div key={item.type} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={`p-6 ${
              item.color === 'blue' ? 'bg-blue-50' :
              item.color === 'green' ? 'bg-green-50' :
              'bg-purple-50'
            }`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                item.color === 'green' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">支持的CSV字段</p>
                <div className="flex flex-wrap gap-1">
                  {item.fields.slice(0, 6).map((field) => (
                    <span key={field} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{field}</span>
                  ))}
                  {item.fields.length > 6 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">+{item.fields.length - 6} more</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleUpload(item.type)}
                disabled={uploading !== null}
                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  uploading === item.type
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : item.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      item.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                      'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {uploading === item.type ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    迁移中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    上传CSV迁移
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Migration Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">迁移结果</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((result, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${result.failed > 0 ? 'bg-amber-400' : 'bg-green-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {result.type === 'products' ? '商品' : result.type === 'customers' ? '客户' : '订单'}迁移
                      </p>
                      <p className="text-xs text-gray-500">ID: {result.migration_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      <span className="text-green-600">{result.success}</span> / {result.total} 成功
                    </p>
                    {result.failed > 0 && (
                      <p className="text-xs text-red-500">{result.failed} 条失败</p>
                    )}
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 max-h-24 overflow-auto">
                    {result.errors.slice(0, 3).map((err, j) => (
                      <p key={j}>行{err.row}: {err.message}</p>
                    ))}
                    {result.errors.length > 3 && <p>...还有 {result.errors.length - 3} 条错误</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">数据验证</h2>
            <p className="text-sm text-gray-500 mt-0.5">检查迁移后数据的完整性和准确性</p>
          </div>
          <button
            onClick={handleValidate}
            disabled={validating}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {validating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                验证中...
              </>
            ) : (
              '开始验证'
            )}
          </button>
        </div>
        {validation && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                validation.overall === 'pass' ? 'bg-green-100 text-green-700' :
                validation.overall === 'warning' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {validation.overall === 'pass' ? '全部通过' : validation.overall === 'warning' ? '存在警告' : '存在错误'}
              </span>
              <span className="text-sm text-gray-500">
                商品: {validation.summary.products || 0} | 客户: {validation.summary.customers || 0} | 订单: {validation.summary.orders || 0} | 库存: {validation.summary.inventory || 0}
              </span>
            </div>
            <div className="space-y-3">
              {Object.entries(validation.details).map(([key, val]) => (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    val.status === 'pass' ? 'bg-green-500' :
                    val.status === 'warning' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                      <span className="text-xs text-gray-500">{val.count} 条记录</span>
                    </div>
                    {val.details.map((d, i) => (
                      <p key={i} className="text-xs text-gray-500 mt-0.5">{d}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Migration Logs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">迁移日志</h2>
        </div>
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">来源</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">总数</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">成功</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">失败</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{log.migration_type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        log.status === 'completed' ? 'bg-green-100 text-green-700' :
                        log.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.source}</td>
                    <td className="px-6 py-4 text-gray-900">{log.records_total}</td>
                    <td className="px-6 py-4 text-green-600">{log.records_success}</td>
                    <td className="px-6 py-4 text-red-600">{log.records_failed}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">暂无迁移日志</div>
        )}
      </div>
    </div>
  );
}
