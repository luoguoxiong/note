import { computed, ref } from 'vue'
import { phone } from '@public/utils/pattern'

/**
 * @Desc: useWhiteListValid 切换客户手机号校验
 * @Date: 2025/7/19
 */
const useWhiteListValid = () => {
  // 白名单popover校验错误是否展示
  // const validPopoverShow = ref<boolean>(false)
  // 白名单popover校验内容
  const validPopoverContent = ref<string>('')
  // 白名单popover校验错误是否展示
  const validPopoverShow = computed(() => {
    return validPopoverContent.value
  })
  // 白名单popover内容设置
  const validPopoverSet = (content: string) => {
    validPopoverContent.value = content
  }

  /**
   * 验证内容
   * @param value
   * @returns {boolean}
   */
  const handleValidPopover = (value: string | number): boolean => {
    const valStr = String(value).trim()
    if (!valStr) {
      validPopoverSet('请输入手机号')
      return false
    }
    const tel = valStr.replace(/\s/g, '')
    if (!phone.test(tel)) {
      validPopoverSet('手机号格式不正确')
      return false
    }
    return true
  }
  // 清空valid
  const handleValidPopoverClear = () => {
    validPopoverSet('')
  }

  return {
    validPopoverShow,
    validPopoverContent,
    validPopoverSet,
    handleValidPopover,
    handleValidPopoverClear,
  }
}

export default useWhiteListValid
