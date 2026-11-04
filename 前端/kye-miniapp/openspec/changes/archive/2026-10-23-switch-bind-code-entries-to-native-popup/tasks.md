# Tasks

## 任务总览

| 序号 | 任务 | 依赖 | 预估时长 |
| ---- | ---- | ---- | ---- |
| 1 | 首页绑码入口切换半屏弹窗（577614） | 无 | 1h |
| 2 | 首页预存运费入口切换半屏弹窗（578367） | 无 | 40min |
| 3 | 实名认证页企业认证入口切换半屏弹窗（578681） | 无 | 1.5h |
| 4 | 三端自测与体积核对 | 任务1-3 | 1.5h |

三个入口互相独立，任务 1/2/3 可并行实施，各入口独立提交。

## 1. 首页绑码入口（禅道 577614）

- [x] 1.1 `src/layout/pages/home/components/bind-code/index.vue`：静态引入 `CustomerBindDialog`，模板挂载 `<CustomerBindDialog express-type="首页" v-model:visible="isShowCustomerBindDialog" />`，新增 visible 状态
- [x] 1.2 `handleBindCode` 中删除 `navigateApplicationWithCode(ApplicationCodeMap['绑码组件'])` 跳转逻辑（含 ApplicationCodeMap 取值），替换为 `isShowCustomerBindDialog.value = true`
- [x] 1.3 验证 `bindText` computed（去切换/立即绑码/去更换三态）随全局 Store 自动重算：组件绑码成功后经 `getMinePageUserInfo` 重写 `customerInfo`，纯响应式消费，无需监听 `update-customer-code` 回调
- [x] 1.4 自测：未绑码（bind 模式）、多编码（switch 模式）、已绑码（change 模式）三种状态点击入口均拉起弹窗且模式正确；绑定/切换/更换成功后按钮文案刷新；关闭弹窗可再次拉起

## 2. 首页预存运费入口（禅道 578367）

- [x] 2.1 `src/layout/pages/home/components/market-area/index.vue`：静态引入 `CustomerBindDialog`，模板挂载 `<CustomerBindDialog express-type="预存运费" v-model:visible="isShowCustomerBindDialog" />`，新增 visible 状态
- [x] 2.2 未绑码点击预存运费处删除 `openCustomerPage('预存运费')` 调用，替换为 `isShowCustomerBindDialog.value = true`
- [x] 2.3 验证无需 `update-customer-code` 回调：绑码成功后弹窗由组件内部自动关闭、停留首页（已确认不自动续跳预存运费），绑码状态经响应式 Store 自动更新，下次点击预存运费时直接进入功能
- [x] 2.4 自测：未绑码点击拉起弹窗、绑码成功后停留首页且再次点击进入预存运费、已绑码用户点击不拉弹窗直接进入功能

## 3. 实名认证页企业认证入口（禅道 578681）

- [x] 3.1 `src/modules/user/pages/realname/home/index.vue`：静态引入 `CustomerBindDialog`，模板挂载 `<CustomerBindDialog express-type="企业认证" v-model:visible="isShowCustomerBindDialog" />`，新增 visible 状态
- [x] 3.2 `checkEnterpriseAuth` 中删除 `navigateApplicationWithCode` 跳转逻辑，替换为 `isShowCustomerBindDialog.value = true`；保留 `report_EXP_event('exp_id_company_popup')` 在拉起时机上报
- [x] 3.3 `@update-customer-code` 回调：调用既有 `reloadPage()` 刷新页面数据，验证回流路由——平台客企业隐藏企业认证入口、非平台客按认证状态展示未认证态/已认证态（历史规则，确认 `initData` 现有逻辑覆盖）
- [x] 3.4 清理遗留死代码：删除 `showBindCodeConfirmDialog` ref 声明、`checkEnterpriseAuth` 与 `reloadPage` 中对它的赋值/重置（模板无任何绑定）
- [x] 3.5 自测：未绑码点击拉起弹窗、绑码成功后回流路由三种分支（非平台客未认证/非平台客已认证/平台客）、关闭弹窗保持未绑码可再次拉起

## 4. 三端自测与体积核对

- [x] 4.1 weapp / alipay / H5 三端回归任务 1-3 的拉起、绑定成功回流、关闭弹窗、绑定/切换/更换三模式
- [x] 4.2 验证埋点：弹窗曝光 `exp_customer_code_bind_page`（express_type 分别为 首页/预存运费/企业认证，isPopUp=true）、企业认证入口 `exp_id_company_popup` 正常上报
- [x] 4.3 构建 weapp/alipay 产物，核对主包体积增量（预期≈0）与总包/子包限制（总包 30MB、子包 2MB）
- [x] 4.4 回归确认 H5 端与低版本端走原 H5 绑码页路径正常（`useBindCustomer` 的 `useDidShow` 返回刷新逻辑未被破坏）
