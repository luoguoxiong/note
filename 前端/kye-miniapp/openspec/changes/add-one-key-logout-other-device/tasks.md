# Tasks

## 任务总览

| 序号 | 任务 | 依赖 | 预估时长 |
| ---- | --- | --- | --- |
| 1 | 基础设施：captchaType 常量、退登接口注册、SmsCodePopup tip prop | 无 | 40min |
| 2 | 退登成功弹窗组件 | 无 | 60min |
| 3 | useOneKeyLogout 流程 hook | 任务1 | 60min |
| 4 | 设置页入口接入 | 任务2、3 | 40min |
| 5 | 埋点补全 | 任务3 | 30min |
| 6 | 多端验证与回归 | 任务4、5 | 60min |

## 1. 基础设施

- [x] 1.1 `src/modules/user/pages/changeLogin/constants/index.ts`：`SMS_CODE_TYPE` 新增 `ONE_KEY_LOGOUT_OTHER_DEVICE = 16`
- [x] 1.2 退登接口注册（apiCode `web.user.login.oneKeyLogoutOtherDevice`，入参 from/deviceType，出参 passwordStatus 类型定义），放在与设置页引用路径一致的 apis 层，`from` 从 `@/public/constants` 的 `loginFromType` 取值
- [x] 1.3 `src/modules/user/components/sms-code-popup/index.vue`：新增 `tip` prop（默认值=现有文案），模板 tip 区块改为消费该 prop，确认存量调用（注销账号）不受影响

## 2. 退登成功弹窗组件

- [x] 2.1 新建 `src/modules/setting/pages/index/components/logout-success-dialog/index.vue`：ky-dialog 实现，成功图标（图片资源）+ 标题「已成功退登其他设备」+ 文案 + 【暂不修改】【去修改】按钮，样式对齐设计稿
- [x] 2.2 组件内按钮点击 emits（confirm=去修改 / cancel=暂不修改），跳转逻辑由页面 hook 处理（`navigateApplicationWithName('用户-密码修改')` 复用 `useLoginPassword.ts` 既有跳转方式）

## 3. 退登流程 hook

- [x] 3.1 新建 `src/modules/setting/pages/index/hooks/useOneKeyLogout.ts`：弹窗显隐、captchaType=16 传递、tip 文案常量、`next` 回调中调用退登接口、请求期间入口 loading 态（置灰+「退登中」）
- [x] 3.2 passwordStatus 分支反馈：0 → `Taro.showToast`「已成功退登其他设备」；1 → 打开成功弹窗
- [x] 3.3 失败分支：toast 服务端 msg、入口恢复可点击、上报失败埋点（request_result=失败，failure_reason）
- [x] 3.4 `from → source 中文枚举` 映射常量（6/45/49/51/53 → 微信小程序/跨越支付宝小程序/跨越高德小程序/跨越寄件飞书小程序），供埋点 source 属性使用

## 4. 设置页入口接入

- [x] 4.1 `src/modules/setting/pages/index/index.vue`：在「号码保护」条目下方、「关于跨越」上方插入「一键退登其他设备」入口行（setting-page-item 结构，右侧「去退登›」），四端共用
- [x] 4.2 `src/modules/setting/pages/index/hooks/useLoginSetting.ts`：聚合 `useOneKeyLogout`，页面挂载 `SmsCodePopup`（tip/captchaType/show）与成功弹窗组件，串联 next 回调与反馈分支
- [x] 4.3 APP 账户与安全页（`src/modules/setting/pages/account/index.vue`）：「号码保护」下方插入同款入口行，复用 useOneKeyLogout hook 与弹窗组件（该页经 App 壳 `index.app.vue` → 账户与安全进入，仅 App 环境触达）

## 5. 埋点补全

- [x] 5.1 点击埋点：去退登（入口点击）、获取验证码（倒计时结束后重发，需在弹窗触发链路补充回调或事件）、去修改、暂不修改，均用 `report_CLK_event('clk_mine_setting_button', { page_code: 'page_mine_seting', button_name })`
- [x] 5.2 自定义事件：退登接口返回时 `report_other_event('other_mine_logout_success_v1', { source, request_result, failure_reason })`（成功与失败两分支，见 3.3）
- [x] 5.3 软键盘与图形验证码互斥：`code-input` 新增 `autoFocus` prop（默认 true，存量零感知）并暴露 `focus()`；`SmsCodePopup` 关闭挂载自动聚焦，经 `withCaptchaRequest` 的 `onCaptchaVisible` 回调感知命中 264587——未命中时主动聚焦拉起软键盘，命中时不拉起，避免键盘把图形验证码弹窗顶起

## 6. 多端验证与回归

- [ ] 6.1 微信小程序全流程自测：入口展示 → 点击埋点 → 风控滑块（命中/未命中）→ 短信验证码（错误/过期/成功）→ 退登接口 → passwordStatus 双分支反馈 → 埋点上报核对
- [ ] 6.2 支付宝小程序、H5（飞书）端同流程验证（重点：from 取值 45/51、滑块 webview 兼容模式）；微信多端 App 壳验证账户与安全页入口链路（from=2/4、TCaptcha 挂载正常）
- [ ] 6.3 回归存量场景：设置页既有条目（手机号/登录密码/号码保护/退出登录/注销账号）、注销账号短信验证码弹窗（tip 默认文案不变）、被退登提示弹窗（`useLogOutTip` 链路）
- [ ] 6.4 真机核验「退登中」加载态、成功弹窗视觉还原度（对照设计稿）
