<template>
  <view class="card">
    <view :class="['menu', line]">
      <view class="menu-item" v-for="(item, index) in menuList" :key="item.title + index">
        <view class="menu-item-icon">
          <image :src="item.icon" class="menu-item-image" />
          <view class="menu-item-subscript" v-if="item.subscript">{{ item.subscript }}</view>
        </view>
        <view class="menu-item-text">
          {{ item.title }}
        </view>
      </view>
    </view>

    <view class="more" @click="handleToggle">
      <text class="more-text">{{ isToggle ? '收起' : '展开' }}</text>
      <image
        class="more-image"
        src="https://ic-img.ky-express.com/netc/20250116_39367474294_!!1737028569084_48_48.png"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, onBeforeMount, computed } from 'vue'
import { IMenu } from '@order-public-sub-root-pages/waybill-route/types'
import { menu } from '../../constant'

const menuList = ref<IMenu[]>([])
const isToggle = ref(true)

onBeforeMount(() => {
  menuList.value = menu.map((item) => ({
    ...item,
    subscript: item?.subscript && item.subscript(),
  }))
})

const line = computed(() => {
  if (!isToggle.value) return ''

  if (menuList.value.length > 15) {
    return 'line4'
  }

  if (menuList.value.length > 10) {
    return 'line3'
  }

  if (menuList.value.length > 5) {
    return 'line2'
  }

  return 'line1'
})

const handleToggle = () => {
  isToggle.value = !isToggle.value
}
</script>
