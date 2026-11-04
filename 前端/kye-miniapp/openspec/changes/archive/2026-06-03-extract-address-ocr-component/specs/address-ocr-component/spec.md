# Spec: address-ocr 完整组件迁移（含 OCR UI + Cropper）

## Overview

将地址智能识别组件及其关联的 OCR UI 子组件、Cropper 裁剪组件从 `kye-miniapp-order` 迁移到 `order-global-package`，实现零业务耦合的通用组件库。

**涉及组件**: 3 组共 21 个文件
- address-ocr 业务组件 (4 文件)
- OCR UI 组件 (13 文件)
- Cropper 图片裁剪组件 (4 文件)

---

## Requirements

### R1: address-ocr 组件独立性

**As a** 开发者
**I want** address-ocr 组件完全独立于 kye-miniapp-order 下单业务包
**So that** freight-time 等其他模块可以直接引用，无需依赖下单包

#### Acceptance Criteria

- **AC-1.1**: 组件位于 `@order-global-package/components/business/address-ocr/` 目录下
- **AC-1.2**: 不 import 任何 `@order-public/store` 模块
- **AC-1.3**: 不 import `@order-public/validate/effect/effectDialog`
- **AC-1.4**: 不 import `@order-public/hooks/address/sender/state` (showCutMasker 等)
- **AC-1.5**: 所有原通过 useStore 获取的数据改为 Props 注入或 Callback 回调

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-1.1 | 组件独立挂载（不依赖 piniaStore） | 正常渲染，无报错 |
| T-1.2 | 未传入 userInfo prop 时 | 使用默认空值或降级处理 |
| T-1.3 | 未传入 onRemoteCheck callback 时 | 跳过过程校验，直接返回识别结果 |
| T-1.4 | 未传入 waybillNumberProvider 时 | OCR 请求不带运单号参数 |

---

### R2: 文本输入 AI 解析能力

**As a** 用户
**I want** 在文本框输入地址后触发 AI 智能解析
**So that** 自动拆分姓名、电话、省市区、详细地址等结构化信息

#### Acceptance Criteria

- **AC-2.1**: 输入文本后调用 aiAddrAnalysis API
- **AC-2.2**: 支持单条和批量模式（通过 singleOcr prop 切换）
- **AC-2.3**: 解析成功后通过 getAddressOcrData emit 返回结构化数据
- **AC-2.4**: 解析失败时展示错误提示

---

### R3: 图片 OCR 识别能力

**As a** 用户
**I want** 上传/拍摄包含地址的图片后自动 OCR 识别
**So that** 无需手动输入即可填充地址信息

#### Acceptance Criteria

- **AC-3.1**: 点击图片按钮后调用 chooseFiles 选择图片
- **AC-3.2**: 选择图片后先进入 Cropper 裁剪流程
- **AC-3.3**: 裁剪完成后调用 analysis API 进行 OCR
- **AC-3.4**: Cropper 组件已迁移到 order-global-package 且功能不变
- **AC-3.5**: Cropper 的 showCutMasker 状态内部管理，不再引用 sender/state.ts

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-3.1 | 上传有效地址图片 → 裁剪 → OCR | 正常返回识别结果 |
| T-3.2 | Cropper 弹窗打开时 maskerVisible 为 true | 遮罩层正确显示 |
| T-3.3 | Cropper 取消/完成时正确触发 onCancel/onComplete | 事件回调正常 |
| T-3.4 | Cropper "换个照片" 触发 reInit() | 重新初始化裁剪区域 |

---

### R4: 多候选地址选择弹框

**As a** 用户
**I want** 当 AI 识别到多个匹配地址时可以选择正确的地址
**So that** 避免地址识别错误

#### Acceptance Criteria

- **AC-4.1**: 多结果时弹出 selectModel 候选列表
- **AC-4.2**: 使用 **miniui Popup** 替代原 DialogMasker 实现
- **AC-4.3**: 展示原始输入地址作为参考
- **AC-4.4**: 每个候选项显示 省/市/区 + 详细地址
- **AC-4.5**: 选择后关闭弹窗并回调选中数据
- **AC-4.6**: 不再依赖 DialogMasker、SvgIcon、getDialogRootClass

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-4.1 | AI 返回 2 个候选地址 | Popup 显示候选列表，含原始地址参考 |
| T-4.2 | 点击某个候选项 | 触发 selectAddress 事件，关闭弹窗 |
| T-4.3 | 点击关闭图标 | 触发 beforeClose → close 事件 |

---

### R5: Ocr UI 组件完整性

**As a** 开发者
**I want** Ocr UI 组件完整迁移且所有子功能可用
**So that** address-ocr 可以正常使用底层 OCR 输入能力

#### Acceptance Criteria

- **AC-5.1**: 主组件 (index.vue) 支持 KyTextarea 输入 + 操作栏按钮
- **AC-5.2**: KyTextarea/KyButton 替换为 miniui 版本
- **AC-5.3**: HelpPopup 帮助弹窗正常工作（粘贴说明 + 图片说明）
- **AC-5.4**: AudioPopup 语音识别弹窗正常工作（录音状态 + 协议勾选）
- **AC-5.5**: PasteAndRecognize PC 粘贴按钮正常工作
- **AC-5.6**: PcWxUploader PC 上传器正常工作
- **AC-5.7**: utils.ts 语音识别 WebSocket 连接配置正确
- **AC-5.8**: report/index.ts 埋点事件码定义完整迁移

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-5.1 | 渲染 Ocr 组件 | 显示文本框 + 图片按钮 + 语音按钮 + 帮助按钮 |
| T-5.2 | 点击帮助按钮 | 弹出 HelpPopup 说明内容 |
| T-5.3 | 点击语音按钮 | 弹出 AudioPopup 录音界面 |
| T-5.4 | PC 环境显示 PasteAndRecognize 按钮 | 可点击并触发粘贴识别 |
| T-5.5 | PC 微信环境显示 PcWxUploader | 可选择图片上传 |
| T-5.6 | 各操作触发的埋点上报 | 事件码和数据格式与迁移前一致 |

---

### R6: Cropper 裁剪组件完整性

**As a** 用户
**I want** 在 OCR 识别前可以裁剪图片中包含地址的区域
**So that** 提高 OCR 识别准确率

#### Acceptance Criteria

- **AC-6.1**: 组件位于 `@order-global-package/components/ui/cropper/`
- **AC-6.2**: 支持全屏遮罩式弹窗（root-portal）
- **AC-6.3**: 支持触摸拖拽调整裁剪区域（四角 + 边缘拖拽点）
- **AC-6.4**: 支持 Canvas 2D 截图输出 base64
- **AC-6.5**: 底部操作栏：取消 / 换个照片 / 完成
- **AC-6.6**: **showCutMasker 状态内部管理**，不再从 sender/state.ts 引用
- **AC-6.7**: cropper-image-taro.vue 核心 Canvas 逻辑保持不变
- **AC-6.8**: Props 接口向后兼容：show, img, describe, autoCropWidth, autoCropHeight

#### Test Scenarios

| ID | 场景 | 预期结果 |
|----|------|---------|
| T-6.1 | 传入 show=true + img url | 全屏显示裁剪界面，图片居中 |
| T-6.2 | 拖拽裁剪框四角 | 裁剪区域跟随触摸移动 |
| T-6.3 | 点击"完成" | 触发 onComplete(base64String) |
| T-6.4 | 点击"取消" | 触发 onCancel，关闭弹窗 |
| T-6.5 | 点击"换个照片" | 触发 onChoose + reInit() |
| T-6.6 | 不传入 externalMaskerVisible | 内部管理遮罩显示状态 |
| T-6.7 | 传入 externalMaskerVisible | 外部可控制遮罩显示状态 |

---

### R7: 模式适配能力 (unfold / page)

**As a** 开发者
**I want** 组件支持不同的使用模式和上下文
**So that** 可以在寄件/收件/展开/详情页等多种场景复用

#### Acceptance Criteria

- **AC-7.1**: moduleStyle='unfold' 模式正常工作（sender/receive 展开）
- **AC-7.2**: moduleStyle='page' 模式正常工作（详情页地址填写）
- **AC-7.3**: addressType 参数区分寄件(SENDER) / 收件(RECEIVE) 地址类型
- **AC-7.4**: page 模式下支持 waybillNumber 运单号参数

---

### R8: 埋点上报完整性

**As a** 数据分析师
**I want** 迁移后的组件埋点数据与迁移前完全一致
**So that** 可以持续监控地址识别功能的用户行为

#### Acceptance Criteria

- **AC-8.1**: address-ocr 的 getAiAddrAnalysisReport 埋点函数完整迁移
- **AC-8.2**: OCR 组件 report/index.ts 的 6 组事件码生成函数完整迁移
- **AC-8.3**: selectModel 的 umpOtherReport 调用保持一致
- **AC-8.4**: 所有埋点事件码字符串不变
- **AC-8.5**: 所有埋点上报参数结构和含义不变

---

### R9: 向后兼容性

**As a** 下单模块开发者
**I want** 仅修改 import 路径即可完成迁移适配
**So that** 迁移成本最小化

#### Acceptance Criteria

- **AC-9.1**: 原 6 个使用方的 import 路径更新为 `@order-global-package/...`
- **AC-9.2**: Props 接口完全兼容（新增字段均为 optional）
- **AC-9.3**: Emits 接口完全兼容
- **AC-9.4**: Expose 方法兼容（Ocr 的 onPasteAndRecognize/startAudio）

---

## Out of Scope

- 不重构各组件内部的功能算法（如语音识别 WebSocket 协议、Canvas 裁剪算法）
- 不优化性能（如懒加载、虚拟滚动等）
- 不新增功能特性
- 不修改 Cropper 的 autoCropWidth/autoCropHeightProps 传递逻辑（当前声明了但未向下传递）
