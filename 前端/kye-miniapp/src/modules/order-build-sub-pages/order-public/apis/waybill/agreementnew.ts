import { http } from '@order-public-sub-public/utils/request'
import { HttpResponse } from '@order-public-sub-public/utils/types'

export interface HelpContent {
  id: number //	id	number	133.0
  title: string //	内容标题	string	不承保托寄物
  sort: number //	排序	number	0.0
  description: string //	描述	string
  content: string //	内容	string	DD
  createDate: string //	创建时间	string	2020-10-21 11:49:50
  lastModifyDate: string
  type: number
  status: number
  version: string
}

// 请求缓存 Map，用于存储正在进行的请求 Promise
const pendingRequestsMap = new Map<string, Promise<HttpResponse<HelpContent[]>>>()

/**
 * 获取协议内容：web.order.agreement.list
 * @param params.type (0 后续改成0和1) 10 0 运单电子协议 20  1 保费电子协议（类型）;2  电子回单 ;3网点自提协议; 4  安装服务协议; 5 代收货款
 * @param params.waybillNumber 运单号   运单号，pageSource=20时，单票详情页运单号必填
 * @param params.pageSource 页面来源  10-下单页面,20-查件页面
 * @returns
 */
export const getHelpContentList = (params: { types: string }) => {
  const { types, pageSource = '10' } = params
  // 使用 types 作为唯一标识
  const requestKey = types

  // 如果已经有相同 types 的请求正在进行，直接返回该 Promise
  if (pendingRequestsMap.has(requestKey)) {
    return pendingRequestsMap.get(requestKey)!
  }

  // 创建新的请求 Promise
  const requestPromise = http<HelpContent[]>(
    'web.order.agreement.list',
    {
      ...params,
      pageSource,
    },
    {
      toast: false,
    },
  )
    .then((response) => {
      // 请求成功后，从 Map 中移除
      pendingRequestsMap.delete(requestKey)
      return response
    })
    .catch((error) => {
      pendingRequestsMap.delete(requestKey)
      // 重新抛出错误，让调用方可以处理
      return Promise.reject(error)
    })

  // 将请求 Promise 存储到 Map 中
  pendingRequestsMap.set(requestKey, requestPromise)

  return requestPromise
}

interface AgreementCheckParams {
  type?: number //	类型	number	是
  pageSource?: string // 页面来源  10-下单页面,20-查件页面
  waybillNumber?: string // 运单号，pageSource=20时，单票详情页运单号必填
}
/**
 * 滑动阅读协议-协议滑动底部后点击确定
 */
export const agreementCheckHasReadNew = (params: AgreementCheckParams) => {
  const { pageSource = '10' } = params
  return http<HelpContent>('web.order.agreement.v1.read', {
    ...params,
    pageSource,
  })
}

interface AgreementSaveParams {
  type: number //	0 运单电子协议 1 保费电子协议
  waybillNumber?: string // 运单号，pageSource=20时，单票详情页运单号必填
  pageSource?: string // 页面来源  10-下单页面,20-查件页面
  status: number // 勾选状态：0-取消勾选，1-确认勾选
  version: string
}
/**
 * 配置下单-勾选协议
 * @param params
 * @returns
 */
export const agreementSaveNew = (params: AgreementSaveParams) => {
  const { pageSource = '10' } = params
  return http<HelpContent>('web.order.agreement.v1.save', {
    ...params,
    pageSource,
  })
}
/**
 * 配置下单-协议默认是否选中
 * @param params type 0 后续改成0和1) 10 0 运单电子协议 20  1 保费电子协议（类型） 2 自提风险告知书
 * @returns
 */
export const getAgreementDefaultSelect = async (params: { type: 0 | 1 | 2 }) => {
  const { data } = await getHelpContentList({ types: params.type.toString() })
  return Promise.resolve({ data: data?.[0]?.status === 1 })
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
