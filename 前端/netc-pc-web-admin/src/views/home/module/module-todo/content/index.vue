<template>
  <div id="todo-content" :class="{ 'is-empty': isEmpty }">
    <div class="title-wrap">
      <span class="title">待办事项</span>

      <span class="desc" v-show="isEmpty"> 暂无待办事项</span>
    </div>
    <div class="todo-box" v-show="!isEmpty">
      <slot v-if="!isLoading"></slot>
      <Loading v-if="isLoading"></Loading>
    </div>
  </div>
</template>
<script setup lang="ts">
import Loading from '@/views/home/components/loading/index.vue'
interface TodoContentProps {
  isEmpty: boolean
  isLoading: boolean
}
defineProps<TodoContentProps>()
</script>
<style scoped lang="scss">
#todo-content {
  position: relative;
  overflow: hidden;
  height: 320px;
  padding: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
}

/* 空态仅保留标题行 + "暂无待办事项"提示，卡片收缩，避免大面积留白 */
#todo-content.is-empty {
  height: 72px;
}
.title-wrap {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 30;
  display: flex;
  align-items: center;
  height: 24px;
  box-sizing: border-box;
}
.title {
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
}
.desc {
  font-size: 13px;
  color: #686b75;
  margin-left: 8px;
  display: flex;
  align-items: center;
}
.todo-box {
  position: relative;
  height: 320px;
  box-sizing: border-box;
}
</style>
