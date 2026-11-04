# Tasks

## 任务总览

| 序号 | 任务 | 依赖 | 预估时长 |
| ---- | ----------------- | ------------------- | ----------------- |
| 1 | 公共链路改造（validate 层） | 无 | 1h |
| 2 | 按钮组件与首页接入 | 任务1 | 1h |
| 3 | 自测与回归验证 | 任务2 | 1h |

## 1. 公共链路改造（validate 层）

> ⚠️ 影响 order-public 公共模块（源码 `src/modules/kye-miniapp-order/src/order-public/`，构建副本自动同步）：自动识别流行为必须保持不变

- [x] 1.1 ~~在 `order-public/validate/utils.ts` 为 `getAiAddrAnalysis` 增加可选参数~~（实现后按用户要求还原，`getAiAddrAnalysis` 保持原签名，四级地址拼接依赖接口默认 fillTownToDetails=1）
- [x] 1.2 在 `order-public/validate/access/index.ts` 将 `tellClipBoard` 中「识别结果弹窗 + 设为寄件/收件回填跳转」抽为内部共享函数，`tellClipBoard` 改为调用该函数，逻辑分支不变
- [x] 1.3 手动识别流入口（实现时应用户要求内聚在按钮组件 `index.vue` 内，validate 层仅导出共享弹窗回填 `showClipBoardDialogAndFill` 与 `CLIPBOARD_MAX_LENGTH`）：取词（复用「粘贴并识别」取词方式）→ trim + 300 字截断（常量提取）→ 空内容 toast「未识别到粘贴板内容」→ `getAiAddrAnalysis(text)`（不改封装，四级地址依赖接口默认 fillTownToDetails=1）→ 识别失败 toast「识别失败，请稍后重试」→ 成功调共享弹窗回填函数
- [x] 1.4 确认手动流不写 `localStorage('clipboardData')` 缓存、不触碰自动流的 hasChange 判定

## 2. 按钮组件与首页接入

- [x] 2.1 新建 `pages/order-single/components/paste-recognize-entry/`（index.vue + index.scss）：图标+文案按钮、独立成行居中、点击热区为整个按钮区域、loading 置灰防重复点击，px 单位
- [x] 2.2 在 `pages/order-single/index.vue` 于 Sender/Receive block 与 PickupMode block 之间接入按钮组件，新增白名单计算属性（`container === 'page'` 且寄收信息≠组合条件/指定地址，实现时以 initData/schema 实际字段核对映射）
- [x] 2.3 平台守卫：支付宝小程序、高德小程序渠道不渲染按钮（复用 `@/public/utils` 环境判断），APP 与微信小程序正常展示
- [x] 2.4 组件 `handleClick` 接入手动识别流（含按钮点击埋点 clk_express_smart_paste_v1）：loading 置灰 → 调用 → 识别结束（含空内容、失败、弹窗关闭）后 finally 恢复可点击

> 实现说明：页面为 schema 布局驱动，接入方式为 `pages/order-single/hooks/utils.ts` 的 `decryptModuleConfig` 在 schema 合并后通过 `insertPasteRecognizeEntry` 将入口组件（`PasteRecognizeEntry`）插入寄/收件人信息所在 Block 的 Receive 之后；白名单字段映射为 `config.container === 'page'` 且 `config.fieldsConfigType === 'fields'`（'combination' 组合条件与「指定地址」（fieldsConfigType 为空）均被排除）；平台守卫复用 `@order-global-package-order/utils/device` 的 `isAliPayClient/isAmapApp`。手动识别流（取词/截断/识别调用/loading）在入口组件 `index.vue` 内实现，validate 层仅导出共享的 `showClipBoardDialogAndFill`（弹窗+回填）。入口图标暂复用现网智能识别图标，待 UI 设计稿交付后替换。

## 3. 自测与回归验证

- [ ] 3.1 白名单场景验证：页面样式=跳转+自由输入展示按钮；组合条件/指定地址、页面样式=平铺、配置未维护、支付宝小程序渠道均隐藏
- [ ] 3.2 手动识别主流程验证：剪切板有「姓名+电话+地址」文本 → 识别成功弹窗 → 设为寄件/收件 → 字段覆盖回填（空字段保留原值）→ 跳转对应填写页；请求参数确认携带 `fillTownToDetails=1`
- [ ] 3.3 异常场景验证：剪切板为空/非文本 → toast「未识别到粘贴板内容」；接口失败 → toast「识别失败，请稍后重试」且下单流程不受阻；弹窗 X 关闭不回填；识别中重复点击无效；>300 字文本正确截断
- [ ] 3.4 自动识别流回归：进入下单页自动粘贴板识别弹窗触发、判定规则（内容变化/关键词/长度）与回填跳转行为与改动前一致；原有智能识别入口（智能填写、图片识别）不受影响
- [ ] 3.5 多端验证：微信小程序读取剪切板顶部系统提示属系统行为；APP（iOS/Android）取词正常；对比 UI 设计稿确认按钮视觉还原
