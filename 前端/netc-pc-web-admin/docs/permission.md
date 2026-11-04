# 权限说明文档

> 适用项目：`netc-pc-web-admin`（新 PC 基座）
> 权限方案对齐老项目 `netc-pc-web` 的守卫逻辑（`routerGuard.js` / `configOrderPermission.js`），但采用 vue-router 4 + Pinia 实现。

## 一、体系概述

本项目采用「**静态全量路由注册 + 全局守卫拦截**」的权限架构，不做动态路由注入（addRoute）。权限判断的基准是后端 `queryAreaMenuList` 接口按用户身份过滤后返回的 `menuCode` 集合——**能出现在接口返回或 localStorage 缓存里的菜单，即代表该用户有权限**。

权限体系由四部分组成：

| 模块         | 职责                                       | 核心文件                                     |
| ------------ | ------------------------------------------ | -------------------------------------------- |
| 权限数据源   | 拉取/缓存菜单，产出 `menuCodes` 集合       | `src/stores/lightapp.ts`                     |
| 权限 store   | 汇聚权限判断入口 `hasAuth()`、拦截弹窗状态 | `src/stores/permission.ts`                   |
| 全局路由守卫 | 登录/绑码/下单权限/menuCode 校验管道（按需阻塞 + 超时降级） | `src/router/guard.ts`                        |
| 拦截反馈弹窗 | 无权限/未绑码/无下单权限三种场景弹窗       | `src/components/permission-dialog/index.vue` |

## 二、权限数据源（lightapp store）

`src/stores/lightapp.ts` 负责菜单数据，权限消费的关键字段：

- `serverMenus`：**仅来源于「localStorage 缓存 / 接口成功」**的侧边栏菜单数据。接口失败时的本地兜底数据（`defaultData`）不写入此字段，因此不参与权限判断（防 mock 越权）。
- `serverMenuCodes`：`serverMenus` 拍平后的 `menuCode` 集合（`Set<string>`，含子菜单递归）。
- `isServerMenuReady`：权限元数据可用性标记。加载过缓存或接口成功返回过即为 `true`；fallback 兜底不置位。

数据加载策略：

1. `init()` 优先从 localStorage（key：`lightAppCache`）加载缓存，页面秒显；
2. 同时发起接口 `queryAreaMenuList`（按区域码取侧边栏区域 `A3003`）刷新数据，成功后覆盖缓存并写入 localStorage；
3. 接口失败时使用本地 `defaultData` 兜底展示菜单，但**不写缓存、不更新 `serverMenus`**，下次仍尝试请求接口。

## 三、全局路由守卫（guard.ts）

`src/router/guard.ts` 在 `main.ts` 中通过 `setupRouterGuard(router)` 注册，使用 vue-router 4 返回值式导航（`return true / false / route`），不用 `next()` 回调。

拦截结果统一为「**当前页弹窗**」：

- 站内导航被拒：`return false` 留在原页 + 弹窗提示；
- 首次导航（直接 URL 进入）：无原页可停留，落回首页 `/admin/home` + 弹窗。

### 守卫校验管道

```
resolveNavigation(to, from)
├── ① 免登录白名单校验（WHITE_LIST 精确匹配 name/path，目前仅 notFound；或 meta.anonymous）→ 放行
├── ② 登录校验：无 token → return false 中止导航（跳登录页逻辑为注释预留，暂未启用）
├── ③ 按需阻塞 + 超时降级（首屏提速核心）：
│      仅 await 当前路由所需数据——需绑码/下单权限 → userStore.init，声明 auth → permissionStore.init；
│      无任何权限标记的路由（如首页）零接口阻塞直接放行；
│      等待上限 INIT_TIMEOUT = 3s，超时视为「数据不可用」降级；
│      未被当前路由依赖的数据后台预热（store 内单例保护，供页面组件复用）
├── ③' 用户数据不可用（接口超时/失败）：放行 + 告警埋点 reason=userDataTimeout
│      （跳过 ④⑤ 拦截判定，避免数据缺失导致误拦；后端接口仍有鉴权兜底）
├── ④ 绑码校验：meta.requireCustomerCode 且未绑客户编码 → 拉绑码关系 → 未绑码弹窗
├── ⑤ 下单权限校验：meta.requireOrderPermission → loadOrderTips() → 拦截弹窗
├── ⑥ 权限声明解析：resolveAuth（meta.auth 静态码 / meta.authParam 从 param 取）
│      未声明权限 → 登录即可访问，放行
├── ⑦ 权限元数据可用性：!isAuthDataReady → 放行 + 告警埋点（可用性优先，后端仍有鉴权兜底）
└── ⑧ 权限校验：!hasAuth(auth) → 弹窗提示（站内留原页 / 首次导航落首页）
```

### 关键设计说明

1. **白名单精确匹配**：一律按 `name` 或完整 `path` 精确匹配，禁用 `startsWith` 前缀匹配。
2. **首次导航补偿**：vue-router 在 `app.use(router)` 时即同步触发初始导航并收集守卫快照，而 `createMicroMainApp` 内部已 `app.use(router)`（早于本模块注册），直接 URL 进入的首次导航不会经过 `beforeEach`。故 `router.isReady()` 后对当前路由再执行一次校验兜底（幂等，重复执行结论不变）。
3. **可用性优先降级**：菜单接口失败且无缓存（`isAuthDataReady === false`）时选择放行并上报埋点，因为菜单都打不开时阻断全部页面代价更高，后端接口仍有鉴权兜底。用户数据超时/失败（③'）同理降级放行。
4. **微前端追加式注册**：守卫与 `createMicroMainApp` 内部守卫（子应用按需加载）按注册顺序先后执行。
5. **按需阻塞 + 超时降级**：守卫只等待当前路由真正需要的数据（上限 3s），无权限标记的路由零接口阻塞；`main.ts` 另有**启动预热**——不等守卫/页面挂载，尽早并行发起用户信息与菜单接口（store 单例与缓存保护，守卫复用同一请求结果，不重复请求）。

## 四、路由 meta 权限配置

类型定义见 `src/router/types.ts`（已通过 `declare module 'vue-router'` 扩展 `RouteMeta` 类型）。

| 字段                     | 类型                 | 说明                                                                        |
| ------------------------ | -------------------- | --------------------------------------------------------------------------- |
| `auth`                   | `string \| string[]` | 所需权限码（menuCode 或权限码）；数组 = 任一满足；**不配置 = 登录即可访问** |
| `authParam`              | `string`             | 从路由 param 动态取权限码（适用于动态路由）                                 |
| `anonymous`              | `boolean`            | 免登录路由（如 403、登录中转页）                                            |
| `requireCustomerCode`    | `boolean`            | 需绑定客户编码才能访问                                                      |
| `requireOrderPermission` | `boolean`            | 需下单权限（getOrderTips 校验）                                             |

### 配置示例

```ts
// 1. 静态权限码：menuCode 对齐菜单接口返回
// 现网真实示例（internal/index.ts 权限拦截测试路由，M9999 不存在于任何菜单配置，访问必被拦截）：
{
  name: 'permissionDeny',
  path: '/admin/permission-deny',
  meta: {
    auth: 'M9999',
  },
}

// 2. 数组 = 任一满足
meta: { auth: ['M3063', 'M6662'] }

// 3. 动态路由：:code 即 menuCode，从 param 取权限码
{
  name: 'iframe-code',
  path: '/admin/iframe/:code',
  meta: { authParam: 'code' }, // 菜单存在即有权限，防 URL 手输绕过
}

// 4. 绑码路由
meta: { requireCustomerCode: true }

// 5. 下单权限路由（可独立于 auth 单独配置）
meta: { requireOrderPermission: true }

// 6. 免登录路由
meta: { anonymous: true }
```

路由文件组织：`src/router/admin.ts` 汇总三类子路由——`internal`（基座内部页面）、`iframe`（iframe 嵌入页）、`micro-app`（微前端子应用）。

## 五、页面/组件级权限判断

`permission store` 提供 `hasAuth()` 方法，支持单个或数组（任一命中）：

```ts
const permissionStore = usePermissionStore()

// 单个权限码
if (permissionStore.hasAuth('M3063')) { ... }

// 数组：任一满足即通过
if (permissionStore.hasAuth(['M3063', 'M6662'])) { ... }
```

判断依据 = `menuCodes`（菜单接口下发的 menuCode 集合）∪ `authCodes`（预留的独立权限码接口，首期为空）。未来若接入独立按钮/功能权限码接口，在 `permission.ts` 的 `init()` 中并行请求填充 `authCodes` 即可。

## 六、无权限拦截反馈（PermissionDialog）

全局唯一弹窗组件，在 `App.vue` 根组件挂载（`<PermissionDialog />`），由路由守卫经 `permissionStore.openPermissionDialog(type, target)` 触发。三种场景（`PermissionDialogType`）：

### 1. `auth`：无访问权限

- 文案：`您没有访问「{target}」页面的权限，如需开通请联系管理员`（target 为被拦截路由 fullPath）
- 操作：单按钮「我知道了」

### 2. `customerCode`：未绑定客户编码

对齐老项目 `bindCodeClientConfirm`，文案由后端直出（`getBindInfo.tips`），按 `clientType / hasBusiness / oldCustomer` 分四种场景：

| 场景              | 判定条件                              | 主按钮       | 次按钮                     |
| ----------------- | ------------------------------------- | ------------ | -------------------------- |
| A 换客商          | `clientType === CHANGE_CUSTOMER_CODE` | 去切换       | -                          |
| B 有商务          | `hasBusiness`                         | 去绑码       | 联系商务（拉起浮层不跳转） |
| C 老客-未匹配商务 | `oldCustomer && !hasBusiness`         | 去绑码       | 申请专属商务               |
| D 新客-未匹配商务 | 其余（含数据缺失兜底）                | 申请专属商务 | 去绑码                     |

绑码关系数据 `getAppUserRelationAuth()` 每次拦截都重新拉取（用户可能刚发起过申请，状态会变化），并发时去重。

### 3. `order`：无下单权限

对齐老项目 `orderPermissionGuardV2`，见下节。

## 七、下单权限（两层校验）

`meta.requireOrderPermission` 路由进入时由 `permissionStore.loadOrderTips()` 执行两层校验，独立于 menuCode 权限：

**第一层：报废/拉黑预检**（`allowToOrderTip` 非空即拦截）

客户级（`queryCustomerInfo`）与用户级（用户信息）的 `allowToOrderFlag` 均 `!== '10'` 且有 tip（`allowToOrderTip`）→ 拦截，弹窗单按钮「我知道了」。

**第二层：下单权限校验**（`getOrderTips`）

`checkResultList[0].blockedFlag === true` → 拦截。按 `extraData.haveApply` 细分：

- 未申请（`extraData.haveApply.haveApply === '10'`）：弹「立即申请」+「取消」，点击申请调用 `applyOrderPermission(customerCode, phone)`，成功提示「申请成功，等待{authPersonName}审核」；
- 审核中/其他：单按钮「我知道了」。

> 注意：每次进入 `requireOrderPermission` 路由都重新拉取（权限状态会变化）；接口失败不阻塞导航（对齐老项目容错策略）。`queryCustomerInfo` 按客户编码缓存。

## 八、埋点

守卫与弹窗的上报均走 `window.$umpOtherReport`，失败不影响导航：

| 事件                                        | 触发点                                                       |
| ------------------------------------------- | ------------------------------------------------------------ |
| `other_router_guard_forbidden_v1`           | 绑码拦截（reason=customerCode）/ 权限拦截（携带 path、auth） |
| `other_router_guard_order_forbidden_v1`     | 下单权限拦截                                                 |
| `other_router_guard_auth_unavailable_v1`    | 权限元数据不可用降级放行 / 用户数据超时降级放行（reason=userDataTimeout） |
| `other_permission_dialog_reach_v1`          | 拦截弹窗曝光（携带 type、target、scenario）                  |
| `clk_customer_code_bind_Recommended_botton` | 未绑码弹窗按钮点击                                           |

## 九、新增页面接入权限指南

1. **确定权限码**：与后端确认页面对应的菜单 `menuCode`（需在 `queryAreaMenuList` 中配置下发）。
2. **配置路由 meta**：在 `src/router/internal|iframe|micro-app` 对应文件中给路由加 `meta.auth`；动态路由用 `meta.authParam`。
3. **不配权限**：若页面登录即可访问，无需任何 meta。
4. **特殊路由**：需绑码加 `requireCustomerCode: true`；需下单权限加 `requireOrderPermission: true`。
5. **页面内按钮级控制**（可选）：使用 `permissionStore.hasAuth(code)` 控制显隐/禁用。
6. **验证**：
   - 直接 URL 访问应被拦截弹窗（首次导航落首页）；
   - 站内菜单点击被拒时留在原页 + 弹窗；
   - 项目内置三个权限验证路由（`src/router/internal/index.ts`）：`/admin/permission-deny`（auth: M9999，访问必拦截）、`/admin/permission-bindcode`（requireCustomerCode）、`/admin/order-permission-test`（requireOrderPermission）；
   - 开发环境可配合 mock（`web.lightApplication.getApplicationInfoListByArea.js`）增删菜单验证。

## 十、关键文件索引

| 文件                                                        | 说明                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `src/router/guard.ts`                                       | 全局守卫：校验管道（按需阻塞 + 超时降级）+ 首次导航补偿    |
| `src/router/types.ts`                                       | 路由 meta 权限字段类型定义（扩展 RouteMeta）               |
| `src/router/admin.ts`                                       | 路由汇总入口（internal / iframe / micro-app）              |
| `src/stores/permission.ts`                                  | 权限 store：hasAuth / 弹窗状态 / 绑码与下单权限数据        |
| `src/stores/lightapp.ts`                                    | 菜单数据源：serverMenuCodes / isServerMenuReady / 缓存策略 |
| `src/stores/user.ts`                                        | 用户 store：currentCustomerCode / allowToOrderFlag         |
| `src/components/permission-dialog/index.vue`                | 全局拦截弹窗（三场景）                                     |
| `src/App.vue`                                               | 根组件：挂载 PermissionDialog                              |
| `src/main.ts`                                               | 守卫注册（setupRouterGuard）+ 启动预热                     |
| `src/utils/auth.ts`                                         | token 存取（sessionStorage）                               |
| `mock/web.lightApplication.getApplicationInfoListByArea.js` | 开发环境菜单 mock（权限测试分组）                          |
