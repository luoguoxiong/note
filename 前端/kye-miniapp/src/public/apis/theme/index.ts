import { http } from '@public/utils/request'
import { GrayThemeConfigRes } from './type'

export const getAppThemeInfo = () => {
  return http<{
    style: any
    theme: GrayThemeConfigRes
  }>('web.advertisement.theme', {
    channelCode: 'miniprogram',
    operatePort: 'MINIPROGRAM',
    pageCode: 'homePageMobile',
    adTypeList: ['60'],
    loginPhone: '',
  })
}
