<template>
  <!-- 根据地址高度, 2行和1行的距离底部间距不一样 -->
  <div class="batch-waybill-receive">
    <div class="batch-waybill-receive-info font-special">
      <div class="receive-info-detail flex">
        <div class="receive-info-detail-left">收</div>
        <div class="receive-info-detail-right">
          <div class="receive-user flex items-center">
            <div class="receive-user-name font-level2">{{ receiveInfo?.person }}</div>
            <div class="receive-user-phone">
              {{
                receiveInfo?.mobile ||
                `${receiveInfo?.telephone}${receiveInfo?.extension ? '-' + receiveInfo?.extension : ''}`
              }}
            </div>
          </div>
          <div class="receive-address pt-16 color-assist" ref="addressRef">
            {{ receiveInfo?.province }}{{ receiveInfo?.city }}{{ receiveInfo?.county }}{{ receiveInfo?.detailAddress }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { PickUp } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const addressRef = ref<InstanceType<typeof HTMLElement>>()

const receiveInfo = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['收方信息'])
})

const setUseHotZone = () => {
  piniaStore.extend.updateHotZoneStore({
    data: { Receive: true },
  })
}
onMounted(() => {
  setUseHotZone()
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
