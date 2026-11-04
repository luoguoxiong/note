# Proposal: switch-login-entry

## Why

禅道需求：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/577091

现有移动端【切换手机号】入口层级深、操作链路长，用户切换账号成本高。需在移动端各端【我的】页面客户支持区域新增【切换登录】轻应用入口，用户一键直达切换登录手机号页面，切换后账号状态全局生效并自动重拉全量业务数据。

代码事实：前端九宫格为纯后端轻应用配置驱动，且 `useApplication.ts` 中 `menuName === '切换登录'` 的跳转特判、统一登录拦截（`checkLogin` + 登录成功回跳）、切换登录 H5 页面（`changeLogin/index.vue`）、切换成功全局生效机制（`loginSuccess({forceClear:true})` + `GLOBAL_SWITCH_USER` 事件）均已存在。本次前端以「入口配置核对 + 既有链路验证/修补」为主，无大规模新开发。

## What Changes

- 后台在【我的-客户支持】轻应用区域（微信 `A6104` / 支付宝 `A5104`）新增第 16 个入口项：`menuName = '切换登录'`、`menuCode = 'M6814'`，位于「跨越招聘」之后；前端既有 `menuName === '切换登录'` 特判命中后跳转 `/modules/user/pages/changeLogin/index?url=...&needLogin=true`
- 核对并修补入口命中链路的边界：
  - 支付宝未登录过滤 `filteAlipayNoLoginApp`（`useLightApp.ts:41-47`）不得误过滤新入口 menuCode
  - 兜底默认数据 `src/libs/application/{weapp,alipay}.esm.js` 按需补充「切换登录」项（接口不可用时入口兜底展示，待产品确认是否需要）
- 登录态分流：复用 `navigateApplication` 开头的 `kyeNavigate.checkLogin` 统一拦截——未登录先进登录页，登录成功后经 `loginBackFn` 回调自动进入切换登录手机号页面；已登录直达
- 切换登录手机号页面复用现有 H5 webview 版（`src/modules/user/pages/changeLogin/index.vue`），不启用原生版 `index.native.vue`
- 切换成功全局生效：H5 `postMessage.loginInfo` → `loginSuccess({ forceClear: true })`（清全局用户数据 + 重拉轻应用等）→ `triggerSwitchUserChange`；切换失败/网络异常保持原登录态并给出失败提示与重试出口（H5 页面内既有能力）
- 埋点：复用 `clk_home_function_button` 点击事件，`button_name` 由 `applicationItem.menuName` 自动带入「切换登录」，无埋点代码改动
- 原有【切换手机号】入口及其链路保持不动

## Capabilities

### New Capabilities

- `switch-login-entry`: 我的页面客户支持区域「切换登录」入口的展示、登录态分流跳转、切换登录全局生效与失败兜底、入口点击埋点

### Modified Capabilities

（无既有 capability 的需求级变更）

## Impact

- **影响代码**：`src/public/utils/application/useApplication.ts`（既有特判核对）、`src/layout/pages/mine/hooks/useLightApp.ts`（支付宝未登录过滤核对）、`src/libs/application/{weapp,alipay}.esm.js`（兜底数据，按需）、`src/modules/user/pages/changeLogin/index.vue`（复用，不改动）
- **影响平台**：微信小程序（weapp）、支付宝小程序（alipay，含高德容器走 alipay 环境）；APP 原生端（安卓/苹果/鸿蒙）由 App 团队单独实施，飞书端走 H5 不在本仓库范围
- **依赖系统**：后台轻应用配置（入口上线依赖配置发布）、用户中心切换登录接口（既有 `web.login.switch.*`，无接口变更）
- **埋点**：`clk_home_function_button` 新增属性值 `button_name = 切换登录`（配置驱动，无代码变更）
- **灰度**：无灰度，随版本常规发布；入口可见性可由后台轻应用配置控制（配置不上线则入口不出现，天然具备回滚手段）
