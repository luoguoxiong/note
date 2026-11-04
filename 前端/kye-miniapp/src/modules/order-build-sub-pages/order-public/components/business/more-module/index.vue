<template>
  <div>
    <div class="more-container">
      <div class="left-line line"></div>
      <div class="content" @click="toggleHandle">
        <span>更多功能</span>
        <span class="more-button">{{ expandFlag ? '收起' : '展开' }}</span>
        <SvgIcon class="more-expand" :class="{ 'expand-icon': expandFlag }" name="right-arrow-blue"></SvgIcon>
      </div>
      <div class="right-line line"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useToggleExpand } from './hooks/useState'

const { expandFlag, toggleExpand } = useToggleExpand()

//切换展开收起状态
const toggleHandle = () => {
  toggleExpand()
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
