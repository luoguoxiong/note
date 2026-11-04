import { Channel } from './init'

/**
 * 接口返回码
 */
export enum HttpCode {
  SUCCESS = 0, //成功
  EMPTY = 60010, // token为空
  INVALID = 6001, // token无效
  EXPIRED = 100201, // token已失效
}

/**
 * SDK类型
 */
export enum SdkType {
  WECHAT_OFFICAL_ACCOUNTS = 1, //微信公众号
  WECHAT_MINI_PROGRAMS = 2, //微信小程序
  WECOM_COM_SIGN = 3, //企业微信(企业签名)
  WECOM_APP_SIGN = 4, //企业微信(应用签名)
}

// 请求重试次数
export const maxRetryCount = 3

/**
 * @description apiCode Channel映射
 */
export const INIT_API_CODE_MAP = {
  [Channel.快速寄件]: 'web.order.init.quickOrder.singlePageResultV3',
  [Channel.立即前往]: 'web.order.init.quickOrder.initConfig',
  [Channel.退出活动]: 'web.order.init.quickOrder.initConfig',
  [Channel.扫二维码下单]: 'web.order.init.scan.singlePageResult',
  [Channel.扫活动码下单]: 'web.order.init.event.singlePageResult',
  [Channel.扫项目编码下单]: 'web.order.init.project.initConfig',
  [Channel.再来一单]: 'web.order.init.copyOrder.singlePageResult',
  [Channel.修改运单]: 'web.order.init.modifyWaybill.initConfig',
  [Channel.返程单]: 'web.order.init.returnWaybill',
  [Channel.批量寄]: 'web.order.configOrder.batch.initConfig',
  [Channel.批量退出活动]: 'web.order.configOrder.batch.initConfig',
  [Channel.批量立即前往]: 'web.order.configOrder.batch.initConfig',
  [Channel.批量扫二维码]: 'web.order.configOrder.batch.initConfig',
  [Channel.运单审核]: 'web.order.init.waybillAudit.singlePageResult',
  [Channel.调价审核]: 'web.order.init.adjustAudit.singlePageResult',
}

export enum OrderSceneType {
  SINGLE = 10,
  BATCH = 20,
}

/**
 * @description 批量预加载接口映射
 */
export const BATCH_INIT_API_MAP = {
  [Channel.批量寄]: 'web.order.init.fill.batchPageResult',
  [Channel.批量扫二维码]: 'web.order.batch.scan.batchPageResult',
}
