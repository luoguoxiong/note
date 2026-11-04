<template>
  <ky-popup
    v-model:show="show"
    :closeOnClickOverlay="true"
    class="waybill-barcode-popup-box"
    position="center"
    style="z-index: 101"
    :catchMove="true"
  >
    <div class="barcode-popup" @click.stop>
      <div class="barcode-popup__content">
        <div class="barcode-popup__content-logo"></div>
        <div class="barcode-popup__content-title">寄件码</div>
        <div class="barcode-popup__content-desc">司机取件时<text class="highlight">出示寄件码</text>即可</div>
        <div class="barcode-popup__content-barcode">
          <image v-if="barcodeData" :src="barcodeData" class="barcode-popup__content-barcode-img" />
        </div>
        <div class="barcode-popup__content-waybill">{{ waybillNumber }}</div>
        <div class="barcode-popup__content-footer">
          <ky-button type="primary" size="small" class="save-image" @click="handleDownloadImage"> 保存图片 </ky-button>
        </div>
      </div>
      <span class="barcode-popup__content-close" @click.stop="() => (show = false)">
        <image src="https://ic-img.ky-express.com/netc/20230405_11463213482_!!1680679776357_120_120.png"></image>
      </span>
    </div>
  </ky-popup>
</template>

<script lang="ts" setup>
import './index.scss'
import { ref } from 'vue'
import { getBarcode, genDownloadBarCode } from './apis'
import Taro from '@tarojs/taro'
import plateform from '@kye-netc/plateform'

const show = ref<boolean>(false)
const barcodeData = ref<string>('')
const waybillNumber = ref<string>('')

/** 下载图片按钮点击 */
const handleDownloadImage = (): void => {
  if (!barcodeData.value) {
    Taro.showToast({
      title: '寄件码异常',
      icon: 'none',
    })
    return
  }
  Taro.showLoading({ mask: true, title: '加载中...' })
  genDownloadBarCode({ source: 0, waybillNumber: waybillNumber.value })
    .then(async (res) => {
      Taro.hideLoading()
      if (!res.data) return
      try {
        await plateform.saveImageToPhotosAlbum(res.data)
      } catch (error) {
        // Taro.showToast({
        //   title: error.message || '保存失败',
        //   icon: 'none',
        // })
      }
    })
    .catch(() => {
      Taro.hideLoading()
    })
}

const openPopup = (number: string) => {
  barcodeData.value = ''
  waybillNumber.value = number
  getBarcode({ waybillNumber: number })
    .then((res) => {
      if (!res.data) return Promise.reject()
      barcodeData.value = `data:image/png;base64,${res.data}`
      show.value = true
    })
    .catch(() => {
      Taro.showToast({
        title: '寄件码获取失败',
        icon: 'none',
      })
    })
}

defineExpose({
  openPopup,
})
</script>
