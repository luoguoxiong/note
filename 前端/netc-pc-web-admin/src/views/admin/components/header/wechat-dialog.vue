<template>
  <KDialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    class="header-wechat-dialog"
    width="506"
    :has-header="false"
    :has-footer="false"
  >
    <img
      class="wechat-img"
      src="https://ic-img.ky-express.com/netc/20260923_53016_!!1790166039462_1012_1110.png"
      alt=""
    />
  </KDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { KDialog } from '@netc-design-pc/ui'

defineOptions({ name: 'wechat-dialog' })

const dialogVisible = ref(false)

const showDialogVisible = () => {
  dialogVisible.value = true
}

defineExpose({ showDialogVisible })
</script>

<style lang="scss">
// 纯图片弹窗：隐藏 KDialog 头部，body 内边距清零，图片自身带圆角
// 注意：不要加 append-to-body，否则逃出 .k-dialog 样式作用域，el-dialog 默认 16px padding 白边会复现
.header-wechat-dialog {
  --k-dialog-body-padding: 0;
  background: transparent;
  box-shadow: none;
  // background: transparent;
  // box-shadow: none;
  // .el-dialog__header {
  //   display: none;
  // }
  // .el-dialog__body {
  //   min-height: auto;
  //   padding: 0 !important;
  //   margin: 0 !important;
  //   overflow: hidden !important;
  // }
}

// 提升优先级覆盖 k-dialog 主题的 --el-dialog-border-radius(8px)，overflow 裁剪直角图片以露出圆角
// .k-dialog .el-overlay .el-overlay-dialog .el-dialog.header-wechat-dialog {
//   --el-dialog-border-radius: 16px;
//   overflow: hidden !important;
// }

.header-wechat-dialog .wechat-img {
  display: block;
  width: 100%;
  height: auto;
}
</style>
