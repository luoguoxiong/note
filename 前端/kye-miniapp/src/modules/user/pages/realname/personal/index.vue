<template>
  <div class="realname-page-personal" v-if="hasToken && relaNameSwitch">
    <div v-if="isEnterpriseDelivery" class="enterprise-delivery">当前是企业交货人实名，不会更新个人实名认证。</div>
    <div v-else class="enterprise-delivery">完成个人实名认证，寄件无需再次采集</div>
    <PersonalForm
      ref="personalFormRef"
      :model="model"
      :is-enterprise-delivery="isEnterpriseDelivery"
      :force-verify-obj="forceVerifyObj"
      user="personal"
      :person-info="personInfo"
      :isAgreed="isAgreed"
      @update:model="handleModelUpdate"
      @click-type="handleClickType"
      @complete="handleFormComplete"
      @validate="handleFormValidate"
      @toggle-agreement="handleToggleAgreement"
    />
    <div class="page-footer">
      <ky-button class="submit-btn" type="primary" :loading="loading" loading-text="提交" @click="onSubmit">
        提交
      </ky-button>
    </div>
    <!-- 未勾选协议提示弹窗 -->
    <AgreementPopup :show="showAgreementPopup" @close="showAgreementPopup = false" @confirm="handleAgreementConfirm" />
  </div>
</template>

<script setup lang="ts">
import './index.scss'
import PersonalForm from '../components/personal-form.vue'
import AgreementPopup from '../components/agreement-popup.vue'
import { ref, computed } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { showToast } from '@public/hooks/useShowToast'
import { isFromScan } from '../hooks/useEnterpriseData'
import { showDialog } from '@kye-netc/kye-miniui'
import { realNameQrCodeCheck, confirmQrcodeResult, getAuthDetail, applyPersonal } from '@modules/user/apis/realname'
import {
  exp_share_real_name_card_personal,
  other_center_id_personal_type,
  other_center_id_personal_id_name,
  other_center_id_personal_id_number,
  clk_center_id_personal_button,
  clk_id_personal,
  other_center_id_personal_button,
  other_id_personal_launch,
  exp_center_id_personal,
  page_id_personal,
} from '../report/index'
import { getToken } from '@/public/storage'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { getQueryObject, urlContact } from '@/public/utils/url'
// import { showVerifyCodeDialog } from '@/components/business/netc-verify-code'
import { enableAlertUnload, disableAlertUnload } from '../hooks/useAlertBeforeUnload'
import { redirectToH5, relaNameSwitch } from '@public/hooks/useRedirectH5ToNative'
import { myAtob } from '../hooks/useAtob'
import {
  IdType,
  QrcodeCheckResult,
  PersonQrCodeType,
  VerifyDialogType,
  ErrorResultCode,
  PersonalModel,
} from '../hooks/type'

import { useRealNameStore } from '../store'
import { setShowPopover } from '../components/upload/upload'
const realNameStore = useRealNameStore()
const { id, work_id } = getQueryObject()
const personalFormRef = ref<any>(null)
const { autoLoginHook } = useAutoLogin()
// 默认提示信息
const defaultTipMessage = '修改后的姓名将同步更新为当前运单的寄件人姓名'
const hasToken = ref(!!getToken())
// 响应式数据
const loading = ref(false)
const isShowTip = ref(false)
const tipMessage = ref(defaultTipMessage)
const isInit = ref(false)
const isEnterpriseDelivery = ref(false) // 是否是企业交货人实名
const isSubmitLeave = ref(false)
const isAgreed = ref(false) // 是否同意协议
const showAgreementPopup = ref(false) // 是否展示协议提示弹窗

const defaultModel: PersonalModel = {
  id: id || '',
  from: 1,
  idType: IdType.RESIDENT_ID_NO,
  collectMethod: 30,
  addressType: 1, // 地址类型。写死
  userType: 2,
  userTypeStatus: 10,
  idCardName: '',
  idCardNo: '',
  otherPhone: '',
  gender: 1,
  address: '',
  idCardFrontPic: '',
  idCardFrontReversePic: '',
}

const model = ref<PersonalModel>(Object.assign({}, defaultModel))

const forceVerifyObj = computed(() => realNameStore.getForceVerifyObj)

const personInfo = ref<any>({})

// 事件处理方法
const handleModelUpdate = (newModel: PersonalModel) => {
  model.value = newModel
  if (model.value.idCardNo || model.value.idCardName) {
    enableAlertUnload()
  } else {
    disableAlertUnload()
  }
}

// 触发勾选协议
const handleToggleAgreement = (val: boolean) => {
  isAgreed.value = val

  handleAutoSubmit()
}

const handleClickType = () => {
  other_center_id_personal_type({
    page_name: 'page_id_personal',
    eventCode: 'other_center_id_personal_type',
    event_type_id: 19999,
    id_personal_type: '是',
  })
}

const handleFormComplete = (data: any) => {
  const { type, message, data: completeData } = data

  if (type === 'error') {
    showToast(message)
  } else if (type === 'upload-success') {
    // 上传成功后处理
    const updatedModel = completeData as PersonalModel

    // 下单强制实名，上传后不一致展示提示语
    if (forceVerifyObj.value?.forceFlag === '20') {
      tipMessage.value = defaultTipMessage
      isShowTip.value = updatedModel.idCardName !== forceVerifyObj.value?.idName
    }
  } else if (type === 'form-complete') {
    // 填写完 id card 输入框，自动触发表单提交逻辑
    onSubmit()
  }
}

const handleFormValidate = (prop: string) => {
  // 可以在这里处理验证相关的埋点
  if (prop === 'idCardName') {
    other_center_id_personal_id_name({
      page_name: 'page_id_personal',
      eventCode: 'other_center_id_personal_id_name',
      event_type_id: 19999,
      id_personal_type: model.value.idCardName ? '是' : '否',
    })
  } else if (prop === 'idCardNo') {
    other_center_id_personal_id_number({
      page_name: 'page_id_personal',
      eventCode: 'other_center_id_personal_id_number',
      event_type_id: 19999,
      id_personal_type: model.value.idCardNo ? '是' : '否',
    })
  }
}

// 自动提交逻辑：当用户勾选协议并且表单填写完，自动触发表单校验和提交逻辑
const handleAutoSubmit = () => {
  if (isAgreed.value) {
    if (model.value.idCardName && model.value.idCardNo) {
      onSubmit()
    }
  }
}

// 生命周期
useDidShow(async () => {
  let token = getToken()
  if (!token) {
    await autoLoginHook({ needLogin: true })

    token = getToken()
    if (!token) {
      return
    }
  }
  hasToken.value = true
  const isRedirectToH5 = await redirectToH5('')
  if (isRedirectToH5) return
  page_id_personal({})
  disableAlertUnload()
  getAuthDetailApi()
  orderShareReport()
  exp_center_id_personal({
    page_name: 'page_id_personal',
    eventCode: 'exp_center_id_personal',
    event_type_id: 2201,
    work_id,
  })
})

const orderShareReport = () => {
  const { forceFlag, isFromShare, waybillNumber } = getQueryObject()
  if (isFromShare === 'true') {
    try {
      exp_share_real_name_card_personal({
        page_name: 'page_id_personal',
        eventCode: 'exp_share_real_name_card_personal',
        event_type_id: 2201,
        button_name: '点击分享卡片',
        ref_page_name: forceFlag === '10' ? '下单成功页' : '实名认证模块页面',
        ref_action: isFromShare === 'true' ? '下单成功点击分享他人' : '实名认证模块页分享',
        waybill_number: waybillNumber,
      })
    } catch (e) {
      console.log(e, ':>>> e')
    }
  }
}

const initQueryData = () => {
  const {
    orderPageSource,
    uniqueId,
    forceFlag,
    otherPhone,
    idName,
    isFromShare,
    isFromBaqiang,
    encodeParam,
    origin,
    miniprogramType,
  } = getQueryObject()

  isFromScan.value = miniprogramType === 'scan'
  realNameStore.setOriginFromQuery(origin)
  let decodedPhone = ''
  if (otherPhone) {
    try {
      decodedPhone = myAtob(otherPhone)
    } catch (error) {
      console.error('Base64 解码失败:', error)
      decodedPhone = otherPhone
    }
  }

  realNameStore.setForceVerifyObj({
    orderPageSource,
    uniqueId,
    forceFlag,
    otherPhone: decodedPhone || '',
    idName: idName ? decodeURIComponent(idName) : '',
    isFromShare,
    isFromBaqiang,
  })

  model.value.idCardName = forceVerifyObj.value?.idName || ''
  model.value.otherPhone = forceVerifyObj.value?.otherPhone || ''

  if (forceVerifyObj.value?.idName?.length || 0 > 30) {
    setTimeout(() => {
      tipMessage.value = '认证姓名不可超过30个字'
    })
  }

  if (isFromBaqiang === 'true') {
    getRealNameQrCodeCheck(encodeParam)
    return
  }
  isInit.value = true
}

const handleBackToHome = () => {
  Taro.switchTab({
    url: '/layout/pages/home/index',
  })
}

const getRealNameQrCodeCheck = async (encodeParam: string) => {
  try {
    const res = await realNameQrCodeCheck({ encodeParam })
    if (res.code === 0 && res.data) {
      isInit.value = true
      const { VERIFIED_REMIND_USE, VERIFIED } = QrcodeCheckResult
      isEnterpriseDelivery.value = res.data.qrCodeType === PersonQrCodeType.ENTERPRISE_DELIVERY
      console.log('res.data.result', res.data.result, VERIFIED_REMIND_USE)
      switch (res.data.result) {
        case VERIFIED_REMIND_USE:
          await showDialog({
            zIndex: 1000,
            title: '个人认证',
            message: res.data.msg,
            parentClassName: 'realname-page-personal',
            showCancelButton: true,
            confirmButtonText: '使用',
            cancelButtonText: '不使用',
            cancle: () => {
              console.log(11)
            },
            confirm: async () => {
              getConfirmQrcodeResult(encodeParam, handleBackToHome)
            },
          })
          break
        case VERIFIED:
          await showDialog({
            zIndex: 1000,
            title: '个人认证',
            parentClassName: 'realname-page-personal',
            message: res.data.msg,
            showCancelButton: false,
            confirmButtonText: '我知道了',
            cancle: () => {
              handleBackToHome()
            },
            confirm: async () => {
              console.log(22)
              handleBackToHome()
            },
          })
          break
      }
    } else if (res.code === ErrorResultCode.WAYBILL_HAS_VERIFIED) {
      Taro.redirectTo({
        url: '/modules/user/pages/realname/qrcode-error/index?waybillHasVerified=true',
      })
    } else {
      isInit.value = true
    }
  } catch (e) {
    if (e.code === ErrorResultCode.WAYBILL_HAS_VERIFIED) {
      Taro.redirectTo({
        url: '/modules/user/pages/realname/qrcode-error/index?waybillHasVerified=true',
      })
    } else {
      isInit.value = true
    }
    console.log(e, ':>>> e')
  }
}

const getConfirmQrcodeResult = async (encodeParam: string, callback: Function) => {
  try {
    const res = await confirmQrcodeResult({ encodeParam })
    // const res = { code: 0, data: '已同步更新寄件人姓名XXXXXXX' }
    if (res.code === 0 && res.data) {
      setTimeout(() => {
        showDialog({
          zIndex: 1000,
          title: '运单已实名',
          message: res.data,
          parentClassName: 'realname-page-personal',
          showCancelButton: false,
          confirmButtonText: '我知道了',
          confirm: () => {
            callback && callback()
          },
        })
      })
    } else {
      if (res.msg) showToast(res.msg)
    }
  } catch (e) {
    console.log(e, ':>>> e')
  }
}

const goNext = (data: any = {}) => {
  const { origin } = getQueryObject()
  isSubmitLeave.value = true
  if (origin === 'gobi') {
    showToast('认证成功')
    setTimeout(() => {
      Taro.navigateBack()
    }, 500)
  } else {
    Taro.redirectTo({
      url: urlContact('/modules/user/pages/realname/finish/index', {
        type: 'personal',
        idType: model.value.idType,
        isChangeName: model.value.idCardName !== forceVerifyObj.value?.idName,
        firstFlag: data.firstFlag || '20',
      }),
    })
  }
}

const getAuthDetailApi = async () => {
  try {
    const res = await getAuthDetail({})
    if (res.code === 0) {
      personInfo.value = { ...personInfo.value, isSupportForeignOCR: res.data.isSupportForeignOCR }
    }
  } catch (error) {
    console.log('getAuthDetailApi', error)
  }
}

const getParamType = (forceFlag: string, fromBaqiang: boolean) => {
  // 个人认证标识 10-个人认证 20-强制认证 30-巴枪扫码认证 40-企业交货人认证
  if (forceFlag === '20') {
    return 20
  } else if (isEnterpriseDelivery.value) {
    return 40
  } else if (fromBaqiang) {
    return 30
  } else {
    return 10
  }
}

const onSubmit = async (safeVerifyId: string = '') => {
  if (loading.value) return

  clk_center_id_personal_button({
    page_name: 'page_id_personal',
    eventCode: 'clk_center_id_personal_button',
    event_type_id: 2101,
    button_name: '提交',
  })

  clk_id_personal({})
  personalFormRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      // 校验是否勾选协议
      if (!isAgreed.value) {
        showAgreementPopup.value = true
        return
      }
      try {
        loading.value = true
        const { forceFlag, uniqueId, otherPhone } = forceVerifyObj.value
        const { isFromBaqiang, encodeParam } = getQueryObject()
        const fromBaqiang = isFromBaqiang === 'true'
        let params = {
          source: 20,
          uniqueId,
          otherPhone: otherPhone || '',
          type: getParamType(forceFlag, fromBaqiang),
          safeVerifyId: safeVerifyId || undefined,
          ...model.value,
        }
        if (fromBaqiang && encodeParam) {
          params.encodeParam = encodeParam
        }
        const res = await applyPersonal(params)
        disableAlertUnload()
        loading.value = false
        if (res.code === 0) {
          other_id_personal_launch({
            request_result: '成功',
            failure_reason: '',
          })
          other_center_id_personal_button({
            page_name: 'page_id_id_success',
            eventCode: 'other_center_id_personal_button',
            event_type_id: 19999,
            if_gain_points: res.data.firstFlag === '10' ? '是' : '否',
            request_result: '成功',
          })
          goNext(res.data)
        } else if (res.code === ErrorResultCode.VERIFY_CODE) {
          // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
          if (res.data.type === VerifyDialogType.HAS_LOCKED) {
            showToast(res.data.msg)
          } else {
            // const verifyResult = await showVerifyCodeDialog(
            //   {
            //     ruleId: res.data.ruleId,
            //     strategyCode: res.data.strategyCode,
            //   },
            //   { type: res.data.type },
            // )
            // if (verifyResult?.safeVerifyId) {
            //   onSubmit(verifyResult?.safeVerifyId)
            // }
          }
        }
      } catch (error: any) {
        other_id_personal_launch({
          request_result: '失败',
          failure_reason: error,
        })
        showToast(error.message || '请求失败')
        other_center_id_personal_button({
          page_name: 'page_id_id_success',
          eventCode: 'other_center_id_personal_button',
          event_type_id: 19999,
          if_gain_points: '否',
          request_result: '失败',
        })
      } finally {
        loading.value = false
      }
    } else {
      setShowPopover(false)
      console.warn('error:', errors)
    }
  })
}
// 底部弹窗-确认勾选协议
const handleAgreementConfirm = () => {
  isAgreed.value = true
  showAgreementPopup.value = false

  handleAutoSubmit()
}
// 初始化
initQueryData()
</script>
