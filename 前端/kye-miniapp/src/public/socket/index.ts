import Taro from '@tarojs/taro'
import { getEnvConfig } from '@/public/constants'
import { getSocketSource, safeParse, socketLog } from './utils'
import { getToken } from '../storage'
/** 心跳间隔 */
const HEART_INTERVAL = 5000
/** 重连时间间隔 */
const RETRY_INTERVAL = 3000
/** 最大重连次数 */
const MAX_RETRY = 5

// const WS_BASE = 'ws://10.247.251.183:9999/ws'
const WS_BASE = 'wss://ic-notice-ws-uat.ky-express.com/ws'
const WS_BASE_PROD = 'wss://ic-notice-ws.ky-express.com/ws'

type MessageHandler<T = any> = (data: T) => void

export enum WebSocketScene {
  /** 下单邀请寄 */
  OrderInvoice = '10',
}

export class SocketClient {
  private socketTask: Taro.SocketTask | null = null
  private heartTimer: ReturnType<typeof setInterval> | null = null

  private isConnected = false
  private reconnectCount = 0
  private isBackground = false
  private isGlobalConnect = false

  /** 事件池 */
  private listeners = new Map<string, Set<MessageHandler>>()

  /* ------------------ 对外 API ------------------ */

  bindAppLifeCycle() {
    // 如果不是全局链接，先注释下方逻辑
    if (!this.isGlobalConnect) {
      return
    }
    Taro.onAppHide(() => {
      socketLog('info', 'App 进入后台,断开链接')
      this.isBackground = true
      this.close()
    })

    Taro.onAppShow(() => {
      if (this.isBackground) {
        socketLog('info', 'App 打开,正在链接')
        this.reconnectCount = 0
        this.connect()
        this.isBackground = false
      }
    })
    Taro.onNetworkStatusChange((res) => {
      const neteWorkConnect = res.isConnected
      if (!neteWorkConnect) {
        socketLog('info', '网络断开, 断开链接')
        this.close()
      } else {
        socketLog('info', '网络链接, 正在链接')
        this.reconnectCount = 0
        this.connect()
      }
    })
  }

  on<T = any>(type: string, handler: MessageHandler<T>) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(handler)
  }

  off(type: string, handler?: MessageHandler) {
    if (!handler) {
      this.listeners.delete(type)
      return
    }
    this.listeners.get(type)?.delete(handler)
  }

  send(data: object | string) {
    if (!this.socketTask || !this.isConnected) {
      socketLog('warn', '未连接')
      return
    }

    const payload = typeof data === 'string' ? data : JSON.stringify(data)
    this.socketTask.send({ data: payload })
  }

  close() {
    socketLog('warn', '主动关闭')
    this.stopHeartBeat()
    this.socketTask?.close({})
    this.socketTask = null
    this.isConnected = false
  }

  get connected() {
    return this.isConnected
  }

  /* ------------------ 内部逻辑 ------------------ */

  async connect() {
    const token = getToken()
    if (!token) {
      return
    }
    const { xForm, isProd } = getEnvConfig()

    const source = getSocketSource()

    const url = `${isProd ? WS_BASE_PROD : WS_BASE}?source=${source}&from=${xForm}&token=${token}`

    if (this.socketTask) {
      this.stopHeartBeat()
      this.socketTask.close({})
    }

    socketLog('info', 'WebSocket connecting...', url)

    const socketTask = await Taro.connectSocket({ url })
    this.socketTask = socketTask

    socketTask.onOpen(this.onOpen)
    socketTask.onMessage(this.onMessage)
    socketTask.onError(this.onError)
    socketTask.onClose(this.onClose)
  }

  private onOpen = () => {
    socketLog('success', '已连接')
    this.isConnected = true
    this.reconnectCount = 0
    this.startHeartBeat()
  }

  private onMessage = (msg: Taro.SocketTask.OnMessageCallbackResult) => {
    try {
      const message = safeParse(msg.data)
      if (message === 'pong') {
        socketLog('success', 'Ping响应：pong')
        return
      }

      socketLog('info', '收到消息', message)

      if (!message?.scene) {
        socketLog('warn', '消息缺少 scene', message)
        return
      }

      this.send({
        msgId: message.msgId,
        ts: new Date().getTime(),
      })

      this.emit(message.scene, message.content)
    } catch (e) {
      socketLog('error', '消息解析失败')
    }
  }

  private emit(type: string, data: any) {
    this.listeners.get(type)?.forEach((handler) => {
      try {
        handler(data)
      } catch (e) {
        socketLog('error', `socket.on("${type}") 执行错误`, e)
      }
    })
  }

  private onError = (err) => {
    socketLog('warn', err)
    this.isConnected = false
    this.stopHeartBeat()
    this.tryReconnect()
  }

  private onClose = () => {
    socketLog('warn', 'Close')
    console.log('⚠️ WebSocket Close')
    this.isConnected = false
    this.stopHeartBeat()
  }

  private tryReconnect() {
    if (this.reconnectCount >= MAX_RETRY) {
      socketLog('warn', '重连上限')
      return
    }

    this.reconnectCount++
    socketLog('info', `🔁 WebSocket 重连 (${this.reconnectCount}/${MAX_RETRY})`)

    setTimeout(() => this.connect(), RETRY_INTERVAL * this.reconnectCount)
  }

  private startHeartBeat() {
    this.stopHeartBeat()

    this.heartTimer = setInterval(() => {
      if (!this.isConnected) return
      socketLog('success', 'ping')
      this.socketTask?.send({ data: 'ping' })
    }, HEART_INTERVAL)
  }

  private stopHeartBeat() {
    if (this.heartTimer) {
      clearInterval(this.heartTimer)
      this.heartTimer = null
    }
  }
}

export const socket = new SocketClient()
