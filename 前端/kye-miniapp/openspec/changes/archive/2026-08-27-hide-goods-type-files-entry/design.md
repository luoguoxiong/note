## Context

### 需求性质

禅道 #564203 是一个**纯前端入口隐藏**需求，原文加粗强调「只做前端入口隐藏！！！！！」。技术复杂度极低，但有两个容易踩空的点，构成本设计的主要内容：

1. 「托寄物资料」这个资料类型在代码里由**一个常量项 `{ label: '托寄物资料', value: 150 }`** 驱动，而该常量被**两个用途**复用：导出页的勾选渲染、导出记录的数字→中文文案翻译。粗暴删除会连带破坏历史记录回显。
2. 「导出」相关入口有 **3 个触发点、2 条数据回填路径**，只改渲染会漏掉「重新导出」的隐形勾选。

### 现状代码地图

真实源码目录为 `src/modules/kye-miniapp-waybill/src/`（`waybill-build` 为构建期副本，只读，不可改）。

```
                    ┌────────────────────────────────────────┐
                    │ pages/waybill-export/constant.ts       │
                    │   WAYBILL_MATERIAL_LIST  (12 项)       │
                    │     { '托寄物资料', value: 150 }  ★    │
                    └───────┬────────────────────┬───────────┘
                            │                    │
              用途一：渲染勾选              用途二：文案翻译
                            │                    │
                            ▼                    ▼
      ┌─────────────────────────────┐   ┌──────────────────────────────┐
      │ pages/waybill-export/       │   │ utils/formatter.ts           │
      │   index.vue                 │   │  formatterExportContentType  │
      │  L92  v-for 渲染 checkbox   │   │   [...INFO, ...MATERIAL]     │
      │  L366 全选 → map 全量 value │   │        │                     │
      │  L372 全选态 = length 比较  │   │        ▼                     │
      │  L404 相册黑名单含 '150'    │   │ export-record/               │
      │  L629 重新导出回填 types    │   │  export-detail-pop/index.vue │
      └─────────────────────────────┘   │  L167 importantContent       │
                                        │  「导出内容」文案回显 ★★    │
                                        └──────────────────────────────┘

  ┌────────────────────────────────────────────────────────────────┐
  │ pages/waybill-detail/components/waybill-info/index.vue         │
  │   L935 goodsTypeFilesList = ref([])                            │
  │   L953 phoneGroup: { '托寄物资料', key:'goodsType' }        ★  │
  │   L960 filter: goodsType 且 length===0 → 不显示（现状条件渲染）│
  │   L572-585 模板 key==='goodsType' 特殊分支 → goGoodsTypeFiles  │
  │   L1059 getOtherPictureData 中赋值                             │
  └──────────────────────┬─────────────────────────────────────────┘
                         ▼
              pages/goods-type-files/index.vue
              （唯一入口；5 类分组：电池运输检测单/检查报告/
                货物照片/电池内包装/电池外包装）
```

### 3 处入口 → 2 个落点

禅道列的移动端 3 处，实际收敛为 2 个代码落点：

| 禅道条目 | 实际落点 | 说明 |
|---|---|---|
| 移动端-导出 | `waybill-export` 页勾选区 | 查件列表「更多」→「导出」→ `export-drawer` → `waybill-export` |
| 移动端-运单详情-其他资料 | `waybill-info` 的 `phoneGroup` | 独立落点 |
| 移动端-运单详情-下载资料 | **同 `waybill-export` 页** | `waybill-detail/index.vue` L901 `openWaybillExport()` → 同一页面，`pageSource='waybill-detail'` 时 `onMounted` 默认触发全选 |

所以导出侧只需改一处，两个入口同时生效。

### 「重新导出」的两条路径（本次不处理，见「注意事项」）

`export-record/components/export-detail-pop/index.vue` 的 `submit()` 按 `exportStatus` 分叉：

```
点击「重新导出」submit()  L188
        │
        ├── exportStatus === 3 ──► onResetExport(id)   L269
        │       getExportRequest({id})  → 后端返回原 types（含 150）
        │       Taro.getApp().exportParams = params
        │       navigateTo → waybill-export
        │              └─ onMounted L627-631
        │                   waybillMaterialCheck = types.map(String)
        │                   ↑ 150 被回填，但界面已无对应 checkbox
        │                   ⇒ 「隐形勾选」：不可见却会提交
        │
        └── 其他状态 ──────► downloadRetryTask({ mobileExportId })  L203
                后端沿用原 types 直接重跑，前端不接触参数
```

PRD 未涉及此链路，本次**两条都不动**，仅记录于 N1。

## Goals / Non-Goals

**Goals:**

- 移动端 3 处托寄物资料入口对用户**无条件不可见**，不依赖接口是否返回数据
- 不破坏历史导出记录的「导出内容」文案回显
- 改动完全可逆，恢复成本 ≈ 取消注释

**Non-Goals:**

- 不改任何后端接口、不推动 `150` 类型码下线
- 不改客户端（PC Web）4 处（不在本仓库）
- 不删除 `goods-type-files` 页面与子包注册
- 不调整埋点
- **不处理导出记录「重新导出」的任何路径**（PRD 未涉及，见 N1）

## Decisions

### D1：常量保留 `150`，在渲染层过滤

**决策**：`WAYBILL_MATERIAL_LIST` 保持 12 项全量不动；在 `waybill-export/index.vue` 新增 computed 过滤。

```ts
/** 导出内容--运单资料（可选项）
 * 禅道 #564203：托寄物资料(150) 仅隐藏入口，常量保留以兼容历史导出记录文案回显 */
const waybillMaterialListShow = computed(() => WAYBILL_MATERIAL_LIST.filter((v) => v.value !== 150))
```

**为什么不直接删常量项**：`utils/formatter.ts` 的 `formatterExportContentType` 复用同一份列表把 `types` 数字翻译成中文，供导出记录详情弹窗的 `importantContent` 使用。若删除 `150`：

```
用户历史导出记录 types = [40, 150, 50]
  删除前：「电子存根/托寄物资料/签收联」   ✓
  删除后：「电子存根/签收联」              ✗ 数据没丢，文案丢了
```

这会让用户困惑「我明明导过，记录里怎么少了一项」，属于隐性破坏。

**参照**：同文件已有 `waybillInfoListShow`（L320-328）用同样手法过滤「路由信息」`130`，本决策与既有模式一致，不引入新范式。

### D2：详情页卡片项注释掉，而非改 filter 条件

**决策**：直接注释 `phoneGroup` 数组里的托寄物资料项。

```ts
const phoneGroup = computed(() =>
  [
    // 禅道 #564203：隐藏托寄物资料入口（仅隐藏，不删除数据链路）
    // { title: '托寄物资料', list: goodsTypeFilesList.value, key: 'goodsType' },
    { title: '复磅照片', list: compoundPictureList.value },
    ...
  ].filter((item) => {
    // if (item.key === 'goodsType' && goodsTypeFilesList.value.length === 0) return false
    if (item.title === '包装照片' && packagePicturesList.value.length === 0) return false
    return true
  }),
)
```

**为什么不是改 filter 为 `if (item.key === 'goodsType') return false`**：需求要求「无条件隐藏」。从数组源头注释掉语义最直白，且 filter 里那条针对 `goodsType` 的空数据判断随之成为死代码，一并注释保持一致。两种写法效果等价，选可读性更好的。

**为什么保留 `goodsTypeFilesList` ref 与 `getOtherPictureData` 里的赋值**：它与渲染已解耦，留着无任何副作用（一次已发生的接口响应字段赋值），但删了回滚要多改两处。

### D3：模板中 `key === 'goodsType'` 分支保留

该分支（L572-585）行为特殊 —— 点击整卡跳转 `goods-type-files` 页而非打开图片预览，与其他所有卡片不同。`phoneGroup` 不再产出 `key === 'goodsType'` 的项后此分支不可达。保留不删，理由同 D1/D2：可逆性优先，且删除模板分支比注释一行数组的 diff 大得多。

### D4：全选逻辑同步切换到过滤后列表

`onChangeWaybillMaterialAll`（L366）与 `onChangeWaybillMaterial`（L372）都基于 `WAYBILL_MATERIAL_LIST`：

```ts
// 改前
waybillMaterialCheck.value = value ? WAYBILL_MATERIAL_LIST.map((v) => `${v.value}`) : []
waybillMaterialCheckAll.value = waybillMaterialCheck.value.length === WAYBILL_MATERIAL_LIST.length

// 改后
waybillMaterialCheck.value = value ? waybillMaterialListShow.value.map((v) => `${v.value}`) : []
waybillMaterialCheckAll.value = waybillMaterialCheck.value.length === waybillMaterialListShow.value.length
```

**必须改的原因**：
- 全选若仍 map 全量，会把 `150` 塞进选中数组并提交给后端 —— 隐藏失效
- 长度比较若仍用全量（12），勾满 11 项时 `11 !== 12`，「全选」checkbox 永远无法自动置为选中态 —— 功能性 bug

这条尤其关键：**「运单详情-下载资料」入口在 `onMounted` 时 `pageSource === 'waybill-detail'` 会主动调 `onChangeWaybillMaterialAll(true)`**（L600-605），不改这里等于该入口完全没隐藏。

### D5：「重新导出」不做任何处理

**决策**：`onMounted` 中 `exportParams.types` 的回填逻辑（L627-631）**保持原样不动**。

```ts
// 保持不动
if (exportParams?.types) {
  isRestartExport.value = true
  waybillMaterialCheck.value = exportParams?.types.map((item) => `${item}`)
  waybillInfoCheck.value = exportParams.types.includes(20) ? ['20'] : []
}
```

**为什么不改**：PRD 涉及范围表只列了三处（导出、运单详情-其他资料、运单详情-下载资料），未提及导出记录的重新导出。「重新导出」语义上是对一条历史记录的**重放**，而非新的资料选取入口，产品是否希望重放时静默剔除托寄物资料属于产品决策，不由开发代为判断。原则：**PRD 未写的不做调整**。

**已知的遗留表现**（记录于 N1，不作为 bug 处理）：历史 `types` 含 `150` 时会回填进 `waybillMaterialCheck`，但界面无对应 checkbox，形成隐形勾选；且该场景 `isRestartExport = true` 会 disabled 全部 checkbox。若后续产品提出需求，前端改动量约 1 行（回填时 `.filter((item) => Number(item) !== 150)`）。

### D6：不动「保存至手机相册」黑名单

`onSetWaybillExportTypeList`（L401-404）：

```ts
const isShowPhone = !['20', '100', '110', '130', '150'].some((type) => types.includes(type))
```

`150` 不再可能出现在 `types` 中，这条判断对 `150` 永久不命中。**保持原样**：删除它不产生任何行为收益，却要改一行核心业务判断，扩大回归面。（顺带说明：该函数上方注释本来就没同步过 `130`/`150`，属存量问题，不在本次范围。）

### D7：`goods-type-files` 页面保留为孤岛

隐藏入口后该页不可达。不删页面、不动 `src/subpackages.ts`（该文件由 `@kye-netc/miniapp-plugins` 自动生成，本就不可手改；页面由插件扫描 `pages/*/index` 自动收录）。

**代价**：无用代码留在子包里，占少量体积。`waybill-build` 有 2MB 上限（插件仅 `console.error` 不中断构建）——该页仅一个 `.vue` + `.config.ts`，无额外资源，影响可忽略。

**收益**：改动面最小；且若产品后续要恢复，只需放开入口。

## Risks / Trade-offs

| 风险 | 影响 | 应对 |
|---|---|---|
| 漏改全选逻辑 | 「下载资料」入口默认全选会带上 150，隐藏形同虚设 | D4 显式覆盖；验证时必须从**运单详情-下载资料**进入，而非只测列表导出 |
| 误删常量 | 历史导出记录文案静默缺项 | D1；review 时确认 `constant.ts` 无删除 |
| 改到副本目录 | 改动被构建覆盖，白改 | 只改 `src/modules/kye-miniapp-waybill/src/`，**禁止**改 `waybill-build/` |
| 后端仍下发 `goodsTypeFiles` | 无影响（前端不再消费用于渲染） | 无需处理 |
| 「重新导出」仍可能携带托寄物资料 | 测试可能提 bug | 有意为之，PRD 未涉及。见 N1，按该表向测试说明两条路径性质 |

**核心 trade-off**：可逆性 vs 代码整洁。本次选可逆性 —— 需求是「隐藏」而非「下线」，产品未来恢复的可能性不低（客户端侧同样只是隐藏），且注释式改动的 review 成本和回归风险都显著更低。

**范围 trade-off**：严格按 PRD 边界执行，不主动扩展到「重新导出」。代价是留下一处已知的隐形勾选表现；收益是改动面可控、不替产品做隐含决策，且该表现已被记录，测试提出时有据可依。

## 注意事项（已知但本次不处理）

> 原则：**PRD 未写的不做调整**，等产品明确提出需求再说。

### N1：「重新导出」链路仍可能携带托寄物资料（`150`）

| 路径 | 触发条件 | 行为 | 前端可否干预 | 本次 |
|---|---|---|---|---|
| A：重新配置后导出 | `exportStatus === 3` | `getExportRequest` 取回原 `types` → 跳导出页 `onMounted` 回填 | 可（约 1 行） | 不做 |
| B：直接重试 | 其他状态 | `downloadRetryTask({ mobileExportId })`，后端沿用原 `types` 重跑 | 不可 | 不做 |

**路径 A 已知表现**：历史 `types` 含 `150` 时回填进选中数组，界面无对应 checkbox → 隐形勾选（不可见却会提交）；`isRestartExport = true` 使全部 checkbox disabled，用户无法手动取消；`waybillMaterialCheckAll` 长度判断因多一值而错位。

**路径 B**：前端完全不经手 `types`，需后端配合才能过滤。

**后续若产品提出需求**：路径 A 在 `onMounted` 回填处加 `.filter((item) => Number(item) !== 150)` 即可（详见 D5）；路径 B 需提后端。

### N2：`goods-type-files` 页面成为孤岛

入口移除后该页不可达，页面代码与子包注册均保留（详见 D7）。

### N3：「保存至手机相册」黑名单残留 `150`

`onSetWaybillExportTypeList` 的 `['20','100','110','130','150']` 中 `150` 永不命中，保持原样（详见 D6）。该函数上方注释本就未同步 `130`/`150`，属存量问题。

## Migration Plan

无数据迁移、无接口变更、无灰度需求（禅道「灰度计划」为空）。

发布即生效。历史导出记录、进行中的导出任务均不受影响（后端逻辑未变）。

## Open Questions

| 问题 | 现状处理 |
|---|---|
| 「重新导出」历史记录是否应剔除托寄物资料？ | 本次不处理（N1）。需产品明确：重放历史记录时静默少一项是否符合预期 |
