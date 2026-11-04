<template>
  <van-image-preview
    v-model:show="show"
    :start-position="current"
    :overlay-style="overlay"
    :close-on-popstate="true"
    :images="images"
    :class="imagePreviewClass"
    @change="onChange"
  >
    <template v-slot:index>({{ index + 1 }}/{{ images.length }})</template>
    <template v-slot:cover>
      <div v-if="isWechat" class="save-tips"><van-icon name="info-o" />长按保存图片</div>
      <div class="roateBox flex items-center justify-center" @click.stop="rotateFn">
        <img src="https://ic-img.ky-express.com/netc/20250619_14399_!!1750314129467_72_76.png" />
      </div>
      <div class="saveBox flex items-center justify-center" v-if="!isWechat" @click.stop="downloadImage">
        <img src="https://ic-img.ky-express.com/netc/20250619_9548_!!1750314148512_72_72.png" />
      </div>
      <div v-if="images.length > 1" class="turn right" @click.stop="rightFn">
        <img src="https://ic-img.ky-express.com/netc/20250619_7825_!!1750314272542_194_194.png" alt="" />
      </div>
      <div v-if="images.length > 1" class="turn left" @click.stop="leftFn">
        <img src="https://ic-img.ky-express.com/netc/20250619_23614_!!1750314293989_194_194.png" alt="" />
      </div>
    </template>
  </van-image-preview>
</template>

<script setup lang="ts">
import { ref, watch, computed, useModel } from 'vue'
import { isWechat } from '@order-public-sub-public/utils/device'
import { showSuccessToast, showFailToast } from '@order-public-sub-public/hooks/useShowToast'
import { $native } from '@order-public-sub-public/utils'
import { imagePreviewProps, indexObjectType } from '@order-public-sub-public/components/business/image-preview/types'
const props = withDefaults(defineProps<imagePreviewProps>(), {
  currentUrl: '',
  images: () => [],
  show: false,
})

let tm: number
const show = useModel(props, 'show')
const overlay = ref({
  opacity: '0.85',
  background: '#000000',
})

const index = ref(0)
const indexObject = ref<indexObjectType>({})
const current = ref(0)
// const loop = ref(null)
const imgStatus = ref(false)

watch(
  () => props.show,
  (v) => {
    if (!v) {
      setTimeout(() => {
        initRotate()
        indexObject.value = {}
        imgStatus.value = false
      }, 300)
    } else {
      initIndex()
    }
  },
)

//初始化当前图片
const initIndex = () => {
  let currentIndex = 0
  for (let i = 0; i < props.images?.length; i++) {
    let img = props.images?.[i]
    if (props.currentUrl === img) {
      currentIndex = i
      break
    }
  }
  index.value = currentIndex
  current.value = currentIndex
}

const imagePreviewClass = computed(() => {
  return [imgStatus.value ? 'image-preview' : '', !isWechat ? 'pointer-events' : '']
})

const downloadImage = () => {
  const imageData = props.images?.[index.value].replace(/^data:.+;base64,/, '')
  console.log(imageData)
  $native
    .downloadImage({
      imageData,
    })
    .then((res) => {
      console.log(res)
      showSuccessToast('保存成功')
    })
    .catch((error) => {
      console.error(error)
      showFailToast('保存失败')
    })
}
const onChange = (i: number) => {
  index.value = i
  tm && clearTimeout(tm)
  console.log('onchange')
  tm = setTimeout(() => {
    current.value = i
  }, 500)
}
const rotateFn = () => {
  if (indexObject.value[index.value]) {
    indexObject.value[index.value] = indexObject.value[index.value] + 1
  } else {
    indexObject.value[index.value] = 1
  }
  let imgDom = document.querySelectorAll('.van-image-preview__image')[index.value]?.querySelector('img')
  if (!imgDom) {
    return
  }
  imgDom.style.transitionDuration = '0.3s'
  let rotateRate = indexObject.value[index.value] * -90
  imgDom.style.transform = `rotate(${rotateRate}deg)`
  imgStatus.value = indexObject.value[index.value] % 2 === 1 ? true : false
}
const initRotate = () => {
  indexObject.value[index.value] = 0
  let imgDom = document.querySelectorAll('.van-image-preview__image')[index.value]?.querySelector('img')
  if (imgDom) {
    imgDom.style.transitionDuration = '0.3s'
    imgDom.style.transform = `rotate(0deg)`
  }
}
const rightFn = () => {
  initRotate()
  let len = props.images?.length
  if (current.value === len - 1) {
    current.value = 0
  } else {
    current.value = index.value + 1
  }
}
const leftFn = () => {
  initRotate()
  let len = props.images?.length

  if (current.value === 0) {
    current.value = len - 1
  } else {
    current.value = index.value - 1
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.image-preview {
  .van-image-preview__image {
    display: flex;
    justify-content: center;
    transition: 0.3s;
    img {
      width: 50%;
    }
  }
}

// 处理ios 16系统长按识别会刷新页面的问题
.pointer-events {
  .van-image {
    img {
      pointer-events: none;
    }
  }
}
</style>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
