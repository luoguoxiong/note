import { ref } from 'vue'

const currentTemplateId = ref<number | string | null>()

export const setTemplateId = (id: number | string | null) => {
  // 常规是-1，模板ID可能为0
  if (id && id !== 'undefined' && +id >= -1) {
    currentTemplateId.value = +id
  } else {
    currentTemplateId.value = null
  }
}

export const getTemplateId = () => {
  const templateId = currentTemplateId.value
  if (templateId === 'undefined') {
    return null
  }
  if (templateId && +templateId) {
    return +templateId
  }
  return null
}

// loading的配置
export const loadingToastOptions: any = {
  message: '加载中',
  duration: 10 * 1000,
  forbidClick: true,
}
