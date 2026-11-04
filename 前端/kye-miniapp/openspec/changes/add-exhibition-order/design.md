# 展会下单技术设计

## Context

**架构与代码归属**：本需求横跨三处代码——主应用（页面注册/实名模块）、下单子应用 `kye-miniapp-order`（channel/init/notice-bar/useSaveOrder，构建产物为 `order-build`）、嵌套子包源码目录 `src/modules/order-build-sub-pages`（展会首页新页面、下单成功页）。

**关键现状（已核实源码）**：

| 事实 | 位置 |
| --- | --- |
| Channel 枚举（10~190）存在 **两份源码**，需同步修改 | `kye-miniapp-order/src/order-public/constants/init.ts` L148-168；`order-build-sub-pages/order-public/constants/init.ts`（同结构） |
| `INIT_API_CODE_MAP` 现有 17 项映射 | `kye-miniapp-order/src/order-public/constants/http.ts` L29-47 |
| 填单页标题由 `setTitle()` 逐分支设置（非映射表） | `kye-miniapp-order/src/pages/order/index.vue` L39-79 |
| 未绑码提示条文案仅区分支付宝 | `order-public/components/business/notice-bar/index.vue` L28-34 |
| 成功页继续下单三分支（扫二维码/广交会保渠道/默认重置） | `order-build-sub-pages/pages/order-success/hooks/useFooterConfig.ts` L67-93 |
| 下单成功跳转 `goSuccessPage` 仅透传 batchId/channel/phone | `kye-miniapp-order/src/pages/order-single/hooks/useSaveOrder.ts` L235-243 |
| 提交成功即执行 `goSuccessAfter → resetWaybillInfo`（重置表单缓存） | `useSaveOrder.ts` L175-181；`order-public/utils/waybillInfo.ts` L18-25 |
| 预加载 = `web.order.init.quickOrder.singlePageV2`（快速寄件，30 分钟刷新，登录后必触发，写入 `orderConfigCache`）；展会预加载 = `web.order.init.exhibitionOrder.singlePage`（仅前端触发后端初始化，不写缓存） | `src/public/apis/order/index.ts` L27-93 |
| `useRealAuth` 为模块级单例（ref 在模块顶层），导出 `showGoRealNameFlag/realNameButtonType/getSuccessPageTipsData` | `order-build-sub-pages/pages/order-success/hooks/useRealAuth.ts` |
| 实名完成页「继续寄件」按钮条件为 `(isFromOrder && !isFromShare) \|\| forceFlag === '20'`，**无** origin=orderExhibition 分支 | `src/modules/user/pages/realname/finish/index.vue` L19、L138-140 |
| 主应用 store 导出 `useUserGlobalStore`，含 `customerCode` getter | `src/store/user.ts` L24、L77 |
| `order-build-sub-pages` 页面注册在 **主应用** 平台配置（非子应用 app.config.ts） | `src/wx.config.ts` L207-235；`src/alipay.config.ts` L100-125 |
| 别名：`@order-public` → order-build 主包；`@order-public-sub-public` → sub-pages 包；`@` → 主应用 src | `config/index.ts` L61-78 |
| 仓库无 `SourcePage` 枚举（技术方案为预设命名） | 全仓 grep 无命中 |

## Goals / Non-Goals

**Goals:**
- 撤展（210）/来展（220）渠道填单全链路：渠道定义 → 独立 init 配置 → 标题 → 文案 → sourcePage 标记 → 成功页继续下单分支
- 展会下单首页：入口卡片、实名横幅、预加载预热、宣传区
- 扫撤展码：handleCommonScan 链路透传（channel + textCode）、失效缺省页

**Non-Goals:**
- 寄件首页「展会下单」入口（其他同事负责）
- 后端 init 接口、二维码生成/识别、指定寄件地址返回逻辑
- 绑码/换绑/围栏命中保持 configId 的既有机制改动（复用现状）
- 提交链路（save/checkInProcess）改动

## Decisions

### D1. 渠道枚举双源同步维护

`Channel` 在两处源码中各有一份（主包与 sub-pages 包不共享构建产物），**必须同时新增**，否则 `useFooterConfig`（引用 `@order-public-sub-public/constants`）编译失败。

```ts
// kye-miniapp-order/src/order-public/constants/init.ts 与
// src/modules/order-build-sub-pages/order-public/constants/init.ts 同步修改

/**
 * @description 下单渠道 10.快速寄件，20.扫二维码下单，30.扫项目编码下单，40.扫活动码下单,50再来一单，60.修改运单 70.退出活动 80.立即前往 90.返程单 140.批量立即前往 160.运单审核 170.调价审核 180.托寄物审核 190.邀请寄 210.撤展下单 220.来展下单
 */
export enum Channel {
  // ...现有值保持不变
  '邀请寄' = '190',
  '撤展下单' = '210',
  '来展下单' = '220',
}
```

替代方案：让 sub-pages 直接 import 主包 constants——不行，两包产物独立、别名指向不同目录，强行跨包引用会破坏分包隔离。

### D2. init 接口映射

```ts
// kye-miniapp-order/src/order-public/constants/http.ts
export const INIT_API_CODE_MAP = {
  // ...现有映射保持不变
  [Channel.撤展下单]: 'web.order.init.exhibitionOrder.singlePageResult',
  [Channel.来展下单]: 'web.order.init.exhibitionOrder.singlePageResult',
}
```

撤展/来展共用同一 apiCode：后端以 **channel** 区分返回哪套配置（撤展=寄件信息模块，来展=收件信息模块），**textCode** 仅用于标记「扫码撤展下单」场景（影响指定地址等数据返回）。前端无需区分。

### D3. 新增 SourcePage 枚举并向成功页透传

技术方案中的 `SourcePage.展会扫码` 当前不存在，需新增。**放置位置：`order-global-package`（单源）**，而非 Channel 所在的 order-public constants——后者存在主包/sub-pages 包两份源码需双源同步，而 `order-global-package` 真源码只有一份（`src/modules/order-global-package`），构建时由插件复制到各子包、dev 环境热同步，单点维护：

```ts
// src/modules/order-global-package/constants/index.ts（单源，与 FeeAuthApplyStatus 同文件）
/**
 * @description 下单成功页来源标记
 */
export enum SourcePage {
  '展会扫码' = 'exhibitionScan',
}
```

消费方按各自子包别名引用（指向同一份源码的构建副本）：

```ts
// 主包（useSaveOrder 等）
import { SourcePage } from '@order-global-package-order/constants'
// sub-pages 包（useFooterConfig、order-exhibition 等）
import { SourcePage } from '@order-global-package-order-sub/constants'
```

存量 `sourcePage` 值（`gjh`、`freightTime`、`wx-scan` 等 30+ 个）为字符串散落模式，本次不迁移，仅新值用枚举；`sourcePageReportMap` 需登记 `'exhibitionScan': '展会扫码'` 供埋点映射。

`goSuccessPage` 透传（仅在「展会渠道 + 存在 textCode」即扫码进入时标记）：

```ts
// kye-miniapp-order/src/pages/order-single/hooks/useSaveOrder.ts
import { Channel } from '@order-public/constants'
import { SourcePage } from '@order-global-package-order/constants'

const goSuccessPage = async () => {
  console.log('afterToastSuccess', 1)
  orderPageScrollTop.value = 0
  setConfigOrderSuccessPageConfig()
  const query = getQueryObject() as QueryObject
  // 展会扫码进入（撤展/来展渠道 + textCode）时，向成功页透传来源标记
  const isExhibitionScan =
    (getChannel() === Channel.撤展下单 || getChannel() === Channel.来展下单) && !!query?.textCode
  router.replace({
    path: '/order-success',
    query: {
      batchId: getBatchId(),
      channel: getChannel(),
      phone: piniaStore.root.getUserInfo?.phone ?? '',
      ...(isExhibitionScan ? { sourcePage: SourcePage.展会扫码 } : {}),
    },
  })
}
```

注意 `goSuccessPage` 的 query 是本次替换生成的，与浏览器当前 query 无关，所以必须显式透传。

### D4. 成功页「继续下单」分支（修正技术方案伪代码）

技术方案伪代码存在笔误 `|| Channel.来展下单`（枚举值恒为真），落地代码如下：

```ts
// order-build-sub-pages/pages/order-success/hooks/useFooterConfig.ts
import { Channel } from '@order-public-sub-public/constants'
import { SourcePage } from '@order-global-package-order-sub/constants'
import { OrderSuccessType } from '@order-public-sub-public/constants'

const goOrderAgain = async () => {
  clk_express_result_continue_placing_order_v1()
  const { sourcePage, channel } = getQueryObject()
  try {
    // 离开页面，重置batchId
    saveBatchId('', true, {
      allowEmpty: true,
      fromType: 'goOrderAgain',
    })
    if (channel === Channel.扫二维码下单 || sourcePage === SourcePage.展会扫码) {
      // 扫码场景（含展会扫码）：继续下单唤起扫一扫，可连续扫多张撤展码
      scanQrcode({ navigateType: 'redirectTo' })
    } else if (
      (channel === Channel.扫活动码下单 && sourcePage === 'gjh') ||
      channel === Channel.撤展下单 ||
      channel === Channel.来展下单
    ) {
      // 广交会/展会渠道跳进来的不重置 channel 以及其他参数
      orderAgainByOrderPageKeepChannel()
    } else {
      // 如果不是扫二维码，离开页面重置 channel
      orderAgainByOrderPage()
      setChannel(Channel.快速寄件)
    }
  } catch (error) {
    console.log(error)
  }
}
```

「清空上次填单缓存」无需新增代码：提交成功跳成功页前 `goSuccessAfter()` 已执行 `resetWaybillInfo()`（重置 order store 表单数据），`orderAgainByOrderPageKeepChannel` 跳回填单页时 store 已为空白。落地后需回归验证 keep-alive 缓存页（CacheBlock）不残留旧值。

### D5. 填单页标题

`setTitle()` 是逐分支结构，在审核类分支前追加展会分支：

```ts
// kye-miniapp-order/src/pages/order/index.vue  setTitle() 内
if (channel === Channel.撤展下单) {
  singleOrderTitle.value = '撤展下单'
  Taro.setNavigationBarTitle({ title: '撤展下单' })
  return
}

if (channel === Channel.来展下单) {
  singleOrderTitle.value = '来展下单'
  Taro.setNavigationBarTitle({ title: '来展下单' })
  return
}
```

### D6. 未绑码提示条文案

沿用支付宝同款文案（`isAliPayClient` 分支已存在，追加渠道条件）：

```ts
// kye-miniapp-order/src/order-public/components/business/notice-bar/index.vue
const tipText = computed(() => {
  let tipsMsg = '为保证您公司信息安全，请先<span style="color: #8365F6">绑码下单 ></span>'
  if (isAliPayClient || channel === Channel.撤展下单 || channel === Channel.来展下单) {
    tipsMsg = '如有客户编码，请<span style="color: #8365F6">绑码以享受专属优惠 ></span>'
  }
  return tipsMsg
})
```

`channel` 取值沿用组件内既有方式（`getChannel()`）。提示条显隐不做前端渠道判断——由后端展会配置「未绑码提示条」勾选项控制。

### D7. 展会下单首页（新页面）

**位置**：`src/modules/order-build-sub-pages/pages/order-exhibition/index.vue` + `index.config.ts` + 独立 scss 文件。

**注册**：在 `src/wx.config.ts` 与 `src/alipay.config.ts` 的 `root: 'modules/order-build-sub-pages'` pages 数组中追加 `'pages/order-exhibition/index'`。

**实名横幅**：复用 `useRealAuth`（模块级单例，与成功页共享状态）。两个关键差异：
- 跳转不用 hook 的 `goRealNameAuth()`（其内部 `goRealNameHome` 不携带展会来源参数），页面自定义跳转带 `origin=orderExhibition`
- `useRealAuth` 依赖成功页生命周期触发查询，首页必须自行调 `getSuccessPageTipsData()`，且以 `customerCode` 为前置门槛

```vue
<!-- src/modules/order-build-sub-pages/pages/order-exhibition/index.vue（script 核心段） -->
<script setup lang="ts">
import Taro, { useUnload } from '@tarojs/taro'
import { computed, onBeforeMount, onMounted, watch } from 'vue'
import { useUserGlobalStore } from '@/store/user'
import { useRealAuth } from '../order-success/hooks/useRealAuth'
import { useExhibitionPreloadTask } from '@/public/apis/order'
import { Channel } from '@order-public-sub-public/constants'
import {
  page_express_exhibition_v1,
  other_express_exhibition_perception_v1,
  clk_express_exhibition_dismantling_v1,
  clk_express_exhibition_arrival_v1,
  exp_express_result_kyc,
  clk_express_result_kyc,
} from './report'
import './index.scss'

const userStore = useUserGlobalStore()
const { showGoRealNameFlag, realNameButtonType, getSuccessPageTipsData } = useRealAuth()

// 实名横幅：已绑码 + 需实名 + 按钮类型为 10（非转发类）
const showReal = computed(
  () => !!userStore.customerCode && showGoRealNameFlag.value && realNameButtonType.value === 10,
)

const getRealData = () => {
  if (!userStore.customerCode) {
    return
  }
  getSuccessPageTipsData()
}

watch(() => userStore.customerCode, getRealData)
onMounted(getRealData)

// 实名横幅曝光上报：showReal 从 false 变为 true 时触发一次
watch(showReal, (val) => {
  val && exp_express_result_kyc()
})

// 预加载：触发后端提前初始化展会下单配置，结果写入本地缓存供下单页预渲染
onBeforeMount(() => {
  useExhibitionPreloadTask()
})

// 撤展/来展入口（顺序：撤展 > 来展）
const ENTRY_LIST = [
  { key: '撤展下单', channel: Channel.撤展下单 },
  { key: '来展下单', channel: Channel.来展下单 },
]

const goFill = (channel: Channel) => {
  // 按渠道分流上报入口点击
  channel === Channel.撤展下单
    ? clk_express_exhibition_dismantling_v1()
    : clk_express_exhibition_arrival_v1()
  Taro.navigateTo({
    url: `/modules/order-build/pages/order/index?channel=${channel}`,
  })
}

const jumpReal = () => {
  clk_express_result_kyc()
  Taro.navigateTo({
    url: '/modules/user/pages/realname/personal/index?forceFlag=10&origin=orderExhibition',
  })
}
</script>
```

**埋点事件（已登记）**：新建 `pages/order-exhibition/report.ts`，含 6 个事件——

| 事件 | 类型 | 触发时机 | 参数 |
| --- | --- | --- | --- |
| `page_express_exhibition_v1` | 页面浏览 | 展会首页 `useDidShow` | `ref_source`：前向来源（首页/寄件页/查件页） |
| `other_express_exhibition_perception_v1` | 展会下单感知 | 展会首页展示入口卡片时 | - |
| `clk_express_exhibition_dismantling_v1` | 点击 | 撤展下单入口 | - |
| `clk_express_exhibition_arrival_v1` | 点击 | 来展下单入口 | - |
| `exp_express_result_kyc` | 曝光 | 实名横幅出现（`showReal` 变为 true） | - |
| `clk_express_result_kyc` | 点击 | 去实名点击 | - |

模板结构：入口卡片列表 → 实名横幅（`v-if="showReal"`）→ 宣传区。**宣传区为单张长图**（「5大核心优势」标题与 5 个条目均在图内，CDN webp 外链 `<image>` 整体渲染、宽度 100% 高度自适应，不拆切图、不做内部跳转），不占子包体积。

**图片资源（已交付 CDN）**：

```ts
// 入口图标（112×112 svg，经 SvgIcon imgUrl 引用）
const ICON_DISMANTLE = 'https://ic-img.ky-express.com/netc/20260928_5397_!!1790577180161_112_112.svg+xml'
const ICON_ARRIVAL = 'https://ic-img.ky-express.com/netc/20260928_35260_!!1790577198932_112_112.svg+xml'
// 5大核心优势长图（整体渲染）
const ADVANTAGE_IMG = 'https://ic-img.ky-express.com/netc/20260928_98145_!!1790565219541_1372_1728.webp'
```

**预加载口径**：展会首页 `onBeforeMount` 调 `web.order.init.exhibitionOrder.singlePage`（入参 `{ source }`），**仅前端触发后端提前初始化展会下单配置，不写本地缓存**。预渲染缓存数据沿用 singlePageV2 的 `orderConfigCache`（登录后必触发，两者配置一致）；cache-block 白名单（含撤展/来展渠道）据此进入预渲染。下单页真实配置仍以 `INIT_API_CODE_MAP` 的 `exhibitionOrder.singlePageResult` 为准。

### D8. 实名完成页支持展会来源

`finish` 页现状无 origin=orderExhibition 分支，需新增（`realNameStore.originFromQuery` 已有链路，个人实名页透传 origin 即可写入）：

```ts
// src/modules/user/pages/realname/finish/index.vue
const isShowContinue = computed(() => realNameStore.originFromQuery === 'orderExhibition')

<template v-if="isShowContinue || (isFromOrder && !isFromShare) || forceVerifyObj.forceFlag === '20'">
  <ky-button type="primary" @click="goBackContinueOrder">继续寄件</ky-button>
  ...
```

`goBackContinueOrder` 内部为 `Taro.navigateBack()`：个人实名页进入时走 redirectTo，back 即返回展会首页。横幅隐藏依赖首页返回后重新查询（`useDidShow` 时触发 `getRealData`，或依赖 visibilitychange 监听），不依赖实名完成回调。

### D9. 扫撤展码链路与失效

- 有效码：`handleCommonScan` 既有分发已支持「后端返回 jumpUrl 直接跳转」，展会码返回的 jumpUrl 携带 `channel=210&textCode=<客户编码>` 即可进入撤展填单页，前端无新增分发逻辑
- 失效码（超过生成时间 + 3 天 / 客户编码未绑定销售项目）：由后端返回 `jumpType=2 + jumpUrl`（指向 order 子应用 empty 页，`emptyStatus=二维码已失效`），前端跳转既有 empty 缺省页，不停留空白中转页

## Risks / Trade-offs

- **[Channel 双源漂移]** → 两处 order-public constants 必须同步修改；SourcePage 已单源化至 order-global-package 无此问题。tasks 中列为独立检查项，CR 时逐行比对
- **[跨仓发布耦合]** → SourcePage 定义在主应用仓库的 order-global-package，消费方 useSaveOrder 在 kye-miniapp-order 子仓库，需同批发布（本需求本来就横跨两者）
- **[useRealAuth 单例状态残留]** → 展会首页与成功页共享同一份模块级 ref；首页 `onMounted` 主动调 `getSuccessPageTipsData()` 覆盖，且 `customerCode` 为空时不展示
- **[预加载数据与展会配置不一致]** → 展会预加载走专属接口 `exhibitionOrder.singlePage`，仅触发后端预初始化、不写本地缓存；cache-block 预渲染沿用 singlePageV2 缓存（登录后必触发，配置一致），下单页 init（`singlePageResult`）刷新最终配置
- **[sub-pages 子包 2MB 体积限制]** → 宣传图用 CDN webp 外链，不在包内置图
- **[后端依赖排期]** → `exhibitionOrder` init 接口、展会码识别（scanGraphicCode）由后端交付；前端可先完成非扫码链路联调

## Migration Plan

纯新增渠道与页面，无存量数据迁移。上线顺序：后端 init 接口就绪 → 前端发布 → 二维码投放。回滚策略：下线二维码投放与入口即可，前端代码按渠道分支隔离、可随版本回退。

## Open Questions

- 后端 `scanGraphicCode` 支持展会码识别的时间点（阻塞扫码链路联调，不阻塞前端开发）
