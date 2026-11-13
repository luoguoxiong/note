# @kye-netc/micro-native

微前端原生通信层：基座与子应用之间的**跨应用方法调用（RPC）**与**事件广播**能力，一套 API 适配四种运行环境，模式自动检测、零配置接入。

## 安装

```bash
pnpm add @kye-netc/micro-native
```

`micro-app` 模式需要 `@micro-zoe/micro-app` 作为 peer dependency；其余模式无需额外依赖。

## 运行模式

模块加载时自动检测一次，全程无需手动指定：

| 模式 | 检测条件 | 方法调用方式 | 事件/消息方式 |
| ------------ | ------------------------------------- | ------------------- | ------------------ |
| `standalone` | 独立运行（默认） | 本地注册表直接调用 | 共享 EventBus |
| `iframe` | `window.self !== window.top` | postMessage 异步 RPC | postMessage 广播 |
| `micro-app` | `window.__MICRO_APP_ENVIRONMENT__` | 共享 EventBus 同步调用 | 共享 EventBus |
| `micro-module` | `window.__MICRO_MODULE_ENVIRONMENT__` | 共享 EventBus 同步调用 | 共享 EventBus |

`standalone` / `iframe` / `micro-app` / `micro-module` 通过 `native.getMode()` 获取。

## 快速开始

### 基座侧（主应用）

```ts
import native from '@kye-netc/micro-native'

native.setAppName('base-app')

// 注册方法，供所有子应用直接调用
native.register({
  getUserInfo: (id: string) => ({ id, name: 'Alice' }),
  openModal: (title: string) => { /* ... */ },
})

// 监听子应用发来的定向消息
native.onMessage(({ fromApp, data }) => {
  console.log(`[base] 收到 ${fromApp} 的消息:`, data)
})
```

### 子应用侧

```ts
import native from '@kye-netc/micro-native'

native.setAppName('sub-app')

// 像调用本地函数一样调用基座方法，统一返回 Promise
const user = await native.getUserInfo('123')

// 向指定应用发送定向消息
native.sendMessageTo('base-app', { type: 'order-paid', orderId: '123' })
```

## 工作原理

所有应用共享一个挂在 `window.__NATIVE_EB__` 上的 EventBus（注册表 + 事件监听器）。

```
方法调用:  子应用 native.xxx() ──┬─ micro-app / micro-module → 共享注册表同步调用（无序列化）
                                 └─ iframe → postMessage → 基座执行 → postMessage 回传结果
              基座 native.xxx() ─── 本地注册表直接调用

事件广播:  基座 native.emit() ──┬─ 本地监听器
                                ├─ iframe 子应用（postMessage）
                                └─ micro-app / micro-module 子应用（共享 EventBus）

定向消息:  子应用 sendMessageTo(toApp, data) → 基座 emit('receiver-message') → 各应用 onMessage 按 appName 筛选
```

## API 参考

### 应用身份

#### `native.setAppName(name: string): void`

设置当前应用名称。

- `onMessage` 依据它筛选定向消息（不设置则接收全部消息）
- `sendMessageTo` 的 `fromApp` 字段以此为准（子应用模式自动附加）

#### `native.getAppName(): string`

获取当前应用名称。

#### `native.getMode(): NativeMode`

获取当前运行模式：`'standalone' | 'iframe' | 'micro-app' | 'micro-module'`。

### 方法调用（RPC）

#### `native.register(methods: Record<string, Function>): void`

注册一组方法。基座侧注册后即可被子应用调用；同步写入共享 EventBus。

```ts
native.register({
  getToken: () => localStorage.getItem('token'),
  fetchData: async (url: string) => (await fetch(url)).json(),
})
```

#### `native.getRegisteredMethods(): string[]`

获取已注册的方法名列表（自动过滤 `__native_` 开头的内部方法）。

#### `native.clear(): void`

清除所有已注册方法。

#### `native.methodName(...args): Promise<any>`

**任意未占用的方法名**都视为 RPC 调用（Proxy 动态分发），统一返回 Promise：

- 基座调用自己注册的方法 → 本地执行
- 子应用调用 → 自动路由到基座执行
- 方法未注册 → 返回 rejected Promise，开发环境输出一次 `console.warn`

### 定向消息

#### `native.sendMessageTo(toApp: string, data: any): void`

向指定应用发送消息（所有应用的 `onMessage` 都会收到，由各自 appName 决定是否处理）。

#### `native.onMessage(callback): () => void`

监听定向消息，返回取消监听的函数。

```ts
const unsubscribe = native.onMessage(({ fromApp, data }) => {
  console.log(`${fromApp} 发来:`, data)
})
unsubscribe()
```

筛选规则：设置了 `setAppName` 时只接收 `toApp` 匹配的消息，未设置则接收全部。

### 事件广播

#### `native.emit(event: string, ...args: any[]): void`

广播事件：先触发本地监听器，再向所有子应用（iframe 走 postMessage，micro-app / micro-module 走共享 EventBus）分发。

#### `native.addEventListener(event: string, callback: Function): void`

监听事件。micro-app / micro-module 模式下自动同步到共享 EventBus，确保能收到基座广播。

#### `native.removeEventListener(event: string, callback: Function): void`

移除监听（本地 + 共享 EventBus）。

## TypeScript 类型提示

默认情况下 Proxy 动态方法没有类型提示。在任意 `.d.ts` 中通过 declaration merging 声明方法签名，即可获得完整提示：

```ts
// global.d.ts
declare module '@kye-netc/micro-native' {
  interface NativeMethods {
    getUserInfo: (id: string) => { name: string; age: number }
    setTheme: (theme: 'light' | 'dark') => void
  }
}
```

```ts
const info = await native.getUserInfo('123') // info: { name: string; age: number }
await native.setTheme('dark')
```

调用返回值统一为 Promise：声明为同步返回 `T` 的方法实际返回 `Promise<T>`，声明为 `Promise<T>` 的保持不变。

## 注意事项

- **调用一律 `await`**：无论哪种模式，`native.xxx()` 都返回 Promise。
- **iframe 模式有序列化开销**：参数与返回值经 JSON 序列化传输，不能传函数、DOM 节点等不可序列化对象；单次调用默认 30s 超时。
- **micro-app / micro-module 模式同进程直调**：无序列化、无超时，性能与 standalone 一致。
- **`setAppName` 要在 `onMessage` 之前调用**：筛选依赖调用时的 appName。
- **基座与子应用各自引入本包**：基座的 `register` 必须先于子应用调用执行（同进程模式下子应用直接读共享注册表，方法未注册会 reject）。
