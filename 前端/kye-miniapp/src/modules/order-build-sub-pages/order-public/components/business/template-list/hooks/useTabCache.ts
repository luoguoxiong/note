import { cloneDeep } from 'lodash-es'
import { setBatchEstimatedCostConfig } from '@order-public-sub-root-pages/order-single/hooks/useBatchInit'
import { getChannel } from '@order-public-sub-public/configs'
import { getTemplateId } from '@order-public-sub-root-pages/order-single/hooks/template'
import { OrderConsumer } from '@order-public-sub-public/types'
import { initCacheConfig, setCacheInitConfig } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { Channel, ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
//缓存对象
let tabCacheObj: any = {}
//缓存时长
const CACHE_TIME_LIMIT = 10 * 60 * 1000

//通过缓存，更新表单配置信息
const updateOrderByTabCache = async () => {
  const data = getTabCacheData()
  const { pageInitConfigResponse } = data
  setCacheInitConfig(data)
  piniaStore.globalData.setInitConfig({ initConfig: cloneDeep(pageInitConfigResponse) })
  setBatchEstimatedCostConfig(pageInitConfigResponse?.configDimension?.dynamicConfig?.estimatedCost)
  await initCacheConfig(pageInitConfigResponse)
}

//缓存对象的key
const cacheKey = () => {
  try {
    const templateId = getTemplateId()
    const channel = getChannel()
    const customerCode = piniaStore.schema.moduleDimensionData(ModuleType['下单公司'])?.customerCode
    const key = `${customerCode}_${channel}_${templateId}`
    return key
  } catch (e) {
    return ''
  }
}

//获取缓存数据
const getTabCacheData = () => {
  try {
    const key = cacheKey()
    const time = Date.now()
    const obj = tabCacheObj[key]
    const { data, updateTime } = obj || {}
    if (!data?.pageInitConfigResponse || !data?.waybillNumber) {
      return
    }
    if (time - Number(updateTime) > CACHE_TIME_LIMIT) {
      return
    }
    return data
  } catch (e) {
    return
  }
}

//设置缓存数据
const setTabCacheData = (data = piniaStore.globalData.preConfigProcess) => {
  if (getChannel() === Channel.退出活动 || !data?.waybillNumber) {
    return
  }
  const key = cacheKey()
  tabCacheObj[key] = {
    data,
    updateTime: Date.now(),
  }
}

//清空缓存数据
const clearTabCacheData = () => {
  tabCacheObj = {}
}

export const useTabCache = () => {
  return {
    updateOrderByTabCache,
    getTabCacheData,
    setTabCacheData,
    clearTabCacheData,
  }
}
