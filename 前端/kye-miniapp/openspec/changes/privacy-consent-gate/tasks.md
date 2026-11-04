# Tasks: privacy-consent-gate

## 1. 门禁 Hook

- [x] 1.1 新建 `src/public/hooks/usePrivacePopup.ts`：`isAgree` 基于 `IS_AGREE_PRIVACE` 缓存与 `isApp` 初始化
- [x] 1.2 `useReady` 时未同意调用 `Taro.hideTabBar()` 隐藏底部四 Tab，失败打日志
- [x] 1.3 实现 `agreePrivace()`：置位状态、`Taro.showTabBar()`（fail 100ms 重试兜底）、写入 `IS_AGREE_PRIVACE=true`、执行并清空挂起回调
- [x] 1.4 实现 `cancelAgree()`：写入 `IS_AGREE_PRIVACE=false`，非 H5 环境调用 `Taro.exitMiniProgram()` 退出
- [x] 1.5 实现 `waitForAgree(onAlreadyAgreed, onPendingAgree)`：已同意立即执行，未同意挂起回调并执行兜底动作

## 2. 首页接入

- [x] 2.1 首页渲染 `PrivacePopup`（`v-if="!isAgree"`），绑定 `confirm→agreePrivace`、`cancel→cancelAgree`
- [x] 2.2 `getNoLoginData` 广告拉取改为 `waitForAgree` 包装，挂起时复位 `isFetching`
- [x] 2.3 `getNewCustomerData` 广告拉取改为 `waitForAgree` 包装，挂起时复位 `isFetching`
- [x] 2.4 `getOldCustomerData` 广告拉取改为 `waitForAgree` 包装，挂起时复位 `isFetching`
- [x] 2.5 版本弹窗 watcher 的 tabBar 恢复分支增加 `isAgree.value` 前置条件，未同意时不调用 `Taro.showTabBar()`

## 3. 验证

- [x] 3.1 微信开发者工具：清除缓存编译 → 首页弹窗弹出、底部四 Tab 隐藏、页面功能入口不可点、广告请求未发出
- [x] 3.2 微信端点击【同意并继续】→ Tab 恢复、广告请求补发、推送弹窗按既有规则展示；再次进入不弹窗
- [x] 3.3 微信端点击【不同意】→ 退出小程序；再次进入重新弹窗
- [x] 3.4 支付宝端重复 3.1–3.3，重点实测 `Taro.exitMiniProgram` 退出能力
- [x] 3.5 H5 环境回归：不同意仅关闭弹窗不退出，App 容器（isApp）不触发弹窗
