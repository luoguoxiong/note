# TY255891 查件列表页底部品牌logo 技术设计

## Context

- 查件列表真实实现位于 waybill 子仓库 `src/components/waybill-search/index.vue`（主应用经 `@modules/waybill-build` 别名异步引入 `PageWaybillSearch`），列表由 `ky-list-virtual`（@kye-netc/kye-miniui 0.3.5）驱动，数据经 `listFetch(page)` 返回 `{ data, total }`，`rowTotal` 即运单总条数。
- `ky-list-virtual` 内部维护 `finished` 状态（`items.length >= total` 时置 true），`#finished` 插槽**仅在全部数据加载完成后渲染**；加载中 / 还有下一页时不渲染。
- 寄件页底部品牌标识为公共组件 `@/public/components/base/footer` → `Logo`（148×48 整图，含 KYE 图形标 + 95324），查件页应复用同一图片资源保持视觉一致。
- 工作区已有一份未提交的半成品草稿：`#finished` 内 `logo-search`（rowTotal>1）+ 列表外 `logo-bottom`（rowTotal===1），为文档流方案，不满足"贴底"要求，需重写。

## Goals / Non-Goals

**Goals:**

- 品牌标识贴底固定展示（fixed），KYE 图形标 + 95324 整图横向居中
- 有数据且全部加载完 → 展示；加载中 / 还有下一页 → 隐藏
- 列表底部加高，滚动到底时「可筛选…去筛选」与 logo 上下共同展示不遮挡
- 空态、获取专属服务方案页不展示
- 微信 / APP(H5) / 支付宝 / 企微 / PC 各端一致

**Non-Goals:**

- 顶部标题样式优化（本次确认不做）
- 查件业务逻辑、页面配置、埋点改动
- 后端接口改动（仅复用现有 `rowTotal`）

## Decisions

### D1：logo 固定元素放在 `#finished` 插槽内，样式 `position: fixed` 贴底

```text
ky-list-virtual
├─ #beforeContent   顶部提示
├─ #default         运单卡片（虚拟列表）
├─ #empty           空态（不加 logo）
└─ #finished        ── finished=true 才渲染 ──
   ├─ 「可筛选查询近1年内运单 去筛选>」（padding-bottom 加高，露出贴底层）
   └─ .brand-logo-fixed（position: fixed; bottom: 0; v-if="rowTotal > 0"）
```

- **为什么**：`#finished` 的渲染时机（仅全部加载完）天然实现「加载中/有下一页隐藏」，无需在 `listFetch` 周边自维护 `loadingMore`/`allLoaded` 状态及多处 `init()` 重置点（组件内有 4 处 `init()` 调用、1 处 `allData` 清空），改动收敛在 template + scss。
- **为什么 fixed 在 scroll-view 插槽内可行**：微信小程序 / H5 / 支付宝中 `position: fixed` 元素相对视口定位，不受 scroll-view 滚动影响（业界通用做法，项目内 `search_go_top` 回顶按钮同为 fixed）。
- **替代方案（否决）**：logo 放在 `ky-list-virtual` 兄弟节点、自维护 `allLoaded/loadingMore` 状态 —— 状态重置点分散（init/刷新/tab 切换/筛选变更），出错面大，不符合最小改动原则。

### D2：展示条件收敛为 `rowTotal > 0`，删除草稿的 rowTotal===1 分支

草稿用 `rowTotal===1`（列表外贴底）/ `rowTotal>1`（流内）区分，是对"列表过短滚不到底"的绕路实现。统一 fixed 方案后：无论数据多少条，finished 且有数据即贴底展示，逻辑单一路径。

### D3：图片资源沿用寄件页 Footer 同款整图

`https://ic-img.ky-express.com/netc/20250719_43690_!!1752909576195_148_48.png`（148×48，KYE 图形标 + 95324 合一图）。不拆分文本拼接，保证与寄件页像素级一致，无需新增资源。

### D4：列表底部加高方式

给 `#finished` 区域容器增加 `padding-bottom`（预留 logo 高度 48px + 上下间距，约 150px，含 iPhone 安全区余量），使「可筛选…去筛选」提示上移，不被贴底 logo 遮挡。空态/加载中不渲染该区域，无副作用。

### D5：清理草稿代码

删除工作区草稿的 `logo-search`、`logo-bottom`、`.list-bottom` 及 `rowTotal===1` 分支模板；保留 `rowTotal` ref（`listFetch` 内赋值，本方案仍需它做空态判断）。

## Risks / Trade-offs

- [fixed 在个别端 scroll-view 内表现异常（如老版本支付宝）] → 多端验收清单覆盖微信/APP/支付宝/企微/PC；若发现定位异常，降级方案为 D-替代：logo 移至列表容器兄弟节点 + `#finished` 渲染时机改由 `finished` 事件/状态驱动（预留 tasks 验证项）
- [`#finished` 在空态（0 条）也会渲染（items.length>=total 即 0>=0）] → logo 加 `v-if="rowTotal > 0"` 兜底；「可筛选…去筛选」提示在空态的展示为现有行为，不在本次范围
- [贴底 logo 遮挡最后一张卡片操作按钮] → 通过 D4 的 padding-bottom 加高规避；走查重点验证
- [PC 端（PC微信/PC企微）宽屏下贴底观感] → logo 横向居中固定宽度 148px，与寄件页一致，不做宽屏特化
- [图片加载失败] → 与寄件页 Footer 同风险同表现（lazy image 容错），不单独处理

## Migration Plan

- 纯前端 UI 改动，按周迭代生产灰度放量节奏发布，无数据迁移、无开关（走查类 UI 需求，与寄件页同款元素，回滚即还原代码）。
- 发布前多端走查清单见 tasks.md。

## Open Questions

- 设计稿（Pixso，密码 lx3M）中 logo 具体间距/背景与现用整图若有出入，以设计稿走查为准微调 scss 常量（不影响结构）。
