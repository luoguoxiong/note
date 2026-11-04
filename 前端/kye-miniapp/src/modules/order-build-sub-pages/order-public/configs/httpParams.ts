import { BATCH_INIT_API_MAP, Channel, INIT_API_CODE_MAP, OrderPageType } from '@order-public-sub-public/constants'
import { ref } from 'vue'
import axios from 'axios'
import { $native, getQueryObject } from '@order-public-sub-public/utils'
import { QueryObject } from '@order-public-sub-public/types'
import { getBaseUrl } from '@order-public-sub-public/utils/env'
import { setUUid } from '@public/hooks/useTmpCacheKey'
//
import { getOrderKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { batchIdReport } from '@order-public-sub-root-pages/order-single/report'
import { localStorage } from '../utils/storage'
import Taro from '@tarojs/taro'
import { useGlobalDataStore } from '@order-public-sub-public/store/modules/globalData/pinia'
import { useExtendStore } from '@order-public-sub-public/store/modules/extend/pinia'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const globalDataStore = useGlobalDataStore()
const extendStore = useExtendStore()
const batchId = ref('')
const batchIdFromType = ref('')
const channel = ref<Channel>()
interface IcGrayHeader {
  [key: string]: string | number
}
interface saveBatchIdParamsType {
  allowEmpty?: boolean //是否允许为空
  fromType?: string //设置来源，用于定位问题
}

export const grayheader = ref<IcGrayHeader>()

//batchId的存储key
const batchIdLocalStorageKey = () => {
  try {
    return `${getOrderKey()}-batchId`
  } catch (e) {
    return ''
  }
}
/**
 * @description 保存批次Id
 * @param batchId
 * @param store 是否保存到localStorage，默认为true
 */
export const saveBatchId = (id?: string, _store = true, params?: saveBatchIdParamsType) => {
  const { allowEmpty = false, fromType = '' } = params || {}
  batchIdFromType.value = fromType
  batchIdReport('set', {
    batchId: id,
    setStore: _store,
    key: batchIdLocalStorageKey(),
    fromType,
    allowEmpty,
  })
  if (!allowEmpty && !id) {
    return
  }
  const val = id ?? ''
  batchId.value = val
  if (_store) {
    localStorage?.setItem(batchIdLocalStorageKey(), val)
    globalDataStore.setBatchId({ batchId: val })
  }
}

/**
 * @description 保存下单公司是否显示标记
 * @param bindCustomerCodeFlag
 */
export const saveBindCustomerCodeFlag = (flag: boolean) => {
  const val = flag || false
  extendStore.updateOrderCustomer({
    orderCustomer: {
      bindCustomerCodeFlag: val,
    },
    orderPageType: OrderPageType.单票, // TODO: 临时处理，后续需要优化
  })
}

/**
 * @description 是否需要绑码弹窗
 * @param bindCustomerCodeFlag
 */
export const saveNeedBindCustomerCode = (value: boolean) => {
  const val = value || false
  extendStore.updateOrderCustomer({
    orderCustomer: {
      needBindCustomerCode: val,
    },
    orderPageType: OrderPageType.单票, // TODO: 临时处理，后续需要优化
  })
}

/**
 * @description 绑码提示条是否显示标记
 * @param bindCustomerCodeBar
 */
export const saveBindCustomerCodeBar = (flag: boolean) => {
  const val = flag || false
  extendStore.updateOrderCustomer({
    orderCustomer: {
      bindCustomerCodeBar: val,
    },
  })
}

/**
 * @description 获取批次Id
 */
export const getBatchId = () => {
  // 去掉这个逻辑是因为，如果是子包走到这里，可能会拿到上一次的batchId.
  // 比如从修改运单进来，进入到主页面，更新了batchId， 然后这里的ref没有更新，就会拿到上次运单信息的
  // 条件： 修改运单 --- 子包触发HTTP请求
  // 最好主包要先执行更新batchId
  // if (batchId.value) {
  //   return batchId.value
  // }

  const tempId = Taro.getStorageSync(batchIdLocalStorageKey()) || localStorage.getItem(batchIdLocalStorageKey())
  return tempId || piniaStore.globalData.getBatchId
}

export const getChannel = () => {
  if (channel.value) {
    return channel.value
  }

  const tempChannel = localStorage.getItem('channel') as Channel
  return tempChannel || Channel.快速寄件
}

/**
 * @description 需要特殊处理临时更换
 * @param val
 */
export const setChannel = (val: Channel) => {
  const currentVal = val ?? Channel.快速寄件
  channel.value = currentVal
  localStorage?.setItem('channel', currentVal)
}

/**
 * @description 将channel重置为url的初始值
 */
export const resetChannel = (val?: Channel) => {
  let channel = Channel.快速寄件
  if (val) {
    channel = val
  } else {
    channel = getQueryObject().channel || Channel.快速寄件
  }
  setChannel(channel)
}

/**
 * @description 根据channel获取apiCode
 */
export const getApiCode = () => {
  if (getChannel() === Channel.修改运单) {
    setUUid()
  }
  return INIT_API_CODE_MAP[getChannel()]
}

/**
 * @description 根据channel获取批量预加载apiCode
 */
export const getBatchApiCode = () => {
  const channel = getChannel()
  const apiCode = Reflect.get(BATCH_INIT_API_MAP, channel) || BATCH_INIT_API_MAP[Channel.批量寄]
  return apiCode
}

/**
 * @description 获取来源
 */
export const getSource = async () => {
  const { source } = await $native?.getSource()
  return source === 'other' ? 'miniprogram' : source
}

/**
 * @description 获取source和channel的参数
 */
export const getSourceAndChannel = async () => {
  const params = { source: '', channel: getChannel() }

  params.source = await getSource()

  return params
}

/**
 * @description 拼接链接
 * @param query
 * @param url
 */
export function getOrderConfigUrl(query: QueryObject, url?: string) {
  let baseUrl = url
  if (!url) {
    const locationOriginArray = location.href.split('?')
    if (locationOriginArray.length > 0) {
      baseUrl = locationOriginArray[0]
    } else {
      baseUrl = getBaseUrl()
    }
  }
  return `${baseUrl}?${Object.keys(query)
    .map((key) => `${key}=${query[key as keyof QueryObject]}`)
    .join('&')}`
}

/**
 * @description 获取source和channel的参数
 */
export const getAssetCode = async () => {
  try {
    const assetNumber = localStorage?.getItem('assetNumber')
    if (assetNumber) {
      return assetNumber
    }
    const assetCodeResult = await axios.get('https://localhost:18098')
    return assetCodeResult?.data?.data?.host_name
  } catch (error) {
    console.error('打印连接https://localhost:18098 失败', error)
  }
}

/**
 * @description 获取并设置路由ICGray的参数
 * &grayheader=[{"key":"X-framework-ICGray","value":3}]
 */

export const setGrayheader = async () => {
  let ICGrayVal = getQueryObject()?.grayheader || getQueryObject()?.grayHeader
  console.log('headergray', ICGrayVal)
  if (ICGrayVal) {
    try {
      ICGrayVal = decodeURIComponent(ICGrayVal)
      console.log('headergray', ICGrayVal)
      const ICList = JSON.parse(ICGrayVal)
      if (ICList?.length > 0) {
        grayheader.value = ICList.reduce((pev: IcGrayHeader, cur: IcGrayHeader) => {
          pev[cur.key] = cur.value
          return pev
        }, {})
      }
    } catch (error) {
      console.error('路由ICGray解析失败', error)
    }
  }
}
