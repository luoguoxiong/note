import { ref } from 'vue'
import { useDidShow } from '@tarojs/taro'
import { refreshWebviewCheck } from '@public/utils/webview'
import { useLogin } from '@/public/hooks'
import { urlContact } from '@/public/utils'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'

export const useWebview = ({ src, needLogin }) => {
  const { autoLoginHook } = useAutoLogin()

  const onLoaded = ref(false)

  const webviewSrc = ref('')

  const { token } = useLogin()

  const openWebviewUrl = () => {
    const parmas = needLogin ? { token: token.value } : {}
    const url = src || ''
    webviewSrc.value = urlContact(url, parmas)
  }

  useDidShow(async () => {
    try {
      if (needLogin) {
        await autoLoginHook({ needLogin: true })
      }
      if (!onLoaded.value) {
        onLoaded.value = true
        openWebviewUrl()
      } else {
        if (refreshWebviewCheck(webviewSrc.value)) {
          onRefresh()
          return
        }
      }
    } catch (error) {
      console.error(error)
    }
  })

  const onRefresh = () => {
    webviewSrc.value = ''
    setTimeout(() => {
      openWebviewUrl()
    }, 300)
  }

  return { webviewSrc }
}
