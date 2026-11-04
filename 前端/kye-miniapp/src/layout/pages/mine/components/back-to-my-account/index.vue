<template>
  <FloatPanel usePCAreaLimit :is-hide="false" :topLimit="0" v-if="showBackSelf" adsorbDirection="left">
    <view class="float-ball">
      <network-image
        class="back-marketing__image"
        src="https://ic-img.ky-express.com/netc/20230925_13521882323_!!1695651901009_248_256.png"
        @tap.stop="handleGoBack"
      ></network-image>
      <network-image
        class="back-marketing__close"
        src="https://ic-img.ky-express.com/netc/20250709_8530_!!1752047746874_72_72.png"
        @tap.stop="handleCloseSwitch"
      ></network-image>
    </view>
  </FloatPanel>
</template>

<script lang="ts" setup>
import FloatPanel from '@public/components/base/float-panel/index.vue'
import { useLoginWhiteListSetting } from '@/modules/setting/pages/index/hooks/useLoginWhiteList'
import { computed, ref, watch } from 'vue'
import './index.scss'

defineOptions({ name: 'default-account' })

const props = defineProps<{
  backMyAccountCallBack?: Function | any
}>()

const setting = useLoginWhiteListSetting()

const showBackSelf = ref(setting.showBackSelfBtn.value)
const showBackSelfBtn = computed(() => setting.showBackSelfBtn.value)

watch(showBackSelfBtn, () => {
  showBackSelf.value = showBackSelfBtn.value
})

const handleCloseSwitch = () => {
  showBackSelf.value = false
}

const handleGoBack = () => {
  setting.handleGoBack(props.backMyAccountCallBack)
}
</script>
