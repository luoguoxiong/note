# Proposal: DetailAddress 详细地址选择弹窗组件迁移

## 变更名称
`extract-detail-address-component`

## 目标

将 `DetailAddress` 详细地址选择弹窗组件（含子组件 List + ListRefreshLoad + KyTextarea）从 `@order-public` 迁移到 `order-global-package`，实现零业务耦合，支持 freight-time 等模块直接引用。

## 背景

### 当前位置
```
kye-miniapp-order/src/order-public/components/business/detail-address/
├── index.vue          # 主组件（393 行）
├── types.ts           # State 类型定义
├── index.scss         # 样式（156 行）
├── readme.md          # 文档
├── report/index.ts    # 埋点上报（2 函数）
└── components/list/   # 列表项子组件
    ├── index.vue      # 高亮地址列表项
    └── index.scss
```

### 使用方统计
| 模块 | 引用数量 | 路径前缀 |
|------|---------|---------|
| kye-miniapp-order | **7 处** | `@order-public/components/business/detail-address` |
| order-build-sub-pages | **9 处** | `@order-public-sub-public/components/business/detail-address` |
| freight-time (待接入) | **1 处** | `@order-global-package-freight-time/components/business/detail-address` |

## 涉及文件清单（8 文件）

| # | 文件 | 类型 | 操作 |
|---|------|------|------|
| 1 | `detail-address/index.vue` | 主组件 | 复制 + 改造 |
| 2 | `detail-address/types.ts` | 类型定义 | 复制 |
| 3 | `detail-address/index.scss` | 样式 | 复制 |
| 4 | `detail-address/readme.md` | 文档 | 复制 |
| 5 | `detail-address/report/index.ts` | 埋点 | 复制 + 注释 |
| 6 | `detail-address/components/list/index.vue` | 子组件 | 复制 + 改造 |
| 7 | `detail-address/components/list/index.scss` | 子组件样式 | 复制 |
| 8 | **list-refresh-load/** (新增) | 下拉刷新组件 | **一并迁移** |
| 9 | **ky-textarea/** (新增) | 多行文本输入 | **一并迁移** |

## 依赖分析

### ✅ 已在 global-package 的依赖（改相对路径即可）
| 依赖 | 来源路径 | 目标路径 |
|------|---------|---------|
| `showToast` | `@order-global-package-order/hooks/useShowToast` | 保持不变 |
| `BottomPopup` | `@order-global-package-order/components/ui/bottom-popup` | 保持不变 |
| `SvgIcon` | `@order-global-package-order/components/ui/svg-icon` | 保持不变 |
| `KyButton` | `@order-global-package-order/components/base/ky-button` | 保持不变 |
| `highlightText` | `@order-global-package-order/utils/highlightText` | 保持不变 |
| `getValueOrEmpty` | `@order-public/utils` → 已迁移 | `@order-global-package/utils` |
| `filterEmojis` | `@order-public/utils/pattern` → 已迁移 | `types/constants.ts` |
| `setFooterZIndex` | `@order-public/hooks/asynrender` → 已迁移 | `types/footer.ts` |

### 🆕 需要一起迁移的组件
| 组件 | 原始位置 | 目标位置 | 文件数 |
|------|---------|---------|-------|
| **ListRefreshLoad** | `@order-public/components/ui/list-refresh-load/` | `global-package/components/ui/list-refresh-load/` | ~3-5 文件 |
| **KyTextarea** | ~~需迁移~~ → **已迁移** ✅ | `global-package/components/base/ky-textarea/` (已存在) | — |

### 📦 API 层（已存在，直接使用）
| API | global-package 路径 | 状态 |
|-----|-------------------|------|
| `findSuggest` | `@order-global-package/apis/address` | ✅ 已有 |
| `aiAddrAnalysis` | `@order-global-package/apis/address` | ✅ 已有 |
| `FindSuggestItem`, `AiAddrAnalysisRes` | `@order-global-package/apis/address/types` | ✅ 已有 |

### ⚠️ 需要去耦合的 @order-public 依赖
| 依赖 | 当前用法 | 解耦方案 |
|------|---------|---------|
| `useStore()` | 获取 `piniaStore.order.waybillNumber` | **Props 注入**: 新增 `waybillNumberProvider` prop 或直接用现有 `waybillNumber` prop |
| `useOriginalAddress` / `updateCommonDisabledScroll` | 滚动控制 | **内联**: `wx.pageScrollTo({ scrollTop: 0 })` （与 area-address 同方案） |
| `getDetailAddressSceneType` | AI 场景类型 | **内联**: 写死映射 `{ 10: 'sender', 20: 'receive' }` 或 props 注入 |
| `Address` 常量 | SENDER/RECEIVE 枚举 | **内联**: 直接写 `'SENDER'` / `'RECEIVE'` 字符串比较 |
| `umpOtherReport` | 曝光上报 ×3 | **注释掉**：open() 曝光、setPromise 收件曝光、pasteReport |
| `report/index.ts` (detailPopupClosedReport, pasteReport) | 埋点函数 | **注释函数体**，保留接口 |

### ❌ 保持不迁移（属 order 包业务层）
| 依赖 | 原因 |
|------|------|
| `lodash-es` (debounce) | npm 通用依赖 |

## 迁移策略

### 核心原则
1. **功能完全一致**: 模板逻辑、交互行为与原版 100% 一致
2. **原文件保留**: kye-miniapp-order 和 sub-pages 原文件暂不删除，用于测试对比
3. **路径规则**:
   - kye-miniapp-order: `@order-public/...` → `@order-global-package-order/...`
   - order-build-sub-pages: `@order-public-sub-public/...` → `@order-global-package-order-sub/...`
   - freight-time: `@order-global-package-freight-time/...`

### 关键改造点
1. **Pinia Store 解耦**: 移除 `useStore()`，waybillNumber 从 props 传入
2. **useOriginalAddress 内联**: 改为内部 ref，通过 emit 回传原始地址
3. **updateCommonDisabledScroll 内联**: 与 area-address 方案一致
4. **上报代码注释**: umpOtherReport + report 函数体注释

## 接入计划

迁移完成后在 `freight-time/pages/adress/index.vue` 接入：
```vue
<DetailAddress
  ref="detailAddressRef"
  :area="tertiaryAddress.split('/')"
  :addressType="pageTitle.includes('寄件') ? 'SENDER' : 'RECEIVE'"
  @onSelect="onDetailAddressSelect"
/>
```

## 验收标准
- [ ] 所有 16 处使用方 import 路径更新完成
- [ ] 功能回归：输入搜索 → 列表展示 → 点击选中 → 确定 AI 解析 完整流程
- [ ] freight-time 地址页接入并可正常使用
- [ ] 原 kye-miniapp-order 文件保留（对比用）

## Out of Scope
- 不重构组件内部算法
- 不优化性能
- 不新增功能
- address-unfold 下的 detail-address 是不同组件（UI 层），不在本次范围
