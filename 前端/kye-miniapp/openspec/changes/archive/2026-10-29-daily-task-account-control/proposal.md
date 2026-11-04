# Proposal

## Why

积分规则调整后，「下单送积分」引导需按账号管控状态限制展示：未绑码用户与被管控（冻结：限消费、限送分）用户实际无法获得送分，继续引导会产生无效引导。禅道需求：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/578255

本次范围收窄为**仅前端处理**：任务列表项隐藏由后端接口 `web.marketing.activityTask.get` 控制（detailList 不下发即隐藏）；点击兜底拦截复用现有 `beforeIntercept + beforeApi` 机制，后端配置新 beforeApi `web.marketing.activityTaskBiz.checkIntegralAccountBeforeIntercept`。

## What Changes

- 每日任务板块（daily-task 组件）根节点增加空态整块隐藏：`taskList.length === 0` 时不渲染板块（含「每日任务」标题），覆盖微信小程序与 APP（两端同逻辑、同组件）
- 营销专区签到入口（market-area 的 toSign）接入 beforeApi 前置校验：从 `store.data.taskList` 读取 `taskCode === 'dailyAttendance'` 项的 `beforeIntercept/beforeApi` 配置（方案 B，配置化）；`beforeIntercept === 1` 时调用拦截接口，失败弹窗展示后端返回文案，`code === 100201` 静默终止
- 拦截接口参数沿用现有模式：`{ taskId: item.id, customerCode, source: 3 }`
- `toSign` 函数声明按项目规范改为箭头函数 + const

明确不改动的存量逻辑（explore 阶段已确认）：

- homeCache 持久化滞后：保留现状（拦截兜底机制覆盖状态漂移场景）
- 刷新节点（下拉刷新、切 tab 10 分钟节流等）：均为现有逻辑，保留
- `dailyAttendanceTaskId` 恒为 0 的存量问题：本次不涉及，签到接口 `signIntegral` 参数维持现状
- 接口对管控/未绑码用户仍正常下发 `dailyAttendance` 项（后端已确认），方案 B 数据链路无死角

## Capabilities

### New Capabilities

- `daily-task-account-control`：首页每日任务板块按账号管控状态控制显示（空列表整块隐藏），以及板块外签到入口的 beforeApi 前置拦截

### Modified Capabilities

- 无

## Impact

- 代码影响：
  - `src/layout/pages/home/components/daily-task/index.vue`：模板根节点增加 v-if
  - `src/layout/pages/home/components/market-area/index.vue`：toSign 增加拦截逻辑
- 接口依赖：
  - `web.marketing.activityTask.get`（既有）：后端控制 detailList 下发项，实现列表项隐藏
  - `web.marketing.activityTaskBiz.checkIntegralAccountBeforeIntercept`（新增，由后端配置在任务项 beforeApi 字段）：点击兜底拦截校验
- 平台影响：
  - 微信小程序（weapp）：整板块隐藏 + 签到入口拦截（签到在营销专区板块外）
  - APP：与微信同逻辑，整板块隐藏生效
  - 支付宝小程序（alipay）/ H5：整板块隐藏生效（detailList 含签到项时列表非空，板块保留签到引导）；签到入口拦截逻辑位于 market-area（仅微信端渲染），其他端无此入口，不受影响
- 异常降级（沿用既有口径，不调整）：
  - `getDailyTask` 失败走 `defaultTaskList` 兜底时，签到项 `beforeIntercept` 为 0，无拦截，由后端/CRM 侧兜底
  - 用户秒点签到且 taskList 未加载完成时，无配置不拦截（等价 `beforeIntercept` 缺省 0）
