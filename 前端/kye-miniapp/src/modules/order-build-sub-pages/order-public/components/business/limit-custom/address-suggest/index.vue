<template>
  <dialog-masker
    :title="title"
    :className="className"
    :showCancelButton="false"
    :showConfirmButton="false"
    :closeable="closeable"
    :beforeClose="beforeClose"
    :renderClassName="true"
  >
    <template #default>
      <div class="title-container suggest-dialog">
        <p class="tip">猜您会选择以下寄件信息</p>
        <div class="limit-address-list">
          <div
            class="address-item"
            v-for="(item, index) in senderInfoVoList"
            :key="index"
            @click="selectAddressFun(item)"
          >
            <div class="flex top">
              <div class="name">{{ item.person }}</div>
              <div class="mobile">{{ item.mobile }}</div>
            </div>
            <div class="companyName">{{ item.companyName }}</div>
            <div class="address">{{ item.province }}{{ item.city }}{{ item.county }}{{ item.detailAddress }}</div>
          </div>
        </div>
      </div>
    </template>
  </dialog-masker>
</template>

<script lang="ts" setup>
import dialogMasker from './../dialog-masker/index.vue'
import { ReceiveAiInfo } from '@order-public-sub-public/types'
import { addressDialogProps } from '@order-public-sub-public/components/business/limit-custom/address-suggest/types'
const emit = defineEmits(['selectAddress', 'update:show'])

const selectAddressFun = (value: ReceiveAiInfo) => {
  emit('selectAddress', value)
}

defineProps<addressDialogProps>()
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
