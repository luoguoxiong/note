# Design: 查件列表卡片配置新增“付款方式”字段

## Context

卡片配置体系已通用化（TY250646 等历史迭代沉淀）：

- 配置链路：`web.query.cardConfig.get/save/switch` + Pinia store（`src/store/cardConfig.ts`），标准配置由后端下发，前端不做字段白名单过滤（仅过滤失效 KYFIELD 动态表头）
- 渲染链路：`waybill-card/index.vue` 按 `visibleWaybillFields` 动态渲染，`fieldComponentMap`（code → 组件）+ `isFieldVisible`（按状态可见性）+ `DefaultField` 未知 code 兜底
- 配置编辑：`module-edit-popup` 完全按配置项的 name/visible/fixed 通用渲染，不感知具体字段 code
- 现状：版本号 `'optimizeVersion'` 硬编码在 4 处（store get × 2、module save/switch × 2）
- 后端方案 A：新增 `config_version=payModeVersion` 标准配置行（继承 optimizeVersion + 末尾追加 `{"code":"payMode","name":"付款方式","visible":false,"fixed":false,"order":last}`），不动历史版本行

## Goals / Non-Goals

**Goals:**

- 版本号配置化：单一常量收敛，后续新增字段类需求只改一处
- 卡片支持 payMode 字段的配置下发、编辑（开关/拖拽）与展示
- 空值隐藏整行（区别于通用字段的 `--` 占位），加密值直显

**Non-Goals:**

- 不改配置编辑弹窗、拖拽排序、保存链路（通用机制直接复用）
- 不处理 searchMobile 请求参数改造（见 Open Questions）
- 不涉及埋点、筛选、运单详情页

## Decisions

### D1: 版本号抽取为常量并随本次升级

在 `src/public/apis/card-customize/index.ts`（get/save/switch API 定义的公共落点）导出：

```ts
export const CARD_CONFIG_VERSION = 'payModeVersion'
```

- store（`src/store/cardConfig.ts`）与 module 侧 save/switch（`src/modules/kye-miniapp-waybill/src/apis/card-customize/index.ts`）统一引用
- 替代方案：环境变量/远程下发 → 过度设计；纯前端常量即可满足“统一修改”诉求
- 兼容性：后端读不到目标版本时降级 baseVersion（旧版前端不带 payModeVersion 读不到付款方式，零侵入）；新版前端先发、后端 initStandardConfig 未落库时同理降级，仅表现为看不到新字段

### D2: 新建独立 PayModeField 组件而非复用 DefaultField

- DefaultField 空值展示 `--`（v1.2.1 通用规则），付款方式需求 5.2.2③ 要求空值**隐藏整行**，行为冲突，独立组件最干净
- 组件内 `v-if` 空值渲染空，格式“付款方式：{value}”，值取后端下发的付款方式字段（字段名以联调确认为准，见 Open Questions）
- 注册到 `fieldComponentMap[WaybillInfoCode.PAY_MODE]`；`isFieldVisible` 无需特判（走 default: true）

### D3: DEFAULT_CARD_CONFIG 兜底不加入付款方式

- 兜底字段全部 `visible:true`，若加入则接口失败时默认展示，违背“默认关闭”
- 加入并设 `visible:false` 会引入同列表双可见性口径，不如不加入
- 兜底场景（配置接口失败）下不展示付款方式，符合产品预期

### D4: 枚举与类型同步

- `WaybillInfoCode` 新增 `PAY_MODE = 'payMode'`（code 与后端标准配置下发一致，大小写敏感）
- `waybill-card/types.ts` 的 `ISearchWeb` baseInfo 已声明 `payMode/payModeDesc`，本次新增 `payModeText?: string`——`web.query.waybill.searchMobile` 在 `waybill.baseInfo.payModeText` 返回付款方式文案（后端自行增加字段，前端请求参数不改）

## Risks / Trade-offs

- [本地默认配置即降级兜底] → 后端无需 payModeVersion→baseVersion 版本降级逻辑：配置接口异常或未落库时，前端走 `DEFAULT_CARD_CONFIG` 本地默认配置，其中不含付款方式（默认关闭），表现完全符合预期
- [maxSelect=4 已选满时开启付款方式] → 既有交互为其他字段开关禁用（isSwitchDisabled），用户需先关一个；与后端 120101 校验兜底一致，无新增逻辑

## Migration Plan

1. 联调前置：后端在联调/预发执行 initStandardConfig 落 payModeVersion 标准配置
2. 前端按 tasks 实施，dev 环境验证配置页出现“付款方式”（默认关闭、排最后）→ 开启后卡片展示 `waybill.baseInfo.payModeText` → 空值运单隐藏 → 加密运单展示 ***
3. 灰度按周迭代节奏放量；回滚策略：前端回滚版本号常量即可回到 optimizeVersion，后端旧版本行未动，无数据迁移

## Open Questions

（无——已全部与后端确认：① searchMobile 前端传参不改，后端自行下发新字段；② 字段名为 `waybill.baseInfo.payModeText`，加密值由后端返回后前端直显）
