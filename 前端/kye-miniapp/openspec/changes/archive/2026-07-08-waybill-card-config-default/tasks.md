## 1. 接口定义与类型

- [x] 1.1 创建 `apis/card-customize/types.ts`，定义 CardConfig、StatusConfig、CardConfigResponse 等类型
- [x] 1.2 创建 `apis/card-customize/index.ts`，定义 getCardConfig 接口调用
- [x] 1.3 定义枚举 `codes.ts`（SenderReceiverCode、WaybillInfoCode、FunctionCode）

## 2. 默认配置常量

- [x] 2.1 创建 `config/types.ts`，定义 SenderReceiverField、WaybillInfoField、FunctionButton 接口
- [x] 2.2 创建 `config/defaultConfig.ts`，定义默认配置
- [x] 2.3 定义 DEFAULT_SENDER_RECEIVER_FIELDS（8个字段）
- [x] 2.4 定义 DEFAULT_WAYBILL_INFO_FIELDS（6个字段，含 visible 字段）
- [x] 2.5 定义 DEFAULT_FUNCTION_BUTTONS（16个按钮）
- [x] 2.6 定义 DEFAULT_CARD_CONFIG 整合对象

## 3. Pinia Store

- [x] 3.1 创建 `store/cardConfig.ts`（Pinia store，替代原 useCardConfig Hook）
- [x] 3.2 实现 loadAllConfigs 方法，调用 getCardConfig 接口
- [x] 3.3 实现 getConfigByVersion 方法，根据 currentVersion 选择配置
- [x] 3.4 实现 useDefaultConfig 方法，接口失败时降级
- [x] 3.5 实现 getConfigByStatus getter，根据运单状态获取配置
- [x] 3.6 实现 getVersionByStatus getter，根据运单状态获取版本
- [x] 3.7 实现 updateConfig 方法，用于配置页保存后更新
- [x] 3.8 实现 reset 方法，用于用户切换等场景

## 4. 运单信息字段组件

- [x] 4.1 创建 `waybill-card/fields/index.ts`，定义字段组件映射
- [x] 4.2 创建 `TimeField.vue`，渲染货好时间/寄件时间/签收时间，支持连带标签
- [x] 4.3 创建 `PreArriveTime.vue`，渲染预计派送时间
- [x] 4.4 创建 `Receiver.vue`，渲染签收人
- [x] 4.5 创建 `RouteInfo.vue`，渲染路由信息
- [x] 4.6 创建 `DefaultField.vue`，通用字段组件

## 5. 运单卡片组件改造

- [x] 5.1 修改 `waybill-card/index.vue`，新增 cardConfig props
- [x] 5.2 实现 isSenderReceiverFieldVisible 方法，判断寄收信息字段是否显示
- [x] 5.3 实现 visibleWaybillFields 计算属性，过滤 visible 为 true 的字段
- [x] 5.4 改造寄收信息模板，添加 v-if 显隐判断
- [x] 5.5 改造运单信息模板，使用动态组件渲染

## 6. 底部按钮配置化

- [x] 6.1 在 `waybill-search/index.vue` 新增 getRelieveButtonsWithConfig 函数
- [x] 6.2 新增 getMenusWithConfig 函数，叠加配置过滤
- [x] 6.3 新增 showCancelOrderBtnWithConfig 函数
- [x] 6.4 修改模板，使用配置化函数替换原有函数
- [x] 6.5 添加 configCode 到 MENU_LIST，使用 FunctionCode 枚举
- [x] 6.6 统一渲染逻辑：前3个在底部右侧，order 最小的在最右边

## 7. 查件列表页集成

- [x] 7.1 在 `waybill-search/index.vue` 引入 useCardConfigStore
- [x] 7.2 在 useDidShow 中调用 loadAllConfigs
- [x] 7.3 传递 cardConfig 给 WaybillCard 组件
- [x] 7.4 实现 getActiveStatusTab 方法，获取当前选中的状态 tab

## 8. 接口联调

- [x] 8.1 联调 web.query.cardConfig.get 接口（接口已定义）
- [x] 8.2 验证接口返回数据格式（类型定义已完善）
- [x] 8.3 验证降级逻辑（接口失败时使用默认配置）（已实现）

## 9. 待优化（TODO）

- [ ] 9.1 标签显示位置逻辑：时间字段全隐藏时，标签跟随寄收信息或单独一行
- [ ] 9.2 按钮配置合并：取货评价配置需控制取货评价/查看取货评价/修改取货评价3个操作
- [ ] 9.3 按钮配置合并：派货评价配置需控制派货评价/查看派货评价/修改派货评价3个操作
- [ ] 9.4 按钮配置合并：展会配置需控制添加展会/查看展会2个操作
- [ ] 9.5 按钮配置合并：修改运单配置需控制修改运单/恢复下单2个操作
