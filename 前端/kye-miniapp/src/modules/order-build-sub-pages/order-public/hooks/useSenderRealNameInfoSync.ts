import { onMounted, onBeforeUnmount } from 'vue'
import EventManager from '@order-public-sub-public/hooks/useEventSubscription'
import { syncSenderRealNameInfo } from '@order-public-sub-public/apis/init'
import { AddressValue, OrderPageType, Address, ModuleType } from '@order-public-sub-public/constants'
import { useUpdateData as senderUpdateData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { usePerson } from '@order-public-sub-public/hooks/address/sender/useFields'
import { Delivery } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * @description Adds an event listener for syncing real name info after real name verification.
 * @param originOrderPageType The original order page type.
 */
const addEvent = (originOrderPageType: OrderPageType): (() => void) => {
  let syncId = ''

  /**
   * @description Syncs the sender's real name and phone number after real name verification.
   */
  const syncSenderFormData = async () => {
    try {
      const res = await syncSenderRealNameInfo({ uniqueId: syncId })
      const { data } = res
      const { idCardName } = data as Record<string, unknown>
      if (idCardName) {
        const isSenderPage = window.location.href.includes('sender-page')
        if (isSenderPage) {
          const { onInputPerson } = usePerson({ moduleStyle: Address.SENDER })
          onInputPerson(idCardName as string)
        } else {
          const senderFormData = piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
          const payload: AddressValue = { ...senderFormData, person: idCardName as string }
          const { setEditValue } = senderUpdateData({ moduleStyle: Address.SENDER })
          setEditValue({ item: payload, needMerge: true })
        }
      }
    } catch (err) {
      console.warn(err)
    } finally {
      syncId = ''
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible' && syncId) {
      syncSenderFormData()
    }
  }

  const onSyncIdChange = (data: unknown) => {
    const { orderPageType, syncId: id } = data as Record<string, string>
    if (orderPageType === originOrderPageType) {
      syncId = id
    }
  }

  EventManager.subscribe('senderFormDataSyncIdChange', onSyncIdChange)

  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}

/**
 * @description A hook for syncing real name info after real name verification.
 * @param originOrderPageType The original order page type.
 */
export const useSenderRealNameInfoSync = (originOrderPageType: OrderPageType) => {
  let offEvent: () => void

  onMounted(() => {
    offEvent = addEvent(originOrderPageType)
  })

  onBeforeUnmount(() => {
    offEvent()
  })
}
