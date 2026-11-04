## Why

生产环境接口压力告警：运单轨迹地图页的「增量轨迹」轮询在异常运单（草稿单、虚拟运单）场景下产生确定性的无效请求。这类运单后端统一返回错误码 `56008`（未查询到运单信息），永远不可能查到轨迹，但前端 `usePolling` Hook 的 `catch` 分支无条件继续调度下一轮轮询，导致页面停留期间以非运输中 5 秒 / 运输中 15 分钟的间隔无限请求 `web.query.waybill.listWaybillTracksInPeriod`，并连带放大后端对 TMS 上游的调用压力。

> 注：经代码核查，增量轮询 Hook 当前仅微信端轨迹页（`weApp.vue`）接入；支付宝端无数据轮询、H5 端仅有动画绘制定时器。问题实际影响微信端，详见 design.md。

禅道需求：[#566584 【技术优化】移动端-web.query.waybill.listWaybillTracksInPeriod调用次数逻辑优化](https://zentao.ky-tech.com.cn/platform-home/#/need-detail/566584)

## What Changes

- 增量轨迹轮询失败时，区分错误类型：仅当后端返回确定性业务失败 `code === 56008`（未查询到运单信息）时，清除定时器并停止后续轮询。
- 其余错误码（网络抖动、临时超时等可恢复失败）维持原有「继续轮询」行为不变，保证自愈能力。
- 正常运单的轮询节奏（运输中 15 分钟、非运输中配置间隔默认 5 秒）、轨迹展示、小车动画均不受影响。
- 新增 `56008` 错误码常量定义，避免裸数字魔法值。
- 不修改任何后端接口签名、返回结构或错误码定义，业务契约零变更；不新增任何 UI 提示（接口本就 `hideToast`，静默停止即可）。

## Capabilities

### New Capabilities

- `waybill-track-polling`: 运单轨迹地图页增量轨迹轮询行为，涵盖轮询启停条件、轮询间隔、成功/无数据/失败各分支的调度策略，以及确定性业务失败（56008）下的轮询终止规则。

### Modified Capabilities

无（openspec/specs/ 中无既有轮询相关 spec）。

## Impact

- **代码**：`kye-miniapp-waybill` 子应用
  - `src/pages/waybill-route/components/routeMap/hooks/usePolling.ts`（核心改动：`catch` 分支增加 56008 判断）
  - waybill-route 相关常量文件（新增 56008 错误码常量）
- **接口**：`web.query.waybill.listWaybillTracksInPeriod`（调用方行为变化，接口本身不变）
- **平台**：增量轨迹轮询（`usePolling`）当前仅微信端 `routeMap/page/weApp.vue` 接入；支付宝端 `aliPay.vue` 无数据轮询，H5 端 `h5.vue` 仅有 200ms 动画绘制 `setInterval`、无接口轮询。故本次改动实际影响微信端（含鸿蒙等微信内核平台），改动文件为三端共用的 Hook 但当前仅微信端消费
- **后端 / 上游**：无改动；预期收益为异常运单场景下该接口及 TMS 上游查询的无效调用量显著下降
- **风险**：极低。改动仅新增一个错误码分支，正常运单与其他错误码路径行为完全不变
