import { ref } from 'vue'

export const declared = ref<number | string>('')

export const premium = ref<number | string>('')

export const premiumType = ref<number | null>(null)

export const originalPremium = ref<number | string>('')

export const bottomTips = ref('')

export const originalBottomTips = ref('')

// 是否显示弹窗
export const visible = ref(false)

export const originalDeclared = ref<number | string>('')

export const initAgreeContentResquest = ref(true)
