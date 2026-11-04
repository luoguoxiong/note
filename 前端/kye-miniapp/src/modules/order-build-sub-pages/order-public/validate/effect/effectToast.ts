import { CheckDetail } from '@order-public-sub-public/types'
import { useToast } from '@public/hooks/useToast'
const { showToast } = useToast()

export const effectToast = (option: CheckDetail) => {
  if (!option) {
    return console.warn('校验数据为空')
  }
  return new Promise((resolve, reject) => {
    const { content, blockedFlag } = option
    showToast({
      title: content,
      icon: 'none',
    })
    if (blockedFlag) {
      reject(option)
    }
    resolve(option)
  })
}
