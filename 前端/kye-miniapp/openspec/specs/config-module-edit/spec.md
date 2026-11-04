# config-module-edit Specification

## Purpose
TBD - created by archiving change waybill-config. Update Purpose after archive.
## Requirements
### Requirement: 可编辑模块头
配置页 SHALL 在三个模块（寄收/运单/功能按钮）上方分别渲染模块头：左侧为数字角标 + 模块名（1 寄收信息展示字段 / 2 运单信息展示字段 / 3 功能按钮展示字段），右侧为 edit 图标 + 「编辑」按钮。数字角标 SHALL 固定为 24×24px、`border-radius: 6.86px 1.71px 6.86px 1.71px`，三个角标颜色依次为 `#ff9300`、`#00c58c`、`#57a8f9`。

#### Scenario: 三个模块头渲染
- **WHEN** 配置页渲染可编辑模块视图（`ConfigModulesView` editable）
- **THEN** 寄收、运单、功能按钮三个模块上方分别显示 1/2/3 角标（对应颜色 #ff9300/#00c58c/#57a8f9）+ 模块名 + edit 图标 + 编辑按钮

### Requirement: 模块编辑弹窗结构
点击某模块的「编辑」按钮 SHALL 从底部弹出该模块编辑弹窗。弹窗顶部 SHALL 显示「数字 + 选中模块 label + 关闭按钮」。若该模块配置定义了 `maxSelect`，SHALL 在顶部下方显示文案「最多可设置{maxSelect}个选项；支持长按拖动调整顺序」；否则不显示该文案。

#### Scenario: 运单信息模块显示最多可选项提示
- **WHEN** 用户点击运单信息模块的编辑按钮，且 waybillInfoConfig 定义了 maxSelect=4
- **THEN** 弹窗顶部显示「2 运单信息展示字段 + 关闭」，下方显示「最多可设置4个选项；支持长按拖动调整顺序」

#### Scenario: 寄收模块不显示最多可选项提示
- **WHEN** 用户点击寄收模块的编辑按钮（该模块无 maxSelect）
- **THEN** 弹窗顶部显示「1 寄收信息展示字段 + 关闭」，不显示最多可选项文案

#### Scenario: 关闭模块编辑弹窗
- **WHEN** 用户点击弹窗顶部关闭按钮或遮罩
- **THEN** 弹窗关闭，已修改的开关与排序状态保留在页面配置中

### Requirement: 字段项行布局
弹窗内每个字段项 SHALL 独占一行，行左右边距为 24px、行高为 96px。

#### Scenario: 字段项行布局
- **WHEN** 模块编辑弹窗渲染字段项列表
- **THEN** 每个字段项独占一行，左右边距 24px、高度 96px

### Requirement: 字段项开关控制
弹窗内 SHALL 按配置逐项渲染字段行，每行右侧显示 switch 开关，开关状态绑定该字段的 `visible` 属性。`fixed` 为 true 的字段（寄收、功能按钮模块中存在）SHALL 禁用开关（不可隐藏）且不可排序；非 fixed 字段 SHALL 允许切换 `visible`。

#### Scenario: 切换非固定字段开关
- **WHEN** 用户切换一个非 fixed 字段的 switch
- **THEN** 该字段 `visible` 随之更新，ConfigModulesView 同步显隐

#### Scenario: 固定字段开关不可切换
- **WHEN** 字段 fixed=true
- **THEN** 该字段 switch 禁用，用户无法关闭其 visible

### Requirement: 排序手柄可用性
字段行左侧的 sort 拖拽手柄 SHALL 仅在运单信息、功能按钮两个模块显示；寄收模块 SHALL 不显示 sort 手柄。功能按钮模块中 `fixed=true` 的按钮 SHALL 不显示 sort 手柄（不可排序）。

#### Scenario: 寄收模块无排序手柄
- **WHEN** 寄收模块编辑弹窗渲染字段行
- **THEN** 字段行不显示 sort 手柄，仅显示文案与 switch

#### Scenario: 运单信息模块显示排序手柄
- **WHEN** 运单信息模块编辑弹窗渲染字段行
- **THEN** 每个字段行左侧显示 sort 手柄，可长按拖动调整顺序

#### Scenario: 固定功能按钮无排序手柄
- **WHEN** 功能按钮模块中某按钮 fixed=true
- **THEN** 该按钮行不显示 sort 手柄，仅显示文案与 switch

### Requirement: 模块配置变更同步
用户在模块编辑弹窗中修改的开关状态与排序 SHALL 实时同步至页面配置，关闭弹窗后 `ConfigModulesView`（可编辑态）与卡片预览 SHALL 反映最新配置。

#### Scenario: 弹窗修改同步至预览
- **WHEN** 用户在某模块弹窗中关闭一个字段并关闭弹窗
- **THEN** 配置页的 ConfigModulesView 与卡片预览中该字段不再显示

