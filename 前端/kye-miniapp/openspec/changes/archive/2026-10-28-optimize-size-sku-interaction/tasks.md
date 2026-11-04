# 尺寸及 SKU 交互优化（移动端）— 实施任务

> 所有修改均在真实源码 `src/modules/kye-miniapp-order/src/order-public/...` 进行，禁止修改 `order-build-sub-pages` 构建副本。编码前需阅读 `.agents/rules/` 全部规范与对应技能文档。

## 1. API 层与基础设施

- [x] 1.1 在 `apis/product-info/index.ts` 新增接口封装：`getCustomerSkuInfo`（web.order.customer.sku.info）、`saveCustomerSku`（web.order.customer.sku.save）、`deleteCustomerSku`（web.order.customer.sku.delete）、`getLinkGoodsV2`（web.order.linkGoods.v2.list），并补充 `types.ts` 类型定义（完成标准：类型完整、命名符合 API 规范）
- [x] 1.2 全局搜索 `displayUserSizeCheck`/`getShowHistorySize`/`isOnlyHistory` 的所有引用点并记录清单，确认废弃影响面（完成标准：引用清单输出，无未知调用方）

## 2. 选择尺寸页批量能力（select-size-multi-select）

- [x] 2.1 新增 page 级 `useSelectSizeBatch` hook（isSelectAllStatus / selectedIds / searchKey），在 `select-size/index.vue` 持有并 props 下发（完成标准：切 tab 保留选中与搜索词、退出批量清空选中、页面销毁状态重置）
- [x] 2.2 `select-size/index.vue` 增加【批量操作】/【退出操作】切换：currentCount ≥20 时置灰 + toast"最大添加20组"；批量态下接入 `web.order.customer.sku.info` 展示双 tab 条数统计（完成标准：入口行为符合 spec）
- [x] 2.3 ListRefreshLoad 下新增 Footer 组件：批量态展示【全选】+"已选xx条"（xx 标黄）+【确定】，非批量态展示【新增尺寸】（仅我的尺寸 tab，受平台/ mySizeOptFlag 控制）（完成标准：Footer 状态切换与事件暴露齐全）
- [x] 2.4 改造 MySize/HistorySize 卡片：新增单选框与选中态样式；批量态点击整卡切换选中；选中态编辑/删除 icon 置灰；搜索态不置灰（完成标准：卡片交互符合 spec 且不影响非批量态单选回填）
- [x] 2.5 实现全选/取消全选与计数联动（手动取消一项全选回退未选中态）（完成标准：计数实时准确）
- [x] 2.6 实现确定回填：选中卡片统一展开为组列表，复用 `sliceSelectedByRemaining` 以 currentCount 快照截断（支持卡片内部分截断），经 `setPreWaybillGoodsSizeList` 回填（不回填托寄物）后返回；未选中 toast"请先选择尺寸"（完成标准：剩余 1~3 组边界场景回填正确）
- [x] 2.7 批量态搜索取并集：已选集合不在搜索结果中仍保持选中，确定回填取并集；清空搜索保留选中；退出批量保留搜索结果与高亮（完成标准：a+b / b+a 场景正确）
- [x] 2.8 删除数据后实时更新 tab 条数统计（本地减数）（完成标准：删除后计数即时更新）

## 3. 我的尺寸新增/删除（my-size-management）

- [x] 3.1 新增 `add-my-size` 页面目录与子包路由注册（`product-info/components/add-my-size/`，完成标准：路由可达、命名符合 03-目录结构规范）
- [x] 3.2 实现托寄物输入与校验：64 截断、禁表情/空格、纯数字/纯字符失焦报错、敏感词校验（validSensitiveWord）、保存标红（完成标准：5 类校验场景全部通过）
- [x] 3.3 实现尺寸多组编辑：尺寸行复用 `product-size` sizeRow 单行布局（长*宽*高*件数*单件重量，每项仅一行、无单独长宽高新增长宽高入口，多组仅通过【添加尺寸】追加）、长宽高必填校验（自动定位第一条报错 + 气泡"请先完善尺寸信息"）、件数/单件重量、【删除】仅一条不展示（完成标准：保存校验符合 spec）
- [x] 3.4 实现保存：调用 `saveCustomerSku`，重复数据后端错误码 toast；成功 toast"新增成功"返回我的尺寸 tab 并刷新列表（路由参数标记 refresh + 默认 tab）（完成标准：返回后列表含新数据且计数更新）
- [x] 3.5 实现 20 组上限控制：含新增空项计数，达上限置灰【新增尺寸】/【添加尺寸】+ toast"最多可添加20组"（完成标准：边界 19/20/21 组行为正确）
- [x] 3.6 实现列表删除：CRM 数据置灰 + toast"后台维护的尺寸数据无法删除"；自有数据 `showKyDialog` 二次确认后调用 `deleteCustomerSku` 刷新列表（完成标准：两类数据删除行为符合 spec）
- [x] 3.7 实现空态：我的尺寸"暂无我的尺寸数据"+【新增尺寸】按钮；历史尺寸缺省图无新增按钮；入口固定【选择尺寸】（完成标准：4 种数据组合下入口均为【选择尺寸】）

## 4. 推荐托寄物一键回填（recommend-goods-fill）

- [x] 4.1 `product-name/index.vue` 接入初始化 `recommendGoodsInfoList` 与 `getLinkGoodsV2` 实时搜索，下拉新增【推荐托寄物】分组（前 10 条，名称+尺寸摘要，多组"+xx组"，长度省略），展示顺序推荐＞常规（完成标准：联想展示符合 spec）
- [x] 4.2 实现一键回填：点击推荐项清除货物信息当前尺寸组后回填托寄物+全部尺寸组，toast"已填充托寄物和尺寸信息"，切换结果覆盖不叠加（完成标准：覆盖语义正确，不影响我的/历史尺寸回填）
- [x] 4.3 实现降级逻辑：无推荐隐藏模块、搜索无结果保持线上样式、接口异常不展示下拉；组合维护/不可编辑配置不启用联想（完成标准：4 类降级场景正确）

## 5. 历史尺寸命名与编辑校验（history-size-naming）

- [x] 5.1 `historySize/index.vue` 编辑弹窗接入 `modifyUserHistorySize` 指定错误码处理：气泡提示"存在重复名称"，弹窗不关闭；正常保存维持现有逻辑（完成标准：顺序不同视为重复的场景通过）
- [x] 5.2 确认历史尺寸名称展示仅托寄物名称（v2 数据源），移除前端对"历史记录x"的兼容拼接逻辑（如有）（完成标准：新增/存量数据展示一致）（注：源码中无"历史记录x"拼接逻辑，卡片直接展示 goodsName，无需改动）

## 6. 平台控制与埋点

- [x] 6.1 实现平台判断：支付宝、高德端或 mySizeOptFlag=false 时隐藏新增/编辑/删除入口（新增页 Footer、卡片 icon、空态按钮）（完成标准：微信正常、支付宝/高德隐藏、mySizeOptFlag=false 隐藏）
- [x] 6.2 补充埋点：批量操作进入/退出、批量确定回填、全选点击、进入新增尺寸页、新增保存/删除、推荐托寄物曝光与点击（参照页面现有 exposure/click 模式）（完成标准：事件码登记且上报验证）
- [x] 6.3 清理废弃代码：移除 `displayUserSizeCheck` 调用与 `isOnlyHistory` 路由参数（依据 1.2 引用清单）（完成标准：全局无残留引用，相关页面行为正常）

## 7. 验证

- [ ] 7.1 多端验证：微信小程序、支付宝小程序、H5 下核心链路回归（多选回填、新增删除、推荐回填、命名展示）（完成标准：三端无阻塞性问题）
- [ ] 7.2 边界用例验证：currentCount 快照截断（剩余 1~3 组）、空尺寸计数、20 组上限、CRM 置灰删除、覆盖回填、切 tab 状态保留（完成标准：spec 全部 scenario 通过）
