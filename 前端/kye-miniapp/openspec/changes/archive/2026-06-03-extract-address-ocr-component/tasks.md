# Tasks: Address OCR 组件完整迁移（含 OCR UI + Cropper）

## Overview

将 address-ocr (4 文件)、OCR UI (13 文件)、Cropper (4 文件) 共 21 个文件从 `kye-miniapp-order` 迁移到 `order-global-package`，实现零业务耦合。

---

## Phase 0: 准备工作与依赖确认

- [x] **T-0.1** 确认 order-global-package 目录结构，创建 components/business/、components/ui/ 目录（如不存在）
- [x] **T-0.2** 确认 miniui 组件库版本: 验证 KyTextarea(KyInput.TextArea)、KyButton(Popup)、Popup、Overlay 组件可用性
- [x] **T-0.3** ~~全局搜索 `showCutMasker` 所有引用点~~ ✅ 已完成: 3处(定义+写入+读取). 解耦方案: Cropper emit `update:maskerVisible` 事件 → order-single 自行处理
- [ ] **T-0.4** 确认 `@public/utils` 的具体来源和可用性（公共工具库，保持引用）
- [x] **T-0.5** 在 order-global-package 中创建 types/address.ts 类型定义文件（迁移 AiAddrAnalysis 等类型）
- [ ] **T-0.6** 在 order-global-package 中创建 apis/address/index.ts API 适配层（re-export aiAddrAnalysis, analysis）→ 暂保持原路径引用
- [x] **T-0.7** 创建 shared/utils/address.ts（迁移 getValueOrEmpty, joinAt 等工具函数）→ utils/index.ts 已导出

---

## Phase 1: Cropper 图片裁剪组件迁移（4 文件）

### 1.1 文件迁移
- [x] **T-1.1.1** 复制 `cropper/index.vue` → `order-global-package/components/ui/cropper/index.vue` ✅ (已修改: showCutMasker → emit)
- [x] **T-1.1.2** 复制 `cropper/index.scss` → 同目标路径 ✅
- [x] **T-1.1.3** 复制 `cropper/components/cropper-image-taro.vue` → 同目标路径 ✅
- [x] **T-1.1.4** 复制 `cropper/readme.md` → 同目标路径 ✅

### 1.2 依赖解耦 (showCutMasker)
- [x] **T-1.2.1** **关键**: 移除 `import { showCutMasker } from '@order-public/hooks/address/sender/state'` ✅
- [x] **T-1.2.2** 添加 emit 声明: `const emit = defineEmits(['onCancel', 'onChoose', 'onComplete', 'update:maskerVisible'])` ✅
- [x] **T-1.2.3** watch props.show 时 emit 代替直接赋值 ✅
- [x] **T-1.2.4** onMounted 中 emit('update:maskerVisible', false) 替代原赋值 ✅
- [x] **T-1.2.5** 更新 order-single/index.vue: 移除 import, 改为本地 ref(false) ✅
- [x] **T-1.2.6** 更新 `@import '@order-public/styles/index.scss'` → `@order-global-package/styles/index.scss` ✅

### 1.3 验证
- [ ] **T-1.3.1** 单元测试: maskerVisible 状态在 show=true 时为 true
- [ ] **T-1.3.2** 单元测试: maskerVisible 状态在 onComplete 后正确重置
- [ ] **T-1.3.3** 单元测试: reInit() 方法正常调用
- [ ] **T-1.3.4** 手动验证: 裁剪弹窗打开/关闭/截图完整流程

---

## Phase 2: OCR UI 组件迁移（13 文件）

### 2.1 主组件迁移
- [x] **T-2.1.1** 复制 `ocr/index.vue` → 目标路径 (已修改 imports: KyTextarea/KyButton/vKeyboard/样式/子组件路径) ✅
- [x] **T-2.1.2** 复制 `ocr/index.scss` → 同目标路径 ✅
- [x] **T-2.1.3** 替换 KyTextarea import → `@order-global-package/components/base/ky-input/textarea.vue` ✅
- [x] **T-2.1.4** 替换 KyButton import → `@order-global-package/components/base/ky-button/index.vue` ✅
- [x] **T-2.1.5** 更新子组件 import 路径为相对路径 ✅
- [x] **T-2.1.6** 更新 `@order-public/styles/index.scss` → `@order-global-package/styles/index.scss` ✅
- [x] **T-2.1.7** umpOtherReport 保持原引用 (TODO: 后续迁移到 global-package) ✅
- [x] **T-2.1.8** OCR_PLACEHOLDER 保持原引用 (TODO: 迁移常量) ✅
- [x] **T-2.1.9** filterEmojis 保持原引用 ✅
- [x] **T-2.1.10** vKeyboard → `@order-global-package/directives/keyboard` ✅
- [x] **T-2.1.11** getUserSettingInfoByKey 保持原引用 (TODO: 改为 prop 注入) ✅

### 2.2 工具函数与埋点
- [x] **T-2.2.1** 复制 `ocr/utils.ts` → 同目标路径（语音识别 WebSocket 逻辑）✅
- [ ] **T-2.2.2** 确认 utils.ts 中 wss 地址配置来源
- [x] **T-2.2.3** 复制 `ocr/report/index.ts` → 同目标路径（6 组事件码函数）✅
- [ ] **T-2.2.4** 确认 report 中是否有对 umpOtherReport 的二次包装需要适配

### 2.3 子组件迁移
- [x] **T-2.3.1** 复制 `components/help-popup/` (index.vue + index.scss) ✅
- [x] **T-2.3.2** 复制 `components/audio/` (index.vue + index.scss + useAudio.ts) ✅ (index.vue 已更新 import 路径)
- [x] **T-2.3.3** 复制 `components/paste-and-recognize/index.vue` ✅
- [ ] **T-2.3.4** 确认 paste-and-recognize 的 getClipboardPermission 依赖处理
- [x] **T-2.3.5** 复制 `components/pc-uploader/index.vue` ✅
- [ ] **T-2.3.6** 确认 pc-uploader 的 van-uploader 兼容性

### 2.4 验证
- [ ] **T-2.4.1** 渲染测试: Ocr 主组件正常显示文本框 + 操作栏
- [ ] **T-2.4.2** 功能测试: HelpPopup 弹出/关闭正常
- [ ] **T-2.4.3** 功能测试: AudioPopup 录音状态展示正常
- [ ] **T-2.4.4** 功能测试: PC 端 PasteAndRecognize 可见且可点击
- [ ] **T-2.4.5** 埋点验证: 对比迁移前后上报的事件码和数据一致性

---

## Phase 3: address-ocr 业务组件迁移（含 selectModel）

### 3.1 selectModel 子组件重写
- [x] **T-3.1.1** 复制 `selectModel/index.vue` 和 `index.scss` 到目标路径 ✅
- [x] **T-3.1.2** **移除 DialogMasker 依赖** ✅
- [x] **T-3.1.3** **移除 DialogMaskerProps 依赖** ✅
- [x] **T-3.1.4** **用 miniui Popup 重写模板** (`import { Popup } from '@kye-netc/kye-miniui'`) ✅
- [x] **T-3.1.5** 移除 SvgIcon 依赖（用 × 字符替代关闭图标） ✅
- [x] **T-3.1.6** 移除 getDialogRootClass / render() / closeFun 逻辑 ✅
- [x] **T-3.1.7** 更新 AiAddrAnalysis 类型引用为 `@order-global-package/types/address` ✅
- [x] **T-3.1.8** 更新 joinAt 工具函数引用为 `@order-global-package/utils/address` ✅
- [x] **T-3.1.9** 更新 closeDialog 引用为 `@order-global-package-order/hooks/useShowToast` ✅
- [x] **T-3.1.10** 更新 umpOtherReport 引用 (TODO: 后续迁移) ✅
- [x] **T-3.1.11** 更新样式引用路径 ✅
- [x] **T-3.1.12** 添加 closeable prop 和 onClose 处理逻辑 ✅

### 3.2 address-ocr 主组件迁移
- [x] **T-3.2.1** 复制 `address-ocr/index.vue` → 目标路径 ✅ (已重构: Props注入替代Store)
- [x] **T-3.2.2** 复制 `address-ocr/index.scss` → 目标路径 ✅
- [x] **T-3.2.3** 更新 Ocr import → `@order-global-package/components/ui/ocr` ✅
- [x] **T-3.2.4** 更新 Cropper import → `@order-global-package/components/ui/cropper` ✅
- [x] **T-3.2.5** **解耦 useStore**: 新增 props userInfo, waybillNumberProvider, onRemoteCheck, getSenderDataProvider, getReceiveDataProvider, isInitAddressFlag ✅
- [x] **T-3.2.6** **解耦 remoteCheck**: 条件调用 props.onRemoteCheck ✅
- [x] **T-3.2.7** **解耦 useOriginalAddress**: 改为内部 ref originalAddressDisplay + prop originalAddress ✅
- [x] **T-3.2.8** **替换 showKyDialog**: 使用 SelectModel 组件 (miniui Popup) 替代 extraDataValue 模式 ✅
- [ ] **T-3.2.9** 更新 API import (aiAddrAnalysis, analysis) - 保持原路径，TODO: 迁移适配层
- [x] **T-3.2.10** 类型引用改为 `@order-global-package/types/address` ✅
- [x] **T-3.2.11** 更新样式引用路径 ✅
- [x] **T-3.2.12** 新增 SelectModel 弹框集成 + update:maskerVisible 事件转发 ✅

### 3.3 验证
- [ ] **T-3.3.1** unfold 模式渲染: sender/unfold 场景正常
- [ ] **T-3.3.2** page 模式渲染: sender/page 场景正常
- [ ] **T-3.3.3** 文本 AI 解析: 输入地址 → 调用API → 返回结果
- [ ] **T-3.3.4** 图片 OCR 流程: 选图 → 裁剪 → OCR → 返回结果
- [ ] **T-3.3.5** 多候选选择: AI 返回多结果 → Popup 显示 → 选择回调
- [ ] **T-3.3.6** 不传 userInfo/waybillNumberProvider 时降级正常
- [ ] **T-3.3.7** 不传 onRemoteCheck 时跳过校验正常

---

## Phase 4: 调用方适配

### 4.1 主要引用点更新 (6 个 address-ocr 使用方)
- [x] **T-4.1.1** 更新 `sender/unfold/index.vue`: AddressOcr import → `@order-global-package/...` ✅
- [x] **T-4.1.2** 更新 `sender/page/address-page/index.vue`: 同上 ✅
- [x] **T-4.1.3** 更新 `receive/unfold/index.vue`: 同上 ✅
- [x] **T-4.1.4** 更新 `receive/page/address-page/index.vue`: 同上 ✅
- [x] **T-4.1.5** 更新 `address-book/sender/index.vue`: 同上 ✅
- [x] **T-4.1.6** 更新 `address-book/receive/index.vue`: 同上 ✅

### 4.2 其他引用点处理
- [x] **T-4.2.1** 更新 `dispatch-information/page/index.vue`: Ocr + PasteAndRecognize import → `@order-global-package/...` ✅
- [ ] **T-4.2.2** 确认 `address-batch-ocr/index.vue` 当前已注释掉 Ocr/Cropper 引用

### 4.3 回归验证
- [ ] **T-4.3.1** 寄件展开页: 地址填写 → OCR识别 → 数据回填 完整流程
- [ ] **T-4.3.2** 寄件详情页: 地址填写 → OCR识别 完整流程
- [ ] **T-4.3.3** 收件展开页: 同上
- [ ] **T-4.3.4** 收件详情页: 同上
- [ ] **T-4.3.5** 地址簿寄件: OCR 识别功能正常
- [ ] **T-4.3.6** 地址簿收件: OCR 识别功能正常
- [ ] **T-4.3.7** dispatch-information 页面: OCR 输入 + 粘贴识别功能正常

---

## Phase 5: 清理与收尾

- [ ] **T-5.1** 确认所有功能回归测试通过后，删除原位置文件:
  - `kye-miniapp-order/src/order-public/components/ui/ocr/` (13 文件)
  - `kye-miniapp-order/src/order-public/components/ui/cropper/` (4 文件)
  - `kye-miniapp-order/src/order-public/components/business/address-ocr/` (4 文件)
- [ ] **T-5.2** 全局搜索残留的旧路径引用，确保无遗漏
- [ ] **T-5.3** 更新 README 或文档说明新的组件位置
- [ ] **T-5.4** Code Review: 确认无多余依赖引入

---

## 任务统计

| Phase | 任务数 | 完成 | 状态 |
|-------|-------|------|------|
| Phase 0 | 7 | 5 | 🔄 进行中 |
| Phase 1 | 12 | 9 | ✅ 核心完成 (验证待做) |
| Phase 2 | 22+15=37 | 16+15=31 | ✅ **核心完成 + 依赖深度迁移完成** (验证待做) |
| Phase 3 | 23 | 22 | ✅ 核心完成 (验证待做) |
| Phase 4 | 12+5=17 | 8+5=13 | ✅ **引用点已全部更新 + freight-time 集成完成** |
| Phase 5 | 4 | 0 | ⏳ 待回归测试后执行 |
| **总计** | **~99** | **~80** | **~81% 完成** |

## 已知 TODO 项（后续迭代优化）
- [x] ~~迁移 `@order-public/constants` (OCR_PLACEHOLDER, filterEmojis)~~ ✅ **2026-06-03 完成** → `types/constants.ts`
- [x] ~~迁移 `@order-public/utils` (uuid)~~ ✅ **2026-06-03 完成** → `types/uuid.ts`
- [x] ~~迁移 `@order-public/utils/env` (isPROD, RequestBaseUrl)~~ ✅ **2026-06-03 完成** → `types/env.ts`
- [x] ~~迁移 `@order-public/constants` (Channel)~~ ✅ **2026-06-03 完成** → `types/channel.ts`
- [x] ~~迁移 `@order-public/hooks/asynrender` (setFooterZIndex, footerZIndex)~~ ✅ **2026-06-03 完成** → `types/footer.ts`
- [x] ~~迁移 `@order-public/components/business/address-book/sender/hooks/state` (voiceAiDiscernVisible)~~ ✅ **2026-06-03 完成** → `types/voice.ts`
- [x] ~~替换 `@pages/order-single/hooks/useInit` getUserSettingInfoByKey~~ ✅ **2026-06-03 完成** → 父组件 prop `showVoiceButton`
- [x] ~~替换 getSource() / getToken()~~ ✅ **2026-06-03 完成** → 写死 `'miniprogram'` + `Taro.getStorageSync`
- [ ] 迁移 `@order-public/reportUmp/sceneReport/umpotherReport` → global-package（**已注释，待后续恢复**）
- [ ] 迁移 `@order-public/report/sender` (clickOcrHelpReport, getAiAddrAnalysisReport等) → global-package（**已注释，待后续恢复**）
- [ ] 迁移 `@order-public/report/exposureReport` useOrderExposureReport → global-package（**已注释，待后续恢复**）
- [ ] 迁移 `@order-public/components/business/recent-address/report` getOtherParams → global-package（**已注释，待后续恢复**）
- [ ] 迁移 `@order-public/components/base/ky-report` KyReport → miniui/global-package（**已注释，待后续恢复**）
- [ ] 保持不迁移: `showKyDialog`, `getCustomerShortInfo`, `getClipboardPermission`, `fileAfterRead`, `chooseFiles`
- [ ] 创建 `apis/address/index.ts` 适配层，统一导出 aiAddrAnalysis / analysis

---

## Phase 2 扩展: OCR UI 依赖深度迁移 (2026-06-03)

### T-2.x: @order-public 依赖本地化

#### 新增类型文件（已完成 ✅）
- [x] **T-2.x.1** 创建 `components/ui/types/channel.ts` — Channel 枚举 (10 值)
- [x] **T-2.x.2** 创建 `components/ui/types/uuid.ts` — uuid() 纯函数
- [x] **T-2.x.3** 创建 `components/ui/types/env.ts` — isPROD, RequestBaseUrl, isH5EnvDev
- [x] **T-2.x.4** 创建 `components/ui/types/constants.ts` — filterEmojis, OCR_PLACEHOLDER
- [x] **T-2.x.5** 创建 `components/ui/types/voice.ts` — voiceAiDiscernVisible ref
- [x] **T-2.x.6** 创建 `components/ui/types/footer.ts` — footerZIndex ref, setFooterZIndex

#### 函数级替换（已完成 ✅）
- [x] **T-2.x.7** `utils.ts`: `getSource()` → 写死 `'miniprogram'`（两处调用点）
- [x] **T-2.x.8** `utils.ts`: `getToken()` → 删除 import，改为 `Taro.getStorageSync('TOKEN') || ''`
- [x] **T-2.x.9** `index.vue`: `getUserSettingInfoByKey('voiceVisible')` → `props.showVoiceButton`（新增 Boolean prop）

#### 上报代码注释（已完成 ✅）
- [x] **T-2.x.10** `ui/ocr/utils.ts`: 注释 audioFailReport ×3、reportDialogResult ×1、audioReport ×1
- [x] **T-2.x.11** `ui/ocr/index.vue`: 注释 umpOtherReport ×4、clickOrcHelpReport、useOrderExposureReport、KyReport 组件、getOtherParams
- [x] **T-2.x.12** `ui/ocr/components/paste-and-recognize/index.vue`: 注释 umpOtherReport ×1
- [x] **T-2.x.13** `ui/ocr/report/index.ts`: 注释导出函数体

#### Import 路径更新（已完成 ✅）
- [x] **T-2.x.14** `ui/ocr/utils.ts`: isWechat→device.ts, uuid→types/uuid.ts, Channel→types/channel.ts(注释), env→types/env.ts
- [x] **T-2.x.15** `ui/ocr/index.vue`: filterEmojis/OCR_PLACEHOLDER→types/constants.ts, voiceAiDiscernVisible→types/voice.ts, setFooterZIndex→types/footer.ts

---

## Phase 4 扩展: freight-time 模块集成 (2026-06-03)

### T-4.x: freight-time 接入 address-ocr

- [x] **T-4.x.1** `freight-time/pages/adress/index.vue`: 引入 AddressOcr 组件 (`@order-global-package-freight-time/components/business/address-ocr/index.vue`)
- [x] **T-4.x.2** 替换模板占位 div `<div class="smart-recognition">智能识别组件</div>` 为 `<AddressOcr>` 组件实例
- [x] **T-4.x.3** 配置基础 props: moduleStyle="page", addressType="SENDER_PAGE", isInitAddressFlag=false
- [x] **T-4.x.4** 绑定事件回调: @getAddressOcrData="onGetAddressOcrData", @getResolutionData="onResolutionData"
- [x] **T-4.x.5** 添加 refAddressOcr ref 和事件处理函数（TODO: 回填逻辑预留）
