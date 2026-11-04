// 审批状态
// 名片变更工单状态：1.待审批 2.同意 3.拒绝
export const lastModifyWorkOrderStatusMap = {
  padding: 1,
  agree: 2,
  reject: 3,
} as const

// Optional: You can also add a type for the map values
export type LastModifyWorkOrderStatus = (typeof lastModifyWorkOrderStatusMap)[keyof typeof lastModifyWorkOrderStatusMap]

// Or if you need to use the keys as a type:
export type LastModifyWorkOrderStatusKey = keyof typeof lastModifyWorkOrderStatusMap

// 首页卡片展示
export const Template_ID_MAP: ITemplateIdMap = {
  个人介绍视频: 'businessCard_person-introduce_json',
  微信视频号: 'businessCard_wx-video_json',
  公司简介: 'businessCard_company-info_json',
  行业解决方案: 'businessCard_industry-solutions_json',
  企业荣誉: 'businessCard_company-honors_json',
  服务方式: 'businessCard_service-style_json',
  激情广告: 'businessCard_custom-style_json',
}

interface ITemplateIdMap {
  个人介绍视频: 'businessCard_person-introduce_json'
  微信视频号: 'businessCard_wx-video_json'
  公司简介: 'businessCard_company-info_json'
  行业解决方案: 'businessCard_industry-solutions_json'
  企业荣誉: 'businessCard_company-honors_json'
  服务方式: 'businessCard_service-style_json'
  激情广告: 'businessCard_custom-style_json'
}

export type TemplateKeyType = keyof ITemplateIdMap
export type TemplateValueType = ITemplateIdMap[TemplateKeyType]
