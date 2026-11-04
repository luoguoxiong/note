<template>
  <div class="realname-page-enterprise-step-one">
    <div class="step-content">
      <Step :step-key="1" />
    </div>
    <div class="step-one-form">
      <div class="tip">请上传营业执照</div>
      <ky-form ref="stepOneFormRef" :model-value="model">
        <form-input formLabel="证件类型" :hasEye="false" value="营业执照" maskValue="营业执照"></form-input>

        <ky-field
          class="company-name-field"
          :required="true"
          prop="companyName"
          :rules="companyNameRuls"
          v-model="model.companyName"
          @blur="companyNameBlur"
          label="公司全称"
          clearable
          maxlength="60"
          placeholder="请输入公司全称"
        >
        </ky-field>

        <ky-field
          class="idcard-name-field"
          :required="true"
          prop="creditCode"
          :rules="ruls"
          v-model="model.creditCode"
          @blur="idCardBlurValidate('creditCode')"
          label="证件号码"
          clearable
          maxlength="18"
          placeholder="请填写统一信用代码"
        >
          <template #right>
            <Upload user="enterprise" :type="IdTypeEnum.营业执照" @complete="onComplete" />
          </template>
        </ky-field>
      </ky-form>
    </div>
    <div class="page-footer">
      <ky-button class="submit-btn" type="primary" @click="onSubmit"> 下一步 </ky-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import './index.scss'
import { ref, onMounted } from 'vue'
import Step from '../../components/step/index.vue'
import FormInput from '../../view-verify-info/form-input.vue'
import Upload from '../../components/upload/index.vue'
import { checkEnterpriseAuth, checkCompanyName } from '@/modules/user/apis/realname'
import { updateEnterpriseData } from '../../hooks/useEnterpriseData'
import { IdTypeEnum } from '../../hooks/type'
import Taro from '@tarojs/taro'
import { exp_center_id_company, page_id_company } from '../../report'
import { enableAlertUnload, disableAlertUnload } from '../../hooks/useAlertBeforeUnload'
import { setShowPopover } from '../../components/upload/upload'
const model = ref<{ creditCode: string, companyName: string }>({ creditCode: '', companyName: '' })
const stepOneFormRef = ref()
const ruls = [
  {
    validator: (val: string) => {
      // 不能小于18位
      return val.length >= 18
    },
    message: '请输入18位统一社会信用代码',
  },
]
const companyNameRuls = [
  {
    required: true, message: '请输入公司全称'
  },
  {
    validator: async (val: string) => {
      return await checkCompanyNameApi()
    },
    message: '您输入的公司全称和当前绑定的公司全称不匹配，请核对后重新输入',
  }
]

const checkCompanyNameApi = async () => {
  try {
    const param = {
      customerName: model.value.companyName,
    }
    const res = await checkCompanyName(param)
    if (res.data.isMatch) {
      return true // 校验通过
    } else {
      return false
    }
  } catch (error) {
    Taro.showToast({ title: error.message || '网络异常', icon: 'none' })
    return false // 校验不通过
  }
}

const checkCanNext = async () => {
  try {
    const param = {
      customerName: model.value.companyName,
      creditCode: model.value.creditCode,
    }
    const res = await checkCompanyName(param)
    if (res.data.isMatch) {
      return true // 校验通过
    } else {
      return false
    }
  } catch (error) {
    Taro.showToast({ title: error.message || '网络异常', icon: 'none' })
    return false // 校验不通过
  }
}

const checkEnterpriseAuthApi = async () => {
  try {
    const param = {
      creditCode: model.value.creditCode,
    }
    const res = await checkEnterpriseAuth(param)
    if (res.code === 0) {
      return true // 校验通过
    }
  } catch (error) {
    Taro.showToast({ title: error.message || '网络异常', icon: 'none' })
    return false // 校验不通过
  }
}

const idCardBlurValidate = (props) => {
  if (model.value.creditCode) {
    enableAlertUnload()
  } else {
    disableAlertUnload()
  }
  stepOneFormRef.value?.validate(props).then(({ valid, errors }) => {
    if (valid) {
      console.log('success:', model.value)
    } else {
      setShowPopover(false)
      console.warn('error:', errors)
    }
  })
}

const onComplete = (data: any) => {
  if (!data) return
  const { ocrData } = data
  const creditCode = ocrData.result.ocr_data_list?.find((item) => item.key === 'BizLicenseCreditCode')?.value
  const companyName = ocrData.result.ocr_data_list?.find((item) => item.key === 'BizLicenseCompanyName')?.value
  if (!creditCode) {
    return
  }
  stepOneFormRef.value?.reset()
  model.value.creditCode = creditCode
  model.value.companyName = companyName || ''
  if (model.value.companyName) {
    companyNameBlur(companyName)
  }
  enableAlertUnload()
  console.log('ocrDataonComplete', data)
}

const onSubmit = async () => {
  stepOneFormRef.value.validate().then(async ({ valid, errors }) => {
    if (valid) {
      const res = await checkEnterpriseAuthApi()
      if (!res) return
      const isMatch = await checkCanNext()
      if (!isMatch) return
      updateEnterpriseData({ creditCode: model.value.creditCode, orgNames: model.value.companyName })
      Taro.redirectTo({ url: '/modules/user/pages/realname/enterprise/step-two/index' })
      // 成功
    } else {
      setShowPopover(false)
      console.warn('error:', errors)
    }
  })
}

// 公司全称失焦
const companyNameBlur = (e) => {
  console.log(e, '公司全称失焦')
  stepOneFormRef.value?.validate('companyName').then(({ valid, errors }) => {
    if (valid) {
      console.log('success:', model.value)
    } else {
      setShowPopover(false)
      console.warn('error:', errors)
    }
  })
}
onMounted(() => {
  disableAlertUnload()
  page_id_company({})
  exp_center_id_company({})
})
</script>
