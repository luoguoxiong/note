# Proposal

## Why

禅道需求 #576210：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/576210 。用户发现手机号在陌生设备登录后，小程序端缺少自助退登入口，只能修改密码或联系客服，处置链路长、账号安全感低。本次为跨越寄件小程序（微信/支付宝/高德/飞书）提供「一键退登其他设备」能力：短信验证码二次确认后保留当前设备、退出该手机号在其他所有设备的登录态。

## What Changes

- 设置页（`src/modules/setting/pages/index/index.vue`）「号码保护」条目下方新增「一键退登其他设备」入口行，右侧展示「去退登›」，四端（weapp/alipay/h5-飞书）共用
- APP 端「账户与安全页」（`src/modules/setting/pages/account/index.vue`，经微信多端 App 壳 `index.app.vue` → 账户与安全进入）「号码保护」条目下方新增同款入口行，右侧展示「去退登›」，与设置页共用同一流程 hook 与弹窗组件
- `SmsCodePopup` 组件（`src/modules/user/components/sms-code-popup/index.vue`）新增提示文案 prop（默认值保持现有文案，本需求传入一键退登专属长文案），组件无 footer，符合 PRD「仅右上角✕」的交互要求，无需按钮控制
- 新增退登流程逻辑（新 hook，仿 `useLoginSetting.ts` 聚合模式）：点击去退登上报埋点 → 复用 `withCaptchaRequest` + TCaptcha 处理「退登获取验证码安全校验」与「验证码正确安全校验」两个风控点（命中返回 264587 弹滑块）→ 发送/校验短信验证码（`captchaType=16`）→ 调用新增退登接口
- 新增 API 注册：`web.user.login.oneKeyLogoutOtherDevice`（入参 `from`=loginFromType（`@/public/constants` 运行时取值：微信6/支付宝45/高德49/飞书51）、`deviceType`（取自 `useLoginPublicParmas`）），出参 `passwordStatus`
- 退登成功反馈按 `passwordStatus` 分支：0=未设置登录密码 → `Taro.showToast`「已成功退登其他设备」；1=已设置 → 新建成功弹窗组件（仿 `logout-dialog`，含成功图标、标题「已成功退登其他设备」、按钮【暂不修改】【去修改】，去修改跳转 H5 轻应用「用户-密码修改」）
- 埋点：`clk_mine_setting_button` 新增枚举值「去退登」「获取验证码」「去修改」「暂不修改」；新增自定义事件 `other_mine_logout_success_v1`（属性 source/request_result/failure_reason），退登请求结果返回时上报
- 被退登设备提示弹框：沿用 `useLogOutTip` 现有链路（后端 `fetchLogoutTip` 返回新增退登原因文案），前端预计零改动
- 范围外（其他工程负责）：PC 客户端（跨越寄件客户端）个人中心入口、登录日志/铸剑展示、服务端退登执行

## Capabilities

### New Capabilities

- `one-key-logout-entry`：设置页一键退登入口与验证流程（入口行展示、双风控校验联动、短信验证码弹窗交互、退登接口调用时序）
- `logout-success-feedback`：退登成功反馈（passwordStatus 双分支展示、成功弹窗交互、退登结果埋点上报）

### Modified Capabilities

- 无

## Impact

- **代码**：
  - 修改：`src/modules/setting/pages/index/index.vue`、`src/modules/setting/pages/account/index.vue`（APP 账户与安全页）、`src/modules/setting/pages/index/hooks/useLoginSetting.ts`（聚合新 hook）、`src/modules/user/components/sms-code-popup/index.vue`（新增 tip prop）
  - 新增：`src/modules/setting/pages/index/hooks/useOneKeyLogout.ts`、退登成功弹窗组件（setting 模块 components 下）、`src/modules/setting/apis` 退登接口注册
  - 复用不动：`withCaptchaRequest`/TCaptcha、`code-input`、`useCountdown`、`useLoginPublicParmas`、`useUserInfo`、`useLogOutTip` 链路
- **平台**：微信 weapp、支付宝 alipay、H5（飞书）三平台共用同一实现；`from` 经 `getEnvConfig().from` 运行时取值（6/45/49/51），无端级分支
- **接口依赖（后端 web-user-sso）**：`/verification/sendSmsCode`、`/verification/checkSmsCode`（复用，新增 `captchaType=16`）；`/login/oneKeyLogoutOtherDevice`（新增，待网关登记 apiCode `web.user.login.oneKeyLogoutOtherDevice`）；`logoutTip` 退登原因枚举扩展（服务端）
- **风控依赖**：web-uam 后台新增策略编码（退登获取验证码安全校验、验证码正确安全校验），前端按 264587 响应联动滑块
- **埋点**：QT 平台事件 `clk_mine_setting_button` 枚举扩展、自定义事件 `other_mine_logout_success_v1` 新增登记
