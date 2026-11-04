## Why

address-ocr（地址智能识别）组件当前位于 `@kye-miniapp-order` 下单基础包中，但该组件是通用的地址识别功能，被寄件、收件、地址簿等多个业务场景复用。随着业务发展，该组件需要被 `freight-time` 等其他独立模块使用，将其抽离到 `@order-global-package` 公共组件库中可以：
1. **降低耦合度** - 解除对下单业务逻辑（store、remoteCheck、useUpdateData 等）的强依赖
2. **提升复用性** - 支持更多业务模块直接引用，无需依赖整个下单包
3. **统一组件规范** - 使用 miniui 基础组件库替代下单内部封装的 KyTextarea、KyButton、Popup 等

## What Changes

- **将 address-ocr 业务组件从 `src/modules/kye-miniapp-order/src/order-public/components/business/address-ocr/` 迁移到 `src/modules/order-global-package/components/business/address-ocr/`**
- **将 Ocr UI 子组件从 `src/modules/kye-miniapp-order/src/order-public/components/ui/ocr/` 迁移到 `src/modules/order-global-package/components/ui/ocr/`**（完整迁移，含 4 个子组件、工具函数、埋点定义）
- **将 Cropper 图片裁剪组件从 `src/modules/kye-miniapp-order/src/order-public/components/ui/cropper/` 迁移到 `src/modules/order-global-package/components/ui/cropper/`**（完整迁移，含裁剪核心子组件）
- **重构组件依赖**：
  - UI 组件替换：KyTextarea → miniui KyTextarea, KyButton → miniui KyButton, DialogMasker → miniui Popup
  - API 接口层：aiAddrAnalysis、analysis 接口需要在 order-global-package 中提供或通过依赖注入
  - Store 依赖解耦：通过 props/callback 方式注入，不再直接使用 useStore
  - 业务逻辑剥离：remoteCheck 校验、useUpdateData 数据回填等下沉到调用方
  - 状态解耦：showCutMasker 从 sender/state.ts 改为组件内部状态或 prop 注入
- **保持原有功能不变**：文本识别、图片OCR、语音识别、帮助弹窗、多结果选择弹窗、图片裁切、粘贴识别、埋点上报等核心能力完整保留
- **原使用方适配**：更新 kye-miniapp-order 中的 6 个引用点（sender/receive 的 unfold + page 模式，address-book sender/receive）

## Capabilities

### New Capabilities
- `address-ocr-component`: 独立的地址智能识别通用组件，支持文本输入AI解析和图片OCR识别双模式，包含多候选地址选择交互
- `ocr-ui-component`: 通用 OCR 输入 UI 组件，整合文本输入、图片识别按钮、语音识别、帮助弹窗、粘贴并识别等功能，作为 address-ocr 的底层 UI 基础组件
- `cropper-ui-component`: 通用图片裁剪组件，基于 Taro Canvas 2D API 实现手势拖拽裁剪功能，支持自定义裁剪区域和输出格式

### Modified Capabilities
- (无现有 spec 需要修改)

## Impact

**受影响的代码模块：**

| 模块 | 影响类型 | 说明 |
|------|---------|------|
| `order-global-package/components/business/` | 新增 | address-ocr 组件及子组件（selectModel）、hooks、样式 |
| `order-global-package/components/ui/ocr/` | **新增** | OCR UI 组件完整迁移（13 个文件） |
| `order-global-package/components/ui/cropper/` | **新增** | Cropper 图片裁剪组件完整迁移（4 个文件） |
| `kye-miniapp-order/components/business/sender/unfold` | 修改 | 更新 import 路径 |
| `kye-miniapp-order/components/business/sender/page/address-page` | 修改 | 更新 import 路径 |
| `kye-miniapp-order/components/business/receive/unfold` | 修改 | 更新 import 路径 |
| `kye-miniapp-order/components/business/receive/page/address-page` | 修改 | 更新 import 路径 |
| `kye-miniapp-order/components/business/address-book/sender` | 修改 | 更新 import 路径 |
| `kye-miniapp-order/components/business/address-book/receive` | 修改 | 更新 import 路径 |
| **`kye-miniapp-order/components/ui/ocr/`** | **删除** | 完整移除（13 个文件全部迁出） |
| **`kye-miniapp-order/components/ui/cropper/`** | **删除** | 完整移除（4 个文件全部迁出） |
| **`freight-time/pages/adress/index.vue`** | **修改** | **[新增 2026-06-03]** 接入 address-ocr 组件（通过 @order-global-package-freight-time） |

---

### 完整迁移文件清单

#### 1. address-ocr 业务组件

| 文件 | 类型 | 说明 |
|------|------|------|
| `index.vue` | 主组件 | 地址智能识别入口（文本OCR + 图片OCR 双模式） |
| `index.scss` | 样式 | 主样式 |
| `components/selectModel/index.vue` | 子组件 | 多候选地址选择弹框（依赖 DialogMasker → 替换为 Popup） |
| `components/selectModel/index.scss` | 子组件样式 | 弹框样式 |

#### 2. OCR UI 组件（13 个文件 → `order-global-package/components/ui/ocr/`）

| 文件 | 类型 | 说明 |
|------|------|------|
| `index.vue` | 主组件 | OCR 输入框 + 操作栏（KyTextarea, KyButton, 图片/语音/帮助按钮） |
| `index.scss` | 样式 | 主样式（241 行） |
| `utils.ts` | 工具函数 | 语音识别（WebSocket 录音流式识别, 263 行） |
| `report/index.ts` | 埋点 | OCR 组件专属事件码定义（6 组事件码生成函数） |
| `components/help-popup/index.vue` | 子组件 | 帮助说明弹窗 |
| `components/help-popup/index.scss` | 子组件样式 | 弹窗样式 |
| `components/audio/index.vue` | 子组件 | 语音识别弹窗 |
| `components/audio/useAudio.ts` | 子组件 Hook | 语音识别状态管理 |
| `components/paste-and-recognize/index.vue` | 子组件 | PC 端粘贴并识别按钮 |
| `components/pc-uploader/index.vue` | 子组件 | PC 微信小程序图片上传器 |

#### 3. Cropper 图片裁剪组件（4 个文件 → `order-global-package/components/ui/cropper/`）

| 文件 | 类型 | 说明 |
|------|------|------|
| `index.vue` | 主组件 | 裁剪弹窗主组件（root-portal + 操作栏） |
| `index.scss` | 样式 | 裁剪弹窗样式（全屏遮罩 + 底部操作栏） |
| `components/cropper-image-taro.vue` | 核心子组件 | Taro Canvas 2D 裁剪引擎（743 行，触摸拖拽 + 边界约束） |
| `readme.md` | 文档 | 使用文档 |

**总计迁移：21 个文件（4 主组件 + 17 子组件/工具/样式/文档）**

---

**依赖变更详情：**

##### address-ocr 组件依赖替换
| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/ui/ocr` | `@order-global-package/components/ui/ocr` | 内部组件迁移 |
| `@order-public/components/ui/cropper` | `@order-global-package/components/ui/cropper` | 内部组件迁移 |
| `@order-public/store` (useStore) | Props 注入 (userInfo, waybillNumberProvider) | Store 解耦 |
| `@order-public/hooks/address/useCommon` (useOriginalAddress) | Props 或内部状态 | 解耦 |
| `showKyDialog` / effectDialog | miniui Popup | UI 组件替换 |

##### OCR UI 组件内部依赖替换
| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/base/ky-textarea` | miniui KyTextarea | 基础组件替换 |
| `@order-global-package-order/components/base/ky-button` | miniui KyButton | 基础组件替换 |
| `@order-public/reportUmp/sceneReport/umpotherReport` | ~~迁移 report/index.ts~~ **→ 全部注释** | **2026-06-03 更新**: 上报暂不迁移，代码注释保留 |
| `@order-public/constants` (OCR_PLACEHOLDER) | **`order-global-package/components/ui/types/constants.ts`** | **已完成迁移** |
| `@order-public/utils/pattern` (filterEmojis) | **同上 constants.ts** | **已完成迁移** |
| `@order-public/styles/index.scss` | order-global-package 全局样式 | 样式引用更新 |
| `@pages/order-single/hooks/useInit` (getUserSettingInfoByKey) | **→ 父组件 prop `showVoiceButton`** | **2026-06-03 更新**: 改为 Boolean prop 注入 |
| `@order-public/utils` (getSource, getToken) | **写死 `'miniprogram'` + `Taro.getStorageSync`** | **2026-06-03 更新**: 移除异步调用 |
| `@order-public/utils` (uuid, isWechat) | **`order-global-package/components/ui/types/uuid.ts` + `device.ts`** | **已完成迁移** |
| `@order-public/utils/env` (isPROD, RequestBaseUrl) | **`order-global-package/components/ui/types/env.ts`** | **已完成迁移** |
| `@order-public/constants` (Channel) | **`order-global-package/components/ui/types/channel.ts`** | **已完成迁移** (仅用于已注释的上报) |
| `@order-public/hooks/asynrender` (setFooterZIndex, footerZIndex) | **`order-global-package/components/ui/types/footer.ts`** | **已完成迁移** |
| `@order-public/components/business/address-book/sender/hooks/state` (voiceAiDiscernVisible) | **`order-global-package/components/ui/types/voice.ts`** | **已完成迁移** |

##### Cropper 组件内部依赖替换
| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/hooks/address/sender/state` (showCutMasker) | 组件内部 ref 状态 | **关键解耦点**：当前 Cropper 直接引用 sender 的状态变量，需改为内部管理或 prop 控制 |
| `@order-public/styles/index.scss` | order-global-package 全局样式 | 样式引用更新 |
| `@tarojs/runtime`, `@tarojs/taro` | 保持不变 | Taro 框架依赖（运行时必需） |

##### selectModel 子组件依赖替换
| 原依赖 | 替换为 | 说明 |
|--------|--------|------|
| `@order-public/components/business/limit-custom/dialog-masker` | **miniui Popup** | **关键变更**：DialogMasker 是通用弹窗组件，被10+处使用。selectModel 中仅使用其基础弹窗能力（Overlay + 内容区），可替换为 miniui Popup 实现自包含 |
| `@order-public/apis/address/types` (AiAddrAnalysis) | 迁移类型定义到 global-package | 类型定义迁移 |
| `@order-public/hooks/address/useCommon` (useOriginalAddress) | Prop 注入 | 解耦 |
| `@order-public/reportUmp/sceneReport/umpotherReport` | 迁移或复用 OCR report | 埋点统一 |
| `@order-global-package-order/components/ui/svg-icon` | 保持或迁移 | 图标组件确认归属 |
| `@order-global-package-order/validate/pageConfig` (getDialogRootClass) | 移除（selectModel 不再使用 DialogMasker 的 closeFun） | 依赖消除 |

---

**对外接口（Props/Emits）：**

##### address-ocr 组件
- Props 保持兼容：moduleStyle、addressType、waybillNumber
- Emits 保持兼容：getAddressOcrData、getResolutionData
- 新增可选 Props/回调：onRemoteCheck（智能识别后校验回调）、onOriginalAddressChange（原始地址变更回调）

##### Cropper 组件（保持兼容）
- Props: show, img, describe, autoCropWidth, autoCropHeight
- Emits: onCancel, onChoose, onComplete(base64String)
- **变更**: showCutMasker 外部状态依赖移除，改为组件内部管理

##### Ocr UI 组件（保持兼容）
- Props: ocrMessage(v-model), loading, showImageOcr, singleOcr, imgBtnText, rows, maxlength, placeholder, addressType
- Emits: uploaderAfterRead, onClickImg, update:ocrMessage, onInputOcr
- Expose: onPasteAndRecognize(), startAudio()
