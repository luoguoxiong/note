# 扫撤展码下单（exhibition-order-scan）

## ADDED Requirements

### Requirement: 扫撤展码链接分发
扫撤展码进入 SHALL 统一走 `handleCommonScan` 分发处理；后端识别展会码后返回的跳转链接 MUST 携带 `channel=210` 与 `textCode`（客户编码），前端跳转下单页后由既有初始化链路消费。

#### Scenario: 扫有效展会码
- **WHEN** 用户扫描有效期内的撤展下单二维码
- **THEN** `handleCommonScan` 处理后跳转携带 `channel=210 & textCode=<客户编码>` 的下单填单页，页面为撤展下单场景

#### Scenario: 扫码渠道标记来源
- **WHEN** 填单页 query 中渠道为撤展/来展且存在 `textCode`
- **THEN** 下单成功跳转时 `sourcePage` 置为「展会扫码」，用于成功页继续下单分支判断

### Requirement: 二维码失效场景
撤展二维码超过有效期（生成时间 + 3 天）或客户编码未绑定销售项目时，SHALL 由后端返回跳转指引（jumpType/jumpUrl），前端按指引跳转失效缺省页，不停留在空白中转页。

#### Scenario: 扫过期二维码
- **WHEN** 用户扫描超过有效期的撤展二维码
- **THEN** 后端返回失效指引，前端跳转展示「二维码已失效」缺省页

### Requirement: 成功页继续下单分支
下单成功页「继续下单」SHALL 扩展两个展会分支：展会扫码场景（`sourcePage === 展会扫码`）进入唤起扫一扫分支；撤展/来展渠道（非扫码进入）进入保持渠道跳回填单页分支，两者均不得落入「重置为快速寄件」的默认分支。

#### Scenario: 展会扫码单继续下单
- **WHEN** 用户通过扫撤展码下单成功，在成功页点击「继续下单」（query 含 `sourcePage=展会扫码`）
- **THEN** 唤起扫一扫（进入 `scanQrcode` 分支），可继续扫下一张撤展码

#### Scenario: 非扫码展会单继续下单
- **WHEN** 用户从展会首页进入撤展/来展填单页下单成功，点击「继续下单」
- **THEN** 跳回填单页且渠道保持撤展/来展不变（`orderAgainByOrderPageKeepChannel` 分支），URL 上的 channel 等参数保留

#### Scenario: 普通快速寄件不受影响
- **WHEN** 快速寄件渠道下单成功后点击「继续下单」
- **THEN** 仍走默认分支：跳回下单页并重置渠道为快速寄件
