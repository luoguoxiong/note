## Context

运单轨迹地图页（`kye-miniapp-waybill` 子应用 `waybill-route` 页面）在全量轨迹查询完成后，通过 `usePolling` Hook 发起增量轨迹轮询：

- 轮询间隔：运输中固定 15 分钟；非运输中取 `getWaybillTrackConfig` 接口的 `refreshInterval`（秒），默认 5 秒。
- 调度链路：`startNextPolling()` 在 `refreshStatus === true` 或运输中时，`setTimeout(onListWaybillTracksInPeriod, interval)`。
- 增量查询 `onListWaybillTracksInPeriod` 三个分支：有增量数据 → 更新状态并播动画后继续；无增量 → 继续；请求失败（`catch`）→ **无条件** `startNextPolling()`。

异常运单（草稿单、虚拟运单）后端经 TMS 查询后统一返回业务错误码 `56008`（未查询到运单信息）。这是确定性失败——运单不存在，轮询多少次都不会有结果。响应拦截器（`apis/request.ts`）对非成功 code 执行 `Promise.reject({ ...data, message: data.msg })`，错误码 `code` 原样透传到 `catch` 的异常对象上，前端具备判断依据。

**平台接入现状（代码核查结论，与禅道文档「三端轮询」表述的差异）**：routeMap 按 `envConfig.env` 分发三个页面组件——`WEAPP → weApp.vue`、`ALIPAY → aliPay.vue`、`WEB → h5.vue`。增量轮询 Hook `usePolling` 当前**仅微信端 `weApp.vue` 接入**；支付宝端无任何数据轮询；H5 端的 `setInterval(locusTimer, 200)` 只是轨迹动画绘制进度器（数据耗尽即 `clearInterval`），不发起接口请求。因此无效轮询问题实际只发生在微信端（含鸿蒙等微信内核平台）。

**轮询启动前置条件**：全量轨迹查询走的是独立接口 `web.query.waybill.listWaybillTracksNew`（非增量接口）。`useCommon.onGetWaybillTrackData` 内部 try/catch，失败时返回 `undefined`；`weApp.vue` 的 `getMapData` 中 `if (data) { initPollingState(...) }`——全量失败则不会初始化轮询状态、动画回调里也不会启动轮询。因此能进入「增量无限轮询」的前提是：全量查询成功返回（页面有轨迹数据、`refreshStatus` 被初始化），而增量接口 `listWaybillTracksInPeriod` 持续返回 56008（两个接口后端查询路径不同，允许出现全量成功、增量失败的组合）。本次改动只需覆盖增量 Hook 的 catch 分支。

相关文件（真实源码目录，非 `-build` 副本）：

- `src/modules/kye-miniapp-waybill/src/pages/waybill-route/components/routeMap/hooks/usePolling.ts` — 增量轮询 Hook（仅微信端 weApp.vue 消费）
- `src/modules/kye-miniapp-waybill/src/pages/waybill-route/components/routeMap/page/weApp.vue` — 微信端轨迹页，轮询启动入口（动画 complete / 无动画分支）
- `src/modules/kye-miniapp-waybill/src/pages/waybill-route/constant.ts` — 运单状态常量（`WAYBILL_STATUS`）
- `src/modules/kye-miniapp-waybill/src/apis/waybill-route/index.ts` — `listWaybillTracksInPeriod` 增量接口封装（`hideToast: true`）
- `src/modules/kye-miniapp-waybill/src/apis/request.ts` — 响应拦截器，业务错误以 `{ ...data }` reject

约束：后端零变更；不新增 UI；改动文件虽为三端共用目录，但行为变化仅影响微信端。

## Goals / Non-Goals

**Goals:**

- 异常运单（`code === 56008`）场景下，增量轮询在收到该错误后**永久停止**（页面生命周期内不再发起 `listWaybillTracksInPeriod`），消除确定性无效请求。
- 其余错误码（网络超时、抖动等可恢复失败）保持「继续轮询」行为，自愈能力不变。
- 正常运单（运输中 / 非运输中 / 已签收）的轮询节奏、轨迹展示、动画完全不变。
- 错误码以具名常量定义，不出现裸魔法数字。

**Non-Goals:**

- 不改后端接口签名、返回结构、错误码定义。
- 不处理全量轨迹查询 `listWaybillTracksNew` 失败的页面表现：全量失败时 `onGetWaybillTrackData` 返回 undefined，本就不会初始化/启动轮询，页面维持既有空态表现。
- 不为支付宝 / H5 端新增增量轮询能力（当前两端本就无数据轮询，不在本需求范围）。
- 不新增任何 UI 提示、弹窗或空态（接口 `hideToast: true`，静默停止即可）。
- 不引入退避重试、最大重试次数等通用轮询策略（本次只解决确定性失败这一个点）。
- 不改动轮询间隔配置逻辑。

## Decisions

### 决策 1：仅在 `56008` 时停止，其余错误码继续轮询

`onListWaybillTracksInPeriod` 的 `catch (e)` 分支改为：

```ts
} catch (e) {
  console.log('增量轨迹获取失败', e)
  // 56008：未查询到运单信息（草稿单/虚拟运单），确定性失败，停止轮询
  if (e?.code === WAYBILL_API_ERROR_CODE.WAYBILL_NOT_FOUND) {
    clearPollingTimer()
    return
  }
  startNextPolling()
}
```

- 选择「直接停止」而非「拉长间隔」：异常运单本质不会成功，任何间隔的重复调用都是浪费。
- 选择「仅 56008 停止」而非「所有异常都停」：网络抖动、临时超时是可恢复错误，需要靠继续轮询自愈；一刀切会导致正常运单在弱网下永久失去轨迹刷新。
- 不依赖 `refreshStatus` / `isTransporting` 条件：56008 是业务终态，优先级高于调度条件，直接清定时器并 `return`，不再走 `startNextPolling` 的条件判断。

**备选方案（否决）**：

- 后端针对 56008 改接口契约/返回结构：成本高、影响契约，且「异常即停」语义内聚在轮询发起方（前端）更合理。
- 在「暂无增量轨迹」时停止：会误伤正常运单——无增量不代表后续无轨迹，运输中车辆位置持续更新依赖轮询。

### 决策 2：错误码常量定义在 waybill-route 的 constant.ts

在 `src/pages/waybill-route/constant.ts` 中与 `WAYBILL_STATUS` 并列新增：

```ts
/**
 * 运单轨迹相关业务错误码
 */
export const WAYBILL_TRACK_ERROR_CODE = {
  /** 未查询到运单信息（草稿单/虚拟运单等异常运单） */
  WAYBILL_NOT_FOUND: 56008,
}
```

理由：该错误码消费方目前只有 waybill-route 轨迹页轮询，放在页面级常量文件与 `WAYBILL_STATUS` 同层，内聚且就近；不放入子应用公共 apis 层，避免过度扩散。`usePolling.ts` 已有从 `'../../../constant'` 导入常量的先例，导入路径一致。

### 决策 3：停止方式为清除定时器 + return，不新增状态标记

复用现有 `clearPollingTimer()`：停止时定时器已被清除，且不再调度下一轮，轮询自然终止；页面 `onUnmounted` 时的清理逻辑同样调用 `clearPollingTimer`，无冲突。

不额外引入 `pollingStopped` ref 标记：当前没有任何 UI 或外部消费者需要感知「已停止」状态，新增标记属于 YAGNI；Hook 对外暴露的 API（`startNextPolling` 等）保持不变。

## Risks / Trade-offs

- **[风险] 56008 语义被后端复用到其他可恢复场景** → 缓解：56008 当前明确定义为「未查询到运单信息」（草稿单/虚拟运单），属运单不存在的终态；若后端未来扩展该码语义，需同步评估本逻辑。常量集中定义，改动点只有一处。
- **[风险] 异常运单页面停止轮询后，若运单状态后续变为正常（如草稿单转正），用户停留期间不会自动恢复** → 可接受：草稿单/虚拟运单不存在「同页停留期间转正」的真实业务路径；用户重新进入页面会重新走全量查询并初始化轮询，自然恢复。
- **[权衡] 停止轮询后页面无任何提示** → 符合需求预期（无卡死、无报错弹窗）；异常运单本就无轨迹可展示，静默停止对用户无害。
- **[风险] 改错副本目录** → 缓解：只改 `src/modules/kye-miniapp-waybill/src/` 源码，严禁改 `waybill-build/` 等插件生成的副本目录。
