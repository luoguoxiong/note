import { ref } from 'vue'
import { useLogin } from '@/public/hooks'
import { useDidShow } from '@tarojs/taro'
import plateform from '@kye-netc/plateform'

export const showBusinessPopup = {
  show: false,
}

export const useContactBuisness = () => {
  const { isLogin } = useLogin()

  const showBussiness = ref(false)
  const showType = ref('phone')

  const showBuisnessOnShow = () => {
    if (showBusinessPopup.show) {
      openBusinessPopup()
      showBusinessPopup.show = false
    }
  }

  const openBusinessPopup = (type = 'phone') => {
    if (!isLogin.value) {
      plateform.makePhoneCall({ phoneNumber: '95324' })
    } else {
      showType.value = type
      showBussiness.value = true
    }
  }

  useDidShow(() => {
    showBuisnessOnShow()
  })

  return {
    openBusinessPopup,
    showBussiness,
    showType,
  }
}
