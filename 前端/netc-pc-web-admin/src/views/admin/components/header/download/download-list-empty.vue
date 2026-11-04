<template>
  <!-- 旧 none-data 组件结构内联还原 -->
  <div class="empty-wrapper">
    <img
      class="empty width_160"
      style="width: 160px"
      src="https://ic-img.ky-express.com/netc/20230308_73163189596_!!1678265895770_320_320.png"
      alt=""
    />
    <div class="text c_666">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 下载中心-任务列表空态
 * 从 download-list.vue 抽取(行为不变重构), 旧 none-data 组件结构内联还原
 */
</script>

<style lang="scss" scoped>
// 旧 none-data 组件样式
.empty-wrapper {
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px auto;
  line-height: 20px;
  color: #909399;
  font-size: 14px;
  .empty {
    display: inline-block;
  }

  .text {
    font-size: 14px;
  }

  .width_160 {
    width: 160px;
    height: 160px;
  }
}
</style>
