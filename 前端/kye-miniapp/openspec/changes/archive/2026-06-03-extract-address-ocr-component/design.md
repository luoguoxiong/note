# Technical Design: Address OCR 组件完整迁移（含 OCR UI + Cropper）

## Context & Problem Statement

address-ocr 组件及其关联的 OCR UI 子组件、Cropper 裁剪组件当前全部位于 `@kye-miniapp-order` 下单基础包中，形成强耦合依赖关系：

1. **业务逻辑耦合**：直接使用 useStore、remoteCheck、useUpdateData 等下单专属逻辑
2. **UI 组件耦合**：依赖 order-public 内部的 KyTextarea、KyButton、DialogMasker
3. **状态耦合**：Cropper 组件引用 sender/state.ts 中的 showCutMasker 全局变量
4. **弹窗耦合**：selectModel 子组件依赖 DialogMasker 通用弹窗（被 10+ 处复用）

目标：将 **21 个文件** 完整迁移到 `order-global-package`，实现零业务耦合。

## Goals

- [G1] address-ocr + Ocr UI + Cropper 三套组件**完整物理迁移**到 order-global-package
- [G2] 所有外部依赖替换为 miniui 基础组件或 props 注入
- [G3] 迁移后原使用方仅需修改 import 路径，功能完全不变
- [G4] 消除对 `@order-public/store`、`@order-public/validate`、`sender/state.ts` 的直接依赖

## Non-Goals

1. 不重构各组件的内部功能逻辑，仅做物理迁移 + 依赖替换
2. 不改变 API 接口签名和返回数据结构
3. 不修改埋点事件码和上报格式
4. 不迁移 DialogMasker 本身（selectModel 中用 miniui Popup 替代其使用）

---

## Component Architecture (迁移目标架构)

```
order-global-package/
├── components/
│   ├── business/
│   │   └── address-ocr/                    # [迁移] 地址智能识别业务组件
│   │       ├── index.vue                   #   主入口（文本OCR + 图片OCR）
│   │       ├── index.scss                  #   样式
│   │       ├── hooks/                      #   业务 hooks
│   │       └── components/
│   │           └── selectModel/            #   多候选地址选择弹框
│   │               ├── index.vue           #     → 使用 miniui Popup 替代 DialogMasker
│   │               └── index.scss
│   │
│   └── ui/
│       ├── ocr/                            # [迁移] OCR 输入 UI 组件
│       │   ├── index.vue                   #   主组件 (KyTextarea + 操作栏)
│       │   ├── index.scss                  #   样式
│       │   ├── utils.ts                    #   语音识别 (WebSocket)
│       │   ├── report/index.ts             #   OCR 埋点事件码
│       │   └── components/
│       │       ├── help-popup/             #   帮助说明弹窗
│       │       ├── audio/                  #   语音识别弹窗 (+ useAudio.ts)
│       │       ├── paste-and-recognize/    #   PC 粘贴并识别
│       │       └── pc-uploader/            #   PC 上传器
│       │
│       └── cropper/                        # [迁移] 图片裁剪组件
│           ├── index.vue                   #   裁剪弹窗主组件
│           ├── index.scss                  #   弹窗样式
│           ├── components/
│           │   └── cropper-image-taro.vue  #   Taro Canvas 2D 裁剪引擎
│           └── readme.md
```

---

## Dependency Analysis (完整依赖图)

### Layer 1: address-ocr 业务组件

```
┌─────────────────────────────────────────────────────────────────────┐
│              address-ocr (business component)                       │
│         Target: order-global/package/components/business/           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │    Ocr (UI Layer)   │  │   Cropper (UI)      │                  │
│  │  ↓ internal import  │  │  ↓ internal import  │                  │
│  │  components/ui/ocr/ │  │ components/ui/      │                  │
│  │                     │  │ cropper/             │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│  ┌─────────────────────┐                                           │
│  │  selectModel        │  ← 使用 miniui Popup                      │
│  │  (多候选选择弹框)    │    替代 DialogMasker                      │
│  └─────────────────────┘                                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  External Dependencies (需解耦/替换)                 │           │
│  ├────────────────────┬────────────────────────────────┤           │
│  │ ❌ useStore        │ → Props: userInfo,            │           │
│  │    (piniaStore)    │   waybillNumberProvider        │           │
│  ├────────────────────┼────────────────────────────────┤           │
│  │ ❌ remoteCheck     │ → onRemoteCheck callback      │           │
│  │    (过程校验)      │                                │           │
│  ├────────────────────┼────────────────────────────────┤           │
│  │ ❌ useUpdateData   │ → emit getAddressOcrData       │           │
│  │    (数据回填)      │   调用方自行处理               │           │
│  ├────────────────────┼────────────────────────────────┤           │
│  │ ❌ useOriginalAddr │ → Prop 或内部 ref             │           │
│  │    (原始地址)      │                                │           │
│  ├────────────────────┼────────────────────────────────┤           │
│  │ ❌ aiAddrAnalysis  │ → API 适配层或 re-export       │           │
│  │ ❌ analysis (OCR)  │                                │           │
│  └────────────────────┴────────────────────────────────┘           │
│                                                                     │
│  ✅ 保持: chooseFiles, getValueOrEmpty, joinAt, localStorage, 埋点  │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer 2: Ocr UI 组件

```
┌─────────────────────────────────────────────────────────────────────┐
│                Ocr UI Component                                      │
│          Target: order-global-package/components/ui/ocr/            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  index.vue 主组件依赖:                                               │
│  ├── KyTextarea     → miniuiKyTextarea                             │
│  ├── KyButton       → miniui KyButton                              │
│  ├── HelpPopup      → 内部子组件 (help-popup/)                      │
│  ├── AudioPopup     → 内部子组件 (audio/, 含 utils.ts WebSocket)   │
│  ├── PasteAndRecognize → 内部子组件                                 │
│  ├── PcWxUploader   → 内部子组件                                    │
│  │                                                                  │
│  ├── umpOtherReport  → 迁移 report/index.ts 到 global-package      │
│  ├── OCR_PLACEHOLDER → 迁移常量定义                                 │
│  ├── filterEmojis    → 内联或 shared utils                          │
│  ├── vKeyboard       → 确认 directive 归属                         │
│  ├── isWechatEnv 等  → 确认 @public/utils 来源                     │
│  └── getUserSettingInfoByKey → callback 或 re-export              │
│                                                                     │
│  子组件依赖:                                                        │
│  ├── help-popup:  无特殊外部依赖 ✅                                  │
│  ├── audio:       utils.ts (WebSocket 语音识别) 需确认 wss 配置 ⚠️   │
│  ├── paste-and-recognize: getClipboardPermission → 需适配 ⚠️        │
│  └── pc-uploader: van-uploader 模式 → 需确认兼容性 ⚠️               │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer 3: Cropper 图片裁剪组件

```
┌─────────────────────────────────────────────────────────────────────┐
│                Cropper Image Component                               │
│        Target: order-global-package/components/ui/cropper/          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  index.vue (主弹窗):                                                 │
│  ├── vue (reactive, onMounted, ref, watch) → 保持                  │
│  ├── ❌ showCutMasker (from sender/state.ts)                        │
│  │     → 改为组件内部 const showMasker = ref(false)                 │
│  │       或通过 prop :maskVisible 控制                              │
│  ├── @order-public/styles/index.scss → global-package 样式          │
│  └── ky-cropper-image → 内部子组件                                  │
│                                                                     │
│  cropper-image-taro.vue (核心引擎):                                 │
│  ├── @tarojs/runtime (CATCHMOVE) → 保持 (Taro 运行时必需)           │
│  ├── @tarojs/taro (createSelectorQuery, getImageInfo,              │
│  │   canvasToTempFilePath, getSystemInfoSync) → 保持               │
│  └── vue (reactive, onMounted, toRefs, nextTick) → 保持            │
│                                                                     │
│  ⚠️ 关键解耦点 (已确认方案):                                     │
│  └── showCutMasker 当前是 sender/state.ts 的全局响应式变量           │
│      被 Cropper 直接 import 和修改，形成隐式跨组件通信              │
│                                                                     │
│      引用链:                                                         │
│        ① sender/state.ts:39   → export const showCutMasker          │
│        ② cropper/index.vue    → import + watch/onMounted 写入       │
│        ③ order-single/index.vue → CSS class 读取 (footer z-index)   │
│                                                                     │
│      迁移方案 (emit 事件模式):                                       │
│        Cropper 内部:                                                 │
│          - 删除 import { showCutMasker } from sender/state           │
│          - 新增 emit('update:maskerVisible', val)                   │
│          - watch props.show 时 emit 替代直接赋值                     │
│          - onMounted 时 emit(false)                                 │
│        order-single (业务方):                                        │
│          - 监听 @update:maskerVisible 事件                           │
│          - 维护本地 maskerVisible ref 状态                          │
│          - 用于 CSS class 控制 footer z-index                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer 4: selectModel 子组件（DialogMasker 替换策略）

```
┌─────────────────────────────────────────────────────────────────────┐
│           selectModel (多候选地址选择弹框)                            │
│         变更前: 使用 DialogMasker                                     │
│         变更后: 使用 miniui Popup (自包含)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ 变更前的依赖链 ────────────────────────────────────────────┐     │
│  │                                                              │     │
│  │  selectModel                                                │     │
│  │    └── DialogMasker (limit-custom/dialog-masker)            │     │
│  │         ├── Overlay (@kye-netc/kye-miniui)                  │     │
│  │         ├── SvgIcon (@order-global-package-order)           │     │
│  │         ├── getDialogRootClass (@order-global-package-order)│     │
│  │         └── render() from vue (closeFun 销毁逻辑)           │     │
│  │                                                              │     │
│  │  外部依赖:                                                   │     │
│  │    • AiAddrAnalysis type (@order-public/apis)                │     │
│  │    • useOriginalAddress (@order-public/hooks)                │     │
│  │    • joinAt (@order-public/utils)                           │     │
│  │    • closeDialog (@order-global-package-order)               │     │
│  │    • umpOtherReport (@order-public/reportUmp)               │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌─ 变更后的依赖链 ────────────────────────────────────────────┐     │
│  │                                                              │     │
│  │  selectModel                                                │     │
│  │    └── Popup (@kye-netc/kye-miniui)  ← 直接使用            │     │
│  │                                                              │     │
│  │  外部依赖 (已消除):                                          │     │
│  │    ✗ DialogMasker → 删除                                     │     │
│  │    ✗ SvgIcon → 用简单 × 符号替代或内联 SVG                   │     │
│  │    ✗ getDialogRootClass → 不再需要 closeFun                 │     │
│  │    ✗ render() → Popup 自管理生命周期                         │     │
│  │                                                              │     │
│  │  保留/迁移的依赖:                                            │     │
│  │    • AiAddrAnalysis type → 迁移到 global-package/types      │     │
│  │    • useOriginalAddress → Prop 注入                         │     │
│  │    • joinAt → 迁移到 global-package/utils                   │     │
│  │    • closeDialog → 从 global-package 引入                   │     │
│  │    • umpOtherReport → 复用 OCR report/index.ts              │     │
│  └──────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Decision 1: 迁移范围 - 三层组件全量迁移

**选择**: 将 address-ocr、Ocr UI、Cropper 三层组件共 21 个文件全部迁移

| 组件组 | 文件数 | 迁移目标路径 | 关键变更 |
|--------|-------|-------------|---------|
| address-ocr | 4 | `components/business/address-ocr/` | Store/API 解耦 |
| Ocr UI | 13 | `components/ui/ocr/` | UI 组件替换 |
| Cropper | 4 | `components/ui/cropper/` | showCutMasker 解耦 |

**理由**: 这三层组件存在紧密的组合关系（address-ocr 引用 Ocr + Cropper），部分迁移会导致跨模块引用混乱。

### Decision 2: Store / 状态解耦策略

**选择**: Props + Callback 注入模式

```typescript
// 迁移后的 address-ocr Props 接口
interface AddressOcrProps {
  // === 原有 Props (保持兼容) ===
  moduleStyle?: string
  addressType?: string
  
  // === 新增: 替代 useStore 依赖 ===
  userInfo?: UserInfo                    // 原 piniaStore.globalData.userInfo
  waybillNumberProvider?: () => string   // 原 piniaStore.order.waybillNumber
  
  // === 新增: 替代 remoteCheck 依赖 ===
  onRemoteCheck?: (data: OcrResult) => Promise<boolean>
  
  // === 新增: 替代 useOriginalAddress 依赖 ===
  originalAddress?: string              // 原始输入地址
  onOriginalAddressChange?: (val: string) => void
}
```

**Cropper 的 showCutMasker 解耦**:
```typescript
// 方案: 内部状态 + 可选外部控制
const maskerVisible = ref(false)

const props = defineProps({
  show: Boolean,
  img: String,
  // ... 其他原有 Props
  externalMaskerVisible: {  // 新增可选: 允许外部控制遮罩
    type: Boolean,
    default: undefined     // undefined = 内部管理
  }
})

// 监听 show 时同步更新内部状态
watch(() => props.show, (val) => {
  maskerVisible.value = val
})
```

### Decision 3: UI 组件替换映射（完整版）

| 原组件 | 来源 | 替换为 | 来源 | 备注 |
|--------|------|--------|------|------|
| **address-ocr 层** |||||
| KyTextarea | `@order-public/components/base/ky-textarea` | KyTextarea | miniui | |
| KyButton | `@order-global-package-order/components/base/ky-button` | KyButton | miniui | |
| showKyDialog / DialogMasker | `@order-public/validate/effect/effectDialog` | Popup | miniui | 仅 selectModel 使用 |
| **Ocr UI 层** |||||
| KyTextarea | 同上 | 同上 | miniui | Ocr 内部使用 |
| KyButton | 同上 | 同上 | miniui | Ocr 内部使用 |
| **selectModel 特殊处理** |||||
| DialogMasker | `@order-public/components/business/limit-custom/...` | **Popup** | miniui | **重写弹窗实现** |
| SvgIcon | `@order-global-package-order/components/ui/svg-icon` | 内联 SVG 或 text | - | 仅关闭图标 |
| **Cropper 层** |||||
| Overlay | `@kye-netc/kye-miniui` (通过 DialogMasker) | Overlay | miniui | Cropper 可能直接用 root-portal |
| **保持不变的依赖** |||||
| @tarojs/runtime | - | - | - | Taro 运行时必需 |
| @tarojs/taro | - | - | - | Taro API 必需 |
| vue | - | - | - | 框架依赖 |

### Decision 4: API 接口适配层

**选择**: 在 order-global-package 中创建 api adapter，统一导出

```
order-global-package/
├── apis/
│   └── address/
│       └── index.ts          # re-export 或适配 aiAddrAnalysis, analysis
├── types/
│   └── address.ts            # 迁移 AiAddrAnalysis 等类型定义
```

### Decision 5: 埋点函数处理

**选择**: 将 OCR 专属埋点 (`report/index.ts`) 随组件一起迁移；`umpOtherReport` 通用函数在迁移组件中内联调用或从 global-package 导入

**更新 (2026-06-03)**: 上报相关代码已全部注释，不影响核心功能。具体变更见下方 "Decision 7"。

---

### Decision 6: OCR UI 组件 `@order-public` 依赖深度迁移 (Phase 2 扩展)

**选择**: 将 OCR UI (`ui/ocr/`) 目录下可本地化的依赖从 `@order-public/*` 迁移到 `order-global-package/components/ui/types/`

**背景**: 原方案中部分依赖标记为 "TODO: 后续迁移"，现执行实际迁移以进一步降低耦合。

#### 迁移清单（新增 6 个类型/工具文件）

| 新文件 | 来源 | 内容 | 零外部依赖 |
|--------|------|------|-----------|
| `types/channel.ts` | `@order-public/constants` | `Channel` 枚举 (10 个渠道值) | ✅ |
| `types/uuid.ts` | `@order-public/utils` | `uuid()` 纯函数 (UUID v4) | ✅ |
| `types/env.ts` | `@order-public/utils/env` | `isPROD`, `RequestBaseUrl`, `isH5EnvDev` | ✅ |
| `types/constants.ts` | `@order-public/constants` | `filterEmojis` 正则, `OCR_PLACEHOLDER` 字符串 | ✅ |
| `types/voice.ts` | `@order-public/components/business/address-book/sender/hooks/state` | `voiceAiDiscernVisible = ref(true)` | ✅ (仅 vue ref) |
| `types/footer.ts` | `@order-public/hooks/asynrender` | `footerZIndex = ref(14)`, `setFooterZIndex()` | ✅ (仅 vue ref) |

#### 函数级替换规则

| 原函数 | 替换方案 | 说明 |
|--------|---------|------|
| `getSource()` | **写死返回 `'miniprogram'`** | 小程序场景固定值，无需运行时判断 |
| `getToken()` | **`Taro.getStorageSync('TOKEN') \|\| ''`** | 直接从 Taro 本地存储读取 token |
| `isWechat` | → `utils/device.ts` | 已迁移到 global-package |
| `getUserSettingInfoByKey('voiceVisible')` | **父组件注入 `showVoiceButton` Boolean prop** | 解耦页面级 hook |

#### 上报相关处理（统一注释）

| 文件 | 注释内容 |
|------|---------|
| `ui/ocr/utils.ts` | `audioFailReport` × 3 处、`audioReport` × 1 处、`reportDialogResult` × 1 处 — 全部注释 |
| `ui/ocr/index.vue` | `umpOtherReport` × 4 处、`clickOrcHelpReport`、`useOrderExposureReport`、`KyReport` 组件、`getOtherParams` — 全部注释 |
| `ui/ocr/components/paste-and-recognize/index.vue` | `umpOtherReport` × 1 处 — 注释 |
| `ui/ocr/report/index.ts` | 导出函数体全部注释 |

#### 保留不迁移的依赖（仍从 `@order-public` 引入）

| 依赖 | 保留原因 |
|------|---------|
| `showKyDialog` | 通用弹窗方法，无本地化价值 |
| `getCustomerShortInfo` | 客户信息查询，需服务端配合 |
| `getClipboardPermission` | 剪贴板权限检测，平台相关 |
| `fileAfterRead` | 文件读取后处理逻辑 |
| `chooseFiles` | 文件选择器工具 |

**迁移结果**: `@order-public/*` 引入数从 ~18 个降至 **5 个**（上述保留项）

---

## Risk Analysis

| Risk | 影响 | 缓解措施 |
|------|------|---------|
| **R1: Cropper showCutMasker 解耦遗漏** | 高 - 可能导致裁剪遮罩状态异常 | 单元测试验证 maskerVisible 状态流转；对比迁移前后行为 |
| **R2: selectModel Popup 替换 UI 差异** | 中 - 弹窗样式/交互可能不一致 | 像素级对比截图；保留原 scss 样式变量 |
| **R3: 语音识别 WebSocket 连接配置** | 中 - wss 地址可能硬编码在 utils.ts | 迁移时确认配置来源；考虑提取为可配置项 |
| **R4: Taro Canvas 兼容性** | 低-Medium - cropper-image-taro 依赖 Taro Canvas 2D API | 确保 order-global-package 也有 Taro 依赖；不改动核心裁剪逻辑 |
| **R5: dispatch-information 对 Ocr/PasteAndRecognize 的独立引用** | 低 - 该组件也直接使用了 OCR 组件子组件 | 本次仅迁移组件，dispatch-information 的 import 路径同步更新即可 |

---

## Migration Plan (实施阶段规划)

### Phase 0: 准备工作
- [ ] 确认 order-global-package 目录结构就绪
- [ ] 确认 miniui 组件库版本包含 KyTextarea/KyButton/Popup/Overlay
- [ ] 创建类型定义和 API 适配层

### Phase 1: 基础组件先行 (无业务依赖)
1. **迁移 Cropper** (4 文件)
   - 复制文件到 `order-global-package/components/ui/cropper/`
   - 解耦 showCutMasker → 内部状态
   - 更新样式引用路径
   - 编写基础测试
2. **迁移 OCR UI** (13 文件)
   - 复制文件到 `order-global-package/components/ui/ocr/`
   - 替换 KyTextarea/KyButton 为 miniui
   - 迁移 report/index.ts
   - 处理 utils.ts 中的外部依赖
   - 编写基础测试

### Phase 2: 业务组件迁移
3. **迁移 selectModel** (1 文件)
   - 重写为基于 miniui Popup 的自包含实现
   - 移除 DialogMasker/SvgIcon/getDialogRootClass 依赖
   - 迁移类型定义
4. **迁移 address-ocr 主组件** (2 文件)
   - 复制主文件 + 样式
   - 重构为 Props/Callback 模式
   - 更新内部 import 路径（Ocr/Cropper/selectModel 均为相对路径）
   - 迁移 hooks

### Phase 3: 调用方适配
5. **更新 kye-miniapp-order 6 个引用点**
   - 修改 import 路径指向 order-global-package
   - 注入必要的 props/callbacks
   - 功能回归验证

### Phase 4: 清理
6. **删除原位置文件**（确认无误后）
7. **更新路由/导出配置**（如有）

---

## Open Questions

| ID | Question | Status | Decision Needed |
|----|----------|--------|-----------------|
| OQ-1 | `umpOtherReport` 函数是否需要在 order-global-package 中单独维护一份？还是从原位置 re-export？ | Open | 建议: 迁移 OCR report/index.ts，通用 umpOtherReport 通过 global-package re-export |
| OQ-2 | `vKeyboard` directive 归属哪里？是否需要迁移到 global-package？ | Open | 需确认 directive 注册方式 |
| OQ-3 | `@public/utils` (isWechatEnv 等) 的具体来源？是 npm 包还是内部模块？ | Open | 需确认后在 global-package 中建立对应依赖 |
| OQ-4 | ~~**Cropper 的 showCutMasker 是否有其他地方也在读写该值？**~~ | **✅ Resolved** | 共 3 处引用: 定义(sender/state.ts) + 写入(cropper/index.vue) + 读取(order-single/index.vue:45 CSS class). 方案: Cropper 改为 **emit `update:maskerVisible` 事件**, order-single 监听事件后自行处理 z-index |
| OQ-5 | ~~**dispatch-information 页面对 Ocr/PasteAndRecognize 的独立引用如何处理？**~~ | **✅ Resolved** | `dispatch-information/page/index.vue:92-93` 直接 import 了 Ocr + PasteAndRecognize 子组件(派件信息独立使用). **纳入 Phase 4.2 一并更新 import 路径**即可, 无额外处理成本 |
