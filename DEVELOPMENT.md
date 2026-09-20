# ShopifyDataBridge · 研发演进与设计基线

本文档记录 ShopifyDataBridge（前身为 MoveShopify）从早期全功能电商脚手架到专用轻量级数据迁移中继工具的演进过程与工程规范。

---

## 1. 架构定位演进

### 1.1 历史背景与重构动机
项目早期包含前台店铺、结算、支付和后台管理。然而随着业务发展，交易核心能力集中由主站 `tradingWEB` 承载，两套电商系统并存导致维护成本激增、数据模型割裂。
经过架构决策，本项目进行**业务解耦与边界收窄**：
* 剥离全部独立前台、支付、优惠券及订单履约。
* 聚焦作为 **Shopify -> TradingWEB 数据清洗与迁移中继专用工具**。

### 1.2 迁移管道设计
```
Shopify CSV -> PapaParse -> Security Sanitization -> 6D Validation -> TradingWEB Receiver
```
* **异步分批导入**：大容量 CSV 采用前端流式切片与服务端分页写入，避免内存溢出。
* **状态可观测性**：基于持久化存储的迁移进度轮询（`/api/admin/migration/progress`）与错误明细导出。

---

## 2. 安全加固基线

1. **输入净化（Input Sanitization）**：
   * CSV 单元格内容自动剔除 `@`, `+`, `-`, `=` 等潜在的 Excel/Calc 宏注入符号。
   * HTML 富文本清洗（过滤 `<script>`, `<iframe>`, `javascript:` 伪协议）。
2. **鉴权与防刷**：
   * 所有 `/api/migrate/*` 路由强制要求 Bearer Token 校验。
   * 浏览器端与管理面板交互附带 Authorization Header。
3. **资源白名单**：
   * 图片链接仅允许 Shopify 官方 CDN 域名（`cdn.shopify.com`），拦截外链爬虫与恶意探针。

---

## 3. 测试与质量保证

```bash
# 运行类型检查
pnpm ts-check

# 运行代码检查
pnpm lint

# 运行单元测试
pnpm test
```
