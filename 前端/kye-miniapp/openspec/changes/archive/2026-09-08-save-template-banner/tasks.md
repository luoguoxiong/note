## 1. 类型与数据层

- [x] 1.1 在 `src/modules/order-build-sub-pages/order-public/types/waybill.ts` 的 `templateVo` 接口中新增 `showSaveBanner: boolean` 字段（完成标准：类型无报错，编译通过）
- [x] 1.2 在 `src/modules/order-build-sub-pages/pages/order-success/hooks/useOrderSuccess.ts` 两处 `extInfo.value = templateVo ?? {...}` 兜底对象（初次加载 L134、审核轮询 L100）中补充 `showSaveBanner: false`（完成标准：字段缺失时横幅不展示，无 undefined 告警）

## 2. 横幅 UI 与跳转

- [x] 2.1 在 `useFooterConfig.ts` 中导出 `toSaveTemplate`（含 H5 链路 `#/detail?pageFrom=100`），供横幅点击复用（完成标准：可从页面组件 import 且调用后跳转与线上「保存模板」按钮一致）
- [x] 2.2 在 `pages/order-success/index.vue` 的 `<Footer>` 之前新增横幅节点：`v-if="extInfo?.showSaveBanner"`，内容为文案"保存为寄件模板，下次寄件直接使用" + "保存模板"按钮，整块绑定点击调用 `toSaveTemplate`（完成标准：点击横幅任意区域可跳转新增寄件模板页）
- [x] 2.3 编写横幅样式（独立 scss，px 单位），视觉对照设计稿/原型：整块可点卡片、左侧文案 + 右侧按钮，位置紧贴 Footer 上沿（完成标准：与设计稿截图逐项比对一致）

## 3. 自测与回归

- [x] 3.1 微信小程序端自测：`showSaveBanner=true` 展示横幅、`=false`/字段缺失隐藏、点击跳转正确（完成标准：三种场景均符合 spec 场景描述）
- [x] 3.2 回归模板有值场景：Footer「保存模板」按钮与气泡展示/交互与线上一致，横幅不出现（完成标准：与改动前行为一致）
- [x] 3.3 审核中场景验证：轮询结束后横幅状态跟随最新 `templateVo`（完成标准：审核完成刷新后横幅显隐正确、无闪烁异常）
