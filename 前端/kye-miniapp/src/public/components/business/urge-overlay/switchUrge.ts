import { setPushConfig } from '@/modules/waybill-build/apis/waybill-route/index'
import { isWechatEnv } from '@/public/utils'
import { getEnvConfig } from '@/public/constants'
import Taro from '@tarojs/taro'
//打开公众号
export const switchPushConfig = (waybillNumber: string, flag = true) => {
  return new Promise((resolve, reject) => {
    setPushConfig({ waybillNumber, openFlag: flag ? 10 : 20 }).then((res) => {
      if (+res.data.subscribe === 0) {
        if (isWechatEnv) {
          const { isProd } = getEnvConfig()
          wx.openOfficialAccountProfile({
            username: isProd ? 'kye_95324' : 'kye91588', // 此处填写公众号的微信号
            fail: () => {
              Taro.showToast({ title: '打开公众号失败', icon: 'none' })
            },
          })
        } else {
          return resolve({
            type: 'app',
          })
        }
      }

      if (!res.data.success) {
        Taro.showToast({ title: '打开公众号失败', icon: 'none' })
        return reject({
          type: 'fail',
        })
      }
      Taro.showToast({
        title: flag ? '公众号将推送物流信息' : '已关闭推送物流信息',
        icon: 'none',
      })
      return resolve(res)
    })
  })
}
