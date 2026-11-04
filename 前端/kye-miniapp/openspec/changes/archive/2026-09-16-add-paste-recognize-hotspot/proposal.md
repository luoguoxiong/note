# Proposal

## Why

用户在快速寄件填单首页需逐项手动填写寄收人信息，剪切板中已有的「姓名+电话+地址」文本无法直接使用。现有粘贴板识别仅在进入下单页时自动触发一次，用户中途复制内容后没有手动触发的入口。需求来源：TY570232，禅道链接：https://zentao.ky-tech.com.cn/platform-home/#/need-detail/570232

## What Changes

- 快速寄件填单首页（order-single），在寄件人信息、收件人信息卡片与寄件方式卡片之间新增【智能粘贴地址】按钮（图标+文案，独立成行居中，按压态背景 rgba(0,0,0,0.1)）。
- 按钮展示白名单：仅当「下单页面类型=单票 且 页面样式=跳转（container==='page'）且寄收信息≠组合条件、指定地址（fieldsConfigType==='fields'）且智能识别模块开启（addressOcrVisible）」时展示；任一条件不满足或配置未维护时隐藏；仅微信小程序渠道展示，支付宝小程序、高德小程序渠道不展示。
- 点击按钮直接读取剪切板文本（复用智能识别「粘贴并识别」的取词方式，不单独处理权限弹窗）：内容为空时 toast「未识别到粘贴板内容」；有文本时 trim 后按 300 字截断，调用智能识别接口（address.ai.discern，详细地址拼接四级地址依赖接口默认值 fillTownToDetails=1）。
- 识别成功后复用现有自动识别流程的 `tellClipBoard` 弹窗与回填逻辑（抽取共享函数 `showClipBoardDialogAndFill` + `setClipBoardInfo`）：弹窗「是否使用粘贴板中的地址」，用户选择「设为寄件信息 / 设为收件信息」后按字段覆盖回填并跳转对应填写页（container==='page' 时现有逻辑已跳转 /sender-page、/receive-page），点 X 关闭不回填；识别失败 toast「识别失败，请稍后重试」。
- 手动触发不更新 `clipboardData` 本地缓存，每次点击均重新获取剪切板内容。
- 新增按钮点击埋点（umpOtherReport CLK，eventCode: clk_express_smart_paste_v1）；无其他埋点。

## Capabilities

### New Capabilities

- `paste-recognize-entry`: 快速寄件填单首页的手动粘贴识别入口 —— 按钮展示白名单、点击取词与截断、识别调用、弹窗回填的完整行为规则。

### Modified Capabilities

- `tellClipBoard` 自动识别流触发时机、判定规则不变；回填细节有一处统一调整：`setClipBoardInfo` 合并寄/收回填后，平铺样式的远程校验（remoteCheck）寄收行为一致（均为平铺即触发，原寄件侧的 `!isOrderPage()` 守卫移除）

## Impact

- 受影响代码（源码目录 `src/modules/kye-miniapp-order/src/`，非 `-build` 副本）：
  - `order-public/components/business/paste-recognize-entry/`：新增按钮组件（图标+文案+按压态+白名单+取词识别流，内聚自治）。
  - `pages/order-single/components/index.tsx`：componentsMap 注册组件；`pages/order-single/hooks/utils.ts`：schema 合并后将入口插入寄/收件 Block 之后（幂等）。
  - `order-public/validate/access/index.ts`：将 `tellClipBoard` 的「弹窗 + 回填跳转」抽为共享函数 `showClipBoardDialogAndFill` 与 `setClipBoardInfo`（寄/收回填合并，type 参数控制）；自动流 `tellClipBoard` 改为调用共享函数，对外行为保持。
- 接口：复用 `address.ai.discern`（四级地址拼接依赖接口默认值 fillTownToDetails=1，来源 TY566999 ADDR-001 规则），无后端改动。
- 平台影响：仅微信小程序（weapp）；支付宝小程序、高德小程序不支持本功能，按钮隐藏；H5、APP 不在当前展示范围（客户端白名单仅微信）。
- 稳定性：识别接口异常仅 toast 提示，不阻塞下单流程；按钮 loading 置灰防重复点击（finally 恢复）。
