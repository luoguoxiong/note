<template>
  <template v-if="type === 'left-slide'">
    <div class="skeleton-content">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="p" class="h72" />
          <div style="padding: 10px 56px 0">
            <el-skeleton-item variant="text" class="h24" />
          </div>
        </template>
      </el-skeleton>
    </div>
    <div class="skeleton-content">
      <el-skeleton animated>
        <template #template>
          <div class="line-title">
            <el-skeleton-item variant="text" class="width96 h24" />
            <el-skeleton-item variant="text" class="width60 h24" />
          </div>
          <el-skeleton-item variant="p" class="mtop16 h24" />
          <el-skeleton-item variant="p" class="mtop16 h24 width320" />
        </template>
      </el-skeleton>
    </div>
  </template>
  <template v-else>
    <div class="skeleton-content">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="p" class="width96 h24" />
          <div class="card-wrap mtop16">
            <el-skeleton-item variant="p" class="card-item" />
            <el-skeleton-item variant="p" class="card-item" />
            <el-skeleton-item variant="p" class="card-item" />
            <el-skeleton-item variant="p" class="card-item" />
            <el-skeleton-item variant="p" class="card-item" />
            <el-skeleton-item variant="p" class="card-item" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div class="skeleton-content">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="p" class="width96 h24" />
          <el-skeleton-item variant="p" class="mtop16 h24" />
          <el-skeleton-item variant="p" class="mtop16 h24" />
          <el-skeleton-item variant="p" class="mtop16 width120 h24" />
        </template>
      </el-skeleton>
    </div>
  </template>
</template>
<script setup lang="ts">
interface SkeletonProps {
  type: 'left-slide' | 'right-slide'
}
defineProps<SkeletonProps>()
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
