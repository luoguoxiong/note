import { ref } from 'vue'
// 姓名
export const person = ref('')
// 手机号
export const mobile = ref('')
// 固定电话
export const telephone = ref('')
// 分机号
export const extension = ref('')
// 公司名称
export const companyName = ref('')
// 省
export const province = ref('')
// 城市
export const city = ref('')
// 区县
export const county = ref('')
// 详细地址
export const detailAddress = ref('')
// 指定地址id
export const locationId = ref('')
// 指定地址名
export const locationName = ref('')
// 指定地址
export const specifyAddress = ref('')
// 展馆号
export const exhibitionNumber = ref('')
// 展馆号code
export const exhibitionCode = ref('')
// 展位号
export const exhibitionSiteNumber = ref('')

export const exhibitionProject = ref('')

// 当前弹框类型，收 receive。寄 sender
export const currentPopueType = ref('sender')

// 平铺类型选择文件后设置底部按钮层级
export const showCutMasker = ref(false)
