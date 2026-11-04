## Why

`AreaAddress`（省市区地址选择弹窗）当前位于 `@order-public/components/business/area-address/`，是通用的省市区三级联动选择组件，被寄件、收件、地址簿等多个业务场景复用。随着业务发展，该组件需要被 `freight-time` 等独立模块使用，将其抽离到 `@order-global-package` 可以：

1. **降低耦合度** — 解除对 `@order-public/apis/address`、`@order-public/hooks/asynrender`、`@order-public/reportUmp` 的直接依赖
2. **提升复用性** — 支持更多业务模块直接引用，无需依赖整个下单包
3. **统一 API 适配** — 将 3 个地址 API (`multilevelLinkage`, `hotCityNameList`, `mapAddressSearch`) 纳入 global-package 适配层

## What Changes

- **将 AreaAddress 组件从 `src/modules/kye-miniapp-order/src/order-public/components/business/area-address/` 迁移到 `src/modules/order-global-package/components/business/area-address/`**
- **将 3 个地址 API 函数 + 相关类型迁移到 `order-global-package/apis/address/`**
- **重构组件依赖**：
  - API 层：`multilevelLinkage`, `hotCityNameList`, `mapAddressSearch` → 迁移到 global-package apis
  - 工具函数：`getValueOrEmpty` → 已在 `global-package/utils/index.ts`
  - 样式：`@order-public/styles/index.scss` → `@order-global-package/styles/index.scss`
  - 上报：`umpOtherReport` → 注释或保留原路径
  - `setFooterZIndex` → 已迁移到 `global-package/components/ui/types/footer.ts`
  - `updateCommonDisabledScroll` → 需评估是否可内联或迁移
- **保持原有功能不变**：省市区三级联动、热门城市、搜索定位、确定/取消

## Capabilities

### New Capabilities
- `area-address-component`: 独立的省市区三级联动选择弹窗组件，支持热门城市快捷选择、关键词搜索定位、picker 联动滚动

### Modified Capabilities
- (无现有 spec 需要修改)

## Impact

**受影响的代码模块：**

| 模块 | 影响类型 | 说明 |
|------|---------|------|
| `order-global-package/components/business/area-address/` | **新增** | AreaAddress 主组件 (index.vue) + types + scss + README |
| `order-global-package/apis/address/` | **新增** | 3 个 API: multilevelLinkage, hotCityNameList, mapAddressSearch + 类型定义 |
| **`kye-miniapp-order` 下 8 个引用点** | **修改** | import 路径替换为 `@order-global-package-order/components/...` |
| **`order-build-sub-pages` 下 8 个引用点** | **修改** | import 路径替换为 `@order-global-package-order-sub/components/...` |
| `freight-time/pages/adress/index.vue` | **[可选]修改** | 如需接入省市区功能 |

---

### 完整文件清单（迁移目标）

#### 1. AreaAddress 业务组件（4 文件）

| 文件 | 类型 | 说明 |
|------|------|------|
| `index.vue` | 主组件 | 省市区选择弹窗（BottomPopup + ky-picker + 搜索 + 热门城市）(436 行) |
| `types.ts` | 类型 | ReactiveType, SelectSearchItem, columnsType 接口定义 (22 行) |
| `index.scss` | 样式 | 弹窗完整样式 (149 行) |
| `README.md` | 文档 | 组件说明 |

#### 2. API 适配层（新增）

| 文件 | 内容 | 来源 |
|------|------|------|
| `apis/address/types-area.ts` | MultilevelLinkage, MultilevelLinkageResponse, MapAddressSearchResponse, HotCityNameListResponse | 从 `@order-public/apis/address/types.ts` 提取 |
| `apis/address/index.ts` (扩展) | re-export multilevelLinkage, hotCityNameList, mapAddressSearch | 新增导出 |

---

### 所有使用方清单（共 16 处）

#### kye-miniapp-order 内（8 处）→ 替换为 `@order-global-package-order/components/business/area-address`

| # | 文件路径 | 场景 |
|---|---------|------|
| 1 | `components/business/sender/unfold/index.vue` | 寄件展开页 |
| 2 | `components/business/sender/page/address-page/index.vue` | 寄件详情页 |
| 3 | `components/business/receive/unfold/index.vue` | 收件展开页 |
| 4 | `components/business/receive/page/address-page/index.vue` | 收件详情页 |
| 5 | `components/business/address-book/sender/index.vue` | 地址簿-寄件 |
| 6 | `components/business/address-book/receive/index.vue` | 地址簿-收件 |
| 7 | `hooks/address/sender/useFields.ts` | 寄件 useArea hook (ref 引用) |
| 8 | `hooks/address/receive/useFields.ts` | 收件 useArea hook (ref 引用) |
| 9 | `hooks/address/address-book/sender/hooks/useFields.ts` | 地址簿寄件 useArea |
| 10 | `hooks/address/address-book/receive/hooks/useFields.ts` | 地址簿收件 useArea |

#### order-build-sub-pages 内（8 处）→ 替换为 `@order-global-package-order-sub/components/business/area-address`

| # | 文件路径 | 场景 |
|---|---------|------|
| 1 | `components/business/sender/unfold/index.vue` | 寄件展开页 |
| 2 | `components/business/sender/page/address-page/index.vue` | 寄件详情页 |
| 3 | `components/business/receive/unfold/index.vue` | 收件展开页 |
| 4 | `components/business/receive/page/address-page/index.vue` | 收件详情页 |
| 5 | `components/business/address-book/share-page/index.vue` | 地址簿分享页 |
| 6 | `components/business/address-book/sender/index.vue` | 地址簿-寄件 |
| 7 | `components/business/address-book/receive/index.vue` | 地址簿-收件 |
| 8 | `components/business/added-service/receipter-info/index.vue` | 增值服务-收件人信息 |

---

### 依赖变更详情

##### AreaAddress 组件内部依赖替换

| 原依赖 | 替换为 | 可迁移？ | 说明 |
|--------|--------|---------|------|
| `@order-public/apis/address` (multilevelLinkage, hotCityNameList, mapAddressSearch) | **`order-global-package/apis/address`** | ✅ **可迁移** | 纯 HTTP 请求函数，无业务耦合 |
| `@order-public/utils` (getValueOrEmpty) | `@order-global-package/utils` | ✅ **已迁移** | utils/index.ts 已有 |
| `@order-public/hooks/asynrender` (setFooterZIndex) | **`order-global-package/components/ui/types/footer.ts`** | ✅ **已迁移** | OCR 迁移时已完成 |
| `@order-public/hooks/address/useCommon` (updateCommonDisabledScroll) | **需评估** | ⚠️ | 滚动控制逻辑，可能涉及全局状态 |
| `@order-public/reportUmp/sceneReport/umpotherReport` | **注释 / 保持原路径** | ⚠️ | 仅 1 处曝光上报调用 |
| `@order-public/styles/index.scss` | `@order-global-package/styles/index.scss` | ✅ | 样式路径更新 |
| `@order-globalpackage-order/hooks/useShowToast` (showToast, PickerInstance) | **保持不变** | ❌ 不迁移 | global-package-order 内部工具 |
| `@order-global-package-order/components/base/ky-input` | **→ `@order-global-package/components/base/ky-input`** | ✅ **路径更新** | global-package **base/** 下已有，无需从 order 包引入 |
| `@order-global-package-order/components/base/ky-button` | **→ `@order-global-package/components/base/ky-button`** | ✅ **路径更新** | 同上 |
| `@order-global-package-order/components/ui/bottom-popup` | **→ `@order-global-package/components/ui/bottom-popup`** | ✅ **路径更新** | global-package **ui/** 下已有 |
| `@order-global-package-order/utils/highlightText` | **保持不变** | ❌ 不迁移 | global-package-order 内部工具 |
| `ky-picker` (PickerInstance) | **miniUI 组件库** | — 无需引入 | Taro 小程序内置 picker 组件类型 |

##### API 层迁移（3 个函数 + 4 个类型）

| 原位置 | 目标位置 | 内容 |
|--------|---------|------|
| `@order-public/apis/address/types.ts` (行 4-29) | `order-global-package/apis/address/types-area.ts` | MultilevelLinkage, MultilevelLinkageResponse, MapAddressSearchResponse, HotCityNameListResponse |
| `@order-public/apis/address/index.ts` (行 69-71, 170-172, 183-185) | `order-global-package/apis/address/index.ts` (re-export 或 copy) | multilevelLinkage(), hotCityNameList(), mapAddressSearch() |

---

### 对外接口（Props/Emits/Expose）— 完全保持兼容

```typescript
// Emits
emit('onSelectSearchItem', data: { province, city, county })   // 搜索选中
emit('onConfirm', data: { province, city, county })              // picker 确认
emit('getCurRef')                                                 // 获取 ref

// Expose
defineExpose({ open(data: string[]) })  // 打开弹窗并回填当前选中 [province, city, county]
```

**无 Props**（通过 `$attrs` 透传给 BottomPopup）
