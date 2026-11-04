# Tasks

## 任务总览

| 序号 | 任务 | 依赖 | 预估时长 |
| ---- | ------------------------------- | ------ | --------- |
| 1 | 每日任务板块空列表整块隐藏 | 无 | 15min |
| 2 | 签到入口 beforeApi 前置拦截 | 无 | 45min |
| 3 | 自测与多端验证 | 任务1、2 | 45min |

## 1. 每日任务板块整块隐藏

- [x] 1.1 修改 `src/layout/pages/home/components/daily-task/index.vue`：根节点 `<view class="daily-task">` 增加 `v-if="taskList.length"`，使微信端与 APP 在任务列表为空时整板块（含「每日任务」标题）不渲染
- [x] 1.2 确认 alipay/H5 端场景：detailList 仅保留签到项时列表非空、板块正常渲染仅展示签到引导（代码走查，isWxMiniApp 过滤逻辑既有）

## 2. 签到入口拦截（market-area）

- [x] 2.1 修改 `src/layout/pages/home/components/market-area/index.vue`：`toSign` 函数声明按项目规范改为 `const toSign = async () => {}`
- [x] 2.2 在 toSign 中（isEmployee 校验之后、isSign 判断之前）增加拦截逻辑：从 `homeStore.data.taskList` 查找 `taskCode === 'dailyAttendance'` 项，`beforeIntercept === 1` 时经 `http(item.beforeApi, { taskId: item.id, customerCode, source: 3 }, { hideToast: true })` 调用校验接口
- [x] 2.3 实现拦截失败处理：`typeof err === 'string'` 时 `showModal(err)`；对象错误且 `err.code !== 100201` 时 `showModal(err.msg)`；`err.code === 100201` 静默终止；两种弹窗情况均 return 不继续签到（弹窗样式与 toSign 既有 showModal 一致：title「温馨提示」、confirmText「我知道了」、confirmColor '#8365f6'）
- [x] 2.4 边界确认：任务项不存在（列表未加载）或 `beforeIntercept` 非 1 时跳过校验直接走原有流程；不改动 `signIntegral` 调用参数与 `dailyAttendanceTaskId`

## 3. 自测与多端验证

- [x] 3.1 微信开发者工具验证：无管控用户首页每日任务板块正常展示、签到/下单/寄件/评价流程回归无异常
- [x] 3.2 联调验证管控场景（依赖后端接口就绪）：管控/未绑码用户 detailList 清空后微信端整板块隐藏、无标题残留；alipay 端仅保留去签到项
- [x] 3.3 联调验证拦截场景：被管控用户点击「去签到」弹后端返回文案（如「账户限送分及消费，请联系专属商务」）且签到接口未调用；拦截接口返回 100201 时静默终止
- [x] 3.4 异常场景验证：mock 任务接口失败走 defaultTaskList 兜底时板块正常展示、签到无拦截直接走原流程；任务列表未加载时秒点签到不报错
