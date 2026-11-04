# Tasks

## 1. 版本号配置化（前置重构）

- [x] 1.1 在 `src/public/apis/card-customize/index.ts` 新增 `CARD_CONFIG_VERSION` 常量（初值 `'optimizeVersion'`，不改变行为），store 与 module save/switch 共 4 处硬编码改为引用常量；验证：全局 grep 无 `'optimizeVersion'` 残留字面量（仅剩定义处），dev 启动后查件列表个性设置正常加载
- [x] 1.2 将 `CARD_CONFIG_VERSION` 升级为 `'payModeVersion'`；验证：Network 面板确认 cardConfig.get/save/switch 请求 version=payModeVersion，后端未落库时接口正常降级不报错

## 2. 字段枚举与类型

- [x] 2.1 `src/public/components/business/waybill-card/config/codes.ts` 的 `WaybillInfoCode` 新增 `PAY_MODE = 'payMode'`；验证：编译通过，TS 无报错
- [x] 2.2 `waybill-card/types.ts` 的 `ISearchWeb` baseInfo 新增 `payModeText?: string`（searchMobile 在 `waybill.baseInfo.payModeText` 下发付款方式文案）；验证：TS 编译通过，PayModeField 取值有类型支撑

## 3. 付款方式字段组件

- [x] 3.1 新建 `src/public/components/business/waybill-card/fields/PayModeField.vue`：取值 `waybill.baseInfo.payModeText`，有值展示“付款方式：{值}”，空值/undefined 不渲染整行，加密值 `***` 直显；验证：mock 运单数据三种场景（有值/空值/`***`）展示正确
- [x] 3.2 `fields/index.ts` fieldComponentMap 注册 `[WaybillInfoCode.PAY_MODE]: PayModeField`；验证：dev 环境配置页开启付款方式后，待揽件/待签收/已签收三种状态卡片均按配置渲染该字段，长按拖拽排序生效

## 4. 联调与回归验证

- [ ] 4.1 老用户回归：使用存量个性设置模板登录，确认模板配置不变且付款方式默认关闭；验证：保存过配置的账号升级后 configMap 中无 payMode 或 visible=false
- [ ] 4.2 配置链路回归：开启/关闭/拖拽/保存付款方式，toast“保存成功”，返回列表卡片即时生效；验证：保存后重新进入配置页回显一致
- [ ] 4.3 多端冒烟：微信小程序、H5、支付宝小程序各过一遍主流程；验证：三端展示一致无端级样式差异
