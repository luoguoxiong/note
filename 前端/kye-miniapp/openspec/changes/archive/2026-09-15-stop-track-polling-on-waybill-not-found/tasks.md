## 1. 常量定义

- [x] 1.1 在 `src/modules/kye-miniapp-waybill/src/pages/waybill-route/constant.ts` 中新增 `WAYBILL_API_ERROR_CODE` 常量，包含 `WAYBILL_NOT_FOUND: 56008`（未查询到运单信息），附注释说明对应草稿单/虚拟运单场景。完成标准：常量导出且无裸数字 56008 散落在逻辑代码中。

## 2. 轮询 Hook 改造

- [x] 2.1 在 `src/modules/kye-miniapp-waybill/src/pages/waybill-route/components/routeMap/hooks/usePolling.ts` 中从 `'../../../constant'` 导入 `WAYBILL_API_ERROR_CODE`（与现有 `WAYBILL_STATUS` 导入合并）。完成标准：导入语句正确，TypeScript 无报错。
- [x] 2.2 修改 `onListWaybillTracksInPeriod` 的 `catch (e)` 分支：当 `e?.code === WAYBILL_API_ERROR_CODE.WAYBILL_NOT_FOUND` 时，调用 `clearPollingTimer()` 并 `return` 终止轮询；其余错误码保持原有 `startNextPolling()` 调用不变。完成标准：56008 分支不再调度下一轮，非 56008 分支行为与改动前一致。
- [x] 2.3 自查 Hook 对外暴露的 API（返回值）与唯一调用方 `weApp.vue` 无需改动，`onUnmounted` 清理逻辑不受影响；支付宝 `aliPay.vue`、H5 `h5.vue` 不接入轮询、不受影响。完成标准：调用方代码零改动，类型检查通过。（已通过 GetDiagnostics 零诊断 + git diff 仅两个源文件确认）

## 3. 验证（微信端）

- [ ] 3.1 场景 1（核心）：构造增量接口返回 `code=56008` 的运单（草稿单/虚拟运单，或 mock 增量接口 56008、全量接口正常），进入轨迹页观察到一次「增量轨迹获取失败」且 `code=56008` 后，网络面板中不再发起 `listWaybillTracksInPeriod` 请求；页面可正常退出、无卡死、无报错弹窗。
- [ ] 3.2 场景 2：运输中正常运单进入轨迹页，增量轮询按 15 分钟间隔持续，车辆位置/轨迹点与小车动画正常。
- [ ] 3.3 场景 3：非运输中正常运单无增量数据时，轮询仍按配置间隔（默认 5 秒）继续，后续产生新轨迹能及时刷新。
- [ ] 3.4 场景 4：模拟网络超时等非 56008 失败后，轮询仍继续，网络恢复后可正常拉取轨迹。
- [ ] 3.5 通用回归：已签收等正常运单的轨迹展示、气泡、动画与改前一致；确认改动仅落在 `kye-miniapp-waybill/src` 源码目录（`usePolling.ts` 与 `constant.ts`），未误改 `waybill-build` 等副本目录；支付宝/H5 端轨迹页行为无变化。
