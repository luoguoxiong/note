<template>
  <div class="address-ocr">
    <!-- 页面场景 -->
    <template v-if="moduleStyleComputed">
      <!-- <div v-show="!expandOcr" class="container__ocr" @click="openOcr">
        <div class="container__ocr__text">支持智能填写、图片识别</div>
        <div class="container__ocr__right">
          <div class="container__ocr__camera" @click="remindUserPicIndentifyDialog">
            <PcWxUploader
              v-if="isWxPcAppletFlag"
              @uploaderAfterRead="uploaderAfterRead"
              :accept="'.jpg, .png, .jpeg, .bmp'"
            >
              <span class="icon"></span>
            </PcWxUploader>
            <span class="icon" v-else></span>
          </div>
          <PasteAndRecognize
            :ocrMessage="ocrMessage"
            :addressType="addressType"
            @onPasteAndRecognize="onPasteAndRecognize"
          />
        </div>
      </div> -->
      <Ocr
        v-show="expandOcr"
        v-model:ocrMessage="ocrMessage"
        ref="refOcr"
        :loading="loading"
        :rows="3"
        :addressType="addressType"
        @onClickImg="remindUserPicIndentifyDialog"
        @onClickIdentify="onClickIdentify"
        @clear="clear"
      />
    </template>

    <!-- 平铺场景 -->
    <template v-else>
      <Ocr
        v-model:ocrMessage="ocrMessage"
        :addressType="addressType"
        :loading="loading"
        :rows="3"
        @onClickImg="remindUserPicIndentifyDialog"
        @onClickIdentify="onClickIdentify"
      />
    </template>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { showToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { chooseFiles } from '@order-public-sub-public/utils/upload'
// 组件
import Ocr from '@order-public-sub-public/components/ui/ocr/index.vue'
import Cropper from '@order-public-sub-public/components/ui/cropper/index.vue'
// 方法
import { aiAddrAnalysis, analysis } from '@order-public-sub-public/apis/address'
import { AiAddrAnalysis, AiAddrAnalysisRes, resultFlagtype } from '@order-public-sub-public/apis/address/types'
import { getValueOrEmpty, joinAt } from '@order-public-sub-public/utils'
import md5 from 'js-md5'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isWxAppIosEnv, isH5FSEnv } from '@/public/utils'

const piniaStore = useStore()

// 类型

import { AddressValue, ResolutionOcr } from '@order-public-sub-public/constants'

import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { ReportType, ReportTypeEnum } from '@order-public-sub-public/reportUmp/type/types'
import {
  clickImgOcrReport,
  clickOcrClearReport,
  clickOpenOcrReport,
  getAiAddrAnalysisReport,
} from '@order-public-sub-public/report/sender'
import { useOriginalAddress } from '@order-public-sub-public/hooks/address/useCommon'
import { getOcrAddressSceneType } from '@order-public-sub-public/utils/waybillInfo'
import { localStorage } from '@order-public-sub-public/utils/storage'
const IMAGE_TYPE = ['jpg', 'png', 'jpeg', 'image', 'bmp']
const props = defineProps({
  moduleStyle: {
    type: String,
    default: '',
  },
  addressType: {
    type: String,
    default: '',
  },
  waybillNumber: {
    type: String,
    default: '',
  },
})

const moduleStyleComputed = computed(() => {
  return props.moduleStyle === 'page'
})

const expandOcr = ref(true)
const ocrMessage = ref('')
const showCropper = ref(false)
const ocrImg = ref('')
const loading = ref(false)

const emit = defineEmits(['getAddressOcrData', 'getResolutionData', 'discernImgClick', 'selectComplete'])

// 将解析出来的数据回填到识别框
const dataFill = (res: AddressValue) => {
  const { person, mobile, telephone, extension, province, city, county, detailAddress } = res || {}
  const parts = []

  let telephoneExtension = telephone
  if (telephone && extension) {
    telephoneExtension = `${telephone}-${extension}`
  }
  const fullAddress = `${province || ''}${city || ''}${county || ''}${detailAddress || ''}`

  if (person) parts.push(person)
  if (mobile) parts.push(mobile)
  if (telephoneExtension) parts.push(telephoneExtension)
  if (fullAddress) parts.push(fullAddress)

  // ocrMessage.value = parts.join(' ')
}

// 解析地址
const getAddressType = (addressType: string) => {
  if (addressType.toString() === '30') return Number(addressType)
  return addressType.includes('SENDER') || addressType.toString() === '10' ? 10 : 20
}

const extractAddressData = async (data: AiAddrAnalysisRes) => {
  let addressInfo: AiAddrAnalysis
  if (data.resultFlag === resultFlagtype.需要提示) {
    addressInfo = await addressSelect(data.addressInfos)
  } else {
    addressInfo = data.addressInfos?.[0] || {}
  }
  return {
    person: getValueOrEmpty(addressInfo.name),
    mobile: getValueOrEmpty(addressInfo.mobile) || getValueOrEmpty(addressInfo.mobilePhone),
    telephone: getValueOrEmpty(addressInfo.telephone),
    extension: getValueOrEmpty(addressInfo.extension),
    province: getValueOrEmpty(addressInfo.province),
    city: getValueOrEmpty(addressInfo.city),
    county: getValueOrEmpty(addressInfo.district) || getValueOrEmpty(addressInfo.county),
    detailAddress: getValueOrEmpty(addressInfo.address) || getValueOrEmpty(addressInfo.detailAddress),
    companyName: getValueOrEmpty(addressInfo.company),
  }
}
const fullAddress = (v: AiAddrAnalysis, i?: number) => {
  return `地址${i || i === 0 ? i + 1 : ''}：${joinAt(v, [
    'telephone',
    'telPhone',
    'mobile',
    'mobilePhone',
    'name',
    'province',
    'city',
    'district',
    'address',
    'company',
  ])}`
}
// 智能识别弹框埋点
const clickReport = (type: ReportTypeEnum, eventCode: string, data: AiAddrAnalysis[]) => {
  umpOtherReport(
    type,
    {
      eventCode,
      regionCode: 'sender_box',
    },
    {
      recognition_type: props.addressType === 'SENDER_PAGE' || props.addressType === '10' ? '寄件' : '收件',
      recognition_msg: data.map((v, i) => fullAddress(v, i)).join(','),
    },
  )
}
const addressSelect = (data: AiAddrAnalysis[] = []) => {
  const promise: Promise<AiAddrAnalysis> = new Promise<AiAddrAnalysis>((resolve) => {
    // 先调用一次allowHtml为false,主要解决dialog，h函数传入message，偶现不渲染
    showKyDialog({
      zIndex: 1000,
      allowHtml: false,
    }).catch((e) => {
      console.error(e)
    })
    setTimeout(() => {
      clickReport(ReportType.曝光, 'exp_express_single_fill_Multiple_open_button_v1', data)
      showKyDialog({
        zIndex: 1000,
        title: '温馨提示',
        showConfirmButton: false,
        showCancelButton: false,
        allowHtml: true,
        className: 'ky-address-multiple-dialog',
        closeable: true,
        extraDataValue: {
          list: data,
          recognitionType: props.addressType === 'SENDER_PAGE' || props.addressType === '10' ? '寄件' : '收件',
          onSelectAddress: async (value: AiAddrAnalysis) => {
            try {
              resolve(value)
            } catch (e) {
              console.warn(e)
            }
          },
        },
        beforeClose: () => {
          const index = data.findIndex((x) => x.source === ResolutionOcr.AI地址推荐)
          let value = {}
          if (index > -1) {
            value = data[index]
          } else {
            value = data[0]
          }
          resolve(value)
          clickReport(ReportType.点击, 'clk_express_single_fill_Multiple_off_v1', [value])
          return true
        },
      }).catch((e) => {
        console.warn('addressSelect', e)
      })
    })
  })
  return promise
}

// 手动识别成功
const handleRecognitionSuccess = (res: AddressValue, from: string | undefined) => {
  if (from === 'img') {
    dataFill(res)
  }
  showToast('识别成功，如有遗漏请及时补充')
}

// 手动识别失败
const handleRecognitionFailure = () => {
  showToast('识别失败，请输入准确地址信息')
}

// 地址簿新增 修改 智能识别场景
// 手动识别
const getAiAddrAnalysis = async (keyword: string, from?: string) => {
  loading.value = true

  //  // 如果字符串长度大于300，获取前300个字符
  if (keyword.length > 300) {
    keyword = keyword.slice(0, 300)
  }

  try {
    // 类型
    const addressType = getAddressType(props.addressType)
    const { data } = (await aiAddrAnalysis({
      text: keyword,
      addressType,
      businessId: props?.waybillNumber || piniaStore.order.waybillNumber,
      sceneType: getOcrAddressSceneType(addressType),
    })) as { data: AiAddrAnalysisRes }
    useOriginalAddress.value = data.originalAddress || ''
    const res = await extractAddressData(data)
    loading.value = false
    handleRecognitionSuccess(res, from)

    emit('getResolutionData')
    getAiAddrAnalysisReport({
      ...res,
      content: keyword || '',
      addressType: props.addressType,
      request_result: 'success',
      request_status: 'success',
    })
    return res || {}
  } catch (error: any) {
    console.log('error', error)
    handleRecognitionFailure()
    loading.value = false
    getAiAddrAnalysisReport({
      content: keyword || '',
      addressType: props.addressType,
      request_result: 'failure',
      request_status: error.message || error.msg,
    })
    return {}
  }
}

// 点击寄收的OCR模块，需要聚焦
const handleAutoFocusOCR = () => {
  nextTick(() => {
    // 穿透了三层，所以需要三个ref
    refOcr.value?.ocrRef?.textAreaRef?.focus()
  })
}

const openOcr = () => {
  expandOcr.value = true
  handleAutoFocusOCR()
  clickOpenOcrReport()
}

// 提醒用户识别图片方法
const remindUserPicIndentifyDialog = () => {
  const aboutPictureIdentify = JSON.parse(localStorage?.getItem('aboutPictureIdentify') || '{}')
  const phone = piniaStore.globalData.userInfo?.phone || '无法获取手机号'
  clickImgOcrReport(props.addressType)
  emit('discernImgClick')
  if (!aboutPictureIdentify?.[phone]) {
    // if (isWxPcAppletFlag.value && !aliPayOrAMapApp) {
    //   // PC端 使用van-uploader上传
    //   return
    // }
    onClickImg()
  }
}

// 图片识别
const onClickImg = async () => {
  try {
    let isAmage = false
    if (isWxAppIosEnv || isH5FSEnv) {
      isAmage = true
    }
    // const { imgList }: any = (await $native?.chooseImage(params)) || {}
    const imgList = await chooseFiles(
      {
        maxSize: 10,
        type: 'image',
        extension: IMAGE_TYPE,
        maxCount: 1,
        selectCallBack: (type) => {
          console.log(type, 'ddfffffffffffff')
          emit('selectComplete')
        },
      },
      isAmage,
    )
    if (imgList && imgList.length) {
      // ocrImg.value = `data:image/png;base64,${imgList[0].base64.replace(/\r|\n/g, '')}`
      ocrImg.value = imgList?.[0]?.path
      showCropper.value = true
    }
  } catch (err) {
    console.log(err)
  } finally {
  }
}

const clear = () => {
  clickOcrClearReport()
}

// 手动识别
const onClickIdentify = async () => {
  if (!ocrMessage.value) {
    showToast('请粘贴或输入文本')
    return false
  }
  const res = await getAiAddrAnalysis(ocrMessage.value)
  emit('getAddressOcrData', res)
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
    if (response && response?.data) {
      ocrMessage.value = response.data?.detectInformation?.address?.replace(/\n +/g, '\n') ?? ''
      const res = await getAiAddrAnalysis(response.data.detectInformation?.address, 'img')
      emit('getAddressOcrData', res)
    }
  } catch (err) {
    errShowToast()
    console.log(err)
  }
}
const refOcr = ref<InstanceType<typeof Ocr> | null>()
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
