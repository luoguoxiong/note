import { ref } from 'vue'

/**
 * @Desc: usePersonMobileLocal
 * @Date: 2025/10/20
 */
const usePersonMobileLocal = () => {
  const mobileLocal = ref('')
  const mobileLocalUpdate = (value: string) => {
    mobileLocal.value = value
  }
  return {
    mobileLocal,
    mobileLocalUpdate
  }
}

export default usePersonMobileLocal
