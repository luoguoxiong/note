import { http } from '@order-public-sub-public/utils/request'

export interface HelpContent {
  id: number //	id	number	133.0
  title: string //	内容标题	string	不承保托寄物
  sort: number //	排序	number	0.0
  description: string //	描述	string
  content: string //	内容	string	DD
  createDate: string //	创建时间	string	2020-10-21 11:49:50
  lastModifyDate: string
}
/**
 * 获取协议内容：web.order.agreement.get
 * @param params (0 后续改成0和1) 10 0 运单电子协议 20  1 保费电子协议（类型）
 * @returns
 */
export const getHelpContent = (params: { type: number }) => {
  return http<HelpContent>('web.order.agreement.get', params, {
    toast: false,
  })
}

interface AgreementCheckParams {
  page: string //	页面 0 下单保存 1修改	string	是
  source: string //	来源 2客户端 0 app 1小程序	number	是
  notRemindTime: string //	点击不再提醒时间	string	否
  type?: number //	类型	number	是
}
/**
 * 滑动阅读协议-协议滑动底部后点击确定
 */
export const agreementCheckHasRead = (params: AgreementCheckParams) => {
  return http<HelpContent>('web.order.agreement.read', params)
}

interface AgreementSaveParams {
  flag: number //	0 取消阅读 1 阅读	number	是
  type: number //	0 运单电子协议 1 保费电子协议
}
/**
 * 配置下单-勾选协议
 * @param params
 * @returns
 */
export const agreementSave = (params: AgreementSaveParams) => {
  return http<HelpContent>('web.order.agreement.save', params)
}

/**
 * 配置下单-协议默认是否选中
 * @param params type 0 后续改成0和1) 10 0 运单电子协议 20  1 保费电子协议（类型） 2 自提风险告知书
 * @returns
 */
export const getAgreementDefaultSelect = (params: { type: 0 | 1 | 2 }) => {
  return http<boolean>('web.order.agreement.defaultSelect', params)
}

interface AgreementCheckCommonParams {
  agreementType: number //	2-电子回单协议 3-网点自提协议	number
  status: number //	0-取消; 1-已读	number
  source: number // 来源, 2-客户端 0-app 1-小程序
}
/**
 * 配置下单-自提风险协议勾选
 */
export const checkAgreementCommon = (params: AgreementCheckCommonParams) => {
  return http<boolean>('web.order.configOrder.checkAgreement', params)
}
