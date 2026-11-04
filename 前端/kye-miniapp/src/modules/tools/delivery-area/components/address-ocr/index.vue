<template>
  <view class="ocr">
    <view class="text-area">
      <KyTextarea
        ref="ocrRef"
        :clearable="false"
        :customPlaceholder="true"
        :maxlength="maxlength"
        :modelValue="ocrMessage"
        :placeholder="placeholder"
        :rows="rows"
        :formatter="formatter"
        @update:modelValue="onInputOcr"
        v-keyboard
        @clear="clearOcr"
      ></KyTextarea>
    </view>
    <view class="extra">
      <view class="left">
        <image src="https://ic-img.ky-express.com/netc/20260109_82597_!!1767950875870_48_48.png"></image>
        <view class="text" @click.stop="onClickImg">AI图片识别</view>
      </view>
      <view class="right">
        <view class="clear-btn" v-show="ocrMessage" @click="clearOcr">清空</view>
        <ky-button
          class="right__identify"
          :loading="loading"
          type="primary"
          loading-text="识别"
          :text="ocrMessage ? '识别' : '粘贴并识别'"
          @click="onClickIdentify"
        />
      </view>
    </view>
  </view>
  <!-- 裁切 -->
  <Cropper
    v-model:show="showCropper"
    :img="ocrImg"
    :autoCropWidth="745"
    :autoCropHeight="300"
    @onCancel="showCropper = false"
    @onChoose="onCropperChoose"
    @onComplete="onCropperComplete"
  />
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { ref } from 'vue'
import { isAppiOS } from '@/packages/idcard/utils/idcard-device'
import { OCR_PLACEHOLDER } from './constants'
import { filterEmojis } from './utils/pattern'
import './index.scss'
import KyTextarea from './components/ky-textarea/index.vue'
import Cropper from './components/cropper/index.vue'
import { showToast } from '@/public/hooks/useShowToast'
import { aiAddrAnalysis, imageAddressAnalysis } from '../../apis'
import { chooseFiles, showLoadingToast } from './utils/upload'
// import md5 from 'js-md5'

const IMAGE_TYPE = ['jpg', 'png', 'jpeg', 'image', 'bmp']

const props = defineProps({
  maxlength: {
    type: Number,
    default: 300,
  },
  rows: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits(['getAddressOcrData'])

const loading = ref(false)
const ocrMessage = ref('')
const placeholder = ref(OCR_PLACEHOLDER)
const showCropper = ref(false)
const ocrImg = ref('')

const ocrRef = ref()

const formatter = (value: string): string => value.replace(filterEmojis, '')

const onInputOcr = (value: string) => {
  ocrMessage.value = value
}

/**
 * 清空
 */
const clearOcr = () => {
  if (isAppiOS) {
    setTimeout(() => {
      ocrRef.value?.textAreaRef?.focus() //为了解决ios样式兼容
    })
  }
  onClear()
}

const onClear = () => {
  ocrMessage.value = ''
}

const onClickImg = async () => {
  console.log('onClickImg')
  const imgList = await chooseFiles({
    maxSize: 10,
    type: 'image',
    extension: IMAGE_TYPE,
    maxCount: 1,
  })
  console.log('imgList', imgList)
  if (imgList) {
    ocrImg.value = imgList?.[0]?.path
    showCropper.value = true
  }
}

// 图片裁切
const onCropperChoose = () => {
  showCropper.value = false
  onClickImg()
}

const onCropperComplete = (data: string) => {
  showCropper.value = false
  afterRead({ content: data })
}

const afterRead = async ({ content }: { content: string }) => {
  loading.value = true
  if (content && content.length < 20) {
    // 裁剪异常，终止请求识别
    showToast('识别失败，请稍后重试')
    loading.value = false
    return
  }
  try {
    showLoadingToast({
      title: '识别中...',
      forbidClick: true,
    })
    const data = await imageAddressAnalysis(content)
    if (data.code === 0) {
      ocrMessage.value = data.data?.detect_information?.address || ''
    }
    loading.value = false
  } catch (err) {
    showToast('识别失败，请稍后重试')
    loading.value = false
    console.log(err)
  }
}

const getClipboardData = () => {
  return new Promise((resolve, reject) => {
    Taro.getClipboardData({
      success(res) {
        resolve(res.data)
      },
      fail(err) {
        console.log(err)
        resolve('')
      },
    })
  })
}

/**
 * 识别
 */
const onClickIdentify = async () => {
  try {
    loading.value = true
    if (!ocrMessage.value) {
      let word = await getClipboardData()
      console.log('word', word)
      if (typeof word !== 'string' || !word) {
        showToast('请粘贴或输入文本')
        return ''
      }
      let str = word.trim() // 去除空格
      if (str) {
        // 截断100个字
        if (str.length > props.maxlength) {
          str = str.slice(0, props.maxlength)
        }
        onInputOcr(str as string)
      }
    }
    if (!ocrMessage.value) {
      showToast('请粘贴或输入文本')
      return ''
    }
    // TODO: 调用识别接口
    const data = await aiAddrAnalysis(ocrMessage.value)
    if (data.code === 0 && (data?.data?.[0]?.cityId || data?.data?.[0]?.townId)) {
      emit('getAddressOcrData', data?.data?.[0])
      showToast('识别成功，如有遗漏请及时补充')
    } else {
      showToast('未识别到省/市/区/乡镇信息')
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>
