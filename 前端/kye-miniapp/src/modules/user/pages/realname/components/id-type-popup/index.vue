<template>
  <ky-popup
    round
    catchMove
    position="bottom"
    class="id-card-type-popup"
    :show="show"
    :title="title"
    :lazy-render="false"
    @click-overlay="onClose"
  >
    <view class="id-card-type-popup__header">
      <view class="title-text">{{ title }}</view>
      <view class="close-box" @tap="onClose">
        <image
          class="popup-close"
          src="https://ic-img.ky-express.com/netc/20250726_41452_!!1753521106143_64_64.png"
        ></image>
      </view>
    </view>
    <view class="id-card-type-popup__body">
      <div
        v-for="item in idTypeOptions"
        :key="item.value"
        :class="['select-item', model.idType == item.value && 'is-active']"
        @click="handlePickIdType(item)"
      >
        <img
          v-show="model.idType === item.value"
          src="https://ic-img.ky-express.com/netc/20260108_13674_!!1767841190711_32_32.svg+xml"
          alt=""
          class="item-type-icon"
        />
        <img
          v-show="model.idType !== item.value"
          src="https://ic-img.ky-express.com/netc/20260119_28224_!!1768788769838_32_32.svg+xml"
          alt=""
          class="item-type-icon"
        />
        <span class="item-text4">{{ item.label }}</span>
      </div>
    </view>
  </ky-popup>
</template>
<script setup lang="ts">
import './index.scss'
import { idTypeOptions } from '../../hooks'

defineOptions({ name: 'IdTypePopup' })

const emits = defineEmits(['close', 'select'])
interface PropsType {
  model?: {
    idType: string
  }
  title?: string
  show: boolean
}
defineProps<PropsType>()

const onClose = () => {
  emits('close')
}

const handlePickIdType = (item: any) => {
  emits('select', item)
  onClose()
}
</script>
