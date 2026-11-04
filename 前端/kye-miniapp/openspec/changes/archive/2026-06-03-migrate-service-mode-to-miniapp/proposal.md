## Why

运费时效（freight-time）页面与下单页面共用大量组件（地址、托寄物、重量、体积、包装服务等），但由于分属不同项目（netc-h5-order-old 与 kye-miniapp），下单侧组件更新样式后运费时效侧无法同步。本次迁移聚焦于**运费时效独有的服务方式查询与结果展示**，不涉及与下单共用的组件，旨在将 netc-h5-order-old 中已验证的服务方式查询流程独立迁移至 kye-miniapp 小程序。

## What Changes

### 1. 重置
- 主页面增加"重置"按钮（带刷新图标），一键重置所有表单输入及查询结果

### 2. 查询按钮
- 主页面增加"查询"按钮，loading 态，校验寄收地址不通过时 Toast 提示
- 调用 `getQueryServiceTime` API
- 集成验证码弹窗（`withCaptchaRequest`）

### 3. 查询结果的展示与交互
- 新增服务方式相关 TypeScript 类型定义
- 新增运费时效查询 API 接口（`getQueryServiceTime`）
- 扩展 Pinia Store
- 新建 `service-mode` 组件
- 新建 `freight-footer` 底部按钮组件
- 新建 `estimated-shipping-popup` 申请运费弹窗组件
- 优惠券横幅、联系商务入口+弹窗、限取限派提示

### 4. 新客活动
- 新增 `getNewCustomerActivity` API
- URL 直带优惠券 / 留资标记 / API 获取活动三层逻辑
- 查询按钮角标、Footer 角标、activity 参数联动

### 5. 与旧版的 PRD 差异

**费用展示：** 合计/运费/木架费 → 总费用 `¥xx.xx 起` + 明细（TODO）
**排序：** 独立 → 互斥
**列名：** "预估运费" → "预估费用"

### 6. 项目适配
- Vue 2 Options API → Vue 3 Composition API + TS
- Vuex → Pinia
- vant → kye-miniui (ky-button/ky-textarea/ky-popup 等)
- 样式 → CSS Modules
- v-html → rich-text
- 本地图片 → CDN 统一配置

## Capabilities

### New Capabilities
- `service-mode-query`: 运费时效查询与结果展示能力

### Modified Capabilities
<!-- 不涉及 -->

## Impact

| 影响范围 | 文件 |
|----------|------|
| 类型定义 | `src/modules/freight-time/types.ts` |
| API 层 | `src/modules/freight-time/api/index.ts` |
| 状态管理 | `src/modules/freight-time/store/index.ts` |
| 图片配置 | `src/modules/freight-time/constants/images.ts` |
| 查询 hook | `src/modules/freight-time/pages/index/hooks/useFreightTimeQuery.ts` |
| 新客 hook | `src/modules/freight-time/pages/index/hooks/useNewCustomerActivity.ts` |
| 新建组件 | `components/service-mode/`, `components/freight-footer/`, `components/estimated-shipping-popup/` |
| 页面集成 | `src/modules/freight-time/pages/index/index.vue` |

## Excluded

- 货好时间（另由协作方实现）
- 明细弹窗（TODO，依赖下单明细组件抽离公共模块，另起任务）
- 解锁企业专属价页面（等 Taro 版开发，另起任务）
- 地址结构化数据（依赖协作者）
- showCheckResult 管控校验（依赖托寄物组件）
