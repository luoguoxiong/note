# Proposal: 查件列表卡片配置新增“付款方式”字段（TY251087 / 禅道 #570588）

## Why

客户在查件列表卡片上无法区分运单是“寄方付/收方付/第三方付”，需进入运单详情页才能查看，操作路径长、查件效率低（客户反馈单据编码 ZCXX2609-00140）。后端已按方案 A 新增 `config_version = payModeVersion` 标准配置（继承 optimizeVersion 字段 + 末尾追加付款方式项，默认关闭），前端需同步升级版本并支持该字段的配置与展示。随 0923 周迭代上线（计划 2026-09-24）。

## What Changes

- **版本号配置化**：将 `web.query.cardConfig.get/save/switch` 请求中 4 处硬编码 `'optimizeVersion'` 抽取为单一常量 `CARD_CONFIG_VERSION`，并在本次升级为 `'payModeVersion'`（后端目标版本缺失时自动降级 baseVersion，兼容安全）
- **新增字段 code**：`WaybillInfoCode` 枚举新增 `PAY_MODE = 'payMode'`
- **新增字段组件**：新建 `PayModeField.vue` 并注册到 fieldComponentMap，展示格式“付款方式：寄方付/收方付/第三方付”；空值隐藏整行（区别于通用字段的 `--` 占位）；加密时后端返回 `***` 直接展示
- **兜底策略**：`DEFAULT_CARD_CONFIG` 兜底列表不加入付款方式（接口失败降级时不展示，符合“默认关闭”）
- **多端同步生效**：微信/支付宝小程序、H5 等走同一套源码，无需端级差异处理

不改动：列表个性设置编辑弹窗（module-edit-popup）、拖拽排序、保存链路——payMode 由后端标准配置下发，全走既有通用渲染链路。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `waybill-card-fields`: 新增“付款方式字段组件”需求——PayModeField 组件渲染 `payMode` 字段：有值显示“付款方式：xxx”；空值隐藏整行（特例，不展示 `--`）；加密值 `***` 直接展示

## Impact

- 涉及文件：
  - `src/public/apis/card-customize/index.ts`（新增版本常量）
  - `src/store/cardConfig.ts`（引用常量，2 处）
  - `src/modules/kye-miniapp-waybill/src/apis/card-customize/index.ts`（save/switch 引用常量，2 处）
  - `src/public/components/business/waybill-card/config/codes.ts`（新增枚举）
  - `src/public/components/business/waybill-card/fields/`（新增 PayModeField.vue、index.ts 注册）
- 接口依赖：
  - `web.query.cardConfig.get/save/switch`：携带 `version=payModeVersion`，依赖后端 `initStandardConfig` 已落库 payModeVersion 标准配置（未落库时前端走本地默认配置兜底，符合默认关闭预期）
  - `web.query.waybill.searchMobile`：后端自行在 `waybill.baseInfo.payModeText` 下发付款方式文案（含加密 `***` 形态），前端请求参数不改
- 历史数据：已保存的用户 config_json 不含 payMode code，按“未配置即关闭”处理，后端负责合并，前端无兼容代码

## 非目标

- 不改付款方式与结算方式的组合展示（明确独立展示）
- 不涉及筛选、运单详情页等其他模块的付款方式逻辑
- 无埋点需求（产品明确“否”）
