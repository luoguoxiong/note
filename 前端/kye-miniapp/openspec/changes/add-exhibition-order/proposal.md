# 展会下单（撤展/来展/扫撤展码）

## Why

展会场景下散客下单需手动录入展会地址，流程繁琐易错；且现场扫「绑定后台」二维码会把客户已有的 A 后台绑定关系覆盖为展会后台，影响运单归属、客户费用与销售业绩归属。PRD（doc.ky-tech.com.cn/docs/97d9c0a440ed418c9a2da80c4210f7b7）要求新增展会下单独立入口与展会二维码，支持预设展会地址直接下单，并优化绑码逻辑。寄件首页入口由其他同事负责，本 change 不覆盖。

## What Changes

- 新增「展会下单首页」页面（`modules/order-build-sub-pages/order-exhibition/index`），含撤展/来展下单入口卡片、实名认证横幅（复用 `useRealAuth`，`realNameButtonType === 10` 才展示）、5 大核心优势静态宣传区（webp 外链）
- 下单渠道新增 `Channel.撤展下单 = '210'`、`Channel.来展下单 = '220'`（`order-public/constants/init.ts`），展会填单复用现有单票下单页，URL 携带 channel + textCode
- 下单初始化配置映射新增：撤展/来展 → `web.order.init.exhibitionOrder.singlePageResult`（`order-public/constants/http.ts`）；展会首页 `onBeforeMount` 调用预加载接口 `singlePageV2` 预热（真实配置仍以 init 接口为准，singlePageV2 数据仅用于提前渲染假组件）
- 未绑码提示条（notice-bar）展会渠道文案差异化：「如有客户编码，请绑码以享受专属优惠 >」；提示条显隐仍由后端下单配置「未绑码提示条」勾选控制（后端展会配置不勾选即隐藏）
- 后端以 channel 区分下单配置、以 textCode 标记扫码撤展场景；指定寄件地址复用既有能力，前端传 channel + 客户编码
- 下单成功页「继续下单」分支扩展：展会扫码场景（`sourcePage = SourcePage.展会扫码`）唤起扫一扫；撤展/来展渠道保持渠道跳回填单页（提交成功时 `resetWaybillInfo` 已清空填单缓存，无需新增清理）
- 扫撤展码进入：链接统一走 `handleCommonScan` 分发，仅要求跳转链接携带 channel + textCode（下单页已支持）；二维码失效场景由后端返回跳转指引
- 埋点：展会首页曝光/入口点击、实名横幅曝光/点击、成功页继续下单参数补充（详见技术方案埋点章节）

## Capabilities

### New Capabilities

- `exhibition-order-entry`: 展会下单首页——撤展/来展入口展示与跳转、实名横幅显隐规则、宣传区、预加载预热
- `exhibition-order-fill`: 展会下单填单——渠道 210/220 定义与配置获取、未绑码提示条文案、指定寄件地址、缓存与渠道隔离
- `exhibition-order-scan`: 扫撤展码下单——二维码链接分发（channel + textCode）、失效场景处理、成功页「继续下单」行为分支（唤起扫一扫 / 保持渠道返回）

### Modified Capabilities

（无——现有 specs 中无单票下单页渠道配置相关 spec，本次为纯新增能力）

## Impact

- **代码**：
  - `src/modules/kye-miniapp-order/src/order-public/constants/init.ts`（Channel 枚举 + 注释）
  - `src/modules/kye-miniapp-order/src/order-public/constants/http.ts`（INIT_API_CODE_MAP）
  - `src/modules/kye-miniapp-order/src/order-public/components/business/notice-bar/index.vue`（tipText 文案）
  - `src/modules/kye-miniapp-order/src/pages/order-single/hooks/useSaveOrder.ts`（sourcePage 标记）
  - `src/modules/order-build-sub-pages/pages/order-success/hooks/useFooterConfig.ts`（goOrderAgain 分支）
  - `src/modules/order-build-sub-pages/order-exhibition/`（新建页面 + hooks）
  - `SourcePage` 枚举新增「展会扫码」值（新增定义，仓库现状无该枚举）
- **接口**：依赖后端 `web.order.init.exhibitionOrder.singlePageResult`（按 channel 区分撤展/来展配置）；`scanGraphicCode` 识别展会码由后端/基础侧支持
- **不改动**：预加载接口 singlePageV2 本身、首页入口、提交链路（save/checkInProcess）、绑码/换绑/围栏命中时保持当前 configId 的既有机制
- **多端**：改动为条件渲染与枚举分支，微信/支付宝/H5 行为一致；实名横幅、绑码提示条沿用各端既有表现
