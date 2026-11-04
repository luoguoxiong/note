<template>
  <div
    class="ai-address-recommend"
    @click.stop
    v-exposure-report="expReport(receiveAiInfoVoList)"
    v-if="!noClose && (show || receiveAiInfoVoList?.length > 0)"
  >
    <div class="container">
      <!-- 三角标 -->
      <div class="container__icon"></div>
      <div class="container__header">
        <div class="title">已为您智能检测到历史常用收件地址</div>
        <div class="close" @click.stop="onClose"></div>
      </div>
      <!-- 列表 -->
      <div class="container__list">
        <div class="container__list-item" v-for="(item, index) in receiveAiInfoVoList" :key="index">
          <div class="container__list-left">
            <div class="container__list-left__info">
              <div class="container__list-left__info__name">{{ item.person }}</div>
              <div class="container__list-left__info__mobile">{{ item.mobile }}</div>
            </div>
            <div class="container__list-left__address">{{ fullAddress(item) }}</div>
          </div>
          <div class="container__list-right" @click="onSelect(item)" v-click-report="clickReport(item)">
            <KyButton text="使用" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// 组件
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// 类型
import { ListItem } from '@order-public-sub-public/types'
import { AddressValue } from '@order-public-sub-public/constants'
import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { clickReport, expReport } from './report/index'

interface PropType {
  receiveAiInfoVoList?: ListItem[]
}

const props = withDefaults(defineProps<PropType>(), {
  receiveAiInfoVoList: () => [],
})

const emit = defineEmits(['onSelect', 'onClose'])
const visible = computed(() => {
  return props.receiveAiInfoVoList?.length > 0
})

watch(
  () => visible.value,
  (value) => {
    show.value = value
  },
)

const show = ref(false)
const noClose = ref(false)

const onSelect = (item: AddressValue) => {
  const data = {
    person: getValueOrEmpty(item?.person),
    mobile: getValueOrEmpty(item?.mobile),
    telephone: getValueOrEmpty(item?.telephone),
    companyName: getValueOrEmpty(item?.companyName),
    extension: getValueOrEmpty(item?.extension),
    province: getValueOrEmpty(item?.province),
    city: getValueOrEmpty(item?.city),
    county: getValueOrEmpty(item?.county),
    detailAddress: getValueOrEmpty(item?.detailAddress),
  }
  emit('onSelect', data)
  onClose()
}

const onClose = () => (noClose.value = true)

// 完整地址
const fullAddress = (item: ListItem) => {
  const { province = '', city = '', county = '', area = '', detailAddress = '' } = item || {}
  return `${province}${city}${county || area}${detailAddress}`
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
