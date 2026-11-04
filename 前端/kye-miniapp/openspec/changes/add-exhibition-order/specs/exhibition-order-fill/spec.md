# 展会下单填单（exhibition-order-fill）

## ADDED Requirements

### Requirement: 展会下单渠道枚举
下单渠道 Channel SHALL 新增「撤展下单 = '210'」「来展下单 = '220'」两个枚举值，并同步更新枚举注释。

#### Scenario: 渠道值定义
- **WHEN** 代码中引用展会渠道
- **THEN** 使用 `Channel.撤展下单`（'210'）与 `Channel.来展下单`（'220'），禁止字符串字面量散落

### Requirement: 展会渠道独立下单配置
展会填单页 SHALL 通过 `INIT_API_CODE_MAP` 为撤展/来展渠道映射独立初始化接口 `web.order.init.exhibitionOrder.singlePageResult`，后端以 channel 区分返回撤展或来展配置，页面导航标题按渠道展示（撤展下单/来展下单）。

#### Scenario: 进入撤展填单页获取配置
- **WHEN** 用户携带 `channel=210` 进入下单填单页
- **THEN** 前端调用 `web.order.init.exhibitionOrder.singlePageResult` 获取撤展下单配置并渲染，导航栏标题为「撤展下单」

#### Scenario: 进入来展填单页获取配置
- **WHEN** 用户携带 `channel=220` 进入下单填单页
- **THEN** 前端调用同一 init 接口（channel=220）获取来展下单配置并渲染，导航栏标题为「来展下单」

### Requirement: 绑码与围栏不触发配置刷新
用户在展会填单页绑定或换绑客户编码，或未绑码用户寄件地址变化命中围栏时，SHALL 保持当前展会渠道的独立下单配置（configId）不变，不重新获取下单配置。

#### Scenario: 撤展页内绑码
- **WHEN** 用户在撤展填单页完成绑码/换绑
- **THEN** 下单配置保持撤展渠道独立配置，页面不因绑码刷新配置

#### Scenario: 围栏命中
- **WHEN** 未绑码用户在展会填单页切换寄件地址且命中围栏
- **THEN** 下单配置保持当前展会渠道配置不变

### Requirement: 填单缓存渠道隔离
展会渠道填单页的表单缓存 SHALL 与快速寄件缓存隔离（按渠道区分）；展会场景「继续下单」跳回填单页时的缓存清空由提交成功路径既有 `resetWaybillInfo` 覆盖。

#### Scenario: 展会填单不污染快速寄件
- **WHEN** 用户在撤展/来展填单页填写运单信息后离开
- **THEN** 相关缓存不流入快速寄件填单页

#### Scenario: 继续下单回到填单页为空白
- **WHEN** 用户在展会下单成功页点击「继续下单」回到填单页
- **THEN** 上次填单内容不残留（提交成功时 `goSuccessAfter → resetWaybillInfo` 已重置表单数据）

### Requirement: 未绑码提示条文案差异
未绑码提示条（notice-bar）SHALL 在展会渠道（撤展/来展）展示差异化文案「如有客户编码，请绑码以享受专属优惠 >」；提示条显隐仍由后端下单配置「未绑码提示条」勾选项与绑码标记共同控制，前端不做展会渠道隐藏逻辑。

#### Scenario: 展会渠道未绑码提示文案
- **WHEN** 展会渠道下单页满足提示条展示条件（后端配置勾选且未绑码）
- **THEN** 提示条展示展会专属文案「如有客户编码，请绑码以享受专属优惠 >」，点击跳转绑码页

#### Scenario: 后端配置不勾选则隐藏
- **WHEN** 展会渠道下单配置未勾选「未绑码提示条」
- **THEN** 提示条不渲染，无需前端渠道判断隐藏

### Requirement: 指定寄件地址复用既有能力
扫撤展码进入时指定寄件地址 SHALL 复用既有指定寄件地址链路：前端在 init 请求中传入渠道（channel）与客户编码（textCode 解析所得），由后端按展会编码返回指定地址数据。

#### Scenario: 后端返回指定地址
- **WHEN** 扫撤展码进入填单页且后端配置中存在该展会编码的指定寄件地址
- **THEN** 前端按既有指定寄件地址逻辑自动回填并锁定该地址
