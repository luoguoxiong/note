## Context

`address-book`（地址簿）模块位于 `kye-miniapp-order/src/order-public/components/business/address-book/`，含：

- `page/index.vue` — 地址簿列表页（Tab 切换、搜索、列表、底部操作）
- `sender/index.vue` — 寄件地址编辑页（智能识别、信息录入、地图定位）
- `receive/index.vue` — 收件地址编辑页（同上）
- `components/` — 子组件（search、list、tab、skeleton、loading、footer、empty、clear-addr-popup）
- `report/index.ts` — 埋点上报
- `constants.ts` / `types.ts` — 常量与类型
- `clear-addr/` — 已迁至 sub-pages 并注册（不在本次范围）
- 无 `share-page/` — 已迁至 sub-pages 并注册（不在本次范围）

`order-build-sub-pages/order-public/components/business/address-book/` 已存在完整副本（含 `share-page`、`clear-addr`），但 `page`/`sender`/`receive`/`components`/`report` 等为**过期副本**：

- `page/index.vue`：副本缺少 `@click="handleOutClick"`、`handleUnLoginHandler`、`addr-l` class、`addr-b-p` class、`showSubTabFooter`/`showShareFooterManage` 逻辑；navbar 仍启用而源已注释。
- `sender/index.vue`：副本缺少 `@click="clickParent"`；navbar 仍启用而源已注释。

构建插件 `@kye-netc/miniapp-plugins` 在 `onBuildStart` 把 `kye-miniapp-order/src` 整体复制到 `order-build`，把 `order-global-package` 复制到 `includesOrderPublicDir` 各子包下的 `order-global-package/`。`order-build-sub-pages` 为独立子包目录，其下文件不被构建插件覆盖（非 `buildName` 目标）。

## Goals / Non-Goals

**Goals:**

- 将 `address-book` 的 `page`/`sender`/`receive` 及依赖（`components`/`report`/`constants`/`types`）从主包迁至 `order-build-sub-pages`。
- 用源覆盖 sub-pages 过期副本，修正历史 Bug（编辑页滚动、管理标签点击）。
- 完成路由注册切换与 3 处引用路径更新。
- 严格只迁 `address-book`，不动 sender/receive 顶层模块的 `address-page`。

**Non-Goals:**

- 不删除源目录（保留以降低风险，体积收益在二阶段落地）。
- 不修改 `share-page/`、`clear-addr/`（已迁移且注册生效）。
- 不迁移 `sender/page/address-page/index`、`receive/page/address-page/index`（非 address-book）。
- 不修改 `order-global-package/validate/pageConfig.ts`（相对路径 `indexOf` 匹配，新旧路径均命中）。
- 不单独排查历史 Bug（用源覆盖副本后自愈，验证清单覆盖即可）。

## Decisions

### D1: 用源覆盖副本，而非在副本上增量修改

- **选择**：将源 `page`/`sender`/`receive`/`components`/`report`/`constants.ts`/`types.ts`/`index.vue` 内容整体覆盖到 sub-pages 对应位置。
- **理由**：副本已过期，逐行 diff 成本高且易遗漏；源是最新且经过主包验证的版本，整体覆盖最可靠。
- **备选**：在副本上手动补 `handleOutClick` 等缺失逻辑 → 否决，diff 成本高、易出错。

### D2: 覆盖范围排除 share-page 与 clear-addr

- **选择**：覆盖时跳过 `share-page/` 与 `clear-addr/`（源中无 share-page，clear-addr 已迁移且注册生效）。
- **理由**：share-page/clear-addr 已在 sub-pages 注册生效，覆盖会引入不一致或丢失 sub-pages 专有逻辑。
- **实施**：按文件级覆盖，非整目录覆盖。

### D3: 保留源目录，app.config.ts 注释掉注册

- **选择**：保留 `kye-miniapp-order/src/order-public/components/business/address-book/` 源文件，仅在 `app.config.ts` 注释掉 `page`/`sender`/`receive` 三行注册。
- **理由**：降低风险——若 sub-pages 出现问题，取消注释即可回滚路由；删除源留待二阶段验证通过后执行。
- **权衡**：order-build 体积本次不减少（源仍被构建插件复制），但路由已切到 sub-pages，功能验证可在真实环境完成。

### D4: pageConfig.ts 不改动

- **选择**：不修改 `order-global-package/validate/pageConfig.ts`。
- **理由**：该文件用 `path.indexOf(key) > -1` 匹配，key 为相对路径（如 `address-book/page/index`）。order-build 路径 `modules/order-build/.../address-book/page/index` 与 sub-pages 路径 `modules/order-build-sub-pages/.../address-book/page/index` 均包含 `address-book/page/index`，匹配结果一致。`/address-book/clear-addr/index` 同理对两种路径均命中。
- **验证**：迁移后该文件返回的 dialog_root class 不变。

### D5: 仅 3 处引用需更新

- **选择**：仅更新 3 个文件的 `order-build` → `order-build-sub-pages` 路径：
  1. `freight-time/components/sendAndReceive/index.vue`（navigateTo URL）
  2. `freight-time/report/index.ts`（getPageCode codeMap key，全路径匹配）
  3. `order-global-package/report/index.ts`（getPageCode codeMap key，全路径匹配）
- **理由**：这两处 `getPageCode` 用全路径 key 精确匹配（`codeMap[pageName]`），路径变更后旧 key 不再命中，必须更新。`pageConfig.ts` 用 `indexOf` 相对匹配则无需改动。

### D6: alipay.config.ts 与 wx.config.ts 同步

- **选择**：`alipay.config.ts` 的 `order-build-sub-pages` root pages 数组同步新增 3 行，与 `wx.config.ts` 保持一致。
- **理由**：双端配置需对齐，避免支付宝端跳转失败。

## Risks / Trade-offs

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 体积本次不减少 | order-build 仍超体积告警 | 二阶段删除源目录落地收益；本次先验证功能 |
| sub-pages 副本覆盖后 import 路径异常 | 页面加载失败 | 覆盖后检查 `@order-public/` 等别名是否指向 sub-pages 自身 order-public |
| 历史 Bug 未自愈 | 编辑页仍不能滚动 / 管理标签无响应 | 验证清单覆盖；若未自愈则对比源与副本 diff 排查 |
| alipay/wx 配置不同步 | 某端跳转失败 | D6 同步双端配置 |
| 引用遗漏 | 某入口跳转到旧路径 404 | Grep 全量搜索 `order-build/order-public/components/business/address-book` 确认无遗漏 |
