# Design

## Context

绑码半屏弹窗组件 `CustomerBindDialog`（`src/modules/user/pages/customer-code/customer-code-popup/index.vue`）已具备完整能力：内部按接口权限自动切换 bind/switch/change 三模式、未登录自动拉起登录、打开时 loading + 接口并行加载、绑定/切换/更换成功后自动写全局 Store 并刷新用户信息、埋点自动上报（`express_type` 取 `props.expressType`）。主包「我的」页与用户设置页已完成同型切换，本设计将同一接入模式复制到三个新入口，不改动组件本体。

约束：三入口分属主包（首页两个）与 `modules/user` 分包（实名认证页）；弹窗壳已被主包静态引入，主包体积增量需保持≈0；H5 web-view 路径在低版本端与 H5 端仍是事实路径，相关兼容逻辑不得移除。

## Goals / Non-Goals

**Goals**

- 三个入口统一按「静态引入弹窗壳 + `v-model:visible` + `updateCustomerCode` 回调刷新入口状态」模式接入
- 各入口 `express-type` 场景值正确传递，埋点口径与现状一致
- 企业认证入口绑码完成后的回流路由正确（平台客企业隐藏入口；非平台客按认证状态展示）

**Non-Goals**

- 不改动 `CustomerBindDialog` 组件本体及其内部三模式逻辑
- 不改动 `useBindCustomer` Hook（`openCustomerPage` 仍被寄件流程等入口使用，本次不删除）
- 不新增灰度开关判断（已确认：前端统一走半屏弹窗；低版本端天然走 H5，无需代码兜底）
- 不处理其他绑码入口（归父需求 576403 后续子项）

## Decisions

### D1：弹窗壳静态引入，不做异步引入改造

- **选择**：三个入口页面直接 `import CustomerBindDialog` 并挂载在模板中。
- **理由**：弹窗壳及其静态依赖已被主包「我的」页（`layout/pages/mine/index.vue`）静态引入，体积已付出；重组件（bind-code/switch-code/change-code/customerIntro/ContactManager）在组件内部已 `defineAsyncComponent` 懒加载且与分包页面共用 chunk，首页新增引用增量≈0。自行再做动态引入会增加代码复杂度且无体积收益。
- **替代方案**：`defineAsyncComponent` 包裹弹窗壳——否决，分包组件跨包异步化在 Taro 下需额外配置，收益为零。

### D2：入口改造统一模式（与「我的」页对齐）

每个入口的改动三件套：

1. 模板挂载 `<CustomerBindDialog :express-type="..." v-model:visible="isShowCustomerBindDialog" />`
2. 原跳转调用点替换为 `isShowCustomerBindDialog.value = true`
3. 入口状态刷新依赖组件绑码成功后写入的全局 Store：入口①（按钮三态文案）与入口②（绑码状态判断）均为 store 响应式消费，无需监听 `update-customer-code`；入口③因企业认证卡片显隐依赖 `getAuthDetail` 接口数据、且弹窗关闭不触发页面级 `useDidShow`，必须监听该事件手动调 `reloadPage()`

不抽取新的公共 wrapper 组件：仅入口③需要回调（刷页面数据），入口①②零回调直连，抽象收益低于直连成本，且与既有「我的」页接入形态保持一致（mine 页即未监听 `update-customer-code` 的纯响应式消费样例）。

### D3：各入口 express-type 取值

| 入口 | express-type 取值 | 依据 |
| --- | --- | --- |
| 首页绑码入口 | `'首页'` | 沿用现状 `navigateApplicationWithCode({ queryParams: { express_type: '首页' } })` |
| 预存运费入口 | `'预存运费'` | 沿用现状 `openCustomerPage('预存运费')` |
| 企业认证入口 | `'企业认证'` | 现状跳 H5 未传 express_type，按场景命名补齐；埋点事件不变，仅参数取值 |

`exp_customer_code_bind_page` 由组件内部自动上报（含 `isPopUp: true`），业务方无需手动埋点。

### D4：企业认证入口的回流路由实现

- 拉起时机：`checkEnterpriseAuth` 命中「未绑码」分支时，`report_EXP_event('exp_id_company_popup')` 保留（口径不变），跳转调用替换为置 `visible = true`。
- 回流：`@update-customer-code` 回调中调用既有 `reloadPage()`（内部 `initData()` 拉取最新认证数据）；入口展示状态由现有规则驱动——绑码企业为平台客则 `isCommonOrFence` 隐藏企业认证入口，非平台客按 `enterpriseInfo` 有无展示已认证/未认证态。此为历史规则沿用，不新增判断逻辑。
- 弹窗关闭（未完成绑码）：停留实名认证页，`showBindCodeConfirmDialog` 遗留死代码一并删除。

### D5：H5 返回刷新逻辑保留

`useBindCustomer` 内 `useDidShow` 检测从 web-view 绑码 H5 返回并刷新的逻辑保留：H5 端与低版本端仍走 H5 路径，该逻辑是它们唯一的刷新通道。

### D6：绑码成功后的数据刷新链路（已验证通顺）

```
handleBindConfirm（popup:349-356）
├─ emit('updateCustomerCode')      ← 先 emit，此刻 Store 尚未写入
├─ handleClose(true)
└─ afterCustomerChange             ← 后写 Store
     ├─ updateCustomerCodeHandler：同步写 customerCode 进 globalUserStore
     └─ getMinePageUserInfo：拉整包用户+权限接口，重写 customerInfo
        （hasCurBind / bindAuth / existedRelationBind / realNameVO）
           ↓
  全局唯一 pinia store（userGlobal，useUpdateSomeUserInfoV1 与 useUserInfo 同实例）
           ↓
  入口① bindText computed 响应式重算 ✅
  入口② 点击时读 storeToRefs 判断 ✅
  入口③ customerCode 自动更新；卡片显隐靠回调手动 reloadPage() 重拉 getAuthDetail ✅
```

关键结论：`reloadPage()` 内部为 `setTimeout(doReload, RELOAD_DELAY)` 延迟执行 + `initData()` 走服务端接口（服务端绑码状态已更新），天然避开「emit 先于 Store 写入」的时序问题；入口③回调中禁止同步读全局 Store 做判断。

## Risks / Trade-offs

- [首页两个组件（bind-code、market-area）各自挂载一个弹窗实例] → 同页双实例仅增加模板挂载成本，弹窗未打开时不渲染模式组件（懒加载）；若构建后体积异常再合并为页面级单实例
- [express_type `'企业认证'` 为新参数取值，数据侧报表维度将出现新值] → 事件与口径均不变，仅维度值新增，提测时同步数据侧确认报表兼容
- [emit('updateCustomerCode') 先于 Store 写入（handleBindConfirm 先 emit 后 afterCustomerChange）] → 入口回调禁止同步读全局 Store 做判断；入口③的 reloadPage 为延迟执行 + 服务端接口拉取，天然避开；入口①②纯响应式消费不受影响；提测覆盖「绑定/切换/更换成功」三种回流
- [整包刷新接口 getSettingPageUserAndAuth 失败静默（仅 console.error）] → customerCode 已同步写入但 bindAuth/hasCurBind 停留旧值，首页按钮三态文案短暂不准，下次进入「我的」页自动修复；发生概率低，不额外处理
- [支付宝端弹窗层级与表现差异] → 组件已在上个迭代于「我的」页三端验证过，本接入无新增平台特性

## Migration Plan

1. 按入口逐个改造，每个入口独立提交（首页绑码入口 → 预存运费入口 → 企业认证入口）
2. 三端（weapp/alipay/H5）自测每个入口的：拉起、绑定成功回流、关闭弹窗、绑定/切换/更换三模式
3. 构建产物核对主包体积增量
4. 回滚策略：整分支回滚即可（无服务端开关、无数据迁移、无接口变更）

## Open Questions

无（express-type 取值、绑码成功后续接行为、灰度与低版本兜底均已在探索阶段确认）。
