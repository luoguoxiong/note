## Why

下单/地址簿/运费时效等模块的「详细地址」弹窗，在用户点击「确定」时会调用 AI 智能识别接口 `aiAddrAnalysis` 解析地址，并用解析结果覆盖用户输入。当用户已手动选好省/市/区、再填写结构化详细地址（如 "A街道，A小区，A栋"）时，AI 归一化会把逗号等标点删掉、破坏地址结构，用户无法保留原始输入。

需求（禅道 562588）要求：当省/市/区任意一级已选时，不触发智能识别，以用户填写内容为准（标点、结构、字符均不修改）。

## What Changes

- 在两个 detail-address 弹窗组件的 `onConfirmDetailAddress` 开头增加触发边界守卫：`props.area.some(Boolean)` 为真时跳过 `aiAddrAnalysis`，直接以原始 `state.message` 回填并关闭弹窗。
- 触发机制保持现状（「确定」点击 + `debounce(800, leading:true)`），仅调整触发边界，不改为失焦触发。
- 同步处理 order 侧父组件 `onSelectDetailAddress` 的「部分省市区」回填缺口。

## Capabilities

### New Capabilities

- `detail-address-ocr-trigger-rule`: 详细地址智能识别的触发边界规则 —— 已有任意一级行政区域时不触发识别、保留原始输入；三级全空时触发识别。

### Modified Capabilities

- `detail-address-component`: 修改「AI 智能解析地址」的触发条件，增加行政区域判断。

## Impact

| 模块 | 影响 | 说明 |
|---|---|---|
| `kye-miniapp-order/src/order-public/components/business/detail-address/index.vue` | 修改 | 增加边界守卫 |
| `order-global-package/components/business/detail-address/index.vue` | 修改 | 增加边界守卫（freight-time 复用此源） |
| `kye-miniapp-order/.../hooks/address/sender/useFields.ts` | 修改 | 补部分省市区回填缺口 |
| `kye-miniapp-order/.../hooks/address/receive/useFields.ts` | 修改 | 补部分省市区回填缺口 |

> 排除 `order-build-sub-pages`（构建副本，不处理）。
