import { ref } from 'vue'

// 新增、编辑时，公司名编辑态
export const companyNameModifyShipperFlag = ref(true)
// 公司名
export const companyName = ref('')
// 寄件信息mobile是否必填
export const senderMobileRequire = ref(false)

//地址簿中心展示语音识别入口
export const voiceAiDiscernVisible = ref(true)
