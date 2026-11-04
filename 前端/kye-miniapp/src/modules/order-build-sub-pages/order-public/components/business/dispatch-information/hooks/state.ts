import { ref } from 'vue'
import { pickupConfig } from '@order-public-sub-public/apis/pickup/type'

// 表单配置
export const formConfigList = ref<pickupConfig[]>([])
// 骨架屏
export const initSuccess = ref(true)
