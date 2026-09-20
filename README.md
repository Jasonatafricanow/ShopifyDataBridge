# ShopifyDataBridge

> Shopify 历史数据到 TradingWEB 的清洗、校验与迁移桥接系统。

[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%20Strict-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 项目定位与边界

**ShopifyDataBridge** 专为从 Shopify 迁移至 **TradingWEB** 打造的前置数据通道。
其核心定位为：**只专注于 Shopify 导出 CSV 数据的解析、清洗、六维校验、字段映射与中继导入**。所有交易、前台店铺、订单运营、支付、移动 POS 及会员等业务能力均由主站 TradingWEB 承接。

### 核心能力

* 📂 **Shopify 原生 CSV 解析**：完整支持商品（含多规格变体 Options/Variants）、客户（含购买偏好与营销标签）、历史订单（含行项目与财务/履约状态）等数据。
* 🛡️ **六维数据校验（`/api/migrate/validate`）**：
  * 商品维度（必填项、状态合法性）
  * 规格变体维度（SKU 唯一性、价格有效性）
  * 客户维度（Email 格式与唯一性、营销标记）
  * 订单维度（总金额、履约状态与行项目对照）
  * 库存维度（负库存拦截、库位对应）
  * 引用完整性（订单商品与已有商品关联、客户关联）
* 🔒 **企业级安全净化**：
  * CSV 公式注入防御（剥离 `=,+,-,@` 恶意执行前缀）
  * 富文本 HTML 净化（过滤 XSS 脚本与非法标签）
  * 资源防盗链与白名单（仅放行 Shopify 官方 CDN 静态图片资源）
* 📊 **可视化导入进度与审计**：提供直观的上传、校验与导入进度面板及历史审计日志。

---

## 🏗️ 架构概览

```
[ Shopify 导出 CSV ]
       ↓ (浏览器上传 /api/migrate/*)
[ CSV 解析引擎 (PapaParse) ]
       ↓
[ 安全净化层 (Security Layer) ]
  ├── CSV 注入过滤
  ├── HTML 标签清洗
  └── CDN 域名白名单验证
       ↓
[ 六维数据校验器 (Validator) ]
  ├── 字段完整性
  ├── SKU / Email 唯一性
  └── 关联关系检查
       ↓
[ TradingWEB 数据适配器 ]
       ↓ (对接 TradingWEB Import Receiver)
[ TradingWEB 核心数据库 ]
```

---

## 🚀 快速开始

### 前置要求
* **Node.js** >= 18
* **pnpm** >= 9

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制并配置 `.env.local`：

```env
# Supabase / 目标数据库连接（支持鉴权 Bearer Token）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 目标 TradingWEB 接收端配置
TRADINGWEB_API_URL=http://localhost:5000/api
TRADINGWEB_IMPORT_TOKEN=your_secret_token
```

### 3. 启动开发服务

```bash
pnpm dev
# 访问 http://localhost:3000/admin/migration
```

---

## 🛠️ 可用命令

| 命令 | 说明 |
| :--- | :--- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产环境构建 |
| `pnpm start` | 启动生产环境服务器 |
| `pnpm ts-check` | 执行 TypeScript 严格类型检查 |
| `pnpm lint` | 执行 ESLint 代码规范扫描 |
| `pnpm validate` | 联合执行类型检查与 Lint 门禁 |
| `pnpm test` | 执行 Vitest 单元测试 |

---

## 📡 核心迁移 API

* `POST /api/migrate/validate`：上传 CSV 并执行六维一致性校验，返回问题列表
* `POST /api/migrate/products`：批量清洗并导入商品及多规格变体
* `POST /api/migrate/customers`：导入客户档案
* `POST /api/migrate/orders`：导入历史订单与交易记录
* `GET /api/admin/migration/progress`：轮询当前批次迁移进度
* `GET /api/admin/migration-logs`：获取历史迁移操作审计记录

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 授权。
