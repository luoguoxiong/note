<template>
  <view class="idcard-edit">
    <view class="idcard-edit-title">
      分享信息编辑
      <image v-if="isPaddingOrReject" :src="statusTargetImg" class="status-img" />
    </view>
    <view class="idcard-edit-text" @click="handleEditUserInfo">
      <image
        src="https://ic-img.ky-express.com/netc/20250125_4447039519_!!1737788263616_56_56.png"
        class="idcard-edit-btn"
      />
      编辑
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed } from 'vue'
import { trackEvent } from '@/packages/idcard/home/report'
import { useIdCardStore } from '@/packages/idcard/store/idcard'
import { lastModifyWorkOrderStatusMap } from '@/packages/idcard/const/index'

interface EditTitleProps {
  applyStatus: Number | String
  hrUserId: Number | String
  code: Number | String
}

const homeIdCardStore = useIdCardStore()

const props = defineProps<EditTitleProps>()

const isPaddingOrReject = computed(() =>
  [lastModifyWorkOrderStatusMap.padding, lastModifyWorkOrderStatusMap.reject].includes(props.applyStatus),
)

const isReject = computed(() => +props.applyStatus === +lastModifyWorkOrderStatusMap.reject)

const statusTargetImg = computed(() =>
  !isReject.value
    ? 'https://ic-img.ky-express.com/netc/20250225_50166301120_!!1740455003699_176_68.png'
    : 'https://ic-img.ky-express.com/netc/20250225_56666301164_!!1740454993614_176_68.png',
)

const handleEditUserInfo = () => {
  trackEvent('clk_business_card_edit_sharing_information', '分享信息编辑', {
    page_name: 'page_business_card_edit',
    employee_id: props.hrUserId,
    sales_id: props.hrUserId,
  })
  homeIdCardStore.updateFresh(true)
  Taro.navigateTo({
    url: `/packages/idcard/edit/index?id=${props.code}`,
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
