<template>
  <ky-container v-bind="pageOptions">
    <view class="preview preview-container">
      <view v-if="urlList.length" class="preview-swiper">
        <swiper circular class="preview-swiper-h" :current="currentSwiper" @change="onSwiperChange">
          <swiper-item v-for="(item, index) in urlList" :key="`f${index}`" class="preview-swiper-item">
            <image
              :style="getImageStyle(index)"
              mode="aspectFit"
              class="preview-img"
              :src="item"
              @error="urlList[index] = ERROR_PICTURE_IMG"
            />
          </swiper-item>
        </swiper>

        <view v-if="urlList.length > 1" class="preview-active">
          <image class="preview-active-left" @tap="() => onPageTurn('left')" :src="leftIcon" />
          <image class="preview-active-right" @tap="() => onPageTurn('right')" :src="rightIcon" />
        </view>

        <view class="total">{{ `(${currentSwiper + 1}/${urlList.length})` }}</view>

        <view class="preview-footer">
          <view class="btn save" @click="() => saveImageLocally(urlList[currentSwiper])">
            <image class="btn-img" :src="saveIcon" />
          </view>
          <view class="btn-right">
            <view class="btn roate" @click="() => onImageRotate(currentSwiper)">
              <image class="btn-img" :src="rotateIcon" />
            </view>
            <view class="btn" @click="() => onMaxScaleChange(currentSwiper)">
              <image class="btn-img" :src="enlargeIcon" />
            </view>
            <view class="btn" @click="() => throttledScaleImage(currentSwiper)">
              <image class="btn-img" :src="zoomIcon" />
            </view>
          </view>
        </view>
      </view>
      <view v-else></view>
    </view>
  </ky-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'

import { throttle } from 'lodash-es'
import './index.scss'
import { isAmapMiniApp } from '@/public/utils'
import plateform from '@kye-netc/plateform'

const enlargeIcon = 'https://ic-img.ky-express.com/netc/20250827_1056_!!1756259684823_36_36.png'
const saveIcon = 'https://ic-img.ky-express.com/netc/20250827_38467_!!1756259804330_72_72.png'
const rotateIcon = 'https://ic-img.ky-express.com/netc/20250827_96414_!!1756259801498_72_76.png'
const zoomIcon = 'https://ic-img.ky-express.com/netc/20250827_24665_!!1756259844527_36_36.png'
const rightIcon = 'https://ic-img.ky-express.com/netc/20250827_28759_!!1756259781111_108_108.png'
const leftIcon = 'https://ic-img.ky-express.com/netc/20250827_20094_!!1756259688994_108_108.png'

const ERROR_PICTURE_IMG = 'https://ic-img.ky-express.com/default/20250816_70011_!!1755327621597_630_630.png'

defineOptions({ name: 'PreviewImage' })

// 响应式数据
const urlList = ref([])
const currentSwiper = ref(0)
const styleObj = ref({})
const styleScaleObj = ref({})
const pageOptions = ref({
  navBarOptions: {
    showPlatList: [],
    title: '图片预览',
  },
  scrollOptions: {
    scrollViewPlatList: [],
  },
})

// 获取路由参数
const { params } = useRouter()
const { urls, current } = params

// 计算图片样式
const getImageStyle = (index) => {
  const rotate = styleObj.value[index] ? `rotate(${styleObj.value[index]}deg)` : ''
  const scale = styleScaleObj.value[index] ? `scale(${styleScaleObj.value[index]})` : ''

  return { transition: 'transform 0.3s ease', transform: `${rotate} ${scale}` }
}

// 初始化
onMounted(async () => {
  const newUrls = typeof urls === 'string' ? JSON.parse(decodeURIComponent(urls)) : urls
  urlList.value = Array.isArray(newUrls) ? newUrls : []
  const thisCurrent = decodeURIComponent(current)
  const currentIndex = urlList.value.findIndex((item) => item === thisCurrent)

  currentSwiper.value = Math.max(currentIndex, 0)
})

// 点击下载
const saveImageLocally = async (imgUrl) => {
  try {
    // 下载文件资源到本地
    await plateform.saveImageToPhotosAlbum(imgUrl)
    // 显示成功提示
    await Taro.showToast({ title: '成功保存到相册', icon: 'none' })
  } catch {
    Taro.showModal({
      title: '提示',
      content: '需要您授权保存相册',
      showCancel: false,
      success: () => Taro.openAppAuthorizeSetting({}),
    })
  }
}

// 点击翻转
const onImageRotate = (index) => {
  const row = styleObj.value[index] || 0

  if (!row) {
    styleObj.value = { ...styleObj.value, [index]: 90 }
  } else {
    const rotateNumber = row + 90
    styleObj.value = { ...styleObj.value, [index]: rotateNumber === 360 ? 0 : rotateNumber }
  }
}

// swiper切换
const onSwiperChange = (e) => {
  currentSwiper.value = Number(e.detail.current)
}

// 点击左右翻页
const onPageTurn = throttle(async (type) => {
  const len = urlList.value.length
  if (type === 'left') {
    if (currentSwiper.value === 0) {
      await Taro.showToast({ icon: 'none', title: '已经是第一张了' })
    } else {
      currentSwiper.value = currentSwiper.value - 1
    }
  }
  if (type === 'right') {
    if (currentSwiper.value === len - 1) {
      await Taro.showToast({ icon: 'none', title: '没有更多了' })
    } else {
      currentSwiper.value = currentSwiper.value + 1
    }
  }
}, 300)

// 放大
const onMaxScaleChange = throttle((index) => {
  const row = styleScaleObj.value[index] || 1

  if (row === 1) {
    styleScaleObj.value = { ...styleScaleObj.value, [index]: 1.4 }
  } else {
    const scaleNumber = row + 0.4
    styleScaleObj.value = { ...styleScaleObj.value, [index]: scaleNumber >= 5 ? 5 : scaleNumber }
  }
})

// 缩小
const throttledScaleImage = throttle((index) => {
  const row = styleScaleObj.value[index] || 1

  if (row === 1) {
    styleScaleObj.value = { ...styleScaleObj.value, [index]: 0.6 }
  } else {
    const scaleNumber = row - 0.4
    styleScaleObj.value = { ...styleScaleObj.value, [index]: scaleNumber <= 0.2 ? 0.2 : scaleNumber }
  }
})
</script>
