<template>
  <div class="address-batch-ocr">
    <div class="container" :class="confirmLoading ? 'container-pointer-events' : ''">
      <div class="container-body">
        <div class="header">
          <span class="header-title">批量识别</span>
          <span
            >（可批量识别<span class="header-num">{{ BATCH_MAX_LENGTH }}条</span>）</span
          >
        </div>
        <div class="sub-title">粘贴整段地址，自动拆分姓名、电话和地址，多个收件人之间用分号 [；] 隔开</div>
        <!-- <Ocr
          v-model:ocrMessage="ocrMessage"
          ref="refOcr"
          class="container-body-ocr"
          :loading="loading"
          :addressType="addressType"
          :singleOcr="false"
          :imgBtnText="imgBtnText"
          :rows="6"
          :maxlength="1000"
          placeholder="例如：王小二 138XXXX1333 广东省深圳市南山区XXX大厦；张小四 138XXXX1333 广东省深圳市南山区XXX公寓"
          @uploaderAfterRead="uploaderAfterRead"
          @onClickImg="remindUserPicIndentifyDialog"
        >
        </Ocr> -->
      </div>

      <!-- 裁切 -->
      <!-- <Cropper
        v-model:show="showCropper"
        :img="ocrImg"
        :autoCropWidth="745"
        :autoCropHeight="300"
        @onCancel="showCropper = false"
        @onChoose="onCropperChoose"
        @onComplete="onCropperComplete"
      /> -->
    </div>
    <div class="footer">
      <div class="footer__wrap">
        <KyButton
          text="确定"
          loading-text="确定"
          :disabled="!ocrMessage"
          :loading="confirmLoading"
          @click="onConfirm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { showToast, showLoadingToast, closeDialog } from '@order-public-sub-public/hooks/useShowToast'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// 组件
// import Ocr from '@order-public-sub-public/components/ui/ocr/index.vue'
// import Cropper from '@order-public-sub-public/components/ui/cropper/index.vue'
// 方法
import { analysis, batchAddressResolution } from '@order-public-sub-public/apis/address'
import { $native, filterFiledSpace, getValueOrEmpty } from '@order-public-sub-public/utils'
import { isWxPcApplet } from '@order-public-sub-public/utils/device'
import md5 from 'js-md5'

// 类型
import { OrderInfo } from '@order-public-sub-public/types'
import { BATCH_MAX_LENGTH, ImageBase64 } from '@order-public-sub-public/constants'

import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { BatchOrderInfo } from '@order-public-sub-public/apis/types'
import { remoteBatchCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcess'
import { localStorage } from '@order-public-sub-public/utils/storage'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const router = useRouter()
const props = defineProps({
  moduleStyle: {
    type: String,
    default: '',
  },
  addressType: {
    type: String,
    default: '',
  },
})
console.log(props)
const imgBtnText = `仅支持<span style="color: #FF9300;">单条</span>识别`

const ocrMessage = ref('')
const showCropper = ref(false)
const ocrImg = ref('')
const loading = ref(false)

// 提醒用户识别图片方法
const remindUserPicIndentifyDialog = () => {
  const aboutPictureIdentify = JSON.parse(localStorage?.getItem('aboutPictureIdentify') || '{}')
  const phone = piniaStore.globalData.userInfo?.phone || '无法获取手机号'
  if (aboutPictureIdentify?.[phone]) {
    if (isWxPcAppletFlag.value) {
      // PC端 使用van-uploader上传
      return
    }
    onClickImg()
  } else {
    const _aboutPictureIdentify = Object.assign(aboutPictureIdentify, { [phone]: true })
    localStorage?.setItem('aboutPictureIdentify', JSON.stringify(_aboutPictureIdentify))
    if (isWxPcAppletFlag.value) {
      // PC端 van-uploader上传不能通过beforeRead阻止
      return
    }
    showKyDialog({
      zIndex: 1000,
      title: '图片识别说明',
      showConfirmButton: false,
      showCancelButton: false,
      allowHtml: false,
      message: () =>
        h('div', { style: { padding: '0 0.3rem', margin: '0 auto' } }, [
          h(
            'div',
            { style: { color: '#888ea6', textAlign: 'left' } },
            '选择图片后，截取包含完整地址信息的部分后提交识别，如果信息识别不准确，请继续编辑修改再保存。',
          ),
          h('img', {
            src: 'https://ic-img.ky-express.com/netc/20250619_99277_!!1750300935695_1020_304.png',
            style: { width: '100%', marginTop: '0.32rem' },
          }),
          h(
            'div',
            {
              style: {
                width: '4.45rem',
                height: '1.17rem',
                backgroundColor: '#8365F6',
                margin: '0 auto',
                borderRadius: '0.33rem',
                marginTop: '0.53333rem',
              },
              onClick: closeRemindUserPicIndentifyDialog,
            },
            [
              h(
                'span',
                {
                  style: {
                    fontSize: '0.42667rem',
                    lineHeight: '1.17rem',
                    textAlign: 'center',
                    color: '#FFFFFF',
                  },
                },
                '我知道了',
              ),
            ],
          ),
        ]),
    })
  }
}

const closeRemindUserPicIndentifyDialog = () => {
  try {
    closeDialog()
    onClickImg()
  } catch (error) {
    console.log(error)
  }
}

// 图片识别
const onClickImg = async () => {
  try {
    const params = {
      count: 1,
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      necessary: true,
    }
    const { imgList }: any = (await $native?.chooseImage(params)) || {}
    if (imgList) {
      ocrImg.value = `data:image/png;base64,${imgList[0].base64.replace(/\r|\n/g, '')}`
      showCropper.value = true
    }
  } catch (err) {
    console.log(err)
  }
}

// 图片裁切
const onCropperChoose = () => {
  showCropper.value = false
  onClickImg()
}

const onCropperComplete = (data: string) => {
  showCropper.value = false
  afterRead({ content: data.replace(ImageBase64.jpeg, '')?.replace(/\r|\n/g, '') })
}

const errShowToast = () => {
  showToast('识别失败，请稍后重试')
  loading.value = false
}

const afterRead = async ({ content }: { content: string }) => {
  if (content && content.length < 20) {
    // 裁剪异常，终止请求识别
    errShowToast()
    return
  }
  try {
    showLoadingToast({
      message: '识别中...',
      forbidClick: true,
    })
    const params = {
      data: {
        base64_data: content,
        img_id: `${md5(content)}_itc_fill`,
      },
    }
    const response = await analysis(params)
    if (response?.data?.detectInformation?.address) {
      if (ocrMessage.value) {
        ocrMessage.value = `${response.data.detectInformation?.address};${ocrMessage.value}`
      } else {
        ocrMessage.value = response.data.detectInformation?.address
      }
      showToast('识别成功，如有遗漏请及时补充')
    } else {
      errShowToast()
    }
  } catch (err) {
    errShowToast()
    console.log(err)
  }
}
const refOcr = ref<InstanceType<typeof Ocr> | null>()
// 微信PC端小程序
const isWxPcAppletFlag = computed(() => {
  return isWxPcApplet
})
//选择文件后
const uploaderAfterRead = (data: string) => {
  if (data) {
    ocrImg.value = `${data.replace(/\r|\n/g, '')}`
    showCropper.value = true
  }
}
const batchWaybillInfoList = computed(() => piniaStore.order.batchWaybillInfoList || [])
/**
 * 确定
 */
const confirmLoading = ref(false)
const onConfirm = async () => {
  if (!ocrMessage.value) {
    showToast('请粘贴或输入文本')
    return false
  }
  const len = BATCH_MAX_LENGTH - batchWaybillInfoList.value.length
  confirmLoading.value = true
  try {
    const {
      data: { addressInfos },
    } = await batchAddressResolution({ text: ocrMessage.value, addressType: 20 })
    if (!addressInfos?.length) {
      showToast('识别失败，请稍后重试')
      return
    }
    // 如果识别的条数 大于 已存在的列表，需要截取
    const res = addressInfos?.splice(0, len).map((item) => {
      return {
        receive: {
          companyName: getValueOrEmpty(item.company),
          person: getValueOrEmpty(item.name),
          mobile: getValueOrEmpty(item.mobile),
          telephone: getValueOrEmpty(item.telephone),
          extension: getValueOrEmpty(item.extension),
          province: getValueOrEmpty(item.province),
          city: getValueOrEmpty(item.city),
          county: getValueOrEmpty(item.district),
          detailAddress: getValueOrEmpty(item.address),
        },
      }
    }) as unknown as OrderInfo[]
    console.log('res', res, addressInfos)
    await remoteBatchCheck('init', getFilterFormData(), undefined, res)
    router.back()
  } catch (error) {
    showToast('识别失败，请稍后重试')
    console.log('error===>', error)
  } finally {
    confirmLoading.value = false
  }
}
/**
 * @description 获取批量场景公共部分运单
 */
const getFilterFormData = () => {
  const storeFormData = piniaStore.order.orderState as unknown as BatchOrderInfo
  // 处理手机号空格
  return filterFiledSpace(storeFormData.commonWaybillInfo.waybillInfo)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
