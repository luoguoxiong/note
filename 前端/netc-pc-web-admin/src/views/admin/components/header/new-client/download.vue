<template>
  <div class="container">
    <div class="button" @click="openDownload">
      <img src="https://ic-img.ky-express.com/netc/20221027_87063189553_!!1666853583402_532_216.png" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/download.vue
 * 迁移说明: Options API -> <script setup lang="ts">
 */
defineOptions({ name: 'download' })

const downloadUrl = 'https://kydl.kyslb.com/ic/test/20221025/%E8%B7%A8%E8%B6%8A%E5%AE%A2%E6%88%B7%E7%AB%AFV1.3.2.exe'

const openDownload = () => {
  const newWindow = window.parent as any
  const getClientFrameType = () => {
    if (newWindow['net_isInClient'] && typeof newWindow['net_isInClient'] === 'function') {
      return 1
    } else if (newWindow.webViewName && newWindow.mbQuery && typeof newWindow.mbQuery === 'function') {
      return 2
    } else if (newWindow.CefSharp) {
      return 3
    } else if (newWindow.electronClient) {
      return 5
    }
    if (newWindow.chrome?.webview?.hostObjects?.netFuncs) {
      return 4
    }
  }
  if (getClientFrameType()) {
    newWindow.net_downLoadFile(downloadUrl, '', '客户端.exe')
    return
  }
  window.location.href = downloadUrl
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  background: url('https://ic-img.ky-express.com/netc/20221027_45363189592_!!1666853516661_3840_2160.jpeg');
  background-size: cover;
  overflow: hidden;
  position: relative;
  .button {
    width: 256px;
    height: 108px;
    position: absolute;
    left: 28%;
    top: 61%;
    cursor: pointer;
    img {
      width: 100%;
    }
  }
}
</style>
