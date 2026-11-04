# 前端代码检查报告 - kye-miniapp

## 报告信息

| 项目 | 内容 |
|------|------|
| 仓库名称 | kye-miniapp |
| 检查基准 | origin/master |
| 开发分支 | ai/202610/20261015_switch-login-entry_kimi-code-k3-256k |
| 检查时间 | 2026-10-15-20-16-21-976226200 |
| 结束时间 | 2026-10-15-20-18-07-209389400 |
| 检查时长 | 00:01:46 |
| 检查模式 | 增量检查 |
| 变更文件 | 1 个 (+21 / -1 行) |

---

## 检查结果概览

| 严重级别 | 数量 | 分类 | 说明 |
|----------|------|------|------|
| 严重 | 0 | ❌ 问题 | 会造成运行错误或触犯规范红线的代码内容 |
| 中等 | 0 | ⚠️ 告警 | 不会造成运行错误但不符合规范的代码内容，或需要人工介入确认的可疑代码 |
| 轻微 | 1 | 📝 建议 | 能够通过调整代码，提升代码可读性、可维护性的代码内容 |

---

## ❌ 问题【ERROR】（0）

> 会造成运行错误或触犯规范红线的代码内容，**必须修复**。

本次检查未发现相关问题。

---

## ⚠️ 告警【WARNING】（0）

> 不会造成运行错误但不符合规范的代码内容，或需要人工介入确认的可疑代码。

本次检查未发现相关问题。

---

## 📝 建议【SUGGESTION】（1）

> 能够通过调整代码，提升代码可读性、可维护性的代码内容。

### S-01 getApplicationFullUrlAsync 调用未加 await（函数命名误导）

**位置** `src/public/utils/application/useApplication.ts:142`

**作者** `林锦兴`

**规则**: B.3.02 异步函数调用缺少 await

**命中原因**: 调用命名带 Async 的函数 `getApplicationFullUrlAsync`（应为返回 Promise 的异步函数）时未加 `await`，返回值直接通过 `encodeURIComponent` 拼入跳转 url，若其返回 Promise 将得到错误 url。

**分析/核实结论**: 经核实，`getApplicationFullUrlAsync` 定义于 `src/public/utils/applicationUtil.ts:94`，为**同步函数**（返回 `string`，非 Promise），且同文件 106 / 242 / 289 行三处既有调用均未加 `await`。本次新代码与既有约定一致，**不构成 bug**，仅为函数命名带 `Async` 后缀造成的误导性问题。当前调用代码可保持不变；若需彻底消除误导，建议后续将 `getApplicationFullUrlAsync` 重命名去除 `Async` 后缀（需同步修改全部调用点，不在本次变更范围内）。

**修复建议**:
```diff
- const applicationUrl = getApplicationFullUrlAsync(areaCode, menuCode, {
+ // 可选：后续统一重命名函数去除 Async 后缀后
+ const applicationUrl = getApplicationFullUrl(areaCode, menuCode, {
```

---


## 变更文件清单

| # | 文件路径 | 作者 | 状态 | +行 | -行 |
|---|----------|------|------|-----|-----|
| 1 | `src/public/utils/application/useApplication.ts` | 林锦兴 | 修改 | 21 | 1 |
