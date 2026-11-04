# 尺寸及 SKU 交互优化（移动端）

## Why

SKU 仅支持销售在客户后台维护，客户无法自行维护，沟通链路长、处理周期久；历史尺寸/我的尺寸仅支持单组选择，操作繁琐。需要支持客户在下单端口自行维护 SKU，并优化尺寸选择交互（多选、一键回填）。

## What Changes

- 【选择尺寸】页（select-size）新增批量操作：批量多选卡片、【全选】/【确定】底部操作、已选条数动态展示，确认后一次性回填尺寸至货物信息（不回填托寄物），超出 20 组按组维度从上到下截断
- 批量态搜索优化：已选集合与搜索结果取并集回填，切 tab 保留选中与搜索词
- 新增条数统计：tab 标题展示当前 tab 尺寸组数（新接口 `web.order.customer.sku.info`），删除实时更新
- 【我的尺寸】支持单独新增尺寸：新增 add-my-size 页面（托寄物 + 长宽高/件数/单件重量，长宽高必填，最多 20 组），支持删除（CRM 数据置灰不可删）
- 【托寄物选择】新增推荐托寄物一键回填：初始化数据 `recommendGoodsInfoList` + 新搜索接口 `web.order.linkGoods.v2.list`，点击后清除当前已有尺寸组并回填托寄物 + 全部尺寸
- 【历史尺寸】命名规则调整：不再显示"历史记录x"，仅保留托寄物名称；编辑名称新增重复校验（托寄物+尺寸一致，不区分顺序）
- 【货物信息】尺寸入口固定为【选择尺寸】，默认展示双 tab（我的尺寸/历史尺寸），不再按数据有无区分入口名称与 tab 显隐
- 平台控制：支付宝、高德端且 `mySizeOptFlag` 不可操作时，隐藏新增/编辑/删除入口

**非目标**：单票 H5；下单配置=组合维护、托寄物/尺寸不可编辑场景的托寄物联想；新增尺寸页的超长费提示、件数之和校验、托寄物补充交互/历史标签/管控；后端数据清洗与双写逻辑。

## Capabilities

### New Capabilities

- `select-size-multi-select`: 选择尺寸页多选批量回填、搜索交互、条数统计、tab/选中状态生命周期
- `my-size-management`: 我的尺寸新增尺寸页面（校验、重复校验、上限控制）、删除（CRM 置灰）、空态与入口固定化
- `recommend-goods-fill`: 推荐托寄物联想展示与一键回填（覆盖语义）
- `history-size-naming`: 历史尺寸命名展示规则与编辑重复校验

### Modified Capabilities

（无既有 spec 涉及）

## Impact

- 源码：`src/modules/kye-miniapp-order/src/order-public/components/business/product-info/components/`（注意 `order-build-sub-pages` 为构建副本，禁止直接修改）
  - `select-size/index.vue`（双 tab、搜索、截断、批量态容器）
  - `select-size/components/mySize|historySize/index.vue`（卡片单选框、编辑/删除、置灰）
  - `product-size/index.vue`（入口固定化、isOnlyHistory 废除）
  - `product-name/index.vue`（推荐托寄物联想、v2 搜索接口）
  - 新增 `components/add-my-size/` 页面（子包路由）
  - 新增 page 级 hook（选中集合/批量态/搜索词共享）
- API：新增 `web.order.customer.sku.info`、`web.order.customer.sku.save`、`web.order.customer.sku.delete`、`web.order.linkGoods.v2.list`；废弃 `web.order.configOrder.displayUserSizeCheck` 调用与 `isOnlyHistory` 路由参数
- 平台：微信/支付宝小程序、H5（支付宝、高德端隐藏新增/编辑/删除入口）
- 埋点：批量操作、新增尺寸页、推荐托寄物点击需补充曝光/点击埋点
