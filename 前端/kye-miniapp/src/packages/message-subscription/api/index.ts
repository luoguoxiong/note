import { http } from '@public/utils/request'
import { TemplateListRes } from './types'

export const getTemplateList = (params: { type: number }) => {
  return http<TemplateListRes[]>('web.advertisement.msg.third.template.getList', params)
}
