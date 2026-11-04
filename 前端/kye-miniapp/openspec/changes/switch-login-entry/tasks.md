# Tasks

## 任务总览

| 序号 | 任务 | 依赖 | 预估时长 |
| ---- | ----------------- | ------------------- | --------------- |
| 1 | 入口配置与特判链路核对 | 无 | 30min |
| 2 | 登录态分流验证与修补 | 任务 1 | 30min |
| 3 | 切换全局生效与失败兜底验证 | 任务 1 | 45min |
| 4 | 埋点验证 | 任务 1 | 15min |
| 5 | 多端回归与质检归档 | 任务 1-4 | 60min |

## 1. 入口配置与特判链路核对

- [ ] 1.1 与后台确认客户支持区域（weapp `A6104` / alipay `A5104`）新增轻应用项配置：`menuName = 切换登录`（精确匹配，无空格/错别字）、`menuCode = M6814`、图标按 UI 设计稿、排序位于「跨越招聘」之后
- [ ] 1.2 验证 `src/public/utils/application/useApplication.ts:138-156` 特判命中：点击入口跳转 `/modules/user/pages/changeLogin/index?url=...&needLogin=true`，`url` 参数拼接（deviceType/deviceCode/from/pre_click_id/version）正确
- [ ] 1.3 核对 `src/layout/pages/mine/hooks/useLightApp.ts:41-47` `filteAlipayNoLoginApp` 未登录过滤名单，确认 `M6814` 不被误过滤；若被过滤则调整并回归其他入口
- [ ] 1.4 与产品确认 esm.js 兜底默认数据是否补「切换登录」项（design 决策 7）；确认需要则补充 `src/libs/application/{weapp,alipay}.esm.js`

## 2. 登录态分流验证与修补

- [ ] 2.1 验证已登录点击入口直达切换登录手机号页面（`needLogin=true` + `autoLoginHook` 兜底不重复跳登录）
- [ ] 2.2 验证未登录点击入口进入登录页，登录成功后经 `loginBackFn` 回跳自动进入切换页
- [ ] 2.3 验证登录取消/失败停留登录页可返回我的页面，无重复打开登录页、无页面栈错乱

## 3. 切换全局生效与失败兜底验证

- [ ] 3.1 验证切换成功链路：H5 `postMessage.loginInfo` → `loginSuccess({ forceClear: true })` → 轻应用列表重拉 → `GLOBAL_SWITCH_USER` 触发
- [ ] 3.2 验证切换后我的/寄件/查件/消息各 tab 数据为新账号数据；发现不刷新的模块定点补 `onSwitchUserChange` 监听（design 决策 5）
- [ ] 3.3 验证切换失败/网络异常保持原登录态、失败提示与重试出口可用
- [ ] 3.4 验证目标账号开启「禁止他人切换」时验证码校验拦截生效
- [ ] 3.5 回归 `src/app.ts:39-43` changeLogin 页跳过初始化特判在新入口路径下生效（切换后 app 前后台切换无 token 失效报错）

## 4. 埋点验证

- [ ] 4.1 验证点击「切换登录」入口上报 `clk_home_function_button`，属性 `button_name = 切换登录`、`page_code = page_home_mine`、`menu_name = 客户支持`

## 5. 多端回归与质检归档

- [ ] 5.1 微信端回归：入口展示、分流、切换全链路、原【切换手机号】入口不受影响
- [ ] 5.2 支付宝端回归：同上 + 未登录过滤场景 + 高德容器兼容性验证
- [ ] 5.3 按 `质检目录/前端质检目录/前端质检报告.md` 完成需求/技术方案/代码/测试质检并回填结果
- [ ] 5.4 Code Review 并修正，归档 openspec 产物
