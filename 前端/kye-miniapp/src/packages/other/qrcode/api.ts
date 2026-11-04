import { http } from '@public/utils/request'
/**  获取取货和派货评分信息判断接口 */
export const scoreTrans = (param: any) => {
  return http<any>('web.order.score.trans', param)
}
