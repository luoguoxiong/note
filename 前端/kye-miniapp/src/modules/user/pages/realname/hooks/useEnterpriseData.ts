import { ref } from 'vue'

export const useEnterpriseData = ref({
  // 操作来源：移动端
  source: 20,
  creditCode: '', // 统一社会信用代码
})

export const updateEnterpriseData = (data: { creditCode: string }) => {
  useEnterpriseData.value = { ...useEnterpriseData.value, ...data }
}

export const isFromScan = ref(false)