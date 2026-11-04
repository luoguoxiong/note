# 尺寸及 SKU 交互优化（移动端）— 技术设计

## Context

- 现有选择尺寸页 `select-size/index.vue`：双 tab（我的尺寸/历史尺寸），tab 显隐由 `displayUserSizeCheck` 控制；`isOnlyHistory` 路由参数控制单历史模式；单选卡片即回填并返回；`sliceSelectedByRemaining` 按剩余量截断。
- 真实源码在 `src/modules/kye-miniapp-order/src/order-public/...`；`order-build-sub-pages`、`order-build` 为 `@kye-netc/miniapp-plugins` 构建副本，禁止直接修改。
- 现有组件结构：MySize/HistorySize 为无状态 props 组件，事件上抛到 index.vue 处理；搜索为 `KySearch` + debounce，关键词高亮用 `highlightText`。
- 货物信息尺寸区在 `product-size/index.vue`，托寄物输入联想在 `product-name/index.vue`（`getLinkGoods` → `web.order.linkGoods.list`）。

## Goals / Non-Goals

**Goals:**

- 选择尺寸页支持批量多选、全选、一次性回填（组维度统一截断）
- 我的尺寸支持新增/删除，入口固定【选择尺寸】+ 双 tab 常驻
- 托寄物输入支持推荐托寄物一键回填（覆盖语义）
- 历史尺寸命名规则调整与编辑重复校验

**Non-Goals:**

- 单票 H5、组合维护/不可编辑配置的联想、新增页超长费/件数之和校验
- 后端数据清洗、双写、CRM 接口实现
- PC 端（PC 上限 100 组，独立实现）

## Decisions

### D1. 批量状态与选中集合：page 级共享 hook（不用 Pinia）

新增 `useSelectSizeBatch` hook，在 `select-size/index.vue` 持有，通过 props 下发 MySize/HistorySize：

- `isSelectAllStatus`（批量态开关）、`selectedIds: Set<string>`（跨 tab 共享）、`searchKey`
- 生命周期：切 tab 保留；退出批量态清空 `selectedIds`；页面返回销毁（满足"返回再进不保留"）

理由：状态生命周期与页面一致，页面销毁自动清空；Pinia 会引入跨页污染风险（主包/子包共享实例，需手动清理）。备选 Taro.eventCenter 事件同步被否：事件流难追踪且已有页面级重复响应的教训。

### D2. 截断统一组维度 + currentCount 快照

回填前将选中卡片统一展开为 `GoodsSize[]` 组列表（我的尺寸 1 卡=1 组，历史尺寸 1 卡=N 组），复用现有 `sliceSelectedByRemaining` 截断：

- 剩余量以 `route.query.currentCount`（进入页面时货物信息尺寸组数快照，空尺寸按现有 `isEmptySize` 视为 0 条）为准，不依赖 `preWaybillGoodsSizeList` 实时值
- 跨卡片部分截断：按展开后的组顺序 slice，天然支持"一张卡只回填前几组"

理由：一处逻辑覆盖两个 tab；快照语义简单且页面内不会变更货物信息。

### D3. 批量态点击分流（改造现有 handleSelect）

卡片点击按 `isSelectAllStatus` 分流：批量态 → 切换选中态（记录/移除 id）；非批量态 → 现有单选回填+返回逻辑。批量态下编辑/删除 icon 置灰（参考现有置灰实现，不隐藏）；搜索态下不置灰（按技术文档结论）。

### D4. Footer 组件

在 ListRefreshLoad 下新增 Footer 组件：

- 批量态：【全选】（"已选xx条"，xx 标黄）+【确定】；全选遍历当前 tab 列表数据勾选，手动取消一项则全选回退未选中态
- 非批量态：【新增尺寸】（仅我的尺寸 tab 展示；支付宝/高德端或 `mySizeOptFlag=false` 时隐藏）
- 确定时：未选中 → toast"请先选择尺寸"；已选 → D2 截断后经 `setPreWaybillGoodsSizeList` 回填并返回

### D5. add-my-size 新增尺寸页面（子包）

- 路径：`order-public/components/business/product-info/components/add-my-size/`，注册到 order 子包路由
- 组件复用口径（参考现有下单页实现）：
  - 托寄物输入框参考 `product-name/index.vue` 的 `KyInput` 用法（`maxlength=64`、`formatter`、字数统计、`enableNative=false` 等）
  - 尺寸行参考 `product-size/index.vue` 的 `#sizeRow` 布局：长*宽*高*件数*单件重量单行排列（`type=digit`、`formatter`、`v-keyboard` 等），但不含超长费提示
- 结构约束：每个尺寸项仅一行长宽高（一组尺寸数据 = 一行），**没有单独的新增长宽高入口**；多组尺寸通过【添加尺寸】按钮追加新的尺寸项
- 数据项：托寄物（必填 64 字、禁表情/空格、纯数字/纯字符失焦报错、敏感词校验 `validSensitiveWord`）+ 多组尺寸（长宽高必填、件数、单件重量）
- 上限 20 组（含新增空项），达上限置灰【新增尺寸】/【添加尺寸】按钮；仅一项时不展示删除按钮
- 删除：接口返回字段标识 CRM 数据 → 置灰 + toast"后台维护的尺寸数据无法删除"；自有数据二次确认（`showKyDialog`）后删除
- 保存：`web.order.customer.sku.save`；重复数据（后端错误码）toast 展示后端提示；成功后 toast"新增成功"返回 select-size 我的尺寸 tab 并重新请求列表接口（通过路由参数 `refresh=1` + 默认 tab 参数标记）
- 入口隐藏条件：支付宝/高德平台 或 `mySizeOptFlag=false`（`web.order.customer.sku.info` 返回）

### D6. 推荐托寄物一键回填（覆盖语义）

- 数据源：初始化 `moduleDimension.productInfo.recommendGoodsInfoList`；输入过程实时搜索 `web.order.linkGoods.v2.list`（返回 `recommendGoodsList` + `normalGoodsList`）
- 展示：下拉分组【推荐托寄物】＞【常规托寄物】，推荐项取前 10 条；展示托寄物+尺寸摘要，多组显示"+xx组"；无推荐结果隐藏该模块保持线上样式
- 点击推荐项：**清除当前货物信息已有尺寸组**，回填托寄物 + 全部尺寸组，toast"已填充托寄物和尺寸信息"；切换联想结果同样覆盖不叠加
- 我的尺寸/历史尺寸的正常选择回填逻辑不受影响

### D7. 入口固定化与废弃接口清理

- `product-size/index.vue`：入口固定【选择尺寸】，删除 `isShowSelectSize`/`isShowHistorySize` 数据有无判断、`isOnlyHistory` 路由参数；`select-size` 页删除 `displayUserSizeCheck` 调用，双 tab 常驻并展示条数（`web.order.customer.sku.info`）
- 条数统计在删除数据后实时更新（本地减数即可，无需重复请求）

### D8. 历史尺寸命名与编辑校验

- 展示：卡片名称仅托寄物名称（后端 v2 表已去除"历史记录x"，前端无需兼容旧命名拼接逻辑）
- 编辑（`modifyUserHistorySize`）：指定错误 code → 气泡提示"存在重复名称"（复用现有 effectBubble）；其余错误维持现有 toast

### D9. API 层

在 `apis/product-info/index.ts` 新增：`getCustomerSkuInfo`（sku.info）、`saveCustomerSku`（sku.save）、`deleteCustomerSku`（sku.delete）、`getLinkGoodsV2`（linkGoods.v2.list）；移除 `getShowHistorySize` 的调用点（保留 api 定义待确认是否他处使用）。

## Risks / Trade-offs

- [组维度截断边界复杂：一张历史卡部分截断] → 截断后回填数据以展开后的组列表为准，测试用例覆盖"剩余 1~3 组"场景
- [currentCount 快照在新增/删除操作后过期] → select-size 页内不修改货物信息数据；新增尺寸保存返回时由 product-size 侧重新计算并更新跳转参数
- [删除 `displayUserSizeCheck`/`isOnlyHistory` 影响未知调用方] → 实施前全局搜索引用确认（含 history-size 独立组件等旧组件）
- [多端样式差异（支付宝/微信/H5）] → 复用现有组件体系（KyButton/KyField/KySearch），新增页面按多端适配规范验证
- [埋点遗漏] → 实施时参照页面现有埋点模式补充批量操作/新增页/推荐托寄物事件

## Open Questions

（无——探索阶段已确认：支付宝+高德+mySizeOptFlag 控制入口；一键回填覆盖语义；sourceId 维持 20；搜索态不置灰）
