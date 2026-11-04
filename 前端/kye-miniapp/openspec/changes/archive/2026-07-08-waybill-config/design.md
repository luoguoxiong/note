## Context

查件列表「卡片个性设置」已有配置列表页 `waybill-config-list`：用户选择运单状态（待揽件 20 / 待签收 30 / 已签收 40）与版本（常规 / 个性），点击「个性设置版本」卡片跳转至 `waybill-config` 配置页。该页当前是 Hello World 占位页（路由 `/modules/waybill-build/pages/waybill-config/index`，已注册于 subpackages）。

已就绪的基础设施（无需重建）：
- `useCardConfigStore`（`store/cardConfig`）：`getConfigPairByStatus(status)` → `{ standardConfig, customConfig }`、`getVersionByStatus`、`loadAllConfigs`、`updateConfig`。
- `apis/card-customize`：`getCardConfig`、`saveCardConfig`(`web.query.cardConfig.save`)、`switchCardConfig`。
- `CardConfig` 数据模型（`@/public/components/business/waybill-card/config/types`）：`senderReceiverConfig.fields[{code,name,visible,fixed}]`、`waybillInfoConfig.{fields[{code,name,visible,order}], maxSelect}`、`functionConfig.buttons[{code,name,visible,fixed,order}]`。
- `WAYBILL_CONFIG_IMAGES.edit` / `.sort` 图标、`MOCK_WAYBILL_DATA`、`config-card` 组件及 head/address/info/buttons 子组件。
- 既有拖拽范式：`waybill-search/components/draggable-setting` 用 touch 事件 + 长按定时器 + `createSelectorQuery` 测距 + 占位符/拖拽元素 + `position:fixed`+transform 实现长按拖动排序。

约束：跨端（微信/支付宝小程序 + H5），样式用 `px`（非 `rpx`），函数用箭头函数，样式独立 scss，禁用原生表单元素（用 Kye-MiniUI 组件）。

## Goals / Non-Goals

**Goals:**
- 实现 `waybill-config` 配置页（新增/编辑），覆盖入口模式判定、复用算法、模块编辑弹窗、拖拽排序、卡片预览、保存并返回。
- 以可复用 hook（`useSort`）抽离拖拽逻辑，沿用既有 `draggable-setting` 的 touch 机制。
- 新增 `ConfigModulesView` 承载可编辑/预览态，`config-card` 回归 config-list 专属（不破坏列表页 radio 用法）。

**Non-Goals:**
- 不实现版本切换（`switchCardConfig`）落库与列表页切换逻辑（后续 change）。
- 不实现新手引导（`getBeginnerStatus`/`setBeginnerViewed`）。
- 不改 `waybill-card`（查件列表卡片）渲染逻辑——本页预览用 `ConfigModulesView`。
- 不实现后端接口本身，仅联调既有 `saveCardConfig`。

## Decisions

### 1. 文件布局
> 源码写在 `src/modules/kye-miniapp-waybill/src/`（git 子模块，真正源码）；`src/modules/waybill-build/` 是打包生成的产物（subpackage 注册根），写在那里会在下次打包被覆盖。页面跳转 URL 用 `/modules/waybill-build/pages/...`（引用打包后资源）。ES 引用约定：引用 public 内容用 `@public/...`；引用查件(waybill)模块内容用 `@modules/waybill-build/...`（引用打包后资源）；页面内部用相对路径 `./`。

页面与配套代码集中在 `src/modules/kye-miniapp-waybill/src/pages/waybill-config/` 下：
- `index.vue` / `index.scss`（替换占位）
- `components/module-edit-popup/index.vue` + `index.scss`（模块编辑弹窗）
- `components/config-modules-view/index.vue` + `index.scss`（可编辑/预览模块视图，复用于主视图与预览弹窗）
- `src/hooks/useSort.ts`（长按拖拽排序，共享 hook 目录，引用用 `@modules/waybill-build/hooks/useSort`）
- `utils.ts`（复用算法纯函数，已实现并通过验证）
- 引用查件模块资源用 `@modules/waybill-build/apis/card-customize`、`@modules/waybill-build/store/cardConfig`；引用 public 用 `@public/...`。

### 2. 入口参数契约
`config-card.handleToConfig` 改为按「个性版本是否存在」携带 query：`/modules/waybill-build/pages/waybill-config/index?waybillStatus=30&mode=add|edit`。页面用 `Taro.getCurrentInstance().router` 读取。新增态对应「个性版本未设置」（点击空卡片），编辑态对应「个性版本已存在」。

### 3. 初始配置解析（纯函数 `resolveInitialConfig`）
- `edit` → `cloneDeep(store.getConfigPairByStatus(status).customConfig)`（必有值）。
- `add` + `status=20`（待揽件）→ `cloneDeep(standardConfig)`，不弹提示。
- `add` + `status=30/40` → 取上一状态（30→20、40→30）`customConfig`：为空 → `cloneDeep(standardConfig)`；非空 → 弹温馨提示，按用户选择：
  - 「不需要」→ `cloneDeep(standardConfig)`
  - 「好的」→ `buildReusedConfig(standardConfig, prevCustom)`（见决策 4）

### 4. 复用算法（纯函数 `buildReusedConfig(currentStandard, prevCustom): CardConfig`）
以 `currentStandard` 字段集合为基准，按 `code` 匹配 `prevCustom`，分模块处理：
- **寄收模块**（无 order）：逐字段按 code 复用 `visible`；`fixed=true` 强制 `visible=true`。
- **运单信息模块**（有 order + maxSelect）：按 code 复用 `visible`；排序——收集 `visible=true` 且在 prevCustom 中存在的字段，按 prevCustom 的 order 相对顺序排列并置顶，其余字段按 currentStandard 默认顺序跟随；最后 `order` 按 1..n 重排。
- **功能按钮模块**（有 order + fixed）：非 fixed 按钮按 code 复用 `visible` 与排序（同运单信息规则）；`fixed=true` 按钮保持 `visible=true` 且保留其固定位置，不参与「置顶重排」。

替代方案：直接整份 clone prevCustom。**否决**——各状态可用字段不同（如待揽件有「创建时间」、待签收无），整份复制会带入目标状态不存在的字段或丢失目标状态独有字段，不符合需求。

### 5. 可编辑/预览模块视图 `ConfigModulesView`
新增 `components/config-modules-view` 组件（含 `config-module` 子组件），承载配置页可编辑态与预览态（两者复用同一布局）：
- 三个模块（寄收/运单/功能）各由 `config-module` 渲染：模块头（可编辑态显示 1/2/3 角标+模块名+编辑按钮）在 border 外，内容区（`ConfigCardAddress`/`ConfigCardInfo`/`ConfigCardButtons`）由 `bordered` prop 控制是否包 border。去掉 config-card 外层 padding/border chrome，模块间无间距。
- `editable=true`（配置页主视图）：显示模块头与编辑按钮，`bordered` 跟随 editable（默认有 border）；点击编辑按钮 `emit('edit', moduleType)`。
- `editable=false`（预览弹窗）：只读，无模块头/编辑按钮，`bordered` 默认 false（无 border）。
- 角标样式：24×24px、`border-radius: 6.86px 1.71px 6.86px 1.71px`，颜色 `#ff9300` / `#00c58c` / `#57a8f9`。

`config-card` 回归单一展示职责，仅服务 config-list（default radio 形态 + `showEditEntry`/`add`/`edit-entry`）。配置页不再用 config-card 做可编辑/预览态。

替代方案：在 config-card 内加 `editable`/`preview` 模式。**否决**——可编辑态需去外层 chrome + 按模块拆分 border，已不像「卡片」，塞进 config-card 会多形态化；预览也复用该样式，独立组件更清晰（方案 B）。

### 6. 模块编辑弹窗 `module-edit-popup`
props：`moduleType`（1/2/3）、`fields`（当前模块字段数组）、`maxSelect?`。结构：
- 顶部：`数字 + 模块 label + 关闭按钮`；`maxSelect` 存在时下方显示「最多可设置{maxSelect}个选项；支持长按拖动调整顺序」。
- 列表项：`sort 手柄（仅运单/功能模块显示，且非 fixed）` + 字段文案 + `switch`（绑定 `visible`，`fixed` 禁用）。每项独占一行，左右边距 24px、高度 96px。
- `maxSelect` 约束：已达上限时禁用其余关闭项的开启。
- 通过 `useSort` 处理拖拽；变更实时 `emit('update', newFields)` 同步页面 `localConfig`。

### 7. `useSort` hook
抽离既有 `draggable-setting` 的 touch 拖拽机制为泛型 hook（入参为响应式列表 + itemKey），返回 `{ renderList, onTouchStart, onTouchMove, onTouchEnd, draggingStyle }`。机制：200ms 长按定时器触发 → `Taro.createSelectorQuery` 测量各 item rect → 占位符 + 拖拽元素（`position:fixed`+transform 跟手）→ `touchmove` 按距离交换占位符 → `touchend` 提交新顺序并按位置重排 `order`（1..n）。

替代方案：`movable-area`+`movable-view`。**否决**——列表重排需要占位符动态让位，movable-view 更适合单元素拖动；沿用已验证的 touch 方案一致性更高。

### 8. 本地状态、加载与保存
页面持有响应式 `localConfig`（`cloneDeep` 初始配置）。所有弹窗编辑直接作用于 `localConfig`，`ConfigModulesView` 与卡片预览均读 `localConfig`。

加载（不兜底）：`onMounted` 调 `store.loadAllConfigs().then(init)`。`init` 直接读 `store.configMap[waybillStatus]`，若 `store.loadFailed` 或该状态无真实配置 → toast「配置加载失败」+ `navigateBack`，**不用 DEFAULT 兜底**（查件列表页仍用 `getConfigPairByStatus` 的 DEFAULT 兜底）。store 侧：`useDefaultConfig` 不再置 `loaded=true`（仅成功才置），失败 `loaded=false` + `loadFailed=true`，下次 `loadAllConfigs()` 自动重试。

保存：将 `localConfig` 映射为 `SaveCardConfigRequest`（见决策 9）调 `saveCardConfig`，成功后先 `store.loadAllConfigs({ force: true })` 刷新一次再 `Taro.navigateBack()`。

### 9. 保存载荷映射
按后端 `web.query.cardConfig.save` 文档格式（均为 code→值 的 map）：
- `waybillStatus`: number
- `senderReceiverConfig`: `Record<string, boolean>`（code→visible，含 fixed 字段）
- `waybillInfoConfig`: `Record<string, { visible, order }>`（code→{visible,order}，含全部字段）
- `functionConfig`: `Record<string, { visible, order }>`（code→{visible,order}，**过滤 fixed 按钮** canRealAuth/canNeedPay，后端不存 DB）

后端校验：固定按钮丢弃、当前状态不可用字段过滤、waybillInfo 可见项 >4 抛异常（前端弹窗 maxSelect=4 已拦截）。

### 10. `fixed` 字段处理
寄收与功能按钮模块中 `fixed=true` 的项：switch 禁用（不可隐藏）、不显示 sort 手柄（不可排序）、复用与保存时强制 `visible=true` 并保留固定位置。

### 11. `ConfigCardHead` / `ConfigCardAddress` 状态化
原先两个子组件写死 `MOCK_WAYBILL_DATA[待揽件]`。改为接收 `waybillStatus` prop，用 `computed` 从 `MOCK_WAYBILL_DATA[waybillStatus ?? 待揽件]` 取样例数据（未传回退待揽件，兼容 config-list）。`ConfigModulesView` 把 `waybillStatus` 透传给两者。`ConfigCardInfo`/`ConfigCardButtons` 用字段 code 映射的固定文案，与状态无关，不动。

### 12. `useSort` 拖拽定位细节
- **稳定 key**：普通项与拖拽项都用 `item.code` 作 key（占位符用 `ph-code`），长按后 Vue 移动节点而非重建，保留 touch 捕获（否则 touchmove/touchend 断）。
- **跟手定位**：拖拽项 `position:fixed; top:0; left:0`（基准钉视口左上，避免静态位置掉屏外）+ `transform: translate(rect.left + Δx, rect.top + Δy)`（偏移用 rect.left/top，精确跟手）。
- **保持原样式**：拖拽项锁定 `width: rect.width`、`margin:0`，避免脱离文档流后宽度塌缩导致内部 flex 布局（文字/switch）错位。

## Risks / Trade-offs

- **[config-card 入口改造影响列表页]** → config-card 仅加 `showEditEntry` + emit `add`/`edit-entry`，撤掉可编辑形态；回归验证 config-list radio 选择、空卡片跳转、编辑入口。
- **[复用后可见项超过 maxSelect]** → 业务限定：maxSelect 仅约束运单信息模块且各状态一致，复用不会超限，复用层不做截断；上限拦截在弹窗开关处（任务 4.4）。
- **[拖拽低端机性能]** → `position:fixed`+transform 走 GPU 合成；`touchmove` 仅在最近目标变化时 `createSelectorQuery`，减少测量开销。
- **[跨端 touch 差异]** → 沿用 `draggable-setting` 已在多端验证的事件模型；H5 下 touch 事件兼容（Taro 已映射鼠标事件）。
- **[waybillInfo 保存格式]** → 已按后端文档对齐：`waybillInfoConfig` 为 `code→{visible,order}` map（非 fields 数组），`functionConfig` 过滤固定按钮（见决策 9）。

## Open Questions

1. **复用后 disabled(visible=false) 字段的排序**：暂按 spec「按当前常规版本默认顺序排在开启项之后」实现；实现后与产品确认效果再定。
2. **功能按钮 fixed 项**：已定——fixed 项不可改排序、不可改状态，复用时保留固定位置与 `visible=true`（见决策 4/10）。
3. **保存语义**：已定——按后端文档格式保存（`waybillInfoConfig`/`functionConfig` 为 `code→{visible,order}` map，`functionConfig` 过滤固定按钮），见决策 9；`SaveCardConfigRequest` 类型已调整为 `Record<string,{visible,order}>`。
4. **复用导致可见项 > maxSelect**：已定——业务限定 maxSelect 仅约束运单信息模块且各状态一致，复用不会超限，复用层不截断；上限拦截在弹窗开关处（任务 4.4）。
5. **保存后刷新**：已定——保存成功先 `store.loadAllConfigs({ force: true })` 刷新一次再 `navigateBack` 返回列表（见决策 8）。
6. **`useSort` 与 `draggable-setting`**：已定——新写 `useSort`，**不改动** `draggable-setting`（见决策 7）。
