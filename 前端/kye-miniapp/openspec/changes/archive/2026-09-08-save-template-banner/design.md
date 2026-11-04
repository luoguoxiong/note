## Context

- 需求：TY567866（#567866），仅移动端。寄件模板无值时，下单成功页由"弹窗"改为"保存模板横幅"；模板有值时保持线上逻辑不动。
- 数据来源：下单成功页已有接口 `web.order.single.app.getSingleSaveBaseResult`（[orderSuccess.ts](../../../src/modules/order-build-sub-pages/order-public/apis/waybill/orderSuccess.ts)），返回 `templateVo`，经 `useOrderSuccess.ts` 存入 `extInfo`（现有字段 `showSaveTemplate`、`bubbles`）。后端新增 `templateVo.showSaveBanner`。
- 页面：`src/modules/order-build-sub-pages/pages/order-success/index.vue`（git 追踪的真实源码，可直接修改）。
- 现有「保存模板」跳转逻辑：`useFooterConfig.ts` 的 `toSaveTemplate()`，跳 H5 `${baseUrl}#/detail?pageFrom=100`（`H5_ORDER_DEFAULT_MINI_V1` 应用地址 + xForm），本次跳转交互与线上一致。
- 审核中场景存在轮询，结束时会用最新 `templateVo` 覆盖 `extInfo`，横幅状态自动跟随，无需额外处理。

## Goals / Non-Goals

**Goals:**
- `templateVo.showSaveBanner === true` 时，下单成功页展示保存模板横幅（文案"保存为寄件模板，下次寄件直接使用" + 【保存模板】按钮），点击整个横幅跳转新增寄件模板页
- 类型与兜底数据同步补充，保证轮询覆盖后横幅状态正确

**Non-Goals:**
- 埋点（本次明确不做）
- 旧弹窗逻辑的下线（后端处理）
- `showSaveBanner` 与 `showSaveTemplate` 的互斥判断（后端保证，前端不做优先级处理）
- 寄件模板有值时的 Footer「保存模板」按钮与气泡逻辑（保持线上）

## Decisions

1. **横幅渲染位置：`index.vue` 中 `<Footer>` 之前**
   - 备选：放进 `Footer.vue` 内部。放弃原因：Footer 职责是底部按钮配置，横幅是页面级内容，放 index.vue 更清晰且不动 Footer 组件。
   - 视觉位置紧贴 Footer 上沿（与设计稿截图一致）；显隐条件 `extInfo?.showSaveBanner` 且页面非网络错误态。
2. **跳转复用线上链路：从 `useFooterConfig.ts` 导出 `toSaveTemplate`，横幅点击直接调用**
   - 备选：在 index.vue 重新拼一遍 H5 链接。放弃原因：两处拼接必然漂移；`toSaveTemplate` 内含 `to_template_report` 埋点，随复用一起触发，符合"交互同线上"。
3. **样式独立 scss + px 单位**
   - 遵循项目规则：新增横幅样式写入 `pages/order-success/index.scss`（或独立 scss 文件引入），单位用 px（打包自动转换）。
   - 视觉细节以设计稿为准（原型参考：整块可点、圆角卡片、左侧文案 + 右侧白色胶囊按钮"保存模板"）；按钮为视觉元素，点击热区为整个横幅。
4. **数据兜底**
   - `templateVo` 类型（[waybill.ts#L1033](../../../src/modules/order-build-sub-pages/order-public/types/waybill.ts)）新增 `showSaveBanner: boolean`。
   - `useOrderSuccess.ts` 两处 `extInfo.value = templateVo ?? {...}` 的兜底对象补 `showSaveBanner: false`。字段缺失时为 `undefined`（falsy），横幅隐藏，安全。

## Risks / Trade-offs

- [后端未保证 showSaveBanner 与 showSaveTemplate 互斥] → 前端按需求不做互斥处理；若线上出现同时展示，属后端数据问题，由后端修复。
- [设计稿与原型 HTML 视觉细节不一致（截图为白色卡片式，原型为渐变式）] → 以 pixso 设计稿/产品确认的截图为准，实现前与产品核对一次文案与配色。
- [审核轮询覆盖 extInfo 时横幅闪烁] → 轮询仅在审核中场景触发，覆盖后横幅状态由后端数据决定，预期稳定；若出现闪烁再评估是否需要过渡处理。

## Open Questions

- 无（互斥性、旧弹窗、埋点均已确认不涉及前端）。
