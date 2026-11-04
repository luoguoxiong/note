<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <div class="not-found-text">抱歉，您访问的页面不存在</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/admin/home')
}
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;

  .not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .not-found-code {
    font-size: 96px;
    font-weight: 600;
    line-height: 1;
    color: #3d5afe;
  }

  .not-found-text {
    margin: 16px 0 24px;
    font-size: 16px;
    color: #606266;
  }
}
</style>
