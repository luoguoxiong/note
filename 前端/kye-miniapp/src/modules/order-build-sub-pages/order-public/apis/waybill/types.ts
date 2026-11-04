import { CancelOrderSourceType, TrueOrFalseNumber, YesOrNoString } from '@order-public-sub-public/constants'
import {
  CheckResponse,
  PlainObject,
  ProcessHandleOptions,
  ServiceModeDimension,
  ServiceModeType,
} from '@order-public-sub-public/types'
import { BatchSingleProcessResponse } from '../types'

export enum AdType {
  'BANNER' = 10,
  'POPUP' = 20,
  'SCROLL_BANNER' = 30, //走马灯
  'INDEX' = 40, //开屏页
}

/**
 * @description 跳转方式 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口
 */
export enum JumpType {
  'NO' = 0,
  'H5' = 1,
  'NATIVE' = 2,
  'MINI_PROGRAM' = 3, //外部小程序
  'INTERFACE' = 4, //调接口
}

export interface AdParams {
  appCode?: string
  channelCode: string // 	渠道编码，数据字典：eam_advertisement_channel'
  pageCode: string // 页面编码
  adTypeList?: Array<AdType> //	广告类型集合，数据字典：eam_advertisement_type，10：banner，20：弹窗，30：走马灯，40：开屏页
  latestUpdateTime: string //最后更新时间 yyyy-MM-dd HHmmss
}

export interface ConfirmAdParams {
  advertisementCodeList?: string[]
  channelSource: string
  eventType?: string // 事件类型，1-按钮事件，2-关闭事件
  buttonIndex: string // 按钮下标
  customerParam?: unknown
  noLongerRemindFlag?: TrueOrFalseNumber
  noLongerRemindDays?: number
}

export interface AdDetail {
  advertisementCode: string
  advertisementTitle: string
  advertisementBannerDto: Banner
  advertisementPopupDto: Popup
}

export interface Banner {
  posterLink: string
  modelRoute: string //	模块路由
  h5Link: string //	h5链接
  pageGroupCode: string //页面分组编码
  jumpMode: JumpType // 	跳转方式 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口
  advertisementCode: string
  advertisementTitle: string
}

export interface PopupButton extends Banner {
  buttonText: string
  buttonIndex: number
}

export interface Popup extends Banner {
  buttonList: PopupButton[]
  configCloseButton: TrueOrFalseNumber // 0: 不配置；1：配置
  noLongerRemind: TrueOrFalseNumber // 0 不配置；1：配置
  noLongerRemindDays: number
}

export interface AdResponse {
  latestUpdateTime: string //	最后更新时间 yyyy-MM-dd HHmmss
  areaStyleCode: string //	区域样式编码
  advertisementType: string //	广告类型，数据字典：eam_advertisement_type
  frequency: number //	滚动频率广告关闭间隔时间，单位秒
  limitSize: string //	限制尺寸
  customerParam: string //	自定义参数（限制尺寸样式参数）
  allowClose: number // 	是否允许关闭，0：不允许，1：允许
  remark: string //备注
  detailsList: AdDetail[] // 	广告配置
}

export interface RoutePathResponse {
  pageName: string //	模块路由名称
  type: string //	跳转类型，h5，native，miniProgram
  url: string //	具体页面路径
  customParams: PlainObject //	自定义参数
}

export enum BatchPollingStatus {
  '继续轮询' = 10,
  '开始计算费用' = 20,
  '成功' = 30,
  '结束' = 40,
}

/**
 * @description 接口返回的服务方式结构
 */
export interface ServiceModeItem extends ServiceModeDimension {
  serviceMode: ServiceModeType
  callFlag: boolean //是否需要再调用process
}

export interface BusinessLogic {
  businessLogic: { data: CheckResponse | BatchSingleProcessResponse; options: ProcessHandleOptions }
}

export type ServiceModeResponse = ServiceModeItem

export interface SubmitOptions {
  confirmRestrictOpt?: YesOrNoString // 10: 首次提交; 20: 继续确认提交
}

export interface CancelOrderType {
  waybillNumbers: string[]
  cancelReason: string
  cancelCode: string
  cancelSource: CancelOrderSourceType
}

export interface IChoosableTimesItem {
  date: string
  dayOfWeek: number
  matchPeriods: Array<{
    periodType: number
    startTime: string
    endTime: string
  }>
  timeRanges: Array<{
    text: string
    hour: number
    children: Array<{ minute: number }>
  }>
}
