## Why

当前查件列表卡片为固定样式，用户无法自定义显示的字段和功能按钮。历史接到较多客户反馈，希望在查件列表看到「件数、重量、运费」等信息，不用点击进入详情页逐一查看。本次新增「列表卡片个性设置」功能，支持用户自定义卡片展示内容，提升用户体验。

本次 change 专注于实现**本地默认配置**和**列表卡片渲染改造**，为后续配置页和接口联调奠定基础。

## What Changes

- 新增本地默认配置常量（DEFAULT_CARD_CONFIG），包含寄收信息、运单信息、功能按钮三个模块的字段定义
- 新增 useCardConfig Hook，负责配置数据管理（加载、降级、版本切换）
- 改造 waybill-card 组件，支持配置驱动渲染（寄收信息 v-if 显隐、运单信息动态组件渲染）
- 新增运单信息字段组件（fields 目录），每个字段独立组件，通过 code 匹配渲染
- 改造 waybill-search 页面底部按钮，叠加配置过滤逻辑

## Capabilities

### New Capabilities

- `card-config-default`: 本地默认配置常量，包含寄收信息、运单信息、功能按钮三个模块的字段定义，所有字段 visible=true，状态判断由现有逻辑控制
- `use-card-config`: 配置数据管理 Hook，负责加载配置、版本切换、降级逻辑，数据获取优先级：定制版 → 标准版 → 本地默认配置
- `waybill-card-fields`: 运单信息字段组件（fields 目录），每个字段独立组件（TimeField、TotalAmount 等），通过 code 匹配渲染，支持不同字段的差异化展示逻辑

### Modified Capabilities

- `waybill-card`: 运单卡片组件改造，寄收信息保持现有布局只加 v-if 显隐，运单信息改为动态组件渲染（component + v-for）
- `waybill-search-bottom`: 查件列表页面底部按钮改造，在原有 getMenus/getRelieveButtons/showCancelOrderBtn 逻辑上叠加配置过滤

## Impact

**Affected Code**:
- `src/modules/kye-miniapp-waybill/src/constants/cardCustomize.ts` (新增)
- `src/modules/kye-miniapp-waybill/src/components/waybill-search/components/card-custom-setting/hooks/useCardConfig.ts` (新增)
- `src/modules/kye-miniapp-waybill/src/public/components/business/waybill-card/index.vue` (修改)
- `src/modules/kye-miniapp-waybill/src/public/components/business/waybill-card/fields/` (新增目录)
- `src/modules/kye-miniapp-waybill/src/components/waybill-search/index.vue` (修改)

**Dependencies**:
- 后端接口 `web.query.cardConfig.get` 需要联调，用于获取用户配置
- 后端接口 `web.query.cardConfig.save/switch` 暂不联调
- 版本机制（标准版/定制版）后续 change 实现

**Breaking Changes**: 无，所有改造在原有逻辑基础上叠加配置
