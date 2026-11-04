import { getStringParams, isObject, push } from './util/index'
import pvReport from '@order-public-sub-public/reportUmp/sceneReport/pvReport'
import baseReportInstance from '@order-public-sub-public/reportUmp/base'
import {
  BaseConfig,
  baseInstanceType,
  Indexable,
  ReportConfigType,
} from '@order-public-sub-public/reportUmp/type/types'

//公共属性的处理
const commonConfigHandle = async (config = {}, type: baseInstanceType = 'baseParams') => {
  if (!isObject(config)) {
    return
  }
  config = await getStringParams(config)
  for (const configKey in config) {
    baseReportInstance.add(configKey, config[configKey as keyof typeof config], type)
  }
}
//全局属性的设置
const setGlobalproperty = (globalproperty: Indexable<string>) => {
  if (!globalproperty) {
    return
  }
  push('aplus.setMetaInfo', ['globalproperty', globalproperty])
}
//用户属性的设置
const setUserProfile = (userProfile: Indexable<string>) => {
  if (!userProfile) {
    return
  }
  push('aplus.record', ['$$_user_profile', 'OTHER', userProfile])
}

//设置初始化属性
const setInitConfig = (config: ReportConfigType) => {
  setIds(config.ids)
  setGlobalproperty(config.globalproperty)
  setUserProfile(config.userProfile)
}
//设备属性的设置
const setIds = (ids: Indexable<string>) => {
  if (!ids) {
    return
  }
  const { _user_id, _dev_id, _anony_id } = ids
  push('aplus.setMetaInfo', ['_user_id', _user_id])
  push('aplus.setMetaInfo', ['_dev_id', _dev_id])
  push('aplus.setMetaInfo', ['_anony_id', _anony_id])
}

export default async (config: ReportConfigType) => {
  const {
    appKey,
    rhost,
    sdkSrc,
    heatmap,
    rateAhot,
    aplusJsbridgeOnly = false,
  } = (await getStringParams(config.baseConfig)) as BaseConfig
  // 初始化友盟SDK
  // eslint-disable-next-line max-params
  ;(function (w, d, s, q, i) {
    console.log(i)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    w[q] = w[q] || []
    const f = d.getElementsByTagName(s)[0] as HTMLElement,
      j = d.createElement(s) as HTMLScriptElement
    j.async = true
    j.id = 'beacon-aplus'
    j.src = sdkSrc
    f.parentNode?.insertBefore(j, f)
    // document.body.appendChild(j)
  })(window, document, 'script', 'aplus_queue', 'xxxxxx')

  commonConfigHandle(config.commonConfig)
  commonConfigHandle(config.encryption, 'storeParams')
  commonConfigHandle(config.exposureConfig, 'storeParams')
  push('aplus.setMetaInfo', ['appKey', appKey])
  push('aplus.setMetaInfo', ['aplus-rhost-v', rhost])
  push('aplus.setMetaInfo', ['aplus-jsbridge-only', aplusJsbridgeOnly])
  if (heatmap) {
    push('aplus.setMetaInfo', ['aplus-heatmap-enabled', heatmap])
    push('aplus.setMetaInfo', ['aplus-rate-ahot', rateAhot])
  }
  setInitConfig(config)
  //获取异步的配置
  if (typeof config.asyncConfig === 'function') {
    try {
      config.asyncConfig().then((res: ReportConfigType) => {
        // console.log('获取的数据', res)
        setInitConfig(res)
        pvReport(config.vueRouter)
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    pvReport(config.vueRouter)
  }
}
