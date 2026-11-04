<template>
  <div class="address-book-empty">
    <kyEmpty
      :type="EmptyTypeEnum.CUSTOM"
      :custom-config="{
        image: errorText === '当前无网络，请检查后重试' ? imageNetwork : imageAddress,
        description: errorText,
      }"
    >
      <KyButton v-if="errorText !== '暂无地址信息'" size="small" text="重新加载" @click="onReLoad" />
    </kyEmpty>
  </div>
</template>

<script setup lang="ts">
import kyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'

defineProps({
  errorText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['onReLoad'])
const onReLoad = () => emit('onReLoad')
// 注：此处是为了，无网络不显示图片的问题
const imageNetwork = 'https://ic-img.ky-express.com/netc/20250711_97982_!!1752226537213_280_280.png'

let imageAddress = ''
imageAddress = 'https://ic-img.ky-express.com/netc/20250619_5081_!!1750313034323_560_560.png'
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
