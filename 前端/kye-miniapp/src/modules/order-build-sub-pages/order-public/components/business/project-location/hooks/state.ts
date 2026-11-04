import { ModuleType } from '@order-public-sub-public/constants'

import { Delivery } from '@order-public-sub-public/types'
import { computed, ref } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const areaColumns = [
  {
    text: '银河科技广场银河科技广场银河科技广场银河科技广场',
    value: '银河科技广场银河科技广场银河科技广场银河科技广场',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
    ],
  },
  {
    text: '星际数码商城',
    value: '星际数码商城',
    children: [
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
    ],
  },
  {
    text: '未来电子世界',
    value: '未来电子世界',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
    ],
  },
  {
    text: '智慧城购物中心',
    value: '智慧城购物中心',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
    ],
  },
  {
    text: '云顶数码港',
    value: '云顶数码港',
    children: [
      { text: 'B2楼', value: 'B2楼' },
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
    ],
  },
  {
    text: '环宇通讯市场',
    value: '环宇通讯市场',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
    ],
  },
  {
    text: '天际电子街',
    value: '天际电子街',
    children: [
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
    ],
  },
  {
    text: '极光科技中心',
    value: '极光科技中心',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
      { text: '10楼', value: '10楼' },
    ],
  },
  {
    text: '幻影电子集市',
    value: '幻影电子集市',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
      { text: '10楼', value: '10楼' },
      { text: '11楼', value: '11楼' },
    ],
  },
  {
    text: '星光数码天地',
    value: '星光数码天地',
    children: [
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
      { text: '10楼', value: '10楼' },
    ],
  },
  {
    text: '晨曦科技大厦',
    value: '晨曦科技大厦',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
    ],
  },
  {
    text: '日出电子商城',
    value: '日出电子商城',
    children: [
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
    ],
  },
  {
    text: '夜幕科技广场',
    value: '夜幕科技广场',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
      { text: '10楼', value: '10楼' },
      { text: '11楼', value: '11楼' },
      { text: '12楼', value: '12楼' },
    ],
  },
  {
    text: '流星数码城',
    value: '流星数码城',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
    ],
  },
  {
    text: '彩虹电子市场',
    value: '彩虹电子市场',
    children: [
      { text: 'B2楼', value: 'B2楼' },
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
    ],
  },
  {
    text: '琥珀科技中心',
    value: '琥珀科技中心',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
    ],
  },
  {
    text: '钻石数码港',
    value: '钻石数码港',
    children: [
      { text: 'B1楼', value: 'B1楼' },
      { text: '2楼', value: '1楼' },
      { text: '3楼', value: '2楼' },
      { text: '4楼', value: '3楼' },
      { text: '5楼', value: '4楼' },
      { text: '6楼', value: '5楼' },
      { text: '7楼', value: '6楼' },
      { text: '8楼', value: '7楼' },
      { text: '9楼', value: '8楼' },
      { text: '10楼', value: '9楼' },
      { text: '11楼', value: '10楼' },
    ],
  },
  {
    text: '翡翠电子广场',
    value: '翡翠电子广场',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
    ],
  },
  {
    text: '水晶科技商场',
    value: '水晶科技商场',
    children: [
      { text: 'B1楼', value: 'B1楼' },
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
      { text: '10楼', value: '10楼' },
      { text: '11楼', value: '11楼' },
    ],
  },
  {
    text: '宝石电子世界',
    value: '宝石电子世界',
    children: [
      { text: '1楼', value: '1楼' },
      { text: '2楼', value: '2楼' },
      { text: '3楼', value: '3楼' },
      { text: '4楼', value: '4楼' },
      { text: '5楼', value: '5楼' },
      { text: '6楼', value: '6楼' },
      { text: '7楼', value: '7楼' },
      { text: '8楼', value: '8楼' },
      { text: '9楼', value: '9楼' },
      { text: '10楼', value: '10楼' },
    ],
  },
]

export const sendExtend = computed(() => {
  return (
    piniaStore.order.moduleFormData(ModuleType['寄方信息'])?.extend || {
      projectNumber: '',
      projectArea: '',
      projectLocation: '',
    }
  )
})

export const selectValue = ref(['', ''])

export const showPopup = ref(false)

export const areaValue = computed(() => sendExtend.value?.projectArea || '')
export const locationValue = computed(() => sendExtend.value?.projectLocation || '')
export const projectNumber = computed(() => sendExtend.value?.projectNumber || '')
export const areaText = computed(() => `${areaValue.value}${locationValue.value ? '/' + locationValue.value : ''}`)

export const dynamicConfig = computed(() => piniaStore.globalData.dynamicConfig('senderProjectLocation', null))

// 显示隐藏
export const visible = computed(() => dynamicConfig.value?.visible || false)
export const areaVisible = computed(() => dynamicConfig.value?.locationInfo?.visible || false)
export const shopVisible = computed(() => dynamicConfig.value?.shopInfo?.visible || false)

// 动态名称
export const areaLabel = computed(() => dynamicConfig.value?.locationInfo?.areaLabel || '大厦')
export const floorLabel = computed(() => dynamicConfig.value?.locationInfo?.locationLabel || '楼层')
export const houseLabel = computed(() => dynamicConfig.value?.shopInfo?.shopNumberLabel || '门牌号')

// 占位符
export const areaPlaceholder = computed(() => `请选择${areaLabel.value}/${floorLabel.value}`)
export const housePlaceholder = computed(() => `请输入${houseLabel.value}`)
export const popupTitle = computed(() => `${areaLabel.value}/${floorLabel.value}`)

// 列表数据
export const areaList = computed(() => dynamicConfig.value?.locationInfo?.areaList || [])
