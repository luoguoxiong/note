import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'
import { computed, ref } from 'vue'

export const useLogin = () => {
  const { getToken, onTokenChange, onGlobalDataChange } = useCommonDataHook()

  const token = ref<string>(getToken())

  const isLogin = computed(() => !!token.value)

  onTokenChange((value: string) => {
    token.value = value
  })
  onGlobalDataChange(() => {
    token.value = getToken()
  })
  return { isLogin, token }
}
