<template>
  <div class="realname-page-enterprise-step-two">
    <div class="step-content">
      <Step :step-key="2" />
    </div>
    <PersonalForm
      class="personal-form"
      user="enterprise"
      ref="personalFormRef"
      :model="model"
      :person-info="personInfo"
      :isAgreed="isAgreed"
      @update:model="handleModelUpdate"
      @complete="handleFormComplete"
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
import { ref, computed, onMounted } from 'vue'
import Step from '../../components/step/index.vue'
import PersonalForm from '../../components/personal-form.vue'
import AgreementPopup from '../../components/agreement-popup.vue'
import { enableAlertUnload, disableAlertUnload } from '../../hooks/useAlertBeforeUnload'
import { applyEnterprise } from '@modules/user/apis/realname'
import { getQueryObject, urlContact } from '@/public/utils/url'
import { PersonalModel, IdType, ErrorResultCode, VerifyDialogType } from '../../hooks/type'
import { useEnterpriseData } from '../../hooks/useEnterpriseData'
import { other_center_id_company_submit_button, other_id_company_launch } from '../../report'
import Taro from '@tarojs/taro'
import { useRealNameStore } from '../../store'
import { setShowPopover } from '../../components/upload/upload'
const realNameStore = useRealNameStore()
const { id } = getQueryObject()
const personalFormRef = ref<any>(null)
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
const personInfo = computed(() => realNameStore.getPersonInfo)

const model = ref<PersonalModel>(Object.assign({}, defaultModel))
const loading = ref(false)
const isAgreed = ref(false) // 是否同意协议
const showAgreementPopup = ref(false) // 是否展示协议提示弹窗

// 事件处理方法
const handleModelUpdate = (newModel: PersonalModel) => {
  model.value = newModel
  if (model.value.idCardNo || model.value.idCardName) {
    enableAlertUnload()
  } else {
    disableAlertUnload()
  }
}

const onSubmit = async (safeVerifyId: string = '') => {
  if (loading.value) return

  personalFormRef.value?.validate().then(async ({ valid, errors }) => {
    if (valid) {
      // 校验是否勾选协议
      if (!isAgreed.value) {
        showAgreementPopup.value = true
        return
      }
      console.log('success:', model.value, safeVerifyId)
      const work_id = new Date().getTime()
      other_center_id_company_submit_button({
        page_name: 'page_id_company',
        eventCode: 'other_center_id_company_submit_button',
        event_type_id: 2101,
        button_name: '提交',
        work_id,
      })

      try {
        loading.value = true
        let params = Object.assign({}, model.value, useEnterpriseData.value)
        if (safeVerifyId) params.safeVerifyId = safeVerifyId
        const { code, data } = await applyEnterprise(params)
        other_id_company_launch({
          request_result: '成功',
          failure_reason: '',
        })
        loading.value = false
        if (code === 0) {
          Taro.redirectTo({
            url: urlContact('/modules/user/pages/realname/finish/index', {
              type: 'enterprise',
              idType: model.value.idType,
              firstFlag: data.firstFlag || '20', // firstFlag 是否首次认证 10：是，20：否
              work_id,
            }),
          })
        } else if (code === ErrorResultCode.VERIFY_CODE) {
          // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
          if (data.type === VerifyDialogType.HAS_LOCKED) {
            Taro.showToast({ icon: 'none', title: data.msg })
          } else {
            // const verifyResult = await showVerifyCodeDialog(
            //   {
            //     ruleId: data.ruleId,
            //     strategyCode: data.strategyCode,
            //   },
            //   { type: data.type },
            // )
            // if (verifyResult?.safeVerifyId) {
            //   this.onSubmit(verifyResult?.safeVerifyId)
            // }
          }
        }
      } catch (error) {
        other_id_company_launch({
          request_result: '失败',
          failure_reason: error.message,
        })
        Taro.showToast({ icon: 'none', title: error.message })
      } finally {
        loading.value = false
      }
    } else {
      setShowPopover(false)
      console.warn('error:', errors)
    }
  })
}
// 触发勾选协议
const handleToggleAgreement = (val: boolean) => {
  isAgreed.value = val

  handleAutoSubmit()
}
const handleFormComplete = (data: any) => {
  const { type } = data

  if (type === 'form-complete') {
    // 填写完 id card 输入框，自动触发表单提交逻辑
    onSubmit()
  }
}
// 底部弹窗-确认勾选协议
const handleAgreementConfirm = () => {
  isAgreed.value = true
  showAgreementPopup.value = false

  handleAutoSubmit()
}

// 自动提交逻辑：当用户勾选协议并且表单填写完，自动触发表单校验和提交逻辑
const handleAutoSubmit = () => {
  if (isAgreed.value) {
    if (model.value.idCardName && model.value.idCardNo) {
      onSubmit()
    }
  }
}

onMounted(() => {
  disableAlertUnload()
})
</script>
<style lang="scss">
.realname-page-enterprise-step-two {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
  max-width: 100vw;
}
.personal-form {
  box-sizing: border-box;
  border-radius: 24px 24px 0px 0px;
  background: #ffffff;
  margin: -24px 0px;
}
.page-footer {
  padding: 16px 32px;
  min-height: 120px;
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
    height: 88px;
    border-radius: 16px;
    font-weight: 600;
    flex: 1;
  }
}
</style>
