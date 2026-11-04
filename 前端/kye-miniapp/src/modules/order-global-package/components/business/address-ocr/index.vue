<template>
  <div class="address-ocr">
    <!-- 页面场景 -->
    <template v-if="moduleStyleComputed">
      <Ocr
        v-show="expandOcr"
        v-model:ocrMessage="ocrMessage"
        ref="refOcr"
        :loading="loading"
        :rows="3"
        :addressType="addressType"
        :waybillNumber="resolveWaybillNumber()"
        @onClickImg="remindUserPicIndentifyDialog"
        @onClickAudio="onClickAudio"
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
        :waybillNumber="resolveWaybillNumber()"
        @onClickImg="remindUserPicIndentifyDialog"
        @onClickAudio="onClickAudio"
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
      @update:maskerVisible="onMaskerVisibleChange"
    />

    <!-- 多候选地址选择弹框 -->
    <SelectModel
      v-model:show="showSelectModel"
      :title="selectModelTitle"
      :list="selectModelList"
      :recognitionType="selectModelRecognitionType"
      :originalAddress="originalAddressDisplay"
      @selectAddress="onSelectAddress"
      :before-close="beforeClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showLoadingToast } from '../../../hooks/useShowToast'
import { chooseFiles } from '../../../utils/upload'

// 组件 - 使用 order-global-package-order 内部组件（已迁移）
import Ocr from '../../ui/ocr/index.vue'
import Cropper from '../../ui/cropper/index.vue'
import SelectModel from './components/selectModel/index.vue'

// 方法 & 工具
import { aiAddrAnalysis, analysis } from '../../../apis/address' // ✅ 已迁移到 global-package/apis/address
import { AiAddrAnalysis, AiAddrAnalysisRes, resultFlagtype } from '../../../types/address' // 已迁移类型定义
import { getValueOrEmpty, joinAt } from '../../../utils/address' // ✅ 本地（原 @order-public/utils）
import md5 from 'js-md5'

// 埋点（已迁移到 global-package/report）
import {
  umpOtherReport,
  ReportType,
  ReportTypeEnum,
  clickImgOcrReport,
  clickOcrClearReport,
  clickOpenOcrReport,
  getAiAddrAnalysisReport,
} from '../../../report/index'

// 常量 & 存储
const IMAGE_TYPE = ['jpg', 'png', 'jpeg', 'image', 'bmp'] // 图片扩展名白名单
import { AddressValue, ImageBase64, ResolutionOcr } from '../../../types/constants' // ✅ 已迁移到 global-package/types/constants
import { localStorage } from '../../../utils/storage'

// 类型
import { isWxAppIosEnv, isH5FSEnv } from '@/public/utils' // 公共工具库

/**
 * Props 接口 - 解耦后的外部注入接口
 * 原 useStore / remoteCheck 等强依赖通过以下 props 回调注入
 */
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
  /** 用户信息（原 piniaStore.globalData.userInfo） */
  userInfo: {
    type: Object as () => any,
    default: undefined,
  },
  /** 运单号提供者（原 piniaStore.order.waybillNumber） */
  waybillNumberProvider: {
    type: Function as () => string,
    default: undefined,
  },
  /** 智能识别后过程校验回调（原 remoteCheck） */
  onRemoteCheck: {
    type: Function as (key: string, data: any) => void,
    default: undefined,
  },
  /** 获取寄件表单数据（原 getSenderData） */
  getSenderDataProvider: {
    type: Function as () => any,
    default: undefined,
  },
  /** 获取收件表单数据（原 getReceiveData） */
  getReceiveDataProvider: {
    type: Function as () => any,
    default: undefined,
  },
  /** 是否初始化地址标识（原 isInitAddressFlag） */
  isInitAddressFlag: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'getAddressOcrData',
  'getResolutionData',
  'update:maskerVisible',
  'onClickAudio',
  'onClickImg',
  'onClickIdentify',
])

const moduleStyleComputed = computed(() => {
  return props.moduleStyle === 'page'
})

const expandOcr = ref(true)
const ocrMessage = ref('')
const showCropper = ref(false)
const ocrImg = ref('')
const loading = ref(false)

// selectModel 弹框状态
const showSelectModel = ref(false)
const selectModelTitle = ref('温馨提示')
const selectModelList = ref<AiAddrAnalysis[]>([])
const selectModelRecognitionType = ref('')
const originalAddressDisplay = ref('')

/** 获取运单号（优先使用 prop 提供者） */
const resolveWaybillNumber = (): string => {
  return props.waybillNumber || props.waybillNumberProvider?.() || ''
}

/** 获取用户手机号 */
const resolveUserPhone = (): string => {
  return props.userInfo?.phone || '无法获取手机号'
}

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
}

// 解析地址
const getAddressType = (addressType: string) => {
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

/**
 * 多候选地址选择 - 使用 SelectModel 组件替代 showKyDialog + extraDataValue
 */
const addressSelect = (data: AiAddrAnalysis[] = []): Promise<AiAddrAnalysis> => {
  return new Promise<AiAddrAnalysis>((resolve) => {
    // 设置 SelectModel 数据并显示
    selectModelList.value = data
    selectModelRecognitionType.value =
      props.addressType === 'SENDER_PAGE' || props.addressType === '10' ? '寄件' : '收件'
    originalAddressDisplay.value = ocrMessage.value
    showSelectModel.value = true

    clickReport(ReportType.曝光, 'exp_express_single_fill_Multiple_open_button_v1', data)

    // 注册选择回调（通过 emit 从 selectModel 子组件触发）
    const handleSelect = (value: AiAddrAnalysis) => {
      try {
        resolve(value)
      } catch (e) {
        console.warn(e)
      }
      cleanup()
    }

    // 清理函数
    const cleanup = () => {
      // 可以在这里做清理工作
    }

    // 暂存 resolve 以便 selectModel 的 selectAddress 事件调用
    ;(addressSelect as any)._pendingResolve = handleSelect
    ;(addressSelect as any)._pendingBeforeClose = (selectedValue?: AiAddrAnalysis) => {
      const index = data.findIndex((x) => x.source === ResolutionOcr.AI地址推荐)
      let value = {}
      if (index > -1) {
        value = data[index]
      } else {
        value = data[0]
      }
      resolve(value as AiAddrAnalysis)
      clickReport(ReportType.点击, 'clk_express_single_fill_Multiple_off_v1', [value as AiAddrAnalysis])
      cleanup()
    }
  })
}

/** 处理 selectModel 选择事件 */
const onSelectAddress = (item: AiAddrAnalysis) => {
  const pendingResolve = (addressSelect as any)._pendingResolve
  if (pendingResolve) {
    pendingResolve(item)
  }
  showSelectModel.value = false
}

const beforeClose = () => {
  originalAddressDisplay.value = ''
}

/** Cropper maskerVisible 变更事件转发 */
const onMaskerVisibleChange = (val: boolean) => {
  emit('update:maskerVisible', val)
}

// 手动识别成功
const handleRecognitionSuccess = (res: AddressValue, from: string | undefined) => {
  if (from === 'img') {
    dataFill(res)
  }
  showToast('请仔细核对，确保识别信息完全准确')
}

// 手动识别失败
const handleRecognitionFailure = () => {
  showToast('识别失败，请输入准确地址信息')
}

// 地址簿新增 修改 智能识别场景 - 手动识别
const getAiAddrAnalysis = async (keyword: string, from?: string) => {
  loading.value = true

  if (keyword.length > 300) {
    keyword = keyword.slice(0, 300)
  }

  try {
    const addressType = getAddressType(props.addressType)
    const { data } = (await aiAddrAnalysis({
      text: keyword,
      addressType,
      businessId: resolveWaybillNumber(),
      sceneType: undefined, // TODO: getOcrAddressSceneType 需要适配
    })) as { data: AiAddrAnalysisRes }

    originalAddressDisplay.value = data.originalAddress || ''
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

const onClickAudio = () => {
  emit('onClickAudio')
}

// 提醒用户识别图片方法
const remindUserPicIndentifyDialog = () => {
  emit('onClickImg')
  const aboutPictureIdentify = JSON.parse(localStorage?.getItem('aboutPictureIdentify') || '{}')
  const phone = resolveUserPhone()
  clickImgOcrReport(props.addressType)
  if (!aboutPictureIdentify?.[phone]) {
    onClickImg()
  } else {
    const _aboutPictureIdentify = Object.assign(aboutPictureIdentify, { [phone]: true })
    localStorage?.setItem('aboutPictureIdentify', JSON.stringify(_aboutPictureIdentify))
  }
}

// 图片识别
const onClickImg = async () => {
  try {
    let isAmage = false
    if (isWxAppIosEnv || isH5FSEnv) {
      isAmage = true
    }
    const imgList = await chooseFiles(
      {
        maxSize: 10,
        type: 'image',
        extension: IMAGE_TYPE,
        maxCount: 1,
      },
      isAmage,
    )
    if (imgList && imgList.length) {
      ocrImg.value = imgList?.[0]?.path
      showCropper.value = true
    }
  } catch (err) {
    console.log(err)
  }
}

const clear = () => {
  clickOcrClearReport()
}

// 手动识别
const onClickIdentify = async () => {
  emit('onClickIdentify')
  if (!ocrMessage.value) {
    showToast('请粘贴或输入文本')
    return false
  }
  const res = await getAiAddrAnalysis(ocrMessage.value)
  emit('getAddressOcrData', res)
  setTimeout(() => {
    if (!props.isInitAddressFlag) {
      aiDiscernRemoteCheck()
    }
  }, 200)
}

// 智能识别后，触发过程接口（通过 prop 注入替代原 remoteCheck）
const aiDiscernRemoteCheck = () => {
  if (!props.onRemoteCheck || !props.getSenderDataProvider || !props.getReceiveDataProvider) {
    // 未注入回调时跳过远程校验
    console.warn(
      '[address-ocr] onRemoteCheck/getSenderDataProvider/getReceiveDataProvider not provided, skipping remote check',
    )
    return
  }
  const isSender = props.addressType === 'SENDER_PAGE' || props.addressType === '10'
  const originalData = isSender ? props.getSenderDataProvider() : props.getReceiveDataProvider()
  const key = isSender ? 'sender.aiDiscern' : 'receive.aiDiscern'
  if (isSender) {
    props.onRemoteCheck(key, {
      sender: originalData,
    })
    return
  }
  props.onRemoteCheck(key, {
    receive: originalData,
  })
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

defineExpose({
  ocrMessage,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
