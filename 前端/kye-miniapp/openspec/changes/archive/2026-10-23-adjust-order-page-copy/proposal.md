# Proposal

## Why

下单体验走查发现单票寄件页部分文案存在痛点：手机/固话二选一提交报错文案表述冗长，影响客户下单阅读效率，需统一精简调整（禅道需求：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/579866）。

## What Changes

- 收方手机/固话二选一提交校验报错文案精简：「手机号码或固定电话至少填写一项」调整为「手机或固话至少填写一项」（移动端唯一改动点，仅文案字符串，校验规则与触发时机不变）
- 实名认证引导文案调整（语序调整+一行展示）：文案由下单成功页接口 `getSuccessPageTips` 下发，前端不涉及，由后端调整下发内容
- 服务方式区域限行文案调整（3 条去「但」字）：文案由接口下发，前端不涉及，由后端调整下发内容
- 寄/收方信息静默文案调整（4 处）：需求明确仅 PC 端调整，移动端不涉及

## Capabilities

### New Capabilities

- `order-page-copy`：单票寄件下单页提示文案口径（当前仅覆盖移动端涉及的报错文案要求；接口下发文案与 PC 端静默文案不在本仓库范围）

### Modified Capabilities

- 无

## Impact

- 代码变更：`src/modules/kye-miniapp-order/src/order-public/hooks/address/sender/useValidate.ts` 1 处文案字符串（收方手机/固话二选一提交校验）
- 平台影响：微信小程序（weapp）、支付宝小程序（alipay）、H5 共用同一份代码，全端同步生效
- 子仓库：kye-miniapp-order 为独立 git 仓库，需在该仓库创建分支提交；构建副本目录（order-build、order-build-sub-pages 等）由插件自动生成，不手动修改
- 无接口、数据结构、埋点变更；无功能逻辑变更
- 风险：该文案字符串被二选一校验链路共用，改动影响所有触发该提示的场景（下单页提交校验等），新旧文案语义一致，影响可接受
