import { computed, watch } from 'vue'
import { useGlobalDataStore } from '@order-public-sub-public/store/modules/globalData/pinia'
// 更新
import { useUpdateData as senderUseUpdateData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { useUpdateData as receiverUseUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'

// 校验
import senderUseValidate from '@order-public-sub-public/hooks/address/sender/useValidate'
import receiveUseValidate from '@order-public-sub-public/hooks/address/receive/useValidate'
import { getValueOrEmpty } from '@order-public-sub-public/utils'

// 类型
import { Delivery } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants/global'

// 数据
import {
  exhibitionNumber as senderExhibitionNumber,
  exhibitionCode as senderExhibitionCode,
  exhibitionSiteNumber as senderExhibitionSiteNumber,
  exhibitionProject as senderExhibitionProject,
} from '@order-public-sub-public/hooks/address/sender/state'
import {
  exhibitionNumber as receiveExhibitionNumber,
  exhibitionCode as receiveExhibitionCode,
  exhibitionSiteNumber as receiveExhibitionSiteNumber,
  exhibitionProject as receiveExhibitionProject,
} from '@order-public-sub-public/hooks/address/receive/state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const globalDataStore = useGlobalDataStore()

// 寄方展馆号是否展示互联网
export const senderVisible = computed(() => {
  const { visible } = globalDataStore.dynamicConfig('extractShow') || {}
  return visible || false
})

// 寄方展馆号是否展示
export const receiveVisible = computed(() => {
  const { visible } = globalDataStore.dynamicConfig('receiveExtractShow') || {}
  return visible || false
})

// 模块数据对象
export const getExhibitionData = (type: ModulePageType) => {
  if (type === ModulePageType.寄方) {
    return {
      exhibitionNumber: senderExhibitionNumber,
      exhibitionCode: senderExhibitionCode,
      exhibitionSiteNumber: senderExhibitionSiteNumber,
      exhibitionProject: senderExhibitionProject,
    }
  } else {
    return {
      exhibitionNumber: receiveExhibitionNumber,
      exhibitionCode: receiveExhibitionCode,
      exhibitionSiteNumber: receiveExhibitionSiteNumber,
      exhibitionProject: receiveExhibitionProject,
    }
  }
}

// 更新数据方法
export const useUpdateDataFun = (type: ModulePageType) => {
  if (type === ModulePageType.寄方) {
    return senderUseUpdateData
  } else {
    return receiverUseUpdateData
  }
}

// 校验方法
export const useValidate = (type: ModulePageType) => {
  if (type === ModulePageType.寄方) {
    return senderUseValidate
  } else {
    return receiveUseValidate
  }
}

// 场景类型在这里扩展
export enum ModulePageType {
  '寄方' = 'sender',
  '收方' = 'receive',
}

// 映射文案
export enum ModuleTypeObj {
  'sender' = '寄方信息',
  'receiver' = '收方信息',
}

// props在这里扩展
export interface ExhibitionProps {
  isUnfold?: boolean
  type: ModulePageType
}

// 展会号/展馆号 数据
export interface ExhibitionInfo {
  exhibitionCode: string // 展馆号Code
  exhibitionNumber: string // 展馆号
  exhibitionSiteNumber: string // 展位号
  type: string // 类型：sender/receive
}

export interface ListItem {
  exhibitionCode: string
  exhibitionNumber: string
  expoCode?: string
}
export interface ReactiveType {
  show: boolean
  exhibitionNumber: string
  list: ListItem[]
  result: ListItem
}

// 展位号
watch(
  () => piniaStore.order.moduleFormData(ModuleType['寄方信息']),
  (data) => {
    senderExhibitionCode.value = getValueOrEmpty(data?.exhibitionCode)
    senderExhibitionNumber.value = getValueOrEmpty(data?.exhibitionNumber)
    senderExhibitionSiteNumber.value = getValueOrEmpty(data?.exhibitionSiteNumber)
    senderExhibitionProject.value = getValueOrEmpty(data?.exhibitionProject)
  },
  { deep: true },
)

// 展位号
watch(
  () => piniaStore.order.moduleFormData(ModuleType['收方信息']),
  (data) => {
    receiveExhibitionCode.value = getValueOrEmpty(data?.exhibitionCode)
    receiveExhibitionNumber.value = getValueOrEmpty(data?.exhibitionNumber)
    receiveExhibitionSiteNumber.value = getValueOrEmpty(data?.exhibitionSiteNumber)
    receiveExhibitionProject.value = getValueOrEmpty(data?.exhibitionProject)
  },
  { deep: true },
)
