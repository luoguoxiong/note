## Why

当前取消运单列表页面的"去修改货好"入口跳转逻辑与查件列表的"修改货好时间"按钮逻辑不一致，导致用户体验不统一。需要统一这两个入口的跳转逻辑，确保用户在不同场景下修改货好时间的操作体验一致。

## What Changes

- 修改取消运单列表页面（`waybill-cancel/index.vue`）中"去修改货好"链接的点击逻辑
- 使其与查件列表的"修改货好时间"按钮跳转逻辑保持一致
- 跳转到修改运单页面，并带上 `openGoodsTime=1` 和 `onlyModule=goodsTime,serviceMode` 参数

## Capabilities

### New Capabilities
<!-- No new capabilities being introduced -->

### Modified Capabilities
<!-- No existing capability requirements are changing, only implementation details -->

## Impact

- 修改文件：`src/modules/waybill-build/pages/waybill-cancel/index.vue`
- 影响功能：取消运单列表中的"去修改货好"入口
- 依赖模块：订单构建模块（`/modules/order-build/pages/order/index`）
- 影响范围：仅影响取消运单列表中特定场景下的跳转逻辑
