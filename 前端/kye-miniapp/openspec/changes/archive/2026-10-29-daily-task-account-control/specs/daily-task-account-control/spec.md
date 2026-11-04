# daily-task-account-control Specification

<!-- Delta spec for: daily-task-account-control -->

## Purpose

首页每日任务板块按账号管控结果控制显示（后端控制列表项下发、前端空列表整块隐藏），并对微信端板块外的签到入口做 beforeApi 前置拦截，使送分引导只面向可正常送分的用户。

## ADDED Requirements

### Requirement: 每日任务板块空列表整块隐藏

每日任务板块 SHALL 以任务列表非空作为板块渲染的前置条件：任务列表为空时，板块整体（含「每日任务」标题）MUST 不渲染。任务列表项的显隐由接口 `web.marketing.activityTask.get` 返回的 detailList 决定，前端 MUST NOT 在本地实现绑码状态或管控结果的判定逻辑。

#### Scenario: 管控用户在微信小程序端打开首页

- **WHEN** 微信小程序（weapp）登录用户为未绑码或管控冻结状态，接口 detailList 过滤后任务列表为空
- **THEN** 每日任务板块整体不渲染，页面无「每日任务」标题残留

#### Scenario: 管控用户在支付宝小程序端打开首页

- **WHEN** 支付宝小程序（alipay）登录用户为管控冻结状态，接口 detailList 仅保留去签到项
- **THEN** 每日任务板块正常渲染，板块内仅展示每日签到引导

#### Scenario: 无管控用户打开首页

- **WHEN** 已绑码且无管控的用户打开首页，接口 detailList 正常下发全部任务项
- **THEN** 每日任务板块正常渲染，板块内引导全部展示

### Requirement: 签到入口 beforeApi 前置拦截

微信小程序端营销专区的签到入口 SHALL 在执行签到动作前读取任务列表中 `taskCode` 为 `dailyAttendance` 的任务项配置：当该任务项 `beforeIntercept` 为 1 时，MUST 先调用该任务项 `beforeApi` 字段指定的接口（本次为 `web.marketing.activityTaskBiz.checkIntegralAccountBeforeIntercept`）进行校验，校验通过后才继续执行原有签到流程。校验参数 MUST 沿用现有拦截参数模式 `{ taskId: 任务项id, customerCode, source: 3 }`。任务列表未加载完成或任务项 `beforeIntercept` 非 1 时，MUST 跳过校验直接执行原有流程。

#### Scenario: 被管控用户点击去签到

- **WHEN** 已绑码但被管控（冻结：限消费、限送分）的用户在微信小程序端点击「去签到」，任务项 `beforeIntercept` 为 1
- **THEN** 先调用拦截接口校验，校验不通过时终止签到流程并展示拦截弹窗，签到接口不被调用

#### Scenario: 无管控用户点击去签到

- **WHEN** 无管控用户在微信小程序端点击「去签到」，拦截接口校验通过
- **THEN** 继续执行原有签到流程（内部员工校验、已签到判断、签到接口调用）

#### Scenario: 任务列表未加载时秒点签到

- **WHEN** 用户在任务列表数据返回前点击「去签到」，无 `dailyAttendance` 任务项配置
- **THEN** 跳过拦截校验，直接执行原有签到流程

#### Scenario: 已签到用户点击签到入口

- **WHEN** 用户当日已签到，拦截接口校验通过
- **THEN** 按原有逻辑跳转积分签到页，不重复调用签到接口

### Requirement: 拦截失败提示文案来自后端

签到入口与每日任务列表的 beforeApi 拦截失败提示文案 SHALL 以后端接口返回的错误信息为准，前端 MUST NOT 写死拦截文案。当拦截接口返回错误码 100201 时，前端 MUST 静默终止流程，不展示任何弹窗。

#### Scenario: 拦截接口返回管控文案

- **WHEN** 被管控用户触发拦截校验，接口返回错误信息「账户限送分及消费，请联系专属商务」
- **THEN** 页面以弹窗形式展示该返回文案，用户确认后停留当前页面

#### Scenario: 拦截接口返回错误码 100201

- **WHEN** 拦截接口校验失败且错误码为 100201
- **THEN** 前端静默终止流程，不展示弹窗

### Requirement: 任务接口异常时沿用既有降级

每日任务数据接口异常时 SHALL 沿用既有降级策略：使用本地兜底任务列表渲染板块。兜底任务列表中签到项 `beforeIntercept` 为 0，该场景下签到入口 MUST 跳过拦截校验，由后端与 CRM 侧兜底拦截。

#### Scenario: 任务接口调用失败后点击去签到

- **WHEN** `web.marketing.activityTask.get` 调用失败，板块按兜底任务列表渲染，用户点击「去签到」
- **THEN** 跳过拦截校验，直接执行原有签到流程
