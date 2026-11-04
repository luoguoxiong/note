# 展会下单首页（exhibition-order-entry）

## ADDED Requirements

### Requirement: 展会下单首页入口卡片展示与跳转
展会下单首页（`modules/order-build-sub-pages/order-exhibition/index`）SHALL 固定展示「撤展下单」「来展下单」两个入口卡片，顺序为撤展下单 > 来展下单，点击分别跳转对应填单页。

#### Scenario: 点击撤展下单入口
- **WHEN** 用户在展会下单首页点击「撤展下单」卡片
- **THEN** 跳转到单票下单填单页，URL 携带 `channel=210`（撤展下单）与必要参数，页面标题展示「撤展下单」

#### Scenario: 点击来展下单入口
- **WHEN** 用户在展会下单首页点击「来展下单」卡片
- **THEN** 跳转到单票下单填单页，URL 携带 `channel=220`（来展下单）与必要参数，页面标题展示「来展下单」

### Requirement: 实名横幅显隐规则
展会下单首页 SHALL 复用 `useRealAuth` 展示实名认证横幅，显隐条件为「用户已绑定客户编码」且 `showGoRealNameFlag` 为真且 `realNameButtonType === 10`（不含转发类按钮）。

#### Scenario: 已绑码且未个人实名
- **WHEN** 用户登录手机号已绑定客户编码，且接口返回需实名、按钮类型为 10
- **THEN** 展示实名横幅，点击「去实名」跳转 `/modules/user/pages/realname/personal/index?forceFlag=10&origin=orderExhibition`

#### Scenario: 未绑定客户编码
- **WHEN** 用户登录手机号未绑定客户编码（`userStore.customerCode` 为空）
- **THEN** 不调用实名状态查询接口，隐藏实名横幅

#### Scenario: 客户编码异步变更
- **WHEN** 页面停留期间 `customerCode` 发生变化（如绑码返回）
- **THEN** 重新触发实名状态查询并更新横幅显隐

### Requirement: 实名完成后返回展会首页
用户在个人实名页认证完成点击「继续寄件」SHALL 返回展会下单首页；实名完成返回后横幅隐藏可依赖首页重新查询实名状态实现，不依赖实名认证完成回调。

#### Scenario: 实名认证完成点击继续寄件
- **WHEN** 用户从展会首页进入个人实名页并完成认证，点击「继续寄件」
- **THEN** 返回展会下单首页，且因 `isShowContinue` 分支（`origin=orderExhibition`）展示「继续寄件」按钮

### Requirement: 展会首页预加载预热
展会下单首页 SHALL 在 `onBeforeMount` 调用下单预加载接口（`web.order.init.quickOrder.singlePageV2`）预热配置缓存，预加载数据仅用于填单页初始化前的假组件渲染，真实下单配置 MUST 以 `INIT_API_CODE_MAP[channel]` 对应的 init 接口为准。

#### Scenario: 预加载调用时机
- **WHEN** 用户进入展会下单首页
- **THEN** `onBeforeMount` 触发预加载接口调用，不阻塞页面交互

### Requirement: 宣传区静态展示
展会下单首页 SHALL 展示「5 大核心优势」静态宣传素材（webp 外链图片），素材固定展示、不支持任何跳转。

#### Scenario: 宣传区展示
- **WHEN** 用户进入展会下单首页
- **THEN** 页面下方展示 5 大核心优势图文素材，点击无任何跳转行为
