## Why

查件列表的「卡片个性设置」目前只有配置列表页（waybill-config-list）：用户可切换运单状态、选择常规/个性版本，但点击「个性设置版本」卡片后进入的配置页（waybill-config）仍是 Hello World 占位页，无法真正新增或编辑定制卡片。本次 change 实现该配置页，让用户能为「待揽件/待签收/已签收」三种状态定制寄收信息、运单信息、功能按钮三个模块的展示字段与顺序并保存到后端，补齐个性设置闭环。

## What Changes

- 实现配置页 `waybill-config`（替换占位 `index.vue`），支持**新增 / 编辑**两种模式，模式与运单状态由配置列表页路由参数带入
- **新增态**：按状态链路判断上一状态是否已设置定制卡片——待签收(30) 检查待揽件(20)、已签收(40) 检查待签收(30)、待揽件(20) 无需判断；若上一状态已有定制配置，弹「温馨提示」询问「检测到您已设置了"待揽件列表"卡片个性设置，是否直接复用？」：
  - 点击「不需要」：取当前状态常规版本配置（后端必返）为默认
  - 点击「好的」：**渲染的字段集合仍取当前状态常规版本**（各状态可用字段不同，如待揽件有「创建时间」、待签收无该字段则不复用），仅按字段 code 复用上一状态定制配置中**同 code 字段的开关(visible)状态与排序**——上一状态无该 code 字段则保持常规版本默认；**排序规则**：复用后开启(visible=true)的字段保持与上一状态一致的相对顺序并整体置顶，未开启字段按常规版本默认顺序排在下方（排序仅作用于运单/功能按钮模块，寄收模块仅复用开关状态）
- **编辑态**：直接取该状态已有定制版本配置作为初始值
- 新增 `ConfigModulesView` 组件承载可编辑/预览态（不复用 config-card，config-card 回归 config-list 专属）：寄收 / 运单 / 功能按钮三个模块上方分别渲染 `1 / 2 / 3` 数字角标 + 模块名 + edit 图标 + 「编辑」按钮；去掉 config-card 外层 padding/border，按模块拆分 border（`bordered` 可配置，预览态无 border）
- 数字角标样式：`24×24px`、`border-radius: 6.86px 1.71px 6.86px 1.71px`，颜色依次 `#ff9300` / `#00c58c` / `#57a8f9`
- 点击模块「编辑」按钮弹出该模块编辑弹窗：顶部「数字 + 模块名 + 关闭」；若该模块配置了 `maxSelect`，显示「最多可设置{maxSelect}个选项；支持长按拖动调整顺序」；列表项为「拖拽 sort 按钮（仅运单/功能模块显示）+ 字段文案 + visible 开关」
- 新增 `useSort` hook 实现长按拖拽排序
- 底部增加「卡片预览」按钮（ky-button 蓝边白底蓝字、size=large）与「保存设置」按钮（蓝底白字、size=large）：预览按钮底部弹窗显示「卡片预览样式」标题 + 关闭按钮 + `ConfigModulesView`（只读）塞入当前配置与状态；保存按钮按后端文档格式（`code→{visible,order}` map，`functionConfig` 过滤固定按钮）调用 `saveCardConfig`，成功后刷新 store 再返回上一页
- `config-card` 改为 emit `add`（空卡片点击）/ `edit-entry`（个性版本已存在的编辑入口），由配置列表页携带 `waybillStatus` 与 `mode`（新增/编辑）跳转
- `ConfigCardHead` / `ConfigCardAddress` 改为按传入的 `waybillStatus` 从 `MOCK_WAYBILL_DATA` 取样例数据（原先写死待揽件）
- 配置页不兜底：加载失败或当前状态无真实配置时直接报错返回，不用 `DEFAULT_CARD_CONFIG`（查件列表页仍保留 DEFAULT 兜底）

## Capabilities

### New Capabilities
- `waybill-config-page`: 配置页（新增/编辑）整体能力——模式与状态入口契约、新增态上一状态定制配置复用（字段集合取当前常规版本，按 code 复用 visible 与排序、开启项保持相对顺序置顶）与温馨提示弹窗、底部卡片预览弹窗与保存设置、调用 `saveCardConfig` 保存并返回上一页
- `config-module-edit`: 模块编辑能力——`config-card` 可编辑形态下的 `1/2/3` 数字角标模块头与「编辑」按钮，以及点击后的模块编辑弹窗（顶部数字+模块名+关闭、`maxSelect` 提示、字段项 sort 按钮+visible 开关）
- `use-sort`: 长按拖拽排序 hook，供模块编辑弹窗调整运单/功能模块字段顺序

### Modified Capabilities
<!-- openspec/specs/ 中无 config-card / waybill-config 相关既有 spec，本次均为新增 spec；config-card 组件的可编辑形态改造作为实现细节纳入 `config-module-edit` -->

## Impact

**Affected Code**:
- `src/modules/kye-miniapp-waybill/src/pages/waybill-config/index.vue`（替换占位，实现配置页）+ `index.scss`（源码在 kye-miniapp-waybill 子模块；waybill-build 为打包产物）
- 新增 `components/module-edit-popup`（模块编辑弹窗）、`components/config-modules-view`（可编辑/预览模块视图，含 `config-module` 子组件）及其 scss
- 新增 `src/hooks/useSort.ts`（长按拖拽排序，共享 hooks 目录）、`utils.ts`（复用算法纯函数）、`types.ts`
- `src/modules/kye-miniapp-waybill/src/pages/waybill-config-list/components/config-card/config-card.vue`：加 `showEditEntry` + emit `add`/`edit-entry`（撤掉可编辑形态，回归 config-list 专属）；`waybill-config-list/index.vue` 携状态与模式跳转
- `config-card-head.vue` / `config-card-address.vue`：加 `waybillStatus` prop，按状态取 `MOCK_WAYBILL_DATA`（原先写死待揽件）
- `store/cardConfig.ts`：加 `loadFailed`，`useDefaultConfig` 不再置 `loaded`（失败自动重试）；`apis/card-customize/types.ts`：`SaveCardConfigRequest.waybillInfoConfig` 改为 `Record<string,{visible,order}>`
- 复用：`useCardConfigStore`、`saveCardConfig`、`MOCK_WAYBILL_DATA`、`WAYBILL_CONFIG_IMAGES`、`ConfigCardHead/Address/Info/Buttons` 子组件

**Dependencies**:
- 后端接口 `web.query.cardConfig.save` 需联调（保存定制配置）
- 依赖前置 change `waybill-card-config-default` 产出的 `DEFAULT_CARD_CONFIG`、`cardConfig` store、`config-card` 组件基线

**Breaking Changes**: 无
