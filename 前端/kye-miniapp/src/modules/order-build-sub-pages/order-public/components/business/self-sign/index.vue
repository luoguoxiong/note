<template>
  <div
    class="self-sign-content"
    v-if="visible"
    :class="{ 'show-border': isShowBorder, disabled: disabled }"
    v-exposure-report="{
      eventCode: 'exp_express_selfsign_v1',
      otherParams: () => ({ button_name: '本人签收' }),
    }"
  >
    <div class="self-sign" :class="{ 'self-sign-content-flag': selfSignFlag }">
      <div class="cell-content">
        <div class="label">
          需收方本人签收
          <SvgIcon v-show="required" class="product-spec-required" name="required" />
        </div>
        <div
          class="radio-content"
          v-click-report="{
            eventCode: 'other_express_selfsign_v1',
            otherParams: () => ({ is_signbyreceive: selfSignFlag ? '需要' : '不需要' }),
          }"
        >
          <KySwitch active-color="#8365F6" :model-value="selfSignFlag" @change="handleChange" />
        </div>
      </div>
      <div v-if="selfSignFlag" class="self-sign-content-tips">
        开启后，货物派送前会发送短信给收件人，签收时需出示给司机
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KySwitch from '@order-public-sub-public/components/base/ky-switch/index.vue'
import { computed, ref, watchEffect } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { useCheckSelfSign } from './hooks/useCheckSelfSign'
import { ModuleType, SelfSignType } from '@order-public-sub-public/constants'
import { PickUp, SelfSign } from '@order-public-sub-public/types'
import { filterAllSpace } from '@order-public-sub-public/utils'
import useEffect from '@order-public-sub-public/validate'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
const piniaStore = useStore()

defineProps<{ disabled?: boolean }>()

const visible = ref(false)
const required = ref(false)
const { effectBubble } = useEffect()

watchEffect(() => {
  const selfSignConfig = piniaStore.globalData.dynamicConfig('selfSign')
  visible.value = selfSignConfig?.visible || false
  required.value = selfSignConfig?.required || false
})
const selfSignFlag = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType.本人签收)?.selfSignFlag === SelfSignType.YES
})

const handleChange = async (value: boolean) => {
  const mobile = piniaStore.order.moduleFormData(ModuleType['收方信息'])?.mobile || ''
  if (value === true) {
    if (
      mobile === '' ||
      (value && mobile.length > 0 && !/^(1[3|4|5|6|7|8|9][0-9]\d{8})$/.test(filterAllSpace(mobile)))
    ) {
      const validateResult = [{ passed: false, key: 'receive.mobile', content: '使用本人签收需填写真实收件人手机' }]
      // await effectBubble(validateResult)
      showToast('使用本人签收需填写真实收件人手机')
      return
    }
  }
  useCheckSelfSign(value)
  showToast(`需收方本人签收${value ? '开启' : '关闭'}成功`)
}
const dyamincData = computed(() => piniaStore.globalData.dynamicConfig('waybillSpecialEncrypt') || {})
const isShowBorder = computed(() => {
  return dyamincData.value?.visible
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
