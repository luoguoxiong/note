import { ref } from 'vue'
import { getShareParams } from '@order-public-sub-public/utils/share'
import { $native } from '@order-public-sub-public/utils'
import { isWechat } from '@order-public-sub-public/utils/device'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'

const show = ref(false)

/**
 * @description 分享hook
 */
export const useShare = () => {
  const onCancel = () => {
    show.value = false
  }

  /**
   * @description 唤起原生分享
   * @param waybillNumber
   */
  const share = async (waybillNumber: string) => {
    try {
      showLoadingToast({ message: '加载中', forbidClick: true })
      const shareParams = await getShareParams(waybillNumber)

      await $native?.share(shareParams)
      if (isWechat) {
        show.value = true
      }
    } catch (error) {
      // 当微信小程序$native没有分享方法的时候能够正常显示分享提示
      if (isWechat) {
        show.value = true
      }
    } finally {
      closeToast()
    }
  }

  return {
    show,
    onCancel,
    share,
  }
}
