## Context

**当前状态：**
- 取消运单列表页面（`src/modules/waybill-build/pages/waybill-cancel/index.vue`）中有"去修改货好"的入口
- 当前跳转逻辑：跳转到 `/modules/order-build/pages/order/index`，仅带上 `openGoodsTime` 参数
- 查件列表中的"修改货好时间"按钮逻辑：跳转到同一页面，但带上 `openGoodsTime=1` 和 `onlyModule=goodsTime,serviceMode` 两个参数

**需要统一：**
两个入口的跳转逻辑需要保持一致，确保用户体验统一。

## Goals / Non-Goals

**Goals:**
- 统一取消运单列表和查件列表的"修改货好"入口跳转逻辑
- 确保跳转时带上正确的参数（`openGoodsTime=1` 和 `onlyModule=goodsTime,serviceMode`）
- 保持代码简洁，复用现有的跳转逻辑

**Non-Goals:**
- 不修改查件列表的跳转逻辑（作为参考标准保持不变）
- 不修改目标页面（修改运单页面）的逻辑
- 不添加新的功能或 UI 变更

## Decisions

**决策 1：复用查件列表的跳转逻辑**
- **方案**：将查件列表的 `openEdit` 函数提取为公共工具函数，或在取消运单页面复用相同的跳转逻辑
- **理由**：确保两个入口的跳转逻辑完全一致，避免未来再次出现不一致的情况
- **替代方案**：在取消运单页面内联实现跳转逻辑（更简单，但存在代码重复风险）
- **选择**：采用内联实现，因为当前只有两个地方使用，提取公共函数的收益不大

**决策 2：跳转参数格式**
- **方案**：使用 URL query 参数格式，与查件列表保持一致
- **参数列表**：
  - `type: 'edit'`
  - `waybillNo`: 运单号
  - `orderNo`: 订单号
  - `sourcePage: 'waybillSearch'`（或根据实际场景调整）
  - `sourceAction: 'editGoodTime'`
  - `channel: 60`
  - `configId`: 配置 ID
  - `configVersion`: 配置版本
  - `openGoodsTime: '1'`
  - `onlyModule: 'goodsTime,serviceMode'`

## Risks / Trade-offs

**风险 1：参数传递不完整**
- **风险**：如果取消运单页面的数据结构与查件列表不同，可能导致某些参数无法获取
- **缓解**：仔细检查取消运单页面的数据结构，确保所有必要参数都能获取

**风险 2：测试覆盖不足**
- **风险**：修改后未充分测试，导致跳转失败或参数错误
- **缓解**：修改后进行完整的回归测试，确保所有场景都能正常工作

**权衡：代码复用 vs 简洁性**
- 当前选择内联实现而非提取公共函数，牺牲了一定的代码复用性，但实现更简单直接
- 如果未来有更多地方需要此逻辑，应考虑提取为公共工具函数
