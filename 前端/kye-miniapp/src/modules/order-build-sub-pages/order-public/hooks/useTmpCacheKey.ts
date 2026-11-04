import { ref } from 'vue'
export const tmpCacheKey = ref('')
/**
 * 请求头UUID：时间戳+六位随机数
 */
export const setUUid = () => {
  tmpCacheKey.value = `tmp-cache-${Date.now()}`
}

export const clearUUid = () => {
  tmpCacheKey.value = ''
}
