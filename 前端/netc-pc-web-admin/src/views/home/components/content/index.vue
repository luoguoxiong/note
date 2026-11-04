<template>
  <div id="content" :style="style">
    <div class="title" id="content-icon">
      <span class="text">
        <slot name="title"></slot>
      </span>
      <slot name="more"></slot>
    </div>
    <div class="content-wrap">
      <slot name="content"></slot>
      <Loading v-show="isLoading"></Loading>
    </div>
  </div>
</template>
<script setup lang="ts">
import Loading from '@/views/home/components/loading/index.vue'
import { StyleValue } from 'vue'
interface ContentProps {
  isLoading?: boolean
  style?: StyleValue
}
defineProps<ContentProps>()
</script>
<style scoped lang="scss">
#content {
  padding: 16px 24px 24px 24px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  margin-top: 8px;
  & + #content {
    margin-bottom: 0;
  }
  .title {
    height: 18px;
    color: #24262b;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .text {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
  }
  .content-wrap {
    padding-top: 16px;
    position: relative;
  }
}
#content:nth-child(1) {
  margin-top: 0;
}
</style>
