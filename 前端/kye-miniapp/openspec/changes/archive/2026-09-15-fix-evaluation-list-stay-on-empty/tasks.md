## 1. 移除评价完成后的跳转逻辑

- [x] 1.1 修改 `src/modules/kye-miniapp-waybill/src/pages/evaluation-list/index.vue` 的 `onEvaluatedSuccess`：删除 `nextTick` 内调用 `onToBack()` 的整段跳转判断（含 `allData.length === 0` 与 `allData.length < 10 && rowTotal === 0` 两个分支），保留 `evaluationListRef.value?.init()` 刷新与 `checks`/`allChecked` 重置、`reportExp` 埋点逻辑
- [x] 1.2 删除同文件中不再被引用的 `onToBack` 函数（`Taro.switchTab` 跳转 `/layout/pages/waybill/index`）；若 `nextTick`  import 不再被使用则一并清理
- [x] 1.3 确认改动后无未使用变量/TS 报错（`rowTotal` 仍被 `isBatch`/`listFetch` 使用，保留）

## 2. 自检验证

- [ ] 2.1 微信小程序：聚合页仅剩 1 票待评价时完成一键评价，验证页面停留在聚合页并展示「暂无待评价运单」空状态，未跳转查件 tab
- [ ] 2.2 微信小程序：全部评价完成后在空状态页下拉刷新，验证仍停留当前页展示空状态，不跳转
- [ ] 2.3 微信小程序：多票运单只评价部分，验证成功后列表刷新、剩余待评价运单正常展示、底部「一键评价」栏按 `isBatch` 逻辑正常显隐
- [ ] 2.4 支付宝小程序 / H5：重复 2.1、2.2 场景，验证三端行为一致（空状态由 ky-list-standard 内部机制渲染）
- [ ] 2.5 回归：顶部规则横幅、评价记录入口、空状态「去寄件」按钮、在线客服入口、单票评价提交功能均保持原有行为
