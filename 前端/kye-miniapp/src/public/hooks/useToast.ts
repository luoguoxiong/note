import { useToastStore } from '@public/components/base/toast/store'

export const useToast = () => {
  const toast = useToastStore()
  return {
    showToast: toast.showToast,
    hideToast: toast.hideToast,
  }
}
