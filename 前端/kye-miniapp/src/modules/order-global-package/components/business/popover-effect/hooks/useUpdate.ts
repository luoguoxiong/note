import { ref } from 'vue'

const show = ref(false)
const popoverRef = ref(null)
const currentBubbleConfig = ref(null)

export function useGlobalPopover() {
  //用做产生气泡
  const updateValidateItem = (option: any) => {
    const { placement, offset, key = '', theme } = option
    currentBubbleConfig.value = {
      ...option,
    }
    popoverRef.value?.closePopover()
    setTimeout(() => {
      popoverRef.value?.showPopover(key, {
        location: placement,
        theme: theme || 'dark',
        offset,
      })
    })
  }

  const removeValidateSinge = () => {
    currentBubbleConfig.value = null
    show.value = false
    console.log('执行了关闭气泡的逻辑~~~~~')
    popoverRef.value?.closePopover()
  }
  return {
    updateValidateItem,
    removeValidateSinge,
    currentBubbleConfig,
    show,
    popoverRef,
  }
}
