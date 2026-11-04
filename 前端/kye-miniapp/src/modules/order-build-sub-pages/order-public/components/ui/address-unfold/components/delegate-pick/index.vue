<template>
  <div class="address-unfold-delegate-pick">
    <div class="address-unfold-delegate-pick-text flex-items-center space-between" @click="openDispatch">
      <div class="left-box">
        <div class="left flex-items-center">
          <SvgIcon class="left-icon" name="receive-zi"></SvgIcon>
          <span>取货信息</span>
        </div>
        <div class="tip-box">取货联系人信息、取货照片/资料</div>
      </div>
      <div class="right flex-items-center">
        <div class="add-btn">{{ cellName || '去添加' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import { ModuleType } from '@order-public-sub-public/constants'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useStore } from '@order-public-sub-public/store'
import { getMessageToDriverText } from '@order-public-sub-public/components/business/message-to-driver/utils'
// 寄件人未保存的临时编辑值经 query 桥接给取货页（兼容跨子包 module 单例不共享）
import {
  person as senderPerson,
  province as senderProvince,
  city as senderCity,
  county as senderCounty,
  detailAddress as senderDetailAddress,
} from '@order-public-sub-public/hooks/address/sender/state'
const piniaStore = useStore()

const router = useRouter()
const route = useRoute()

//外显值
const cellName = computed(() => {
  const { uploadNum, cargoImgUploadNum } = piniaStore.schema.moduleDimensionData(ModuleType['取货资料']) || {}
  const { person, mobile, telephone } = piniaStore.order.moduleFormData(ModuleType['取货资料'])
  const hasFormData = person || mobile || telephone
  // 给取货司机捎句话已填写也算“已添加”（文案两态不变，仍固定展示“已添加”）
  const hasDriverMessage = !!getMessageToDriverText()
  if (uploadNum || cargoImgUploadNum) {
    return '已添加'
  }
  if (hasFormData || hasDriverMessage) {
    return '已添加'
  }
  return ''
})

//跳转取货资料
const openDispatch = () => {
  const isSenderPage = (route.name || '').indexOf('sender/page') > -1
  const query = isSenderPage
    ? {
        formPage: 'sender-page',
        senderPerson: senderPerson.value || '',
        senderAddress: `${senderProvince.value}${senderCity.value}${senderCounty.value}${senderDetailAddress.value}`,
      }
    : {}

  router.push({
    path: '/pickup-information',
    query,
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
