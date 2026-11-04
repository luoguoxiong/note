# Code Review 报告：privacy-consent-gate

> 评审对象：禅道 #574608 隐私合规——首次打开强制隐私确认门禁
> 评审代码：`src/public/hooks/usePrivacePopup.ts`、`src/layout/pages/home/index.vue`（提交 55491a1df / 0c01f3851 / 54cb24ccb + 评审修复）
> 评审方式：双轴评审（代码标准轴 StandardsAxis + 规格一致轴 SpecAxis）
> 评审时间：2026-10-08

## 总体结论

| 轴 | 结论 | 说明 |
|---|---|---|
| 代码标准轴 | ✅ correct，可合并 | 4 项非阻断问题已全部修复，eslint 复跑 0 error 0 warning |
| 规格一致轴 | ✅ 通过（1 项保留现状） | spec 五条需求主体均落地；P1 确认为历史设计，本次改动未触碰，经确认保留现状 |

## 问题清单与修复结果

### P1（合并前必须处理）

| # | 问题 | 位置 | 处理结果 |
|---|------|------|---------|
| 1 | 版本/升级弹窗分支未经用户点击自动写入同意状态 | `src/layout/pages/home/index.vue` watcher | ☑️ **保留现状**：历史设计（源自 61405b28c），本次改动仅给 else 分支的 showTabBar 加了 `isAgree` 前置条件，未触碰该自动同意路径；经确认以现状为准 |

### P2（应修正）

| # | 问题 | 位置 | 处理结果 |
|---|------|------|---------|
| 2 | waitForAgree 三处重复代码块 | `src/layout/pages/home/index.vue` | ✅ **已修复**：提取 `fetchDetailWithConsent(params, needThrottle)`（:235），新客/未登录/老客三处调用收敛 |

### P3（建议修正）

| # | 问题 | 位置 | 处理结果 |
|---|------|------|---------|
| 3 | 回调参数使用裸 Function 类型 | `src/public/hooks/usePrivacePopup.ts` | ✅ **已修复**：改为 `() => void`，清除 `Function \| null \| undefined` 冗余联合 |
| 4 | waitForAgree 单槽位回调覆盖 | `src/public/hooks/usePrivacePopup.ts` | ☑️ **已记录**：design.md 风险表登记为已知限制（首页同一时刻仅一个数据分支活跃），后续多页面接入时改回调数组 |
| 5 | 调试 console.log 残留 | `src/public/hooks/usePrivacePopup.ts` | ✅ **已修复**：已移除 |
| 6 | setTimeout 兜底延时 100 魔法数字 | `src/public/hooks/usePrivacePopup.ts` | ✅ **已修复**：提取常量 `SHOW_TABBAR_RETRY_DELAY` |

### 范围外提示（不计入本评审）

- `src/modules/kye-miniapp-order` 与 `src/modules/kye-miniapp-waybill` 两个 submodule 指针回退，合入会丢弃其他团队提交，提交前需确认
- `home/index.vue` 行数超 04 规范 300 行上限，属既有问题非本补丁引入
- H5 下 waitForAgree/useReady 整体放行超出 spec「H5 仅豁免退出」口径，源自「飞书无需支持」提交，属有意平台适配

## 验证记录

- 修复后 `npx eslint src/public/hooks/usePrivacePopup.ts src/layout/pages/home/index.vue`：0 error 0 warning
- 首轮 lint 发现的 3 个 prettier 格式问题（箭头函数体括号、多余空行）已一并修复

## 修正状态跟踪

| # | 状态 | 备注 |
|---|------|------|
| 1 | ☑️ 保留现状 | 历史设计，本次改动未影响，已确认 |
| 2 | ✅ 已修复 | 提取 `fetchDetailWithConsent` |
| 3 | ✅ 已修复 | `() => void` 类型约束 |
| 4 | ☑️ 已记录 | design.md 风险表登记 |
| 5 | ✅ 已修复 | console.log 已移除 |
| 6 | ✅ 已修复 | `SHOW_TABBAR_RETRY_DELAY` 常量 |
