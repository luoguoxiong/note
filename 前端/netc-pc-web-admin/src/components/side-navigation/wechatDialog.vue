<template>
  <el-dialog
    title=""
    class="home-wechat-dialog"
    width="416px"
    v-model="dialogVisible"
    :show-close="false"
    append-to-body
  >
    <img
      class="wechat-img"
      src="https://ic-img.ky-express.com/netc/20250907_90355_!!1757235496356_1012_1110.png"
      alt=""
    />
  </el-dialog>
</template>

<script>
export default {
  name: 'wechat-dialog',
  data() {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    showDialogVisible() {
      console.log(222)
      this.dialogVisible = true
    },
  },
}
</script>

<!-- <style lang="scss">
.wechat-dialog {
  .el-dialog__header {
    display: none !important;
  }
  .el-dialog__body {
    padding: 0 !important;
    margin: 0 !important;
    img {
      width: 416px;
      height: 464px;
      // scale: 1.22;
      // transform: translateY(6px);
      transform: scale(1.22);
    }
  }
}
</style> -->

<style>
/* .home-wechat-dialog .el-dialog__header {
  display: none;
}

.home-wechat-dialog .el-dialog__body {
  padding: 0 !important;
  margin: 0 !important;
} */

.home-wechat-dialog {
  height: 0px;
}

.wechat-img {
  width: 416px;
  height: 464px;
  transform: translateY(6px) scale(1.22);
}
</style>
