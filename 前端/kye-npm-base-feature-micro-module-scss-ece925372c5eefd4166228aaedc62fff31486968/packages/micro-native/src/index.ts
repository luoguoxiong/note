/**
 * @kye-netc/micro-native — 微前端原生通信层
 *
 * 在微前端架构中提供跨进程方法调用 + 事件广播能力，支持四种运行模式：
 * - standalone: 独立运行时本地直接调用
 * - iframe: 通过 postMessage 异步调用
 * - micro-app: 同进程共享 EventBus（@micro-zoe/micro-app）
 * - micro-module: 同进程共享 EventBus（@kye-netc/micro-module）
 */

export { Native } from './native'
export { native, default } from './proxy'
export type { NativeMode } from './types'
