import { ref } from 'vue'
import { getSuccessPageTips } from '@order-public-sub-public/apis/waybill/orderSuccess'
import { SuccessPageTipType } from '@order-public-sub-public/types'
import { goRealNameHome } from '@order-public-sub-public/validate/utils'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { isWechat } from '@order-public-sub-public/utils'
import { isWeixinAppSync } from '@/public/config'
import { isWxPcApplet } from '@order-public-sub-public/utils/device'
import { getAppShareRealNameParams } from '@order-public-sub-public/utils/share'
import { useShare } from './useShare'
import Taro from '@tarojs/taro'
import { isH5FSEnv } from '@/public/utils'
import { YesOrNoNumber } from '@order-public-sub-public/constants'

const { show } = useShare()
const realAuthFlag = ref(true)

const realAuthTipsText = ref('')

const showGoRealNameFlag = ref(false)

const realNameButtonType = ref(10)

const extraData = ref({
  pointsAmount: 0,
})

let initFinishedPromise: Promise<unknown> | null = null

let clkGoRealName = false

const getSuccessPageTipsData = async (params?, options?: { delBatchId?: boolean }) => {
  try {
    const { data = [] } = await getSuccessPageTips(params, options)
    const item = data.find((i) => i.type === SuccessPageTipType.实名认证)
    if (!item) {
      realAuthFlag.value = true
      realAuthTipsText.value = ''
      showGoRealNameFlag.value = false
      return
    }
    const { context, hasButton, buttonType, extra } = item
    realAuthFlag.value = false
    showGoRealNameFlag.value = hasButton

    realAuthTipsText.value = context
    realNameButtonType.value = buttonType
    extraData.value = extra
  } catch (error) {
    console.log('getSuccessPageTipsData', error)
  }
}

const addRealAuthBackListen = () => {
  document.addEventListener('visibilitychange', () => {
    if (!clkGoRealName || document.visibilityState === 'hidden') {
      return
    }
    getSuccessPageTipsData()
    clkGoRealName = false
  })
}

const clearSuccessPageRealAuthFlag = () => {
  realAuthFlag.value = true
}

const goRealNameAuth = (waybillNumber?: string) => {
  clkGoRealName = true
  addRealAuthBackListen()
  goRealNameHome(waybillNumber)
}

const shareRealName = async (waybillNumber: string, senderMobile: string) => {
  if (isWxPcApplet) {
    // PC微信4.0以下版本报错，先使用引导方式
    show.value = true
    return
  }
  try {
    showLoadingToast({ message: '加载中', forbidClick: true, duration: 4000 })
    if (isWechat && initFinishedPromise) {
      await initFinishedPromise
    }
    if (isWeixinAppSync()) {
      const res = await new Promise((success, fail) => {
        wx.miniapp.hasWechatInstall({ success, fail })
      }).catch(() => ({ hasWechatInstall: false }))

      if (res?.hasWechatInstall) {
        const shareParams = await getAppShareRealNameParams(waybillNumber, senderMobile)
        try {
          wx.miniapp.shareMiniProgramMessage(shareParams)
        } catch (e) {
          console.error('111111', e)
        }
      } else {
        Taro.showModal({
          title: '温馨提示',
          content: '您的手机还没装微信哦，装好就能愉快使用啦',
          confirmText: '我知道了',
          confirmColor: '#8365F6',
          showCancel: false,
        })
      }

      // if (isWechat) {
      //   show.value = true
      // }
    } else {
      // 微信小程序分享 待定
      const shareParams = await getAppShareRealNameParams(waybillNumber, senderMobile)
      console.log('shareParams', shareParams)
      await window.wx.showShareImageMenu({
        title: shareParams.title,
        path: shareParams.imagePath,
        needShowEntrance: true,
        entrancePath: shareParams.path,
      })
    }
  } catch (error) {
    // 当微信小程序$native没有分享方法的时候能够正常显示分享提示
    // if (isWechat) {
    //   show.value = true
    // }
  } finally {
    closeToast()
  }
}

export const useRealAuth = () => {
  return {
    realAuthFlag,
    realAuthTipsText,
    showGoRealNameFlag,
    realNameButtonType,
    extraData,
    getSuccessPageTipsData,
    goRealNameAuth,
    clearSuccessPageRealAuthFlag,
    shareRealName,
  }
}
