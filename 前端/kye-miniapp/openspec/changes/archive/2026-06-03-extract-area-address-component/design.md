# Technical Design: AreaAddress 省市区选择弹窗组件迁移

## Context & Problem Statement

`AreaAddress` 省市区三级联动选择弹窗当前位于 `@kye-miniapp-order` 下单基础包中，存在以下依赖关系：

1. **API 耦合**：直接使用 `@order-public/apis/address` 中的 3 个地址 API
2. **工具函数耦合**：依赖 `getValueOrEmpty`（已可迁移）、`setFooterZIndex`（已迁移）、`updateCommonDisabledScroll`（待评估）
3. **上报耦合**：依赖 `umpOtherReport` 做 1 处曝光上报
4. **样式耦合**：引用 `@order-public/styles/index.scss`

目标：将组件完整迁移到 `order-global-package`，实现最小外部依赖。

## Goals

- [G1] AreaAddress 组件**完整物理迁移**到 order-global-package
- [G2] 3 个地址 API (`multilevelLinkage`, `hotCityNameList`, `mapAddressSearch`) 迁移到 global-package apis 层
- [G3] 迁移后原 16 处使用方仅需修改 import 路径，功能完全不变
- [G4] 消除对 `@order-public/apis/address`、`@order-public/hooks/asynrender` 的直接依赖

## Non-Goals

1. 不重构组件内部逻辑（三级联动、热门城市、搜索等）
2. 不改变 Emits/Expose 接口签名
3. 不修改 BottomPopup/KyInput/KyButton 组件本身（已存在于 `order-global-package/components/{base,ui}/` 下，仅更新 import 路径）
4. 不处理 ky-picker（miniUI 组件库组件，无需引入路径变更）
5. 不修改 useArea hook 的内部逻辑（该 hook 属于业务层，不在本次迁移范围）

---

## Component Architecture (迁移目标架构)

```
order-global-package/
├── components/
│   └── business/
│       └── area-address/                    # [迁移] 省市区选择弹窗组件
│           ├── index.vue                   #   主组件 (BottomPopup + picker + 搜索 + 热门)
│           ├── index.scss                  #   样式
│           ├── types.ts                    #   类型定义
│           └── README.md                   #   文档
│
└── apis/
    └── address/
        ├── index.ts                        #   [扩展] re-export 或 copy 3 个地址 API
        └── types-area.ts                   #   [新增] 4 个 API 类型定义
```

---

## Dependency Analysis (完整依赖图)

```
┌─────────────────────────────────────────────────────────────────────┐
│              AreaAddress (business component)                        │
│       Target: order-global-package/components/business/              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  模板依赖:                                                          │
│  ├── BottomPopup → @order-global-package/components/ui/bottom-popup │
│  ├── KyInput     → @order-global-package/components/base/ky-input   │
│  ├── KyButton    → @order-global-package/components/base/ky-button  │
│  ├── ky-picker   → miniUI 组件库（无需单独引入）                     │
│  └── scroll-view → Taro 原生组件                                    │
│                                                                     │
│  Script 依赖:                                                       │
│  ├── ✅ multilevelLinkage, hotCityNameList, mapAddressSearch        │
│  │     → 迁移到 order-global-package/apis/address                   │
│  ├── ✅ getValueOrEmpty → @order-global-package/utils (已存在)      │
│  ├── ✅ setFooterZIndex → types/footer.ts (已存在)                 │
│  ├── ⚠️ updateCommonDisabledScroll → 需评估                         │
│  │     方案 A: 内联实现 (仅调用 wx.pageScrollTo)                    │
│  │     方案 B: 保持原路径引用                                        │
│  ├── ⚠️ umpOtherReport → 注释或保持                                 │
│  │     仅 1 处: open() 曝光上报                                     │
│  ├── ✅ highlightText, showToast, PickerInstance                    │
│  │     → @order-global-package-order (保持，order 内部工具)          │
│  └── ✅ lodash-es (debounce, cloneDeep) → npm (保持)                │
│                                                                     │
│  样式依赖:                                                          │
│  └── @order-public/styles/index.scss → @order-global-package/...    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Decision 1: 迁移范围 — 组件 + API 层

**选择**: 迁移 AreaAddress 组件(4 文件) + 3 个地址 API 函数(含类型)

| 组 | 文件数 | 迁移目标 | 关键变更 |
|----|-------|---------|---------|
| AreaAddress 组件 | 4 | `components/business/area-address/` | import 路径替换 |
| 地址 API | ~2 | `apis/address/` (扩展) | 新增 types-area.ts + re-export |

**理由**: 这 3 个 API 是 AreaAddress 的专属依赖，其他组件暂未直接引用；一并迁移可实现零跨包依赖。

### Decision 2: updateCommonDisabledScroll 处理方案

**选择**: **内联实现**

当前 `updateCommonDisabledScroll()` 来自 `@order-public/hooks/address/useCommon`，其核心逻辑为：
```typescript
// 原始实现（简化）
export function updateCommonDisabledScroll() {
  if (process.env.TARO_ENV === 'weapp') {
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  }
}
```

这是一个极简的 Taro 平台滚动重置函数，无任何业务状态依赖。**直接内联到 AreaAddress 的 `handleClose` 方法中**，消除对 useCommon hook 的间接依赖。

**替代方案（如果原函数有额外逻辑）**: 从 `@order-global-package/utils` 导出一个通用的 `resetPageScroll` 工具函数。

### Decision 3: 上报处理

**选择**: **注释 `umpOtherReport` 调用，保留 import 但标记 TODO**

AreaAddress 中仅有 **1 处** 上报调用（`open()` 中的曝光事件），与 OCR 组件的批量注释策略一致：

```typescript
// open() 中的曝光上报 — 注释
// umpOtherReport('OTHER', { eventCode: 'other_express_receiver_city_perception_v1' })
```

### Decision 4: API 适配策略

**选择**: 在 `order-global-package/apis/address/index.ts` 中 re-export 或 copy

```typescript
// 方案 A: re-export（推荐，如果 http 函数不依赖下单包上下文）
import { http } from '@order-global-package-order/utils/request' // 或独立 request
import { MultilevelLinkage, ... } from './types-area'

export const multilevelLinkage = (params: MultilevelLinkage) => {
  return http<MultilevelLinkageResponse>('web.order.address.multilevelLinkage', params, { toast: false })
}

// hotCityNameList, mapAddressSearch 同理
```

**注意**: `http` 函数来自 `@order-public/utils/request`，需要确认是否可通过 `@order-global-package-order` 引用或需独立维护一份。

### Decision 5: 使用方路径映射

| 原模块 | 原路径 | 新路径 |
|--------|-------|-------|
| kye-miniapp-order | `@order-public/components/business/area-address` | `@order-global-package-order/components/business/area-address` |
| order-build-sub-pages | `@order-public-sub-public/components/business/area-address` | `@order-global-package-order-sub/components/business/area-address` |
| freight-time (新) | N/A | `@order-global-package-freight-time/components/business/area-address` |

---

## Risk Analysis

| Risk | 影响 | 缓解措施 |
|------|------|---------|
| **R1: `http` 请求函数的归属问题** | 高 - API 无法正常调用 | 需确认 http 可从哪个包引入；必要时在 global-package 维护独立 request 实例 |
| **R2: `ky-picker` 组件兼容性** | 低-Medium - picker 列数据格式变化 | `changeCollumns()` 转换逻辑不变，columns 数据结构不变 |
| **R3: BottomPopup `$attrs` 透传行为差异** | 低 - 弹窗显示异常 | BottomPopup 已在 global-package-order 中稳定使用 |
| **R4: `updateCommonDisabledScroll` 内联后遗漏边界情况** | 低 - 关闭弹窗时页面滚动位置异常 | 对比原始实现确保一致；微信/支付宝平台分别测试 |
| **R5: 16 处引用点遗漏更新** | Medium - 编译错误 | 全局搜索确认无残留旧路径 |

---

## Migration Plan (实施阶段规划)

### Phase 0: 准备工作
- [ ] 确认 `http` 函数引入方案（global-package-request vs re-export）
- [ ] 在 order-global-package 创建 `apis/address/types-area.ts`
- [ ] 扩展 `apis/address/index.ts`（新增 3 个 API 导出）

### Phase 1: 组件文件迁移
- [ ] 复制 `area-address/index.vue` → 目标路径
- [ ] 复制 `area-address/types.ts` → 目标路径
- [ ] 复制 `area-address/index.scss` → 目标路径
- [ ] 复制 `area-address/README.md` → 目标路径

### Phase 2: 依赖替换
- [ ] 替换 API imports: `@order-public/apis/address` → `@order-global-package/apis/address`
- [ ] 替换 `getValueOrEmpty`: → `@order-global-package/utils`
- [ ] 替换 `setFooterZIndex`: → `@order-global-package/components/ui/types/footer`
- [ ] 内联 `updateCommonDisabledScroll`: 删除 import，handleClose 中直接写 wx.pageScrollTo
- [ ] 注释 `umpOtherReport` 调用和 import
- [ ] 更新样式: `@order-public/styles/...` → `@order-global-package/styles/...`

### Phase 3: 使用方适配
#### 3.1 kye-miniapp-order (10 处)
- [ ] sender/unfold/index.vue
- [ ] sender/page/address-page/index.vue
- [ ] receive/unfold/index.vue
- [ ] receive/page/address-page/index.vue
- [ ] address-book/sender/index.vue
- [ ] address-book/receive/index.vue
- [ ] hooks/address/sender/useFields.ts
- [ ] hooks/address/receive/useFields.ts
- [ ] address-book/sender/hooks/useFields.ts
- [ ] address-book/receive/hooks/useFields.ts

#### 3.2 order-build-sub-pages (8 处)
- [ ] sender/unfold/index.vue
- [ ] sender/page/address-page/index.vue
- [ ] receive/unfold/index.vue
- [ ] receive/page/address-page/index.vue
- [ ] address-book/share-page/index.vue
- [ ] address-book/sender/index.vue
- [ ] address-book/receive/index.vue
- [ ] added-service/receipter-info/index.vue

### Phase 4: 清理
- [ ] 全局搜索残留旧路径引用
- [ ] 删除原位置 `kye-miniapp-order/.../area-address/` 目录
- [ ] 删除 `order-build-sub-pages/.../area-address/` 目录（如存在副本）
- [ ] lint 验证通过
