## Why

运费时效（freight-time）和下单（order-public）各自在弹窗内部实现了几乎相同的"申请查看运费"内容区域。**以下单侧完整内容为准**抽取共享 `apply-popup-content` 到 `order-global-package`，运费时效侧全量接入（包括下单独有的商务二维码等），消除重复并补齐功能缺口。**埋点不在共享范围**，各模块自行处理。

## What Changes

- **新增** `order-global-package` 共享组件 `apply-popup-content`：以下单侧模板 + 逻辑抽取（状态展示区、输入框、商务二维码），不含埋点和外层 `BottomPopup`
- **替换** `order-public/apply-popup/index.vue`：内容区域替换为 `<ApplyPopupContent>`，外层 `BottomPopup` + 埋点 + store 读写保持不变
- **替换** `freight-time/estimated-shipping-popup/index.vue`：内容两个分支替换为 `<ApplyPopupContent>`，外层 `BottomPopup` + `ContactBusiness` + API 调用保持不变；**新增**：商务二维码展示
- **统一** CSS：共享组件使用普通 SCSS（`index.scss`），类名精简，与适配层 BEM class 不冲突
- **修复** order-public 侧 `modalShow.value = false` 在提交完成前执行的 bug
- **修复** freight-time 侧联系人电话硬编码 `'95324'`，改为从 `useUserInfo()` 获取
- **统一** `FeeAuthApplyStatus` 常量定义到共享包

## Capabilities

### New Capabilities
- `apply-popup-content`: 申请查看运费弹窗内容区域纯展示组件，以下单侧为基准。包含：状态图标+标题+申请时间+申请原因+联系人卡片（描述文本+商务二维码+联系按钮）+ 输入框。不含埋点。通过 props 接收数据、通过 events 上报交互，不感知数据来源和提交逻辑。

### Modified Capabilities
<!-- 不涉及 -->

## Impact

- **新增文件**：
  - `order-global-package/components/business/estimated-cost/components/apply-popup-content/`（组件 + SCSS module）
  - `order-global-package/constants/` 中统一 `FeeAuthApplyStatus`
- **修改文件**：
  - `order-public/.../apply-popup/index.vue`（内容区替换为共享组件，埋点保留在适配层）
  - `freight-time/.../estimated-shipping-popup/index.vue`（内容分支替换为共享组件，新增商务二维码）
  - `order-public/.../hooks/useApplyPopup.ts`（修复关闭时机 bug）
- **不迁移**：
  - 外层 `BottomPopup`（标题、底部按钮、加载态）
  - 联系人拨打行为（各模块自行处理）
  - 数据获取与提交逻辑
  - 埋点（各模块自行处理）
- **运费时效侧新增**：商务二维码图片展示
