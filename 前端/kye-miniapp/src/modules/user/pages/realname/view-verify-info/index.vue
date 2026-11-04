<template>
  <div class="view-verify-info-container">
    <div class="view-verify-info">
      <div class="verify-info">
        <span class="label">{{ pageTitle }}信息</span>
        <i v-if="!isViewEnterprise" class="delete-icon" @click="handleDelete"></i>
      </div>
      <form-input
        formLabel="统一信用代码"
        v-if="isViewEnterprise"
        :hasEye="formData.role === 10"
        :value="formData.companyNo"
        :maskValue="maskFormData?.certificationCode"
      ></form-input>
      <form-input formLabel="证件类型" :hasEye="false" :value="idTypeValue" :maskValue="idTypeValue"></form-input>
      <form-input
        formLabel="姓名"
        :hasEye="viewHasEye"
        :value="formData.idCardName"
        :maskValue="maskFormData?.idCardName"
      ></form-input>
      <form-input
        :formLabel="idCardNoLabel"
        :hasEye="viewHasEye"
        :value="formData.idCardNo"
        :maskValue="maskFormData?.idCardNo"
      ></form-input>
    </div>
    <div class="page-footer">
      <ky-button class="submit-btn" type="primary" @click="handleRouteTo"> 更换实名信息</ky-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { delPersonRealName, getAuthDetail } from '@modules/user/apis/realname'
import FormInput from './form-input.vue'
import { getQueryObject, urlContact } from '@/public/utils/url'
// import { EnterpriseInfo, PersonalInfo } from '../hooks'
import { useRealNameStore } from '../store'
import { showDialog } from '@kye-netc/kye-miniui'
import {
  clk_id_personal_delete_button,
  exp_id_personal_delete_popup,
  clk_id_personal_delete_popup_sure_button,
  other_id_personal_delete_popup_sure,
  clk_id_company_change_information_button,
  clk_id_personal_change_information_button,
  page_id_company,
  page_edite_person_v1,
} from '../report/index'
import Taro from '@tarojs/taro'
import { RouteName } from '../hooks'

const realNameStore = useRealNameStore()

// 用户有效证件类型
const IdTypeValue: Record<string, string> = {
  '01': '居民身份证', // 居民身份证
  '06': '港澳台居住证', // 港澳台居住证
  '07': '港澳台居住证', // 港澳台居住证
  10: '外国人永久居住证', // 外国人永久居住证
}
const IdTypeConfig = {
  RESIDENT: {
    idNumberLabel: '居民身份证号',
    idNumberPlaceholder: '请输入您的居民身份证号',
    subTips: '应国家监管要求，寄件人须实名认证，请完善寄件人的实名信息，实名后将减少取货实名时间，为您提升取货服务效率',
  },
  RESIDENT_GAT: {
    idNumberLabel: '公民身份号码',
    idNumberPlaceholder: '请输入您的公民身份号码',
    subTips: '应国家监管要求，寄件人须实名认证，请完善寄件人的实名信息，实名后将减少取货实名时间，为您提升取货服务效率',
  },
  FOREIGNER: {
    idNumberLabel: '外国人永久居留身份证号',
    idNumberPlaceholder: '请输入您的外国人永久居留身份证号',
    subTips:
      '根据交通部《邮件快件实名收寄管理办法》等有关规定，为了更好地向您提供邮件快件的收寄件服务，需要您提供真实有效的身份信息，在交件时出示有效身份证件，便于取派员进行查验和登记，我司承诺将根据《隐私政策》的约定保护您提供的身份信息',
  },
}

interface FormData {
  idCardName: string
  idCardNo: string
  companyNo: string
  role: number
}

const formData = ref<FormData>({
  idCardName: '',
  idCardNo: '',
  companyNo: '',
  role: 30,
})

const isViewEnterprise = computed(() => {
  const { source } = getQueryObject()
  return source === 'Enterprise'
})

const pageTitle = computed(() => (isViewEnterprise.value ? '企业认证' : '个人认证'))

const viewHasEye = computed(() => !isViewEnterprise.value || (isViewEnterprise.value && formData.value.role === 10))

const maskFormData = computed(() => {
  return isViewEnterprise.value ? realNameStore.getEnterpriseInfo : realNameStore.getPersonInfo
})

const idTypeValue = computed(() => IdTypeValue[maskFormData.value?.idType])

const idCardNoLabel = computed(() => {
  const { RESIDENT, RESIDENT_GAT, FOREIGNER } = IdTypeConfig
  switch (maskFormData.value?.idType) {
    case '01':
      return RESIDENT.idNumberLabel
    case '06':
    case '07':
      return RESIDENT_GAT.idNumberLabel
    case '10':
      return FOREIGNER.idNumberLabel
    default:
      return ''
  }
})

// 删除实名信息
const handleDelete = async () => {
  clk_id_personal_delete_button({
    page_name: 'page_id_personal',
    eventCode: 'clk_id_personal_delete_button',
    event_type_id: 2101,
  })
  try {
    nextTick(() => {
      exp_id_personal_delete_popup({
        page_name: 'page_id_personal',
        eventCode: 'exp_id_personal_delete_popup',
        event_type_id: 2201,
      })
    })
    showDialog({
      zIndex: 1000,
      title: '确定要删除个人实名信息吗？',
      message: '删除后，您下次寄件时需要重新实名认证',
      parentClassName: 'view-verify-info-container',
      showCancelButton: true,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      cancle: () => {
        console.log(11)
      },
      confirm: async () => {
        clk_id_personal_delete_popup_sure_button({
          page_name: 'page_id_personal',
          eventCode: 'clk_id_personal_delete_popup_sure_button',
          event_type_id: 2101,
        })
        const res = await delPersonRealName({ source: '20' })
        if (res.code === 0) {
          other_id_personal_delete_popup_sure({
            page_name: 'page_id_personal',
            eventCode: 'other_id_personal_delete_popup_sure',
            event_type_id: 19999,
            request_result: '成功',
          })
          Taro.showToast({ title: '删除成功', icon: 'none' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        } else {
          other_id_personal_delete_popup_sure({
            page_name: 'page_id_personal',
            eventCode: 'other_id_personal_delete_popup_sure',
            event_type_id: 19999,
            request_result: '失败',
          })
        }
      },
    })
  } catch (e) {
    console.log(e, ':>>> e')
  }
}

const getAuthDetailApi = async () => {
  try {
    const res = await getAuthDetail({ maskFlag: false })
    if (res.code === 0 && res.data) {
      if (isViewEnterprise.value) {
        const { idCardName, idCardNo, certificationCode } = res.data.enterpriseCertification
        formData.value = {
          idCardName,
          idCardNo,
          companyNo: certificationCode,
          role: res.data.role,
        }
      } else {
        const { idCardName, idCardNo } = res.data.personCertification
        formData.value = {
          ...formData.value,
          idCardName,
          idCardNo,
          role: res.data.role,
        }
      }
    }
  } catch (error) {
    console.log('getAuthDetailApi', error)
  }
}

/**
 * 处理路由跳转
 */
const handleRouteNavigation = (name: RouteName): void => {
  const urlMap = {
    Personal: '/modules/user/pages/realname/personal/index',
    Enterprise: '/modules/user/pages/realname/enterprise/step-one/index',
    VerifyInfo: '/modules/user/pages/realname/view-verify-info/index',
  }
  const url = urlMap[name]

  // 未认证，跳转认证页面
  Taro.redirectTo({
    url: urlContact(url, {}),
  })
}

const handleRouteTo = () => {
  let pageType = 'Personal'
  if (isViewEnterprise.value) {
    pageType = 'Enterprise'
    clk_id_company_change_information_button({
      page_name: 'page_id_personal',
      eventCode: 'clk_id_company_change_information_button',
      event_type_id: 2101,
    })
  } else {
    clk_id_personal_change_information_button({
      page_name: 'page_id_personal',
      eventCode: 'clk_id_personal_change_information_button',
      event_type_id: 2101,
    })
  }
  handleRouteNavigation(pageType as RouteName)
}

const reportPageExp = () => {
  if (isViewEnterprise.value) {
    page_id_company({})
  } else {
    page_edite_person_v1({})
  }
}

onMounted(() => {
  getAuthDetailApi()
  reportPageExp()
})
</script>

<style lang="scss">
.view-verify-info-container {
  background: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.view-verify-info {
  padding: 24px 32px;
  flex: 1;
  .verify-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    .label {
      padding-left: 24px;
      font-size: 36px;
      font-weight: 600;
      line-height: 52px;
      position: relative;
      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 8px;
        height: 32px;
        background: #8365f6;
        border-radius: 0px 4px 4px 0px;
        left: 0;
        top: 50%;
        margin-top: -16px;
      }
    }
    .delete-icon {
      width: 28px;
      height: 28px;
      background: url('https://ic-img.ky-express.com/netc/20250905_75598_!!1757062218158_28_28.svg+xml') no-repeat;
      background-size: 28px 28px;
      background-position: center center;
      padding: 3px;
    }
  }
}

.page-footer {
  padding: 16px 32px;
  margin-bottom: env(safe-area-inset-bottom, 20px);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-width: 1px 0px 0px 0px;
  border-style: solid;
  border-color: #e6e8ed;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);
  z-index: 99;

  .submit-btn {
    font-weight: 600;
    height: 88px;
    border-radius: 16px;
    flex: 1;
  }
}
</style>
