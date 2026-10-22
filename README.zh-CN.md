# ShopifyDataBridge

[English](README.md) | [简体中文](README.zh-CN.md)

把 Shopify 商品、客户和订单 CSV 转为 TradingWEB 导入会话，由 TradingWEB 校验并提交目标数据。

## 导入流程

CSV → 解析和清洗 → 映射源 ID → 提交导入包 → 读取 TradingWEB 对账结果。

Supabase 验证操作者身份，`MIGRATION_ADMIN_EMAILS` 决定是否允许迁移。`TRADINGWEB_IMPORT_TOKEN` 仅由服务端使用。

```env
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=<public-anon-key>
MIGRATION_ADMIN_EMAILS=admin@example.com
TRADINGWEB_API_URL=https://store.example.com/api
TRADINGWEB_IMPORT_TOKEN=<server-side-operator-token>
SHOPIFY_SOURCE_STORE=example.myshopify.com
```

## 运行与验证

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm validate
pnpm test
```

导入回归测试使用合成 CSV 调用真实解析器和映射器，仅模拟接收端传输。匿名化的真实商户导出和接收端现场对账仍需单独验收。

## 细节与限制

[实现说明](docs/IMPLEMENTATION.md) · [架构纠偏历史](docs/AUDIT-HISTORY.md) · [测试](src/__tests__)

发送端仍有进程内进度缓存。重启续传、试运行字段差异和可下载对账报告属于后续工作。`COZE_` 配置名保留以兼容现有部署。

## 许可

MIT，见 [LICENSE](LICENSE)。
