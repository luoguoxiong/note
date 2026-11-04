import { ref, computed } from 'vue'
// import { DisableItem } from '@order-public-sub-public/apis/init/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { AddedServiceConfig, woodenFrameInfoListType } from '@order-public-sub-public/types'
import { fileType } from '@order-public-sub-public/apis/pickup/type'

import {
  OtherPackageServiceEnum,
  PackageServiceEnum,
} from '@order-public-sub-public/components/business/added-service/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const packageService1 = 'https://ic-img.ky-express.com/netc/20250619_56839_!!1750305292257_404_404.png'
const packageService2 = 'https://ic-img.ky-express.com/netc/20250619_38741_!!1750305296743_404_404.png'
const packageService3 = 'https://ic-img.ky-express.com/netc/20250619_973_!!1750305299976_404_404.png'

// 回单类型
export const receiptFlag = ref('')

// 回单提供方
export const receiptProvider = ref('')
// 回单要求
export const receiptCheckType = ref<string[]>([])
// 回单是否加急
export const receiptUrgentReturn = ref('')

export const isHidePopupConfirmBtn = ref(false)

// 回单张数
export const receiptCount = ref<number | null>(1)

// 声明价值
export const collectionAmount = ref<string | number>('')

// 代收金额
export const collectionFee = ref(0)

// 木架方式
export const woodenFrame = ref<string>('20')

export const otherWoodFrameList = ref<string[]>([])

// 控货
export const goodsControl = ref('')

// ai推荐校验  true校验通过 默认校验通过
export const aiValidate = ref(true)

export const disabledInfos = computed(() => {
  const addedServiceModeData = piniaStore.schema.moduleConfigData(ModuleType['增值服务'])
  return addedServiceModeData.disabledInfos || []
})

// 电子回单-回单资料
export const uploadList = ref<fileType[]>([])

// 跨越代打-回单资料
export const kyeUploadList = ref<fileType[]>([])

// 回单提供方checkbox爆红提示
export const showCheckErrorTip = ref(false)

// 记录回单原件、回单照片的张数
export const receiptFileImageCount = ref(0)

// 拆木架
export const dismantlingWoodenFrame = ref('10')

// ai提示是否展示过
export const isReadAiTips = ref(false)

export const packageServiceListBase: woodenFrameInfoListType[] = [
  {
    name: '打木架',
    value: PackageServiceEnum['打木架'],
    img: packageService1,
    desc: '按体积收费',
    tip: '',
  },
  {
    name: '打木箱',
    value: PackageServiceEnum['打木箱'],
    img: packageService2,
    desc: '按体积收费',
    tip: '',
  },
  {
    name: '打卡板',
    value: PackageServiceEnum['打卡板'],
    img: packageService3,
    desc: '按个收费',
    tip: '',
  },
  // {
  //   name: '打木箱(国际标准)',
  //   value: PackageServiceEnum['打木箱(国际)'],
  //   img: packageService4,
  //   desc: '按体积收费',
  //   tip: '',
  // },
  // {
  //   name: '打木托(国际标准)',
  //   value: PackageServiceEnum['打木托(国际)'],
  //   img: packageService5,
  //   desc: '按个收费',
  //   tip: '',
  // },
]

export const otherPackageServiceListBase: woodenFrameInfoListType[] = [
  {
    name: '气泡柱',
    value: OtherPackageServiceEnum['气泡柱'],
    img: packageService1,
    desc: '按体积收费',
    tip: '',
  },
  {
    name: '珍珠棉',
    value: OtherPackageServiceEnum['珍珠棉'],
    img: packageService2,
    desc: '按体积收费',
    tip: '',
  },
  {
    name: '蜂窝板',
    value: OtherPackageServiceEnum['蜂窝板'],
    img: packageService3,
    desc: '按个收费',
    tip: '',
  },
  {
    name: '打护角',
    value: OtherPackageServiceEnum['打护角'],
    img: packageService1,
    desc: '按体积收费',
    tip: '',
  },
  {
    name: '打绷带',
    value: OtherPackageServiceEnum['打绷带'],
    img: packageService1,
    desc: '按个收费',
    tip: '',
  },
  {
    name: '气泡膜',
    value: OtherPackageServiceEnum['气泡膜'],
    img: packageService1,
    desc: '按个收费',
    tip: '',
  },
]
