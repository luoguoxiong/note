import { http } from '@public/utils/request'
import * as type from './type'

export const orderQuestionCheck = (param: type.CheckReq) => {
  return http<type.AlertStatusData>('web.order.configOrder.checkAlert', param)
}

export const updateBizStatus = (param: type.SubmitSurveyPayload) => {
  return http<null>('web.order.configOrder.common.updateBizStatus', param)
}
