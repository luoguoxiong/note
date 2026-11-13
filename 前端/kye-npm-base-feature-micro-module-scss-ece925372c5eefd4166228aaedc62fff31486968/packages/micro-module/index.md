# @kye-netc/micro-module

微前端库：核心层（Proxy 沙箱 + 子应用加载器 + 样式沙箱 + 共享组件）与 Vue3 适配层（`createMicroMainApp` 微前端路由器 + `registerSubApp` 子应用注册）合一，主应用/子应用一站引入。

## 安装

```bash
pnpm add @kye-netc/micro-module
```

peer 依赖：`vue ^3`、`vue-router ^4`。

## 两种入口

| 入口 | 使用方 | 内容 |
| --- | --- | --- |
| `@kye-netc/micro-module` | **主应用** | 全量 API（加载器、沙箱、微前端路由器、共享组件） |
| `@kye-netc/micro-module/sub-app` | **子应用** | 仅 `registerSubApp` / `useRemoteComponent` / publicPath / 共享组件注册 |

子应用**必须**从 `./sub-app` 引入：该入口不依赖加载器与沙箱，避免把它们拉进子应用 bundle。

## 快速开始

### 主应用

```ts
// main.ts
import { createApp } from 'vue'
import { createWebHashHistory } from 'vue-router'
import { createMicroMainApp } from '@kye-netc/micro-module'
import App from './App.vue'
import { routes } from './router'

const { app, router } = createMicroMainApp(App, {
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    // 加载失败兜底页：需自行注册该路由
    { path: '/sub-app-error', name: 'SubAppError', component: SubAppError },
  ],
  microApps: [
    {
      name: 'subApp1',
      entry: 'https://cdn.example.com/sub-app-1/',
      activeRule: '/admin/sub-app-1',
    },
  ],
  // preload: true, // 按优先级空闲时预加载
})

app.mount('#app')
```

### 子应用

```ts
// main.ts — 同一份产物支持独立运行与微前端注入两种模式
import { registerSubApp } from '@kye-netc/micro-module/sub-app'
import App from './App.vue'
import { routes } from './router'

const app = registerSubApp(
  {
    name: 'subApp1', // 必须与主应用 MicroAppConfig.name 一致
    routes,
    bootstrap: async () => { /* 一次性初始化 */ },
    mount: (container) => { /* 挂载 */ },
    unmount: () => { /* 卸载 */ },
    // 可选：共享组件，供主应用/其他子应用按需引入
    components: {
      addressBlock: () => import('./components/AddressBlock.vue'),
    },
  },
  App,
  document.getElementById('app'), // 独立运行时非空 → 走本地 createApp
)
app?.mount('#app')
```

`rootContainer` 非空视为独立运行（创建本地 app 实例）；为空视为注入模式（把生命周期 + 路由表写到 `window[name]`，供主应用拉取）。

## 微前端路由器（主应用）

### `createMicroMainApp(App, options): { app, router }`

创建基座应用 + 微前端路由器，并把 app 实例写到 `window.__MACRO_MODULE_VUEAPP__`（子应用注入模式会读取）。

`CreateMicroRouterOptions`：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `history` | `RouterHistory` | 路由 history 实例，如 `createWebHashHistory()` |
| `routes` | `RouteRecordRaw[]` | 主应用自身路由表（不含子应用路由） |
| `microApps` | `MicroAppConfig[]` | 初始子应用配置；运行时可再 `registerMicroApps` 动态注册 |
| `errorRouteName` | `string` | 加载失败错误页路由名，默认 `'SubAppError'` |
| `onError` | `(err: MicroAppLoadError) => boolean \| void` | 加载失败回调；返回 `false` 阻止默认跳错误页 |
| `preload` | `boolean` | 创建路由器后按 `priority` 升序空闲时预加载，默认 `false` |

内置行为：

- **beforeEach**：路径前缀命中（含 catch-all 重定向后的 `redirectedFrom` 回溯）→ 按需加载子应用（失败跳错误页，query 携带 `app` / `from`）→ 首次注入子应用路由后跳回原路径重匹配
- **样式隔离**：`cssSandbox` 开启时自动为注入的路由组件包裹 `micro-module-route.micro-module-xxx` 容器
- **afterEach**：进入/离开子应用命名空间时调用 `unmount`/`mount` + 沙箱 `deactivate`/`activate`

### `routeEvents`

路由变更事件总线（`EventTarget`）。子应用路由注入后派发 `routes-changed` 事件，供需要感知路由表变化的场景监听，替代轮询。

## 子应用配置 MicroAppConfig

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 必填 | 子应用唯一标识，对应 `window[name]` 上的导出名 |
| `entry` | `string \| Promise<string>` | 必填 | 入口地址（manifest 基址）；Promise 形式支持配置中心异步解析，结果缓存 |
| `activeRule` | `string` | 必填 | 激活前缀，匹配的路径触发加载/挂载 |
| `priority` | `number` | `0` | 预加载优先级，越小越早；`-1` 不参与预加载 |
| `parentRouteName` | `string` | — | 设置后子应用路由以 children 注入到该命名路由下，否则注入顶层 |
| `jsSandbox` | `boolean` | `true` | JS Proxy 沙箱；`false` 时子应用 JS 跑在真实 window |
| `cssSandbox` | `boolean` | `true` | 样式沙箱，独立于 `jsSandbox`，详见下文 |
| `chunkBasePaths` | `string[]` | — | 扩展 chunk 目录前缀（publicPath 指向 CDN 或与入口不同目录时声明）；未声明按入口 origin 兜底 |

## 加载器 API

手动控制加载 / 动态注册场景使用（`createMicroMainApp` 内部已集成）：

```ts
import {
  registerMicroApps,   // 批量注册配置（运行时注册在下一次路由切换生效）
  registerMicroApp,    // 注册单个子应用
  loadMicroApp,        // 加载：拉取 manifest → 创建沙箱 → 执行脚本 → 返回 SubAppExports
  unloadMicroApp,      // 卸载子应用
  getMicroAppExports,  // 获取子应用导出（路由表/生命周期/共享组件）
  getMicroAppSandbox,  // 获取沙箱实例（activate/deactivate）
  getMicroAppConfig,   // 按 activeRule 获取配置
  findMicroAppByPath,  // 路径前缀匹配 → activeRule
  findMicroAppByName,  // 按 name 反查 activeRule
  isMicroAppLoaded,    // 是否已加载完成
} from '@kye-netc/micro-module'
```

同一子应用并发加载自动去重；manifest 与入口资源带缓存（支持 contenthash）；脚本拉取内置 10s 超时 + 2 次重试。

## JS 沙箱

基于 `Proxy` 的 fakeWindow，隔离子应用全局变量访问：

```ts
import { ProxySandbox, execInSandbox } from '@kye-netc/micro-module'

const sandbox = new ProxySandbox('subApp1')
execInSandbox(sandbox, () => {
  window.a = 1 // 写入 fakeWindow
})
console.log(window.a) // undefined，不污染全局
```

- `sandbox.activate()` / `deactivate()`：切换子应用时恢复/冻结 sideEffect（定时器、事件监听等）
- `ensureSandboxInterceptor()`：确保 script 拦截链在位（可能被第三方覆盖时手动恢复）
- `jsSandbox: false` 时子应用 JS 在真实 window 执行，webpack 公共依赖（如 Element Plus）可直接与主应用共享实例

## 样式沙箱（cssSandbox）

默认开启。子应用 CSS 每条选择器自动加 `.micro-module-xxx` class 前缀，仅命中容器内 DOM：

```css
/* 子应用原始样式 */        /* 注入主应用后被改写为 */
.button { color: red; }  →  .micro-module-subApp1 .button { color: red; }
:root { --x: 1px; }      →  .micro-module-subApp1 { --x: 1px; }
```

用 class 而非 `micro-module[name="xxx"]` 属性选择器：Chromium 祖先匹配 bloom filter 只优化 tag/id/class，属性选择器每次样式重算都要真实遍历祖先链，大 DOM + 大 CSS 下开销显著。

**覆盖范围**（沙箱拦截链自动处理）：

- 入口 CSS 与子应用域名的异步 chunk `<link>`：拦截不插入 → fetch 下载 → `scopeCss` 改写 → 以 scoped `<style>` 插入 → 再放行子应用 JS（无未隔离窗口、无 FOUC）
- dev 模式 style-loader 动态注入的 `<style>`（拦截 `appendChild` / `insertBefore` 改写，含异步回填文本）

**改写规则**：`@media` / `@supports` / `@container` 递归改写内部规则；`@keyframes` / `@font-face` / `@import` 原样保留；`:root` / `html` / `body` 替换为容器自身；已带前缀的选择器幂等跳过（防双重前缀）。

**前提**：子应用 DOM 必须位于 `.micro-module-xxx` 容器内 —— `createMicroMainApp` 注入路由与 `useRemoteComponent` 渲染远程组件时自动包裹；自行渲染需手动提供容器。

**css-only 模式**：`jsSandbox: false` + `cssSandbox: true` 时创建仅用于样式归属的沙箱，已知限制：子应用 JS 在真实 document 上动态创建的 `<style>` 无法归属改写。

手动场景导出：`scopeCss(cssText, appName)`（改写）、`isCssSandboxEnabled(cfg)`（判定，`cssSandbox !== false` 默认开启）、`scopePrefix` / `SCOPED_ATTR`。

已知限制：Teleport 逃逸、CSSOM `insertRule`、CSS nesting 场景不被改写。

## 共享组件

子应用在 `registerSubApp({ components })` 注册组件工厂，主应用/其他子应用按需引入：

```ts
// 主应用（主入口）或子应用（./sub-app 入口）
import { useRemoteComponent } from '@kye-netc/micro-module' // 子应用侧从 '@kye-netc/micro-module/sub-app'

const AddressBlock = await useRemoteComponent({
  name: 'subApp1',       // 目标子应用名
  component: 'addressBlock', // components 映射的 key
  // scopedCSS: true,    // 默认包裹 micro-module-remote.micro-module-xxx 隔离容器
})
```

- 目标子应用未加载时**自动触发加载**；组件 chunk 从子应用自身域按需加载
- 返回的是 Vue 包装组件：attrs/slots 全透传，`defineExpose` 的属性经透传可直接通过模板 ref 读取
- `scopedCSS: false` 跳过隔离容器（目标子应用关闭样式沙箱时使用）

## publicPath（子应用）

子应用在微前端环境下运行时，资源路径需经沙箱代理修正：

```ts
// public-path.ts
import { setupPublicPath, resolvePublicPath } from '@kye-netc/micro-module/sub-app'

// 推荐：resolvePublicPath 解析后由子应用自行赋值给 __webpack_public_path__，
// webpack 编译时才能识别该自由变量
__webpack_public_path__ = resolvePublicPath()
setupPublicPath()
```

## 注意事项

- **子应用路由表必须是完整子路径**（如 `/admin/user/home`），主应用按 activeRule 前缀匹配
- **`registerSubApp` 的 `name`、`MicroAppConfig.name`、UMD 产物全局变量名**三者必须一致
- **同进程多子应用共享 `window.__NATIVE_EB__` 等 window 键时注意命名空间**；子应用 pinia store id、全局样式建议加 `name` 前缀
- **主应用 catch-all 兜底路由**（`/:pathMatch(.*)*`）会先于守卫重定向，路由器已做 `redirectedFrom` 回溯，自定义守卫需注意不要抢先 `return false`
