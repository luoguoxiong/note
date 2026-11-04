# 展会下单实施任务

## 1. 渠道与配置基础

- [x] 1.1 在 `kye-miniapp-order/src/order-public/constants/init.ts` 的 Channel 枚举新增 `'撤展下单' = '210'`、`'来展下单' = '220'`，并更新枚举注释（追加 `210.撤展下单 220.来展下单`）
- [x] 1.2 在 `src/modules/order-build-sub-pages/order-public/constants/init.ts` 同步执行 1.1 的修改（Channel 为存量双源结构，需双源一致），完成后逐行比对两文件 diff
- [x] 1.3 在 `src/modules/order-global-package/constants/index.ts`（单源）新增 `SourcePage` 枚举（`'展会扫码' = 'exhibitionScan'`）；主包用 `@order-global-package-order/constants`、sub 包用 `@order-global-package-order-sub/constants` 引用（见 design.md D3）
- [x] 1.4 在 `kye-miniapp-order/src/order-public/constants/http.ts` 的 `INIT_API_CODE_MAP` 新增撤展/来展映射 `'web.order.init.exhibitionOrder.singlePageResult'`
- [ ] 1.5 确认渠道值可贯通：模拟进入 `modules/order-build/pages/order/index?channel=210`，dev 编译无 TypeScript 报错（引用 `Channel.撤展下单` 的文件均可解析）

## 2. 填单页适配

- [x] 2.1 `kye-miniapp-order/src/pages/order/index.vue` 的 `setTitle()` 新增撤展/来展标题分支（`Taro.setNavigationBarTitle` + `singleOrderTitle`），放在审核类分支之前；验证 channel=210/220 标题分别为「撤展下单」「来展下单」
- [x] 2.2 `kye-miniapp-order/src/order-public/components/business/notice-bar/index.vue` 的 `tipText` computed 追加 `channel === Channel.撤展下单 || channel === Channel.来展下单` 条件，复用支付宝分支文案；验证展会渠道展示「如有客户编码，请绑码以享受专属优惠 >」
- [x] 2.3 验证提示条显隐不受展会渠道影响：后端配置不勾选「未绑码提示条」时展会填单页不渲染提示条（确认无前端隐藏逻辑遗漏或多余）——已核实渲染由 init 下发的 `bindCustomerCodeBar` 控制，组件无前端隐藏逻辑
- [x] 2.4 `kye-miniapp-order/src/pages/order-single/components/cache-block/index.vue` 的 `onBeforeMount` 白名单数组追加 `Channel.撤展下单, Channel.来展下单`（预渲染缓存数据沿用 singlePageV2 写入的 `orderConfigCache`，两者配置一致）

## 3. sourcePage 标记与成功页继续下单

- [x] 3.1 `kye-miniapp-order/src/pages/order-single/hooks/useSaveOrder.ts` 的 `goSuccessPage()` 增加 `isExhibitionScan` 判断（channel 为撤展/来展且 query 存在 textCode），命中时透传 `sourcePage: SourcePage.展会扫码`（代码见 design.md D3）
- [x] 3.2 `src/modules/order-build-sub-pages/pages/order-success/hooks/useFooterConfig.ts` 与 `root-pages/order-success/hooks/useFooterConfig.ts` 的 `goOrderAgain()` 按设计改造两个分支（两份成功页副本逻辑一致）：`sourcePage === SourcePage.展会扫码` 进入 scanQrcode 分支；撤展/来展渠道进入 `orderAgainByOrderPageKeepChannel` 分支（代码见 design.md D4）
- [ ] 3.3 自测成功页三条路径：① 扫码参数进入撤展单（URL 带 channel=210&textCode）→ 提交成功 → 继续下单唤起扫一扫；② 首页进入撤展单（无 textCode）→ 提交成功 → 继续下单跳回填单页且 channel 保持 210；③ 快速寄件 → 继续下单仍重置为快速寄件
- [ ] 3.4 验证「继续下单回到填单页为空白」：成功页跳回后 store 表单数据无残留（回归 `goSuccessAfter → resetWaybillInfo` 链路 + CacheBlock 缓存页表现），异常时补充清理逻辑

## 4. 展会下单首页

- [x] 4.1 新建 `src/modules/order-build-sub-pages/pages/order-exhibition/index.vue` + `index.config.ts` + `index.scss`（样式独立 scss 文件，单位用 px）：入口卡片列表（撤展 > 来展）、实名横幅、宣传区（「5大核心优势」单张长图 CDN webp 外链整体渲染，点击无跳转）
- [x] 4.2 实现入口跳转与预加载：卡片点击 `navigateTo` 到 `/modules/order-build/pages/order/index?channel=<210|220>`；`onBeforeMount` 调 `useExhibitionPreloadTask()`（`web.order.init.exhibitionOrder.singlePage`，入参 `{ source }`，**仅前端触发后端预初始化、不写本地缓存**；预渲染缓存沿用 singlePageV2 的 `orderConfigCache`；代码见 `src/public/apis/order/index.ts` L75-93 与 design.md D7）
- [x] 4.3 实现实名横幅：复用 `../order-success/hooks/useRealAuth`，`showReal = customerCode && showGoRealNameFlag && realNameButtonType === 10`；`onMounted` + `watch(customerCode)` 触发 `getSuccessPageTipsData`；点击跳 `/modules/user/pages/realname/personal/index?forceFlag=10&origin=orderExhibition`；返回首页时刷新实名状态
- [ ] 4.4 在 `src/wx.config.ts` 与 `src/alipay.config.ts` 的 `root: 'modules/order-build-sub-pages'` pages 数组注册 `'pages/order-exhibition/index'`；微信开发者工具与支付宝开发者工具分别编译确认页面可打开
- [ ] 4.5 核实子包体积：编译后 `modules/order-build-sub-pages` 未超 2MB（宣传图走 CDN 外链不应影响）

## 5. 实名完成页适配

- [x] 5.1 `src/modules/user/pages/realname/finish/index.vue` 新增 `isShowContinue = computed(() => realNameStore.originFromQuery === 'orderExhibition')`，按钮条件模板改为 `isShowContinue || (isFromOrder && !isFromShare) || forceFlag === '20'`；确认埋点 `pathMap` 是否需补 `orderExhibition` 映射——已补（`orderExhibition: '展会下单'`）；origin 链路已核实（personal 页 getQueryObject().origin → setOriginFromQuery 持久化）
- [ ] 5.2 验证实名链路：展会首页 → 去实名 → 个人认证完成 → 点「继续寄件」返回展会首页 → 横幅消失（实名状态已刷新）

## 6. 扫撤展码链路（依赖后端）

- [ ] 6.1 与后端确认展会码返回结构：有效码 jumpUrl 携带 `channel=210&textCode`；失效码返回 `jumpType=2` + jumpUrl 指向 empty 页（`emptyStatus=二维码已失效`）；将结论回填技术方案文档
- [ ] 6.2 联调扫码链路：小程序内扫一扫与微信直接扫普通链接二维码（`scan/home` 中转页 q 参数解析）两条路径均能进入撤展填单页；指定寄件地址按后端返回自动回填
- [ ] 6.3 联调失效场景：扫过期码跳转「二维码已失效」缺省页，不停留空白中转页

## 7. 埋点（事件号已登记）

- [x] 7.1 新建 `src/modules/order-build-sub-pages/pages/order-exhibition/report/index.ts`，按登记事件号实现 6 个事件上报（见 design.md D7 埋点表）：`page_express_exhibition_v1`（页面浏览，含 `ref_source` 前向来源）、`other_express_exhibition_perception_v1`（页面感知）、`clk_express_exhibition_dismantling_v1`（撤展点击）、`clk_express_exhibition_arrival_v1`（来展点击）、`exp_express_result_kyc`（实名横幅曝光，watch showReal）、`clk_express_result_kyc`（去实名点击）
- [ ] 7.2 页面浏览 `ref_source` 参数取值确认：前向来源枚举为首页/寄件页/查件页，核实进入展会首页的来源链路并映射取值（无匹配来源时的兜底值）
- [x] 7.3 在 `src/modules/order-build-sub-pages/order-public/configs/report.ts` 的 `sourcePageReportMap` 登记 `'exhibitionScan': '展会扫码'`，确保下单页埋点 `ref_page_name` 正确映射；成功页继续下单埋点补充 `sourcePage`/`channel` 维度（`clk_express_result_continue_placing_order_v1` 已支持 params 透传）

## 8. 回归与收尾

- [ ] 8.1 回归既有渠道：快速寄件/扫二维码/广交会活动码/审核类/邀请寄的下单与成功页继续下单行为不变
- [ ] 8.2 微信 + 支付宝双端回归：展会首页、填单页标题/文案、成功页分支、实名链路
- [ ] 8.3 逐行比对两份 `constants/init.ts` 的 Channel/SourcePage 修改一致性；核对实际代码与 design.md 决策一致（尤其 goOrderAgain 比较表达式完整性）
- [ ] 8.4 更新知识库：将展会下单页面说明/数据流沉淀至 `netc-waybill-doc/下单/技术知识/前端/`；归档 openspec 产物至需求质检目录
