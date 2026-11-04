<template>
  <div class="message-center-list-bottom">
    <p class="message-center-list-loading" v-if="loading">
      <span class="loading-text">加载中...</span>
    </p>
    <p class="has-no-more" v-if="!loading && hasNoMoreComputed">没有更多了</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 列表底部加载/没有更多提示
 * 来源: netc-pc-web/src/views/message-center-entry/components/message-center-list-bottom.vue
 * loading2.png 由老项目 src/assets/image 复制至本模块 assets
 */
defineOptions({ name: 'message-center-list-bottom' })

withDefaults(
  defineProps<{
    // 下一页加载中
    loading?: boolean
    // 没有更多了
    hasNoMoreComputed?: boolean
  }>(),
  {
    loading: false,
    hasNoMoreComputed: false,
  }
)
</script>

<style lang="scss" scoped>
.message-center-list-bottom {
  margin: 16px 0;

  .has-no-more {
    color: #8f8fa8;
    text-align: center;
  }
}

.message-center-list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  margin: auto;
  position: relative;
  text-align: center;

  .loading-text {
    color: #8f8fa8;
    font-size: 12px;
  }

  &::before {
    content: '';
    background: url('./assets/loading2.png') no-repeat top center;
    background-size: 20px 20px;
    width: 20px;
    height: 20px;
    display: inline-block;
    margin-right: 4px;
  }
}
</style>
