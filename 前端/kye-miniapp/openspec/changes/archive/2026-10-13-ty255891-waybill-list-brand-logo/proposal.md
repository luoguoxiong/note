# TY255891 查件列表页底部新增品牌logo

## Why

移动端查件走查发现：寄件页底部有浅灰色 KYE 品牌图形标与客服电话 95324，而查件列表页底部缺失该品牌标识，同一 APP 内两页视觉标准不统一。本需求为查件列表页纯 UI 优化，不改变任何查件业务逻辑（需求文档 v0.1.0，2026-09-23）。

> 范围说明：需求文档中「优化列表页顶部标题样式」一项经确认**本次不做**，仅实现底部品牌标识。

## What Changes

- 查件列表页底部**贴底固定**展示品牌标识：KYE 图形标在左、95324 在右，横向居中（沿用寄件页 Footer 同款品牌整图，148×48：`https://ic-img.ky-express.com/netc/20250719_43690_!!1752909576195_148_48.png`）
- 展示条件：查件列表**有运单数据**时展示
- 隐藏条件：上拉加载更多过程中、还有下一页数据时隐藏，避免与加载状态占位冲突
- 列表底部「可筛选查询近1年内运单 去筛选>」下方增加高度，使滚动到列表末尾时提示文案在上、品牌标识在下共同展示
- 缺省页（无数据空态）、获取专属服务方案的页面**不加**品牌标识
- 覆盖端：APP、微信小程序、PC微信小程序、企微小程序、PC企微小程序、支付宝小程序、高德小程序
- 清理现有半成品草稿逻辑（工作区未提交的 `logo-search`/`logo-bottom` 文档流方案），改为贴底 fixed 方案

## Capabilities

### New Capabilities

- `waybill-search-brand-logo`: 查件列表页底部品牌标识的展示条件（有数据展示 / 加载中与有下一页隐藏 / 空态与专属服务方案页不展示）、贴底定位与列表底部占位加高规则

### Modified Capabilities

（无：现有 specs 中的 `waybill-search-bottom` 仅约定卡片底部按钮配置逻辑，与页面级品牌标识无关）

## Impact

- **代码范围**（均在 waybill 子仓库 `kye-miniapp-waybill`，主应用经 `@modules/waybill-build` 别名引用）：
  - `src/components/waybill-search/index.vue` — 品牌 logo 展示/隐藏逻辑（依赖 `rowTotal`、ky-list-virtual 加载状态）
  - `src/components/waybill-search/index.scss` — 贴底 fixed 样式、列表底部占位加高
- **不改动**：页面配置（`src/layout/pages/waybill/`）、导航栏、标题样式、查件业务逻辑、埋点（需求明确不埋点）
- **多端回归**：微信小程序、APP(H5)、PC微信、企微、PC企微、支付宝、高德——重点验证贴底定位在各端滚动容器内表现及安全区适配
- **数据依赖**：`listFetch` 返回的 `rowTotal`（运单总条数），现有字段，无需后端改动
