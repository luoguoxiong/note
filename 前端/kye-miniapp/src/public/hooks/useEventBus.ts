// types/event-map.ts
import type { AddressValue } from '@order-public/constants'

export interface SenderAddressBookConfirmPayload {
  data: any
  moduleStyle: string
  isTrigger: boolean
  // 地址簿选择结果埋点回调（由地址簿页面传入）：有参数为失败埋点，无参数为成功埋点
  reportCallback?: (err?: unknown) => void
  // 可编辑字段组装函数（由地址簿页面传入，避免主包依赖子包 useCommon）
  getEditableFields?: (item: AddressValue, data: AddressValue, addressProps: any) => any
}

export interface ReceiveAddressBookConfirmPayload {
  data: any
  moduleStyle: string
  isTrigger: boolean
  pageSource?: string
  // 地址簿选择结果埋点回调（由地址簿页面传入）：有参数为失败埋点，无参数为成功埋点
  reportCallback?: (err?: unknown) => void
  // 可编辑字段组装函数（由地址簿页面传入，避免主包依赖子包 useCommon）
  getEditableFields?: (item: AddressValue, data: AddressValue, addressProps: any) => any
}

// 地址簿编辑页（order-build-sub-pages 独立寄件/收件编辑页）保存后的写回事件，payload 即 setAddressBookEditValue 的入参，由主包监听方直接执行
export interface AddressBookEditConfirmPayload {
  addressType: string
  moduleStyle: string
  item: any
  needMerge?: boolean
}

// 地址簿事件基名：实际监听/发射时需在基名后追加场景后缀（_order=去程单 / _order-back=返程单，取自共享 root store 的 orderPageType），
// 用于区分去程单与返程单页面在页面栈中共存时对同名事件的重复监听
export type AddressBookEventName =
  | 'SenderAddressBookConfirm'
  | 'ReceiveAddressBookConfirm'
  | 'SenderAddressBookBlockConfirm'
  | 'ReceiveAddressBookBlockConfirm'
  | 'SenderAddressBookEditConfirm'
  | 'ReceiveAddressBookEditConfirm'
  | 'SenderAddressBookOrderEditConfirm'
  | 'ReceiveAddressBookOrderEditConfirm'

export type EventMap = {
  ReceipterEvent: any
  ReceipterAddressBookEvent: any
  FreightTimeAddressBookEvent: any
  // 以下为基名定义；实际使用的事件名为「基名_场景」形式（见 AddressBookEventName）
  SenderAddressBookConfirm: SenderAddressBookConfirmPayload
  ReceiveAddressBookConfirm: ReceiveAddressBookConfirmPayload
  // 订单页收/寄方信息块（block）直接进入地址簿选中后的确认事件，由订单页 block 组件监听
  SenderAddressBookBlockConfirm: SenderAddressBookConfirmPayload
  ReceiveAddressBookBlockConfirm: ReceiveAddressBookConfirmPayload
  // 子包地址簿编辑页（寄件/收件）保存后的写回事件，由主包寄/收方页面监听，仅执行 setAddressBookEditValue
  SenderAddressBookEditConfirm: AddressBookEditConfirmPayload
  ReceiveAddressBookEditConfirm: AddressBookEditConfirmPayload
  // 订单页（block/unfold 组件）场景专用：与独立填写页（address-page）拆分，避免页面栈中两组件同时存活时重复响应
  SenderAddressBookOrderEditConfirm: AddressBookEditConfirmPayload
  ReceiveAddressBookOrderEditConfirm: AddressBookEditConfirmPayload
} & Record<`${AddressBookEventName}_${string}`, any>

type Handler<T = any> = (data: T) => void

export class EventBus<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Handler<any>>>()

  // 订阅事件
  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  // 取消订阅
  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  // 触发事件
  emit<K extends keyof Events>(event: K, data: Events[K]) {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  // 获取当前已注册监听的事件名列表（仅包含仍有监听者的事件）
  getEventNames(): (keyof Events)[] {
    return Array.from(this.listeners.keys())
  }

  // 清空所有监听（可选）
  clear() {
    this.listeners.clear()
  }
}

export const globalEventBus = new EventBus<EventMap>()
