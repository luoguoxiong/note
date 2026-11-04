import { ref } from 'vue'
import { getFreightTimeAuth } from '../api/index'

export const hasFrightFeeAuth = ref(false) // 是否有运费权限

export const getFreightTimePermission = async () => {
  const { data } = await getFreightTimeAuth()

  hasFrightFeeAuth.value = data?.some((item: any) => item.code === 'freightLookAuthFlag')
}
