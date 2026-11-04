<template>
  <div class="empty-wrapper">
    <div class="empty-header">
      <img :src="noneDataImg" alt="" />
    </div>
    <div v-if="msg" v-html="msg"></div>
    <div v-else-if="!isCustomMsg" class="text c_666">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
/**
 * none-data-two 缺省空白页
 * 来源: netc-pc-web/src/components/none-data/none-data-two.vue (+ 其依赖 none-data/index.vue)
 * 结构内联还原: 老项目 none-data-two 仅是 none-data + 头部缺省图的组合
 */
import { ref } from 'vue'

defineOptions({ name: 'none-data-two' })

withDefaults(
  defineProps<{
    // 数据缺省提示
    msg?: string
    isCustomMsg?: boolean
  }>(),
  {
    msg: '',
    isCustomMsg: false,
  }
)

// 老项目 CDN_IMG_LIST.NONE_DATA_IMG_01
const noneDataImg = ref('https://ic-img.ky-express.com/netc/20230307_4602188237_!!1678194479658_140_140.png')
</script>

<style lang="scss" scoped>
/* 老项目全局工具类, 新项目无全局定义, 此处补齐 */
.c_666 {
  color: #666666;
}

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

  .empty-header {
    .empty {
      display: inline-block;
      width: 160px;
      height: 160px;
    }
  }

  .text {
    font-size: 14px;
  }
}
</style>
