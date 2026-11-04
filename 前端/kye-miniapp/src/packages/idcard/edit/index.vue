<template>
  <scroll-view class="id-card-page-edit" :show-scrollbar="false" enhanced enable-flex scroll-y="true">
    <!-- 个人信息编辑 - 状态展示 -->
    <EditTitle :detail="detail" />

    <view :class="`content ${isPadding ? 'disableContent' : ''}`">
      <view class="flex-item-between mb-24">
        <view class="title">
          <view class="pre-title-line"></view>
          <text class="mingpian-info">名片信息</text>
        </view>
        <view class="preview" @tap="handlePreviewBaseInfo">
          <image src="https://ic-img.ky-express.com/netc/20250206_81558405338_!!1738822881509_64_64.png"></image>
          <text>预览效果</text>
        </view>
      </view>

      <view class="flex-item-between pb-28 border-bottom">
        <view class="label">名片样式</view>
        <template v-if="isPadding">
          <view class="template-list">
            <image :src="disabledMInPian"></image>
          </view>
        </template>
        <template v-else>
          <view class="template-list">
            <image
              :class="{ border: currentTemplate === '10' }"
              @tap="() => onSelectTemplate('10')"
              src="https://ic-img.ky-express.com/netc/20250305_72770395168_!!1741179364649_268_193.png"
            ></image>
            <image
              :class="{ border: currentTemplate === '20' }"
              @tap="() => onSelectTemplate('20')"
              src="https://ic-img.ky-express.com/netc/20250206_73858405318_!!1738831220211_268_193.png"
            ></image>
            <image
              :class="{ border: currentTemplate === '30' }"
              @tap="() => onSelectTemplate('30')"
              src="https://ic-img.ky-express.com/netc/20250206_865840538_!!1738831220209_268_193.png"
            ></image>
          </view>
        </template>
      </view>

      <view class="flex-item-between form-item">
        <view class="label">头像</view>
        <view class="upload-head" @tap="checkStoragePermission">
          <image v-if="detail.baseInfo.avatar" class="head" :src="detail.baseInfo.avatar"></image>
          <image
            v-if="!isPadding"
            class="icon-right"
            src="https://ic-img.ky-express.com/netc/20250206_26358405394_!!1738822881513_64_64.png"
          ></image>
        </view>
      </view>

      <view class="flex-item-between form-item share-recommend">
        <view class="label flex-item-center address-label">
          <text>分享推荐语</text>
          <image
            class="icon-require"
            src="https://ic-img.ky-express.com/netc/20240821_7358405363_!!1724249077651_88_56.png"
          ></image>
        </view>
        <ky-input
          class="input-text"
          placeholder="请输入分享推荐语"
          placeholder-style="font-size: 14px; color: #ADB0B8;font-weight: normal;"
          v-model="shareRecommend"
          @focus="() => handleFocus('shareRecommend')"
          :maxlength="20"
          :disabled="isPadding"
        />
      </view>

      <view class="form-item">
        <view class="flex-item-between">
          <view class="label flex-item-center">
            <text>岗位名称</text>
            <image
              class="icon-require"
              src="https://ic-img.ky-express.com/netc/20240821_7358405363_!!1724249077651_88_56.png"
            ></image>
            <image
              v-if="jobReceiveDisabled"
              class="receive-img"
              src="https://ic-img.ky-express.com/netc/20250328_52770395187_!!1743129314193_48_48.png"
            ></image>
            <image
              v-else
              class="receive-img"
              @tap="handleReceive"
              src="https://ic-img.ky-express.com/netc/20250328_41170395112_!!1743129309734_48_48.png"
            ></image>
            <view
              :class="['receive-btn', { disabled: jobReceiveDisabled }]"
              @tap="!jobReceiveDisabled && handleReceive()"
            >
              恢复原职位
            </view>
          </view>
          <view class="select-value flex-item-center" @tap="handleOpenPopup">
            <text>{{ detail.baseInfo.situation }}</text>
            <image
              v-if="!isPadding"
              class="icon-right"
              src="https://ic-img.ky-express.com/netc/20250206_26358405394_!!1738822881513_64_64.png"
            ></image>
          </view>
        </view>
        <view class="job-tip">
          <!-- 温馨提示：当前修改仅同步至小程序名片，企微岗位对外信息显示需另外更改 -->
          温馨提示：智慧名片岗位修改成功后，如企微开启了对外展示岗位信息则会同步修改
          <!-- <text @tap="toStep">查看操作步骤</text> -->
        </view>
      </view>

      <view class="form-item">
        <view class="flex-item-between">
          <view class="label">
            <text class="label-text">邮箱地址</text>
            <ky-switch
              :model-value="showEmail"
              inactive-color="#ebedf5"
              active-color="#8365F6"
              @change="toggleEmailSwitch"
              :disabled="isPadding"
            />
            <text class="label-tip">开启开关后才能在名片展示</text>
          </view>
        </view>
        <view class="input-email flex-item-between">
          <ky-input
            placeholder="请输入邮箱地址"
            placeholder-style="font-size: 14px; color: #ADB0B8; font-weight: normal;"
            :class="{ 'input-address-disable': isPadding }"
            v-model="email"
            @focus="() => handleFocus('email')"
            :maxlength="30"
            :disabled="isPadding"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="flex-item-between">
          <view class="label">
            <text class="label-text">公司地址</text>
            <ky-switch
              :model-value="showAddress"
              inactive-color="#ebedf5"
              active-color="#8365F6"
              @change="toggleAddressSwitch"
              :disabled="isPadding"
            />
            <text class="label-tip">开启开关后才能在名片展示</text>
          </view>
        </view>
        <view class="textarea-wrapper">
          <view
            :class="[
              'input-address',
              isPadding ? 'input-address-disable' : '',
              { 'input-address-empty': !detail.baseInfo.address },
              inputHeight,
            ]"
            @tap="handleAddressSelectRef"
          >
            {{ detail.baseInfo.address || '请选择公司地址' }}
          </view>
          <Image
            src="https://ic-img.ky-express.com/netc/20250904_92974_!!1756997273541_64_64.png"
            :class="['input-address-icon', { 'input-address-icon-empty': !detail.baseInfo.address }]"
          ></Image>
        </view>
      </view>
    </view>
  </scroll-view>

  <view :class="['id-card-page-edit__footer', { 'id-card-page-edit__disablefooter': isPadding }]">
    <ky-button class="button button-primary" :disabled="isPadding" @tap="onSubmit">提交</ky-button>
  </view>

  <!-- 选择岗位弹窗 -->
  <JobsPopup ref="JobsPopupRef" :detail="detail" :currentJob="currentJob" @selectJobName="selectJobName" />

  <!-- 预览效果 -->
  <PreviewInfo ref="PreviewInfoRef" :detail="detail" />

  <AddressSelect
    ref="AddressSelectRef"
    :detail="detail"
    @updateAdressInfo="handleUpdateAdressInfo"
    :companyAddressList="companyAddressList"
    :initialAddressCode="currentAddressCode"
    :initialCustomerAddress="customerAddress"
  />

  <image-cropper @cancel="handleImgCancel" :show-cropper="showCropper" @complete="handleGetImage" :img-src="imgSrc" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import {
  getDetailForEmployee,
  idcardEdit,
  uploadAvatarUrlApi,
  recoverDutyApi,
  getCompanyAddressList,
} from '@/packages/idcard/api/index'
import { lastModifyWorkOrderStatusMap } from '../const/index'
import { fileUpload } from '../utils/upload'
// 组件
import ImageCropper from './components/croppers/index.vue'
import JobsPopup from './components/jobs-popup/index.vue'
import PreviewInfo from './components/preview-info/index.vue'
import EditTitle from './components/edit-title/index.vue'
import AddressSelect from './components/adress-select-popup/index.vue'

import { isQwPC } from '@/packages/idcard/utils/idcard-device'
import { trackEvent, editModeReportPv, trackEventExp, reportAddress } from './edit-report'
import type {
  getDetailForEmployeeTypes,
  uploadImgDataResponseTypes,
  getDetailForEmployeeResponse,
  recoverDefaultDutyApiTypes,
  businessCardEditTypes,
} from '@/packages/idcard/api/types/index'
import { debounce } from 'lodash-es'

const router = Taro.useRouter()
const { id: code, bcSource, edit } = router.params

// State
const currentTemplate = ref('10')
const shareRecommend = ref('')
const showEmail = ref(false)
const email = ref('')
const showAddress = ref(false)
const address = ref('')
const approveTips = ref(true)
const showCropper = ref(false)
const imgSrc = ref('')

const inputHeight = ref()

const companyAddressList = ref()

const detail = ref<getDetailForEmployeeTypes.getDetailForEmployeeResponseData>({
  lastModifyWorkOrderStatus: '',
  rejectReason: '不符合标准啦！',
  baseInfo: {
    defaultDuty: '',
    themeBackground: '10',
    shareRecommend: '',
    avatar: '',
    situation: '',
    showEmail: false,
    email: '',
    showAddress: false,
    address: '',
    hrUserId: '',
  },
  id: '',
  imgProgress: 0,
  approveTips: true,
})

const currentJob = ref()

// Computed
const isPadding = computed(() => {
  return +detail.value?.lastModifyWorkOrderStatus === lastModifyWorkOrderStatusMap.padding
})

const disabledMInPian = computed(() => {
  const ImgMap = {
    10: 'https://ic-img.ky-express.com/netc/20250206_58158405362_!!1738831220212_268_193.png',
    20: 'https://ic-img.ky-express.com/netc/20250206_73858405318_!!1738831220211_268_193.png',
    30: 'https://ic-img.ky-express.com/netc/20250206_865840538_!!1738831220209_268_193.png',
  }
  const currentThemeBackground = detail.value.baseInfo?.themeBackground
  return currentThemeBackground ? ImgMap[currentThemeBackground] : ''
})

const jobReceiveDisabled = computed(() => {
  return (
    detail.value.baseInfo.defaultDuty === detail.value.baseInfo.situation ||
    detail.value.lastModifyWorkOrderStatus === lastModifyWorkOrderStatusMap.padding
  )
})

const reportHrUserId = computed(() => detail.value.baseInfo?.hrUserId)

// Methods
const toggleEmailSwitch = () => {
  const val = !detail.value.baseInfo.showEmail

  const clickCode = `clk_sharing_information_edit_${val ? 'open' : 'close'}`
  trackEvent(clickCode, '邮箱地址', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })

  showEmail.value = val
  detail.value.baseInfo.showEmail = val
}

const toggleAddressSwitch = () => {
  const val = !detail.value.baseInfo.showAddress
  const clickCode = `clk_sharing_information_edit_${val ? 'open' : 'close'}`
  trackEvent(clickCode, '公司地址', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })
  showAddress.value = val
  detail.value.baseInfo.showAddress = val
}

const JobsPopupRef = ref()
const handleOpenPopup = () => {
  JobsPopupRef.value?.handleOpenJobsPopup()
}

const selectJobName = (val) => {
  currentJob.value = val
  const isHigh = val.includes('总经理')
  detail.value = {
    ...detail.value,
    approveTips: !isHigh,
    baseInfo: { ...detail.value.baseInfo, situation: val },
  }
}

const useDebounce = (fn: (...args: any[]) => void, delay = 300) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const onSubmit = useDebounce(async () => {
  trackEvent('clk_sharing_information_edit_submit', '提交', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })
  reportAddress('other_sharing_information_edit_address', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
    save_address: detail.value.baseInfo.address,
  })

  let msg = ''
  if (!shareRecommend.value) {
    msg = '请填写分享推荐语'
  } else if (shareRecommend.value.length < 2) {
    msg = '分享推荐语最少2个字符'
  }

  if (msg) {
    return Taro.showToast({ icon: 'none', title: msg || '不能为空' })
  }

  if (!email.value && showEmail.value) {
    msg = '请填写邮箱'
    if (msg) {
      return Taro.showToast({ icon: 'none', title: msg || '不能为空' })
    }
  }

  if (email.value.length > 0 && /[\u4e00-\u9fa5]/.test(email.value)) {
    msg = '邮箱不能包含中文字符'
    if (msg) {
      return Taro.showToast({ icon: 'none', title: msg || '不能为空' })
    }
  }
  if (email.value.length > 0 && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
    msg = '请输入正确邮箱地址'
    if (msg) {
      return Taro.showToast({ icon: 'none', title: msg || '不能为空' })
    }
  }

  if (showAddress.value && !address.value) {
    msg = '请填写公司地址信息'
  }

  if (msg) {
    return Taro.showToast({ icon: 'none', title: msg || '不能为空' })
  }

  try {
    const params = {
      id: detail.value.id,
      themeBackground: detail.value.baseInfo.themeBackground,
      shareRecommend: shareRecommend.value,
      avatar: detail.value.baseInfo.avatar,
      situation: detail.value.baseInfo.situation,
      showEmail: detail.value.baseInfo.showEmail,
      email: email.value,
      showAddress: detail.value.baseInfo.showAddress,
      address: address.value,
      addressCode: detail.value.baseInfo.addressCode,
    } as businessCardEditTypes.BusinessCardEditRequest

    await idcardEdit(params)
    Taro.showToast({
      icon: 'none',
      title: '保存成功',
      duration: 1000,
    })

    setTimeout(() => {
      Taro.navigateBack()
    }, 1200)
  } catch (error) {
    console.error('error >>>,', error)
  }
}, 300)

const onSelectTemplate = (val) => {
  trackEvent('clk_sharing_information_edit_style', `名片样式${val[0]}`, {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })

  currentTemplate.value = val
  detail.value.baseInfo.themeBackground = val
}

const checkStoragePermission = async () => {
  trackEvent('clk_sharing_information_edit_profil_picture', '头像', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })

  try {
    const res = await Taro.getSetting()
    if (res.authSetting['scope.writePhotosAlbum']) {
      if (isQwPC) {
        uploadCover()
      } else {
        chooseImg()
      }
    } else {
      await Taro.authorize({
        scope: 'scope.writePhotosAlbum',
      })
      if (isQwPC) {
        uploadCover()
      } else {
        chooseImg()
      }
    }
  } catch (err) {
    if (err?.errMsg?.includes('auth')) {
      Taro.showToast({
        title: '请开启相册权限',
        icon: 'none',
        duration: 2000,
      })
    }
  }
}

const uploadCover = () => {
  if (isPadding.value) return
  Taro.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      console.log('🚀 ~ uploadCover ~ res:', res)
      if (res?.tempFilePaths?.length) {
        const file = res.tempFiles[0]
        if (file.size > 5 * 1024 * 1024) {
          Taro.showToast({
            title: '文件不能大于5M',
            icon: 'none',
            duration: 2000,
          })
          return
        }

        detail.value.imgProgress = 0

        let updateFile = res?.tempFilePaths[0]
        console.log('🚀 ~ uploadCover ~ updateFile:', updateFile)

        const { data: result } = await fileUpload(updateFile, (progress) => {
          detail.value.imgProgress = progress
        })

        console.log('000000000 result data', result)
        detail.value.baseInfo.avatar = result[0].url
      }
    },
    fail: (error) => {
      console.log('🚀 ~ uploadCover ~ error:', error)
      if (error.errMsg.includes('auth')) {
        Taro.showToast({
          title: '请开启相册权限',
          icon: 'none',
          duration: 2000,
        })
      }
    },
  })
}

const PreviewInfoRef = ref()
const handlePreviewBaseInfo = () => {
  PreviewInfoRef.value?.onPreview(true)
}

const AddressSelectRef = ref()
const handleAddressSelectRef = () => {
  if (isPadding.value) return
  console.log('AddressSelectRef >>> ', AddressSelectRef)
  AddressSelectRef.value?.open()
}

const toStep = debounce(() => {
  trackEvent('clk_sharing_information_edit_view_operation_steps', '查看操作步骤', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })

  Taro.navigateTo({ url: '/packages/idcard/configStep/index' })
}, 400)

const currentAddressCode = ref('customer')
const customerAddress = ref()

const getBaseInfo = async () => {
  try {
    const param: getDetailForEmployeeResponse.getDetailForEmployeeRequest = {
      code,
      origin: 'edit',
    }

    // 使用 Promise.allSettled 确保所有请求都完成，互不影响
    const [detailResult, addressResult] = await Promise.allSettled([
      getDetailForEmployee(param),
      getCompanyAddressList({ businessCardCode: code }),
    ])

    // 处理详情接口结果
    let res: any = null
    if (detailResult.status === 'fulfilled') {
      const { data: detailData }: getDetailForEmployeeResponse = detailResult.value
      res = detailData

      // 处理详情数据
      if (res) {
        const baseInfoResult = {
          ...res,
          id: res.id,
          baseInfo: {
            ...res.baseInfo,
          },
        }
        detail.value = baseInfoResult
        approveTips.value = res.approveTips
        currentJob.value = res.baseInfo.situation
        shareRecommend.value = res.baseInfo.shareRecommend || ''
        email.value = res.baseInfo.email
        showEmail.value = res.baseInfo.showEmail
        showAddress.value = res.baseInfo.showAddress
        address.value = res.baseInfo.address
        currentTemplate.value = res.baseInfo.themeBackground

        getRecoverDefaultDuty()
      }
    } else {
      console.error('获取详情信息失败', detailResult.reason)
    }

    // 处理地址接口结果
    let addList: any[] = []
    if (addressResult.status === 'fulfilled') {
      const { data: addressData } = addressResult.value
      addList = addressData || []

      console.log(addList, 'companyAddressList')
      companyAddressList.value = addList
    } else {
      console.error('获取公司地址列表失败', addressResult.reason)
    }

    // 综合处理两个接口的数据（只有详情接口成功时才执行）
    if (res && addList.length > 0) {
      // 默认值处理，在这里停止
      const addressCodeList = addList.map((item) => item.addressCode)

      if (addressCodeList.includes(res.baseInfo.addressCode)) {
        currentAddressCode.value = res.baseInfo.addressCode
      } else {
        currentAddressCode.value = 'customer'
      }

      if (
        !res.baseInfo.addressCode ||
        res.baseInfo.addressCode === 'customer' ||
        !addressCodeList.includes(res.baseInfo.addressCode)
      ) {
        customerAddress.value = res.baseInfo.address || Taro.getStorageSync('customerAddress')
      } else {
        customerAddress.value = Taro.getStorageSync('customerAddress')
      }
    } else if (res) {
      // 只有详情接口成功，地址接口失败的情况
      currentAddressCode.value = 'customer'
      customerAddress.value = res.baseInfo.address || Taro.getStorageSync('customerAddress')
    }
  } catch (error) {
    console.error('获取基础信息过程中发生未知错误', error)
  }
}

const handleFocus = (key) => {
  const eventMap = {
    shareRecommend: {
      code: 'clk_sharing_information_edit_recommend',
      name: '分享推荐语',
    },
    email: {
      code: 'clk_sharing_information_edit_input',
      name: '邮箱地址',
    },
    address: {
      code: 'clk_sharing_information_edit_input',
      name: '公司地址',
    },
  }

  const event = eventMap[key]
  if (event) {
    trackEvent(event.code, event.name, {
      employee_id: reportHrUserId.value,
      sales_id: reportHrUserId.value,
    })
  }
}

const handleReceive = () => {
  trackEvent('clk_business_card_origin_position', '恢复默认岗位', {
    employee_id: reportHrUserId.value,
    sales_id: reportHrUserId.value,
  })

  detail.value.baseInfo.situation = detail.value.baseInfo.defaultDuty
  currentJob.value = detail.value.baseInfo.defaultDuty
  Taro.showToast({
    title: '已恢复原岗位',
    icon: 'none',
    duration: 1000,
  })
}

const chooseImg = () => {
  if (isPadding.value) return
  Taro.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res?.tempFilePaths?.length) {
        const file = res.tempFiles[0]
        if (file.size > 5 * 1024 * 1024) {
          Taro.showToast({
            title: '文件不能大于5M',
            icon: 'none',
            duration: 2000,
          })
          return
        }
        imgSrc.value = res.tempFilePaths[0]
        showCropper.value = true
      }
    },
    fail: (error) => {
      if (error.errMsg.includes('auth')) {
        Taro.showToast({
          title: '请开启相册权限',
          icon: 'none',
          duration: 2000,
        })
      }
    },
  })
}

const uploadAvatarUrl = (base64: string) => {
  uploadAvatarUrlApi({
    base64,
  })
    .then(({ data }: uploadImgDataResponseTypes.uploadImgData) => {
      detail.value.baseInfo.avatar = data.headImgUrl
    })
    .catch((err) => {
      console.error(err)
      Taro.showToast({ icon: 'none', title: err.msg || '服务错误' })
    })
}

const handleGetImage = (base64) => {
  uploadAvatarUrl(base64)
}

const handleImgCancel = () => {
  showCropper.value = false
  imgSrc.value = ''
}

// 修改
const getRecoverDefaultDuty = async () => {
  try {
    console.log('获取默认岗位职责')
    let { data }: recoverDefaultDutyApiTypes.RecoverDefaultDutyResponse = await recoverDutyApi({
      employeeNumber: detail.value.baseInfo.employeeNum,
    } as recoverDefaultDutyApiTypes.RecoverDefaultDutyRequest)
    console.log('接口值: data', data)

    let { defaultDuty } = data

    detail.value.baseInfo.defaultDuty = defaultDuty
  } catch (error) {
    console.log('请求默认岗位职责 error', error)
  }
}

// 地址选择
// const addressSelectShow = ref(false)
// 点击处理函数
// const handleAddressClick = () => {
//   if (!isPadding.value) {
//     addressSelectShow.value = true
//     trackEventExp('exp_sharing_information_edit_address', {
//       employee_id: detail.value.baseInfo.hrUserId,
//       sales_id: detail.value.baseInfo.hrUserId,
//     })
//   }
// }

const handleUpdateAdressInfo = (val) => {
  console.log('更新 地址信息: ', val)
  detail.value = {
    ...detail.value,
    baseInfo: {
      ...detail.value.baseInfo,
      addressCode: val?.addressCode,
      address: val?.address,
    },
  }
  address.value = val?.address
}

onMounted(() => {
  getBaseInfo()
  try {
    editModeReportPv({
      sales_id: reportHrUserId.value,
    })
  } catch (error) {
    console.log(error)
  }
})
</script>

<style lang="scss">
@import './index.scss';
</style>
