import { ref } from 'vue'
import { WaybillSpecialEncryptRule } from '@order-public-sub-public/types'

export const waybillSpecialEncryptType = ref<string | boolean>(false)

export const waybillSpecialEncryptRules = ref<WaybillSpecialEncryptRule[]>([])

// 运单加密弹窗是否显示
export const popupContentVisible = ref(false)

// field弹窗是否显示
export const popupFieldVisible = ref(false)

// 是否同步加密设置
export const syncEncryptSetting = ref(false)

// 是否编辑过
export const isEncryptEdit = ref(false)

export const EncryptFieldColumn = {
  sender_phone: '电话',
  sender: '人姓名',
  shiping_company: '公司',
  shiping_address: '地址',
}
