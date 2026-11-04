## Context

运费时效模块当前在 kye-miniapp 中仅有表单区（寄收地址、托寄物、重量、体积、尺寸、包装服务），缺少完整的查询→结果展示流程。本次迁移目标是补齐服务方式查询的完整功能链，技术栈为 Taro 4.x + Vue 3 + Pinia + TypeScript + Sass。

## Goals / Non-Goals

**Goals:**
- 新增 `getQueryServiceTime` / `getNewCustomerActivity` / `applyEstimated` 等 API
- 扩展 Pinia Store 支持查询结果、新客活动、联系商务状态
- 新建 `service-mode` / `freight-footer` / `estimated-shipping-popup` 组件
- 集成验证码弹窗（项目已有 `captcha` 组件）
- 集成联系商务弹窗（项目已有 `contact-business` 组件）
- 优惠券横幅、限取限派提示、新客活动

**Non-Goals:**
- 不涉及明细弹窗（TODO，依赖下单模块抽离公共组件）
- 不涉及货好时间（由协作方实现）
- 不涉及解锁企业专属价（等 Taro 版页面）
- 不改动下单共用组件（产品名、重量、体积、尺寸、包装服务）

## Decisions

### 1. Hooks 分层架构

**选择**：逻辑抽取到 `useXxx` composable，`.vue` 仅负责视图绑定。

```
useFreightTimeQuery   → 查询/重置/参数组装
useNewCustomerActivity → 新客活动
useServiceMode        → 排序/格式化/权限
useFreightFooter      → Footer 状态计算 + 按钮逻辑
useApplyEstimate      → 申请弹窗逻辑
```

**原因**：组件 ≤300 行规范、单一职责、可测试。

### 2. CSS Modules

**选择**：`.module.scss` + `import styles from './index.module.scss'`，模板用 `:class="styles['xxx']"`。

**原因**：避免 scoped 在小程序端的潜在兼容问题，类名哈希自动隔离。

### 3. 地址数据流（协作者衔接）

**选择**：`sendAndReceive` 使用模块级 `ref<string>`，查询 hook 直接从 `useState.ts` 读取。

**原因**：协作者组件未写 Store，采用模块级单例 ref 共享数据。后续若协作者改走 Store 再切换。

### 4. 验证码集成

**选择**：`withCaptchaRequest(createSearchRequest, captchaRef)` 包裹查询请求。

**原因**：复用项目已有的 `captcha` 组件和 `withCaptchaRequest` 工具函数。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| API 在 Taro 环境不可用 | 已确认接口可用，使用项目已有的 `http` 工具 |
| `v-html` 不兼容 | 改用 `rich-text` 组件 |
| 地址 mock 数据 | 协作者完成后替换为真实结构化数据 |
| 明细弹窗占位 | 标记 TODO，设计预留交互入口 |
