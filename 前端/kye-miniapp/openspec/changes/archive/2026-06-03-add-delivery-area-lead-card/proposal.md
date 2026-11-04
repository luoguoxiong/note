## Why

配送范围查询页在用户确认地址可配送后，缺少承接新客留资和服务方案申请的入口。需要在查询结果下增加留资卡片，并在用户点击后平滑切换为内联表单卡牌，让用户可在当前页面填写信息并进入申请结果页。

## What Changes

- 在 `src/modules/tools/delivery-area` 查询结果中新增留资卡片，样式按设计图展示文案、主按钮和“新客专享优惠”角标。
- 留资入口只对“未留资新客”展示；已留资新客、老客、未支持配送或无查询结果时不展示。
- 当用户为未留资新客且查询结果支持配送时，原查询结果里的“去寄件”按钮隐藏。
- 点击“获取专属服务方案”后，留资卡片在结果区域内平滑切换为表单卡牌，不使用弹窗；表单包含公司名称、省市区、详细地址等必填项，并复用当前查询地址作为默认省市区。
- 表单校验通过后跳转到 H5 申请结果页，并把表单值和固定来源参数拼接到 URL。
- `couponStatus`、`couponNumber` 先作为预留参数，不阻塞当前功能；后续接口确认后再接入真实值。
- 不新增后端接口，不修改公共请求层，不修改子仓库构建产物。

## Capabilities

### New Capabilities

- `delivery-area-lead-capture`: 描述配送范围查询结果页展示留资卡片、切换内联留资表单、校验表单并跳转 H5 结果页的行为。

### Modified Capabilities

- 无。

## Impact

- 影响页面：`src/modules/tools/delivery-area/**`。
- 影响知识页检查：`knowledge/modules/home.md`、`knowledge/apis.md`、`knowledge/project-map.md`，按 `knowledge/manifest.json` 的工具/首页相关路径规则检查是否需要沉淀。
- 不影响其他团队接口；本次不新增 API code，优惠券相关字段仅预留。
- 不影响 `src/public` 请求层、`src/store`、`order-public`、WebView/Native 桥接或子仓库边界。
- 回归范围：微信小程序、支付宝小程序、H5 的配送范围查询、地址选择、留资卡牌转场、必填校验和 H5 跳转 URL 参数。
