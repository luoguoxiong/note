## MODIFIED Requirements

### Requirement: 地址簿页面注册
系统 SHALL 在 `order-build-sub-pages` 子包注册地址簿列表页、寄件编辑页、收件编辑页，并在主包 `order-build` 注释掉对应注册，使地址簿页面从子包加载。

#### Scenario: 子包页面注册
- **WHEN** 构建 weapp/alipay 产物
- **THEN** `wx.config.ts` 与 `alipay.config.ts` 的 `order-build-sub-pages` root pages 数组包含 `order-public/components/business/address-book/page/index`、`order-public/components/business/address-book/sender/index`、`order-public/components/business/address-book/receive/index`

#### Scenario: 主包注册移除
- **WHEN** 读取 `kye-miniapp-order/src/app.config.ts`
- **THEN** `address-book/page/index`、`address-book/sender/index`、`address-book/receive/index` 三行被注释，不再作为主包页面注册

### Requirement: 地址簿副本与源一致
系统 SHALL 用 `kye-miniapp-order/src/order-public/components/business/address-book/` 源文件覆盖 `order-build-sub-pages/order-public/components/business/address-book/` 下的过期副本，确保子包加载的是最新逻辑。

#### Scenario: page/index.vue 一致
- **WHEN** 对比源与 sub-pages 副本的 `page/index.vue`
- **THEN** 两者内容一致，含 `handleOutClick`、`handleUnLoginHandler`、`addr-l` class、`addr-b-p` class、navbar 注释

#### Scenario: sender/index.vue 一致
- **WHEN** 对比源与 sub-pages 副本的 `sender/index.vue`
- **THEN** 两者内容一致，含 `@click="clickParent"`、navbar 注释

#### Scenario: share-page 与 clear-addr 不被覆盖
- **WHEN** 覆盖完成后检查 sub-pages 的 `share-page/` 与 `clear-addr/`
- **THEN** 两目录保持原有内容不变

### Requirement: 引用路径指向子包
系统 SHALL 将所有指向 `order-build/order-public/components/business/address-book/page/index` 的全路径引用更新为 `order-build-sub-pages/...`。

#### Scenario: navigateTo 路径更新
- **WHEN** `freight-time/components/sendAndReceive/index.vue` 调用 `Taro.navigateTo` 打开地址簿
- **THEN** URL 为 `/modules/order-build-sub-pages/order-public/components/business/address-book/page/index`

#### Scenario: 埋点 page_code 映射更新
- **WHEN** `freight-time/report/index.ts` 与 `order-global-package/report/index.ts` 的 `getPageCode` 匹配当前页路径
- **THEN** codeMap key 为 `modules/order-build-sub-pages/order-public/components/business/address-book/page/index`，命中后返回 `page_express_single_address_book_v1`

#### Scenario: 权限白名单无需改动
- **WHEN** `order-global-package/validate/pageConfig.ts` 用 `path.indexOf(key)` 匹配当前页
- **THEN** `address-book/page/index`、`address-book/sender/index`、`address-book/receive/index`、`/address-book/clear-addr/index` 对 order-build 与 order-build-sub-pages 路径均能命中，返回的 dialog_root class 不变

### Requirement: 历史 Bug 自愈
系统 SHALL 通过用源覆盖过期副本，使编辑页滚动与管理标签点击恢复正常。

#### Scenario: 编辑页可滚动
- **WHEN** 用户进入寄件/收件编辑页并尝试滚动
- **THEN** 页面内容可正常滚动（历史 Bug：不能滚动）

#### Scenario: 管理标签点击有响应
- **WHEN** 用户在地址簿列表页点击管理标签
- **THEN** 进入管理态，显示选择框与批量操作栏（历史 Bug：点击无响应）

### Requirement: 迁移范围隔离
系统 SHALL 仅迁移 `address-book` 目录，不迁移 sender/receive 顶层模块的 `address-page` 编辑页。

#### Scenario: address-page 保留在主包
- **WHEN** 读取 `kye-miniapp-order/src/app.config.ts`
- **THEN** `order-public/components/business/sender/page/address-page/index` 与 `order-public/components/business/receive/page/address-page/index` 仍正常注册在主包，未被注释
