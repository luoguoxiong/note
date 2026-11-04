# Proposal: privacy-consent-gate

## Why

禅道需求：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/574608

微信/支付宝小程序首次唤起隐私政策弹窗时未做全屏遮罩，用户无需同意即可点击底层功能入口进入业务页面，进入后接口会采集个人信息，违反《个人信息保护法》明示同意原则与微信小程序隐私合规规范。需要为首次打开流程增加强制隐私确认门禁：未选择前锁定全部功能入口并隐藏底部 Tab，同意后解锁，不同意退出，且未同意前屏蔽精准通知推送弹窗。

## What Changes

- 首页新增隐私确认门禁 Hook `usePrivacePopup`（`src/public/hooks/usePrivacePopup.ts`）：
  - 基于本地缓存 `IS_AGREE_PRIVACE` 判定同意状态，App 容器（`isApp`）视为已同意
  - `useReady` 时未同意则 `Taro.hideTabBar()` 隐藏底部四 Tab
  - `agreePrivace()`：置位同意状态、`Taro.showTabBar()`（失败 100ms 重试兜底）、写入缓存、执行挂起的待同意回调
  - `cancelAgree()`：写入不同意缓存并 `Taro.exitMiniProgram()` 退出小程序（H5 环境跳过退出）
  - `waitForAgree(onAlreadyAgreed, onPendingAgree)`：已同意立即执行，未同意挂起回调并执行兜底动作
- 首页（`src/layout/pages/home/index.vue`）接入门禁：
  - 未同意时渲染 `PrivacePopup` 隐私确认弹窗（ky-popup 全屏遮罩，`closeOnClickOverlay=false`，仅【同意并继续】/【不同意】两个出口，点击遮罩与右上角关闭均按不同意处理）
  - 三个广告数据拉取分支（新客/未登录/老客）改为 `waitForAgree` 包装，未同意时阻断精准通知推送弹窗数据获取
  - 版本弹窗 watcher 的 tabBar 恢复分支增加 `isAgree.value` 前置条件，未同意时不调用 `Taro.showTabBar()`

## Capabilities

### New Capabilities

- `privacy-consent-gate`: 小程序首次打开隐私确认门禁，覆盖同意状态存储、底部 Tab 隐藏/恢复、强制二选一弹窗、不同意退出、精准通知推送弹窗的同意前置拦截

### Modified Capabilities

（无既有 capability 的需求级变更）
