<template>
  <view class="lat" @click="handleOpen">
    <ky-lazy-image
      :delay="500"
      :placeholder="placeholder"
      :class="['lat__icon', 'lat__icon--' + guideKey]"
      :src="menuIcon || ''"
    ></ky-lazy-image>
    <ky-lazy-image :delay="500" mode="aspectFit" v-if="menuBackground" class="lat__corn-icon" :src="menuBackground" />

    <view class="at-badge" v-if="badgeType === 'dottle'"></view>
    <view class="at-text" v-if="badgeType === 'text'">{{ text }}</view>
    <ky-lazy-image
      :delay="500"
      mod="scaleToFill"
      class="at-tag"
      v-if="badgeType === 'tag' && !menuBackground"
      :src="tag"
    ></ky-lazy-image>

    <text class="lat__label">{{ menuName }}</text>

    <view v-if="guideText && guideVisible && popoverAlign" :class="['lat_p', `lat_p--${popoverAlign}`]" @click.stop>
      <text class="lat_p-text">{{ guideText }}</text>
      <ky-lazy-image
        :delay="500"
        src="https://ic-img.ky-express.com/netc/20250705_1215_!!1751697728234_64_64.png"
        class="lat_p-close"
        @tap.stop="handleHide"
        mode="aspectFit"
      />
      <view class="lat_p-arrow" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue'
import Taro from '@tarojs/taro'
import './item.scss'
import placeholder from '@/layout/assets/images/placeholder.png'
import PreloadImage from '@/public/components/base/preload-image/index.vue'
defineOptions({ name: 'lat' })

const props = defineProps({
  index: Number,
  menuName: String,
  menuIcon: String,
  menuBackground: String,
  guideText: String,
  guideKey: String,
  badgeType: String,
  count: Number,
  tag: String,
  text: String,
})

const emits = defineEmits(['open'])

const guideVisible = ref(false)
const popoverAlign = ref<'right' | 'left' | 'center'>()

function handleHide() {
  guideVisible.value = false
  if (!props.guideKey) return
  Taro.setStorage({ key: props.guideKey, data: JSON.stringify(false) })
}

// 5 个一行
function updateAnchor() {
  if ((props.index || 0) % 5 > 2) {
    popoverAlign.value = 'right'
  } else if ((props.index || 0) % 5 === 2) {
    popoverAlign.value = 'center'
  } else {
    popoverAlign.value = 'left'
  }
}

const updatePopover = async () => {
  if (!props.guideKey) return

  Taro.getStorage({
    key: props.guideKey,
    async success({ data }) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (data === null || data === undefined) {
        guideVisible.value = true
        nextTick(updateAnchor)
        return
      }
      const visible = JSON.parse(data)
      guideVisible.value = visible
      if (visible) nextTick(updateAnchor)
    },
    async fail() {
      await new Promise((resolve) => setTimeout(resolve, 200))
      guideVisible.value = true
      nextTick(updateAnchor)
    },
  })
}

watch(() => props.index, updatePopover, { immediate: true })

const handleOpen = () => {
  emits('open')

  handleHide()
}
</script>
