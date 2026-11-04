<template>
  <view v-if="isPreview" class="id-card-page-edit__preview-idcard" @tap="handleClickPreviewIdcardWarp">
    <image
      @tap="() => onPreview(false)"
      class="back-icon"
      src="https://ic-img.ky-express.com/netc/20250218_76066301184_!!1739844936779_96_96.png"
    ></image>
    <view class="flex-item-center">
      <idcard-base-info :base-info="detail?.baseInfo" :is-popup="true">
        <view class="btn-item">
          <view class="contact-btn">
            <image
              class="contact-item-img"
              src="https://ic-img.ky-express.com/netc/20250206_78466301196_!!1738835096863_80_80.png"
            />
            <text class="contact-item">拨打电话</text>
          </view>
          <view class="contact-btn">
            <image
              class="contact-item-img"
              src="https://ic-img.ky-express.com/netc/20250206_51066301179_!!1738835096861_80_80.png"
            />
            <text class="contact-item">企业微信</text>
          </view>
        </view>
      </idcard-base-info>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { trackEvent } from '../../edit-report'
import IdcardBaseInfo from '@/packages/idcard/home/components/idcard-base/index.vue'

const props = defineProps({
  detail: {
    type: Object,
    default: () => {},
  },
})

const isPreview = ref(false)

const reportHrUserId = computed(() => props.detail.baseInfo?.hrUserId)

const handleClickPreviewIdcardWarp = () => {
  isPreview.value = false
}

const onPreview = (val) => {
  if (val) {
    trackEvent('clk_sharing_information_edit_preview_effect', '预览效果', {
      employee_id: reportHrUserId.value,
      sales_id: reportHrUserId.value,
    })
  }
  isPreview.value = val
}

defineExpose({
  onPreview,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
