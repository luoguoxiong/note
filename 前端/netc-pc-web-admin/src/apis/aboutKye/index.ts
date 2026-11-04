import { http } from '@/utils/request/request'

/** 关于跨越-图片项 */
export interface CompanyIntroductionPic {
  picUrl: string
  picTitle: string
}

/** 关于跨越-公司介绍 */
export interface CompanyIntroduction {
  title1: string
  title2: string
  content: string
  picList: CompanyIntroductionPic[]
}

// 关于跨越介绍（来源: netc-pc-web/src/services/api/aboutKye.js getCompanyIntroduction，旧 hideErrMsg -> toast: false）
export const getCompanyIntroduction = () => {
  return http<CompanyIntroduction>('web.cms.companyIntroduction.about', { source: 'pc' }, { toast: false })
}
