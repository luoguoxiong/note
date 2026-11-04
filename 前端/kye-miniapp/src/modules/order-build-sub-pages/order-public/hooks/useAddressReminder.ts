import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { getAddressReminder } from '@order-public-sub-public/apis/address'
import type { AddressReminderItem } from '@order-public-sub-public/apis/address/types'
import type { ChangeKeys } from '@order-public-sub-public/types'

/** 提醒类型枚举 */
export const AddressReminderType = {
  /** 海南违禁品 */
  海南违禁品: 700,
  /** 寄件提醒 */
  寄件提醒: 800,
  /** 收件提醒 */
  收件提醒: 900,
} as const

/** 地址提醒 addressType 取值：sender-寄件, receive-收件, all-全部 */
export type AddressReminderAddressType = 'sender' | 'receive' | 'all'

/**
 * @description 根据过程中 elementsChange 的 keys 判断地址提醒的 addressType
 * keys 格式：模块维度 key 为 'sender'/'receive'（ModuleType 寄方/收方信息小写），
 * 二级字段为 'sender.xxx'/'receive.xxx'（如 'sender.aiDiscern'、'receive.detailAddress'）
 * 含 sender 开头 → 'sender'；含 receive 开头 → 'receive'；都含或都不含 → 'all'
 * 特殊 key 'sender.receive.change'（寄/收地址互换）→ 直接返回 'all'
 */
export const getAddressTypeByKeys = (keys: ChangeKeys[]): AddressReminderAddressType => {
  let hasSender = false
  let hasReceiver = false
  for (const k of keys) {
    if (typeof k !== 'string') continue
    // 寄/收地址互换（switchAddress 的 remoteCheckKey）：双方地址都变化，需全部刷新
    if (k === 'sender.receive.change') return 'all'
    if (k === 'sender' || k.startsWith('sender.')) {
      hasSender = true
    } else if (k === 'receive' || k.startsWith('receive.')) {
      hasReceiver = true
    }
  }
  if (hasSender) return 'sender'
  if (hasReceiver) return 'receive'
  return 'all'
}

/**
 * @description 调用地址提醒接口（同一 orderPageType 共用 store 中的 Promise，防止重复调用）
 * 在 init/process 接口返回保存 moduleDimension 后触发，与服务方式触发方式一致
 * @param addressWarningFlag 地址提醒开关，由调用方从原始 moduleDimension 传入
 *   （不通过 store.schema.moduleDimension 读取，因 updateData 不处理 boolean 类型字段会导致取值丢失）
 * @param addressType 地址类型：sender-寄件, receive-收件, all-全部（默认）
 */
export const fetchAddressReminders = (addressWarningFlag: boolean, addressType: AddressReminderAddressType = 'all') => {
  const piniaStore = useStore()

  // addressWarningFlag 为 false 时不调用
  if (!addressWarningFlag) return

  // 已有进行中的 Promise，复用即可
  const existingPromise = piniaStore.globalData.addressReminderPromise
  if (existingPromise) {
    return existingPromise
  }

  const promise = (async () => {
    try {
      const { data: res } = await getAddressReminder({ addressType })
      if (res) {
        const newReminders = res.reminders || []
        const current = piniaStore.globalData.addressReminders || []
        let merged: AddressReminderItem[]
        if (addressType === 'all') {
          // all：全部覆盖
          merged = newReminders
        } else {
          // sender 处理 type=800；receive 处理 type=900 和 700
          const typesToHandle: number[] =
            addressType === 'sender'
              ? [AddressReminderType.寄件提醒]
              : [AddressReminderType.收件提醒, AddressReminderType.海南违禁品]
          // 移除当前数组中需要处理的 type 项，再追加新返回的项（返回空数组时即清空对应 type）
          const remaining = current.filter((r) => !typesToHandle.some((t) => t === r.type))
          merged = [...remaining, ...newReminders]
        }
        piniaStore.globalData.setAddressReminders({ addressReminders: merged })
      }
    } catch (e) {
      console.error('[useAddressReminder] 获取地址提醒异常:', e)
    } finally {
      // 请求结束（无论成功失败）清空 Promise 缓存
      // 缓存仅用于去重同时段的并发请求（如 init/process 同 tick 多次触发），完成后允许下次触发重新请求
      piniaStore.globalData.setAddressReminderPromise({ addressReminderPromise: null })
    }
  })()

  piniaStore.globalData.setAddressReminderPromise({ addressReminderPromise: promise })
  return promise
}

/**
 * @description 地址提醒数据读取Hook，供组件获取提醒数据使用。
 * 接口调用由 fetchAddressReminders 在数据流中统一触发，本 Hook 仅负责读取。
 * 提醒展示优先级最低。
 */
export const useAddressReminder = () => {
  const piniaStore = useStore()

  // 当前 orderPageType 的地址提醒列表
  const reminders = computed<AddressReminderItem[]>(() => {
    return piniaStore.globalData.addressReminders || []
  })

  // 寄件提醒 (type=800)
  const senderReminder = computed(() => {
    return reminders.value.find((r) => r.type === AddressReminderType.寄件提醒)
  })

  // 收件提醒 (type=900)
  const receiveReminder = computed(() => {
    return reminders.value.find((r) => r.type === AddressReminderType.收件提醒)
  })

  // 海南违禁品提醒 (type=700)
  const hainanReminder = computed(() => {
    return reminders.value.find((r) => r.type === AddressReminderType.海南违禁品)
  })

  /**
   * 关闭指定类型的提醒（从 store 中移除对应数据）。
   * 提醒显隐由数据驱动，用户点关闭即删除该条，接口下次重新返回时会再次展示。
   */
  const dismissReminder = (type: number) => {
    const current = piniaStore.globalData.addressReminders || []
    const next = current.filter((r) => r.type !== type)
    if (next.length !== current.length) {
      piniaStore.globalData.setAddressReminders({ addressReminders: next })
    }
  }

  return {
    senderReminder,
    receiveReminder,
    hainanReminder,
    dismissReminder,
  }
}
