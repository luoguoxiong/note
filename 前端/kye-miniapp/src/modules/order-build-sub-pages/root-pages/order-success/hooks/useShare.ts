import { ref } from 'vue'
import { getShareParams } from '@order-public-sub-public/utils/share'
import { $native } from '@order-public-sub-public/utils'
import { isWechat } from '@order-public-sub-public/utils/device'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { useOrderSuccess } from './useOrderSuccess'
import { OrderSuccessType } from '@order-public-sub-public/constants'

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

  const wxInitShare = async (waybillNumber: string) => {
    const { successOrderInfo, successWaybillList, orderSuccessPageConfig } = useOrderSuccess()
    // 展示通知收件人时，再去调用初始化分享数据
    const needShare = () => {
      const authVisible = successOrderInfo.value?.orderCompletedPageType
        ? [OrderSuccessType['调价审核'], OrderSuccessType['运单审核']].includes(
            successOrderInfo.value?.orderCompletedPageType,
          )
        : false
      const flag = orderSuccessPageConfig.value?.needShare?.toString() === 'true' ? true : false
      return flag && !authVisible && successWaybillList.value?.length === 1
    }
    try {
      // 如果是小程序需要初始化调用
      if (isWechat && needShare()) {
        const shareParams = await getShareParams(waybillNumber)

        await $native?.share(shareParams)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return {
    show,
    onCancel,
    share,
    wxInitShare,
  }
}
