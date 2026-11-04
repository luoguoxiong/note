<template>
  <view class="participate-box">
    <view class="text-list" :class="{ all: isAll }">
      <view class="item" v-for="item in prizeList" :key="item.levelName + item.name">
        <text class="label" :style="labelStyle">{{ item.levelName }}{{ item.initPrizeNumber }}名：</text>
        <text class="value" :style="valueStyle">{{ item.name }}</text>
      </view>
    </view>

    <view v-if="isNeedCustomerName" class="company-text-wrapper" :class="{ all: isAll }">
      <input
        :value="customerName"
        type="text"
        maxlength="12"
        placeholder="请输入您的姓名"
        @blur="onInputBlur"
        @input="(e) => emit('update:customerName', (e.target as HTMLInputElement).value)"
      />
    </view>

    <view v-if="isNeedCompanyName" class="company-text-wrapper" :class="{ all: isAll }">
      <input
        :value="companyName"
        type="text"
        maxlength="20"
        placeholder="请输入您的公司名称"
        @blur="onInputBlur"
        @input="(e) => emit('update:companyName', (e.target as HTMLInputElement).value)"
      />
    </view>

    <view v-if="isNeedCompanyAddr" class="company-text-wrapper" :class="{ all: isAll }" @click="handleShowAddress">
      <input :value="companyAddr" type="text" disabled placeholder="请输入您的公司地址" />
    </view>

    <view
      class="center-btn"
      :class="{ 'no-companyname': !(isNeedCompanyName || isNeedCustomerName || isNeedCompanyAddr) }"
    >
      <ColorfulButton :activity="activity" :text="buttonText" @click="() => emit('click')" />
    </view>

    <!-- 地址选择组件 -->
    <ChooseAddress v-if="initAddress" :show="showAddress" @close="handleAddressClose" @select="handleAddressSelect" />
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, ref } from 'vue'
import { isAutoModel } from '../../constants'
import ColorfulButton from '../colorful-button/index.vue'
import ChooseAddress from '../choose-address/index.vue'
import Taro from '@tarojs/taro'

// 首页说明文字样式配置
const homeFontOp = {
  label: {
    color: '#ffffff',
    fontWeight: 500,
  },
  labelNew: {
    color: '#3C2429',
    fontWeight: 500,
  },
  value: {
    color: '#ffffff',
    fontWeight: 300,
  },
  valueNew: {
    color: '#3C2429',
    fontWeight: 300,
  },
  autoModel: {
    color: '#ffffff',
    fontWeight: 500,
  },
}
// import MarketingLotteryAPI from '../../apis'

defineOptions({ name: 'ParticipateForm' })

const props = defineProps<{
  activity: any
  prizeList: any[]
  companyName: string
  customerName: string
  companyAddr: string
  isNeedCompanyName: boolean
  isNeedCustomerName: boolean
  isNeedCompanyAddr: boolean
}>()

const emit = defineEmits(['click', 'update:companyName', 'update:customerName', 'update:companyAddr', 'page-scroll'])

// 计算属性
const canAutoModel = computed(() => {
  const result = isAutoModel(props.activity)
  console.log('Participate canAutoModel 计算:', {
    activity: props.activity,
    result: result
  })
  return result
})

const isTemp = computed(() => {
  const result = props.activity && props.activity.templateId !== null && +props.activity.templateId === 0
  console.log('Participate isTemp 计算:', {
    activity: props.activity,
    templateId: props.activity?.templateId,
    result: result
  })
  return result
})
const isAll = computed(() => props.isNeedCompanyName && props.isNeedCustomerName && props.isNeedCompanyAddr)

// 按钮文本
const buttonText = computed(() => {
  let text = isTemp.value ? ' ' : 'GO!!!'
  text = canAutoModel.value ? '立即参与' : text
  console.log('Participate 按钮文本计算:', {
    isTemp: isTemp.value,
    canAutoModel: canAutoModel.value,
    activity: props.activity,
    templateId: props.activity?.templateId,
    finalText: text,
    textLength: text.length,
    textCharCode: text.charCodeAt(0)
  })
  return text
})

// 样式配置
const labelStyle = computed(() => {
  return canAutoModel.value ? homeFontOp['autoModel'] : isTemp.value ? homeFontOp['labelNew'] : homeFontOp['label']
})

const valueStyle = computed(() => {
  return canAutoModel.value ? homeFontOp['autoModel'] : isTemp.value ? homeFontOp['valueNew'] : homeFontOp['value']
})

// 状态
const showAddress = ref(false)
const initAddress = ref(false)

// 搜索地址（预留功能）
// async function searchAddress(keyword: string) {
//   try {
//     const result = await MarketingLotteryAPI.mapPosition({ keyword })
//     return result || []
//   } catch (error) {
//     console.log('搜索地址失败:', error)
//     return mockAddressList.value
//   }
// }

// 方法
function onInputBlur() {
  Taro.pageScrollTo({
    scrollTop: 0,
    duration: 0,
  })
}

function handleShowAddress() {
  showAddress.value = true
  initAddress.value = true
  emit('page-scroll', true)
}

function handleAddressClose() {
  showAddress.value = false
  emit('page-scroll', false)
}

function handleAddressSelect(data: any) {
  emit('update:companyAddr', data.companyAddr)
  showAddress.value = false
  emit('page-scroll', false)
}
</script>
