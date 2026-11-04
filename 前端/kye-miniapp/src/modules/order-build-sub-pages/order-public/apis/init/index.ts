/* 初始化接口 */
import { http } from '@order-public-sub-public/utils/request'
import { BaseCheckResponse, InitResponse, preConfigInitResponse } from '@order-public-sub-public/apis/types'
import {
  cacheConfigParams,
  ConfigParams,
  InitDataResponse,
  QueryObject,
  SyncRealNameInfoParams,
} from '@order-public-sub-public/types'
import { getApiCode, getSource, getSourceAndChannel } from '@order-public-sub-public/configs'
import { getQueryObject } from '@order-public-sub-public/utils'

/**
 * @description 下单初始化预加载，继续下单会触发该接口
 */
export const getPreInit = async () => {
  const sourceAndChannel = await getSourceAndChannel()
  return http('web.order.configOrder.earlyOrderInitConfig', { ...sourceAndChannel })
}

/**
 * @description 展会下单预加载：仅前端触发后端提前初始化展会下单配置，不写本地缓存
 * （singlePageV2 登录后必触发，预渲染缓存数据沿用 singlePageV2 的即可，两者配置一致）
 */
export const getExhibitionPreload = async () => {
  const source = await getSource()
  return http('web.order.init.exhibitionOrder.singlePage', { source }, { toast: false })
}

/**
 * @description 获取初始化config接口
 * @param params
 */
export const getConfig = async (params?: ConfigParams) => {
  const source = await getSource()
  const apiCode = getApiCode()
  const channelScene = getChannelScene()

  return http<InitResponse>(apiCode, { ...params, ...channelScene, source }, { toast: false })
}

/**
 * @description 获取缓存config和process接口
 * @param params
 */
export const getCacheConfig = async (params?: cacheConfigParams) => {
  const source = await getSource()
  const apiCode = getApiCode()
  const channelScene = getChannelScene()

  return http<preConfigInitResponse>(apiCode, { ...params, ...channelScene, source }, { toast: false })
}

/**
 * @deprecated
 * @description 获取初始化动态数据接口，新版弃用，改为调用过程中接口入参
 */
export const getInitData = async (params?: Omit<ConfigParams, 'configId'>) => {
  const sourceAndChannel = await getSourceAndChannel()
  return http<InitDataResponse>('web.order.configOrder.initCheck', { ...params, ...sourceAndChannel }, { toast: false })
}

/**
 * @description 下单准入分支流程接口获取
 * @param params
 */
export const getBaseCheck = async (params?: Omit<ConfigParams, 'configId'>) => {
  const sourceAndChannel = await getSourceAndChannel()
  return http<BaseCheckResponse>(
    'web.order.configOrder.baseCheck',
    { ...params, ...sourceAndChannel, apiVersion: '2.0' }, //apiVersion是为了后端兼容对齐前端版本，后续会删除掉
    { toast: false },
  )
}

/**
 * 从url query获取channelScene参数，运费时效跳转页面用
 */
export const getChannelScene = () => {
  const channelSceneObject: { channelScene?: number } = {}
  try {
    const { channelScene } = getQueryObject() as QueryObject
    if (channelScene) {
      //如果url有channelScene就优先取
      return {
        channelScene,
      }
    }
    const urlObj = new URL(window.location.href)
    // 尝试直接从hash部分提取查询参数，考虑到hash可能包含?开始的查询字符串
    const hashQuery = urlObj.hash?.split('?')[1]
    if (hashQuery) {
      const params = new URLSearchParams(hashQuery)
      const sourcePageValue = params.get('sourcePage')
      const channelScene = params.get('channelScene')
      if (sourcePageValue && ['freightTime', 'freight-time'].includes(sourcePageValue)) {
        channelSceneObject.channelScene = 10
      } else if (channelScene) {
        channelSceneObject.channelScene = Number(channelScene)
      }
    }
  } catch (error) {
    console.error('提取sourcePage参数时发生错误:', error)
  }
  return channelSceneObject
}

/**
 * @description 同步最新的寄件人信息实名认证结果
 * @param params
 * TODO: 接口待定
 */
export const syncSenderRealNameInfo = (params: SyncRealNameInfoParams) => {
  return http('web.user.userRealName.getForceRealName', params, { toast: false })
}
