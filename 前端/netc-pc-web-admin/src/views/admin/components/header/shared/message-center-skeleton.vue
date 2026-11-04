<template>
  <el-skeleton class="message-center-skeleton__container" :loading="loading" animated>
    <template #template>
      <div class="message-center-skeleton__item" v-for="(_, index) in skeletonData" :key="index">
        <div class="flex flex_jc_b mb_6">
          <el-skeleton-item variant="text" style="width: 60px"></el-skeleton-item>
          <el-skeleton-item variant="text" style="width: 60px"></el-skeleton-item>
        </div>
        <el-skeleton-item variant="text" style="width: 260px"></el-skeleton-item>
      </div>
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
/**
 * 列表骨架屏
 * 来源: netc-pc-web/src/views/message-center-entry/components/message-center-skeleton.vue
 * element-ui slot="template" -> element-plus #template
 */
import { ref } from 'vue'

defineOptions({ name: 'message-center-skeleton' })

withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  {
    loading: false,
  }
)

const skeletonData = ref(Array.from({ length: 6 }))
</script>

<style lang="scss" scoped>
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.flex {
  display: flex;
}
.flex_jc_b {
  justify-content: space-between;
}
.mb_6 {
  margin-bottom: 6px;
}

.message-center-skeleton__container {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  margin-top: 34px;
  box-sizing: border-box;
}

.message-center-skeleton__item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f1f5;
}
</style>
