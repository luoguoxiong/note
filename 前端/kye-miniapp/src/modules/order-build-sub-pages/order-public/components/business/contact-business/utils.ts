import { $native, isDesktopWechatMiniprogram } from '@order-public-sub-public/utils/index'
import { getOrderSearchUal } from '@order-public-sub-public/apis'
import { isLocal } from '@order-public-sub-public/utils/env'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { debounce } from 'lodash-es'
import { ref } from 'vue'
import { openURL } from '@/modules/webview/utils'
const isPhoneRealNameLoading = ref(false)
export const virtualPhoneRealName = debounce(
  async (phone?: string) => {
    if (isPhoneRealNameLoading.value) return
    isPhoneRealNameLoading.value = true
    if (isDesktopWechatMiniprogram()) {
      showToast('当前登录设备，暂不支持拨打功能')
      isPhoneRealNameLoading.value = false
      return
    }
    try {
      const url = await getVirtualPhoneRealNameUrl(phone)
      openURL(url, {
        needLogin: true,
      })
    } catch (e) {
      console.log(e)
    } finally {
      setTimeout(() => {
        isPhoneRealNameLoading.value = false
      }, 2000)
    }
  },
  300,
  { leading: true },
)

export const getVirtualPhoneRealNameUrl = async (phone?: string) => {
  let url = ''
  let grayHeader = ''
  try {
    const { data } = await getOrderSearchUal({
      channelCode: 'android',
      menuCodes: ['M1088'],
    })
    const infos = data?.vos?.[0]?.lightApplicationInfos?.[0]
    url = infos?.loadAddress
    grayHeader = infos?.grayHeader
  } catch (e) {
    console.error(e)
  }
  if (!url) {
    url = isLocal
      ? `https://ic-h5-uat.kye-erp.com/netc-h5-modules/real-name/index.html#/`
      : `https://ic-h5.kye-erp.com/netc-h5-modules/real-name/index.html#/`
  }
  return `${url}?grayheader=${encodeURIComponent(JSON.stringify(grayHeader))}&phone=${phone}`
}
