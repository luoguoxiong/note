# Implementation Tasks

> 路径约定：源码写在 `src/modules/kye-miniapp-waybill/src/`（git 子模块，真正源码）；`src/modules/waybill-build/` 是打包产物（会被覆盖，勿写）。页面与配套代码位于 `src/modules/kye-miniapp-waybill/src/pages/waybill-config/`；对 `config-card` 与 `waybill-config-list` 的改动在 `src/modules/kye-miniapp-waybill/src/pages/waybill-config-list/` 下。页面跳转 URL 用 `/modules/waybill-build/pages/...`。引用 public 用 `@public/...`，引用查件模块用 `@modules/waybill-build/...`。

## 1. 复用算法与初始配置解析（纯函数，无 UI）

- [x] 1.1 实现 `utils.ts` 的 `buildReusedConfig(currentStandard, prevCustom)`：寄收仅按 code 复用 visible（fixed 强制 true）；运单/功能按 code 复用 visible，开启项按 prevCustom order 相对顺序置顶、其余按 currentStandard 默认顺序跟随，最后 order 按 1..n 重排；功能 fixed 按钮保留固定位置不参与重排。完成标准：三模块输出符合 spec「开启项保持相对顺序并置顶」场景。
- [x] 1.2 实现 `resolveInitialConfig(mode, status, currentPair, prevCustom)`：edit→customConfig；add+待揽件→standardConfig；add+待签收/已签收→检查上一状态 customConfig，返回 `{ needPrompt, ... }`。完成标准：四种入口分支返回值正确。
- [x] 1.3 验证 `buildReusedConfig`/`resolveInitialConfig`（项目无测试运行器，改用 `esno` 运行 `openspec/changes/waybill-config/verify-utils.ts`）覆盖：两状态均存在复用、仅上一状态存在不复用、仅当前存在保持默认、开启项置顶相对顺序、fixed 强制可见且不重排。完成标准：25 项断言全绿。

## 2. useSort 拖拽 hook

- [x] 2.1 实现 `hooks/useSort.ts` 泛型 hook（入参响应式列表 + itemKey），沿用 `draggable-setting` 机制：200ms 长按定时器、`Taro.createSelectorQuery` 测距、占位符 + 拖拽元素（`position:fixed`+transform 跟手）、touchmove 按距离交换占位符、touchend 提交新顺序并按位置重排 order（1..n）。返回 `{ renderList, onTouchStart, onTouchMove, onTouchEnd, draggingStyle }`。完成标准：拖拽后列表顺序与 order 写回正确。
- [x] 2.2 在弹窗组件中联调 useSort，验证长按触发、跟手移动、松手固化、order 递增。完成标准：拖拽交互在模拟器可跑通。（代码已联调，运行时验证见 7.3）

## 3. ConfigModulesView 可编辑/预览模块视图

- [x] 3.1 新增 `components/config-modules-view`：渲染三个 `.config-module`（border 包裹）内含 `ConfigCardAddress`/`ConfigCardInfo`/`ConfigCardButtons` 子组件，去掉 config-card 外层 padding/border chrome；`editable` 控制模块头与编辑按钮显隐。完成标准：可编辑态与预览态复用同一组件。
- [x] 3.2 模块头：1/2/3 数字角标 + 模块名 + edit 图标 + 编辑按钮，点击 `emit('edit', moduleType)`。完成标准：三模块头按序渲染并触发 edit 事件。
- [x] 3.3 角标样式独立 scss：24×24px、`border-radius: 6.86px 1.71px 6.86px 1.71px`，颜色 `#ff9300`/`#00c58c`/`#57a8f9`（用 px 不用 rpx）。完成标准：三色角标视觉与设计一致。
- [x] 3.4 配置页主视图用 `editable`、预览弹窗用只读；config-card 回归 config-list 专属（撤掉 `editable`/`preview` 模式与模块头代码）。完成标准：config-card 仅服务 config-list，配置页主视图/预览均用 ConfigModulesView。

## 4. 模块编辑弹窗 module-edit-popup

- [x] 4.1 创建 `components/module-edit-popup/index.vue` + `index.scss`，props：`moduleType`(1/2/3)、`fields`、`maxSelect?`；字段项独占一行、左右边距 24px、高度 96px。完成标准：组件可被父组件打开/关闭，字段行布局尺寸符合规格。
- [x] 4.2 顶部「数字 + 模块 label + 关闭按钮」；`maxSelect` 存在时下方显示「最多可设置{maxSelect}个选项；支持长按拖动调整顺序」，否则不显示。完成标准：运单模块显示提示、寄收模块不显示。
- [x] 4.3 字段项渲染：sort 手柄（仅运单/功能模块且非 fixed 显示）+ 字段文案 + switch（绑定 visible，fixed 禁用）。完成标准：寄收无手柄、运单全显手柄、功能 fixed 无手柄、fixed 项 switch 禁用。
- [x] 4.4 接入 useSort 实现拖拽排序；switch 切换同步 visible；`maxSelect` 达上限时禁用其余关闭项开启。完成标准：拖拽改序、开关切换、超限禁止开启均生效。
- [x] 4.5 任一变更 `emit('update:fields', newFields)` 同步父组件 `localConfig`。完成标准：关闭弹窗后 config-card 与预览反映最新配置。

## 5. 配置页主体 waybill-config

- [x] 5.1 替换占位 `index.vue`：用 `Taro.getCurrentInstance().router` 读取 `waybillStatus`+`mode`，调 `resolveInitialConfig` 初始化响应式 `localConfig`。完成标准：新增/编辑两态进入后字段集合与初始 visible/order 正确。
- [x] 5.2 新增态温馨提示弹窗：`needPrompt=true` 时弹出「检测到您已设置了"待揽件列表"卡片个性设置，是否直接复用？」，「好的」→`buildReusedConfig` 结果、「不需要」→standardConfig。完成标准：四类入口场景（待揽件无提示、待签收/已签收有/无上一定制）弹窗与初始配置正确。
- [x] 5.3 渲染 `config-card` 可编辑形态（传当前 `localConfig` + 状态预览数据），监听 `edit` 事件打开对应 `module-edit-popup` 并回写 `localConfig`。完成标准：三模块编辑弹窗可打开、修改同步预览。
- [x] 5.4 底部「卡片预览」按钮（ky-button 蓝边白底蓝字）：点击底部弹窗显示「卡片预览样式」标题 + 关闭按钮 + `config-card` 塞入当前 `localConfig` 与状态。完成标准：预览弹窗按当前配置渲染卡片。
- [x] 5.5 底部「保存设置」按钮（ky-button 蓝底白字）：按决策 9 映射 `localConfig`→`SaveCardConfigRequest` 调 `saveCardConfig`，成功后先 `store.loadAllConfigs({ force: true })` 刷新一次再 `Taro.navigateBack()`、失败提示保留页面。完成标准：保存成功后列表刷新到新配置并返回列表页。

## 6. 入口改造

- [x] 6.1 修改 `config-card.handleToConfig`：按个性版本是否存在携带 `?waybillStatus=&mode=add|edit` 跳转 waybill-config。完成标准：空卡片跳转带 add+状态，已存在跳转带 edit+状态。（改为 emit `add`/`edit-entry`，由 config-list 携参跳转）
- [x] 6.2 `waybill-config-list` 页为已存在个性版本补充编辑入口（点击进入 edit 态）。完成标准：两种入口均能正确进入对应模式。

## 7. 联调与验证

- [ ] 7.1 联调 `web.query.cardConfig.save`，按后端文档格式对齐：`waybillInfoConfig` 为 `Record<code,{visible,order}>`（非 fields 数组）、`functionConfig` 过滤固定按钮。完成标准：保存载荷后端可正确落库并回显。（格式已按文档改好，待运行时联调确认）
- [ ] 7.2 三状态（待揽件/待签收/已签收）× 新增/编辑 矩阵手测：复用提示、复用算法结果、模块编辑、预览、保存返回。完成标准：矩阵场景全通过。
- [ ] 7.3 跨端验证（微信小程序 + 支付宝小程序 + H5）拖拽跟手、弹窗滚动、switch 交互。完成标准：三端表现一致无明显异常。
- [x] 7.4 确认 design Open Questions（disabled 字段排序、功能 fixed 置顶、maxSelect 截断策略），将结论回写 spec/design 并落实到 1.1/4.4。完成标准：开放问题有定论且代码与 spec 一致。

## 8. 迭代修复与文档对齐（apply 期）

- [x] 8.1 方案 B 重构：config-card 撤掉 `editable`/`preview` 模式与模块头代码（回归 config-list 专属），新增 `ConfigModulesView` + `config-module` 子组件承载可编辑/预览态；border 只包内容区、`bordered` 可配置、模块间无间距。
- [x] 8.2 `ConfigCardHead`/`ConfigCardAddress` 状态化：加 `waybillStatus` prop，按 `MOCK_WAYBILL_DATA[status]` 取样例数据（原先写死待揽件）；`ConfigModulesView` 透传 `waybillStatus`。
- [x] 8.3 store 加载语义修正：`useDefaultConfig` 不再置 `loaded=true`，加 `loadFailed`；配置页 `init` 直接读 `configMap`，失败/无配置 toast 报错返回（不兜底）；`onMounted` 用 `loadAllConfigs().then(init)`。
- [x] 8.4 保存格式按后端文档对齐：`waybillInfoConfig` 改为 `Record<code,{visible,order}>`，`functionConfig` 过滤固定按钮；`SaveCardConfigRequest` 类型同步更新。
- [x] 8.5 useSort 拖拽修复：稳定 key（`item.code`，占位符 `ph-code`）保留 touch 捕获；`position:fixed; top:0; left:0` + `rect.left/top` 偏移精确跟手；锁定 `width`/`margin:0` 保持原行布局。
- [x] 8.6 `useSort` 迁到 `src/modules/kye-miniapp-waybill/src/hooks/`，引用改 `@modules/waybill-build/hooks/useSort`。
- [x] 8.7 底部按钮用 ky-button 内置 `size="large"`（88px），去掉自定义 height。
