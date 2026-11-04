import { http } from '@/public/utils/request'

export function getHelp(data: WebHelpGetHelpIn) {
  return http<WebHelpGetHelpOut>('web.help.getHelp', data)
}

export function getNewHelpAgreement(data: WebHelpGetHelpIn) {
  return http<WebHelpGetHelpOut>('crm.open.agreementManage.queryAgreementList', data)
}

export interface WebHelpGetHelpIn {
  /**
   * 协议id
   */
  id: number
}

export interface WebHelpGetHelpOut {
  /**
   * id
   */
  id: number
  /**
   * 分类ID
   */
  classid: number
  /**
   * 分类ID
   */
  type: string
  /**
   * 内容标题
   */
  title: string
  /**
   * 排序
   */
  sort: number
  /**
   * 描述
   */
  descript: string
  /**
   * 内容
   */
  content: string
  /**
   * 发布者
   */
  publishUser: string
  /**
   * 创建时间
   */
  createDate: string
  /**
   * 创建时间
   */
  lastModifyUser: string
  /**
   * 最后修改时间
   */
  lastModifyDate: string
  /**
   * 帮助html代码
   */
  htmlCode: string
  /**
   * 文章访问量，默认为0
   */
  clickNum: number
  /**
   * 是否允许评论:0为不允许,1为允许
   */
  isOpenComment: number
  /**
   * 链接地址
   */
  url: string
  /**
   * 主题图片
   */
  titleImg: string
}
