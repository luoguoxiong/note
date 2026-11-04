# Tasks: address-book 迁移至 order-build-sub-pages

## Overview

将 `address-book` 的 `page`/`sender`/`receive` 及依赖（`components`/`report`/`constants`/`types`）从主包 `kye-miniapp-order` 迁移至子包 `order-build-sub-pages`：用源覆盖过期副本、切换页面注册、更新 3 处引用路径。严格只迁 `address-book`，不动 sender/receive 顶层模块。

---

## Phase 0: 准备与确认

- [x] **T-0.1** 通读 `.agents/rules/` 项目规则（03 目录结构、06 组件规范、08 路由规范、09 样式规范）
- [x] **T-0.2** 确认 `order-build-sub-pages/order-public/components/business/address-book/` 副本存在且过期（page/index.vue 缺 `handleOutClick`、sender/index.vue 缺 `clickParent`）
- [x] **T-0.3** Grep 确认引用范围：发现 6 处需更新（3 处主包外部 + 3 处 sub-pages 内部，含 reportUmp 与 useValidate）

---

## Phase 1: 用源覆盖 sub-pages 过期副本

> 覆盖范围：`page`/`sender`/`receive`/`components`/`report`/`constants.ts`/`types.ts`/`index.vue`
> **不动**：`share-page/`、`clear-addr/`、`readme.md`（sub-pages 专有）

- [x] **T-1.1** 覆盖 `page/` 目录全部文件（index.vue、index.config.ts、index.scss、hooks/_、report/_）
- [x] **T-1.2** 覆盖 `sender/` 目录全部文件（index.vue、index.config.ts、index.scss、hooks/\*）
- [x] **T-1.3** 覆盖 `receive/` 目录全部文件（index.vue、index.config.ts、index.scss、hooks/\*）
- [x] **T-1.4** 覆盖 `components/` 目录全部文件（search、list、tab、skeleton、loading、footer、empty、clear-addr-popup、add-address-label、edit-address-label 及其 report、scss）
- [x] **T-1.5** 覆盖 `report/index.ts`、`constants.ts`、`types.ts`、`index.vue`
- [x] **T-1.6** 覆盖后检查 `@order-public/` 等别名 import 是否指向 sub-pages 自身 order-public（与已迁移的 share-page/clear-addr 保持一致）→ 53 文件扫描，33 文件替换 `@order-public/`→`@order-public-sub-public/`、`@order-global-package-order/`→`@order-global-package-order-sub/`，验证无残留

---

## Phase 2: 页面注册切换

- [x] **T-2.1** `src/wx.config.ts`：`order-build-sub-pages` root pages 数组新增 3 行
  - `'order-public/components/business/address-book/page/index'`
  - `'order-public/components/business/address-book/sender/index'`
  - `'order-public/components/business/address-book/receive/index'`
- [x] **T-2.2** `src/alipay.config.ts`：同步新增上述 3 行（与 wx.config.ts 对齐）
- [x] **T-2.3** `src/modules/kye-miniapp-order/src/app.config.ts`：注释掉 3 行注册
  - `// 'order-public/components/business/address-book/page/index'`
  - `// 'order-public/components/business/address-book/sender/index'`
  - `// 'order-public/components/business/address-book/receive/index'`

---

## Phase 3: 引用路径更新（6 处）

> T-0.3 发现 sub-pages 包内部还有 3 个文件引用旧 `order-build/...` 路径，迁移后会导致校验/埋点失效，必须一并更新。

### 主包外部引用（3 处）

- [x] **T-3.1** `src/modules/freight-time/components/sendAndReceive/index.vue` 第 110 行：
  - `navigateTo` URL 从 `/modules/order-build/order-public/components/business/address-book/page/index` 改为 `/modules/order-build-sub-pages/order-public/components/business/address-book/page/index`
- [x] **T-3.2** `src/modules/freight-time/report/index.ts` 第 181 行：
  - codeMap key 从 `modules/order-build/order-public/components/business/address-book/page/index` 改为 `modules/order-build-sub-pages/order-public/components/business/address-book/page/index`
- [x] **T-3.3** `src/modules/order-global-package/report/index.ts` 第 384 行：
  - codeMap key 从 `modules/order-build/order-public/components/business/address-book/page/index` 改为 `modules/order-build-sub-pages/order-public/components/business/address-book/page/index`

### sub-pages 包内部引用（3 处，迁移后 route.name 变为 order-build-sub-pages）

- [x] **T-3.4** `src/modules/order-build-sub-pages/order-public/reportUmp/util/index.ts` 第 192/194/196 行：
  - sender/receive/clear-addr 三个 key 从 `modules/order-build/...` 改为 `modules/order-build-sub-pages/...`
  - 注：clear-addr key 是 clear-addr 迁移时遗留的预存 bug（clear-addr 已在 sub-pages 但 key 仍指向 order-build），本次顺手修正
- [x] **T-3.5** `src/modules/order-build-sub-pages/order-public/hooks/address/sender/useValidate.ts` 第 85/136/238 行：
  - `route.name === 'modules/order-build/.../address-book/sender/index'` 改为 `modules/order-build-sub-pages/...`（3 处，`===` 精确匹配）
- [x] **T-3.6** `src/modules/order-build-sub-pages/order-public/hooks/address/receive/useValidate.ts` 第 99/163/313 行：
  - `route?.name === 'modules/order-build/.../address-book/receive/index'` 改为 `modules/order-build-sub-pages/...`（3 处，`===` 精确匹配）

---

## Phase 4: 构建验证

- [ ] **T-4.1** `npm run build:wx:uat` 构建成功，无报错
  > 环境限制：当前 Node v14.16.0 不满足 Taro CLI 要求（需 14.18+），nvm 切换被沙箱阻止。需用户在本地切换 Node 18 后运行。
  > 已做静态验证：GetDiagnostics 无 TS/语言错误。
- [ ] **T-4.2** 确认 `order-build-sub-pages` 子包体积未超 2MB
  > 依赖 T-4.1 构建产物
- [ ] **T-4.3** 确认 `subpackages.ts` 自动生成文件中 address-book 3 页面出现在 order-build-sub-pages root 下
  > 依赖 T-4.1 构建产物

---

## Phase 5: 功能验证（开发者工具 / 真机）

> 重点验证历史 Bug 是否自愈：编辑页滚动、管理标签点击

- [ ] **T-5.1** freight-time 寄件地址簿入口：点击「地址簿」跳转到列表页，页面正常展示
- [ ] **T-5.2** freight-time 收件地址簿入口：同上
- [ ] **T-5.3** 地址簿列表页：Tab 切换（全部/寄件/收件/共享）、搜索、列表滚动正常
- [ ] **T-5.4** 寄件编辑页（sender）：页面可滚动（历史 Bug 验证）、智能识别、信息录入、地图定位正常
- [ ] **T-5.5** 收件编辑页（receive）：同上
- [ ] **T-5.6** 管理标签点击有响应（历史 Bug 验证）：进入管理态、选择、删除/批量操作正常
- [ ] **T-5.7** 控制台无报错、无 navigateTo fail

---

## Phase 6: 二阶段（验证通过后执行，本次不实施）

- [ ] **T-6.1** 删除源目录 `kye-miniapp-order/src/order-public/components/business/address-book/`（仅保留已被注释的 app.config.ts 行可一并清理）
- [ ] **T-6.2** 重新构建，确认 order-build 体积减少、order-build-sub-pages 体积合规
- [ ] **T-6.3** 回归验证地址簿功能

---

## 任务统计

| Phase    | 任务数 | 本次实施               |
| -------- | ------ | ---------------------- |
| Phase 0  | 3      | ✓                      |
| Phase 1  | 6      | ✓                      |
| Phase 2  | 3      | ✓                      |
| Phase 3  | 6      | ✓                      |
| Phase 4  | 3      | ✓                      |
| Phase 5  | 7      | ✓（需真机/开发者工具） |
| Phase 6  | 3      | ✗（二阶段）            |
| **总计** | **31** | **28 实施 + 3 二阶段** |
