<template>
  <div class="old-dialog" v-if="showDialog">
    <div class="main">
      <div class="header"></div>
      <img src="https://ic-img.ky-express.com/netc/20221215_63763189527_!!1671097848878_316_252.png" alt="" />
      <p class="title">发现电脑存在旧版本</p>
      <p class="intro">尊敬的客户，为了不影响您后续的使用体验，建议您卸载旧版本客户端</p>
      <p class="tip">如有疑问请联系商务</p>
      <div class="button-list">
        <div class="button" @click="noNeedTip">暂不卸载</div>
        <div class="button dark" @click="openUninstall">立即卸载</div>
      </div>
      <div class="close-icon flex" @click="noNeedTip">
        <el-icon class="el-icon-close el-icon"><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/uninstall-old.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - this.$native.openUninstall -> @/native/electron
 *  - el-icon-close 字体图标 -> el-icon + @element-plus/icons-vue (class 名保留)
 */
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { openUninstall as openUninstallNative } from '@/native/electron'

defineOptions({ name: 'uninstallOld' })

const emit = defineEmits<{
  (e: 'uninstallClose'): void
}>()

const showDialog = ref(false)

const switchDialog = (flag: boolean) => {
  showDialog.value = flag
  if (!flag) {
    emit('uninstallClose')
  }
}

const noNeedTip = () => {
  switchDialog(false)
  localStorage.setItem('noNeedUninstallOldClient', '1')
}

const openUninstall = () => {
  openUninstallNative()
  noNeedTip()
}

defineExpose({ switchDialog })
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.old-dialog {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  .main {
    width: 600px;
    height: 410px;
    background: #ffffff;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: PingFang SC, PingFang SC-8;
    position: relative;
    overflow: hidden;
    p {
      padding: 0 52px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #03050d;
      line-height: 24px;
      text-align: center;
    }
    img {
      display: block;
      width: 158px;
      margin: 30px auto 0;
    }
    .intro {
      font-size: 16px;
      font-weight: 400;
      text-align: left;
      color: #03050d;
      line-height: 24px;
      margin: 12px 0 8px;
    }
    .tip {
      font-size: 13px;
      font-weight: 400;
      color: #6e6d72;
      line-height: 18px;
    }
    .header {
      width: 100%;
      height: 46px;
      background: url('https://ic-img.ky-express.com/netc/20221216_46763189579_!!1671172129442_1200_92.png') no-repeat;
      background-size: cover;
    }
    .button-list {
      display: flex;
      justify-content: center;
      margin-top: 30px;
      .button {
        width: 154px;
        height: 44px;
        border: 1px solid #d7d7db;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #6e6d72;
        cursor: pointer;
      }
      .dark {
        background: linear-gradient(138deg, #ac97ff 3%, #8365f6 98%);
        color: #ffffff;
        margin-left: 30px;
        border: none;
      }
    }
    .close-icon {
      position: absolute;
      right: -5px;
      top: 15px;
      width: 36px;
      height: 36px;
      color: #666666;
      i {
        font-size: 14px;
        cursor: pointer;
        color: #ffffff;
      }
    }
  }
}
</style>
