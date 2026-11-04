<template>
  <view class="page-search-drawer">
    <ky-popup :show="searchDrawerVisible" position="right" safe-area-inset-top @update:show="handleUpdateVisible">
      <view class="page-search-drawer-content">
        <view class="search-drawer-content-wrap">
          <SearchDrawerItem :searchDrawerItems="searchDrawerItems"></SearchDrawerItem>
        </view>
        <view class="search-drawer-content-bottom">
          <view class="search-drawer-content-bottom-reset"><ky-button type="primary" plain>重置</ky-button></view>
          <view class="search-drawer-content-bottom-confirm"><ky-button type="primary">确定</ky-button></view>
        </view>
      </view>
    </ky-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchDrawerItem from '@order-public-sub-public/components/business/search-drawer-item/index.vue'
import './index.scss'

defineProps<{
  searchDrawerVisible: boolean
}>()

const searchDrawerItems = ref([
  {
    type: 'checkbox',
    key: 'activeRole',
    title: '角色',
    options: [
      { label: '全部', value: '1' },
      { label: '我寄的', value: '2' },
      { label: '我收的', value: '3' },
    ],
  },
  {
    type: 'calendar',
    key: 'orderRange',
    title: '寄件日期',
    defaultDate: ['', ''],
  },
  {
    type: 'input',
    key: '',
    title: '收件信息',
    options: [
      { label: '收件人信息', value: '' },
      { label: '收件人手机号', value: '' },
    ],
  },
])

const emit = defineEmits(['update:searchDrawerVisible'])

const handleUpdateVisible = (visible: boolean) => {
  emit('update:searchDrawerVisible', visible)
}
</script>
