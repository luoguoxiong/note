<template>
  <div class="personal-form-page-body">
    <div v-if="props.user === 'enterprise'" class="personal-form-page-body--tip">请上传法人或企业负责人的证件</div>
    <ky-form ref="formRef" :model-value="localModel">
      <div class="form-label">证件类型</div>
      <ky-cell
        data-validate="pickupMode.pickupMode"
        class="idtype-select-cell"
        :value="idTypeLabel"
        label=""
        isLink
        title=""
        :required="true"
        @click="onClickType"
        placeholder="请选择"
      >
      </ky-cell>
      <ky-field
        class="idcard-name-field"
        :required="true"
        prop="idCardName"
        :rules="getRules('idCardName')"
        v-model="localModel.idCardName"
        @blur="idCardBlurValidate('idCardName')"
        @update:model-value="(val) => handleFieldUpdate('idCardName', val)"
        label="姓名"
        clearable
        placeholder="请输入您的证件姓名"
      >
        <template #right v-if="showOcrUploadBtn">
          <Upload :user="user" :idType="localModel.idType" :type="IdTypeEnum.身份证人像面" @complete="onComplete" />
        </template>
      </ky-field>
      <div v-if="isShowTip" class="name_tip">{{ tipMessage }}</div>
      <ky-field
        class="idcard-number-field"
        :required="true"
        :rules="getRules('idCardNo')"
        @blur="idCardBlurValidate('idCardNo')"
        prop="idCardNo"
        clearable
        v-model="localModel.idCardNo"
        @update:model-value="(val) => handleFieldUpdate('idCardNo', val)"
        :maxlength="isForeignIdNo ? 46 : 30"
        :label="idTypeConfigOptions.idNumberLabel"
        :placeholder="`请输入您的${idTypeConfigOptions.idNumberLabel}`"
      ></ky-field>
      <ky-field
        v-if="forceVerifyObj.forceFlag === '20'"
        class="idcard-number-field"
        prop="otherPhone"
        disabled
        required
        v-model="localModel.otherPhone"
        label="手机号"
        placeholder="请输入您的手机号"
      ></ky-field>
    </ky-form>
    <div class="agreement-row" @tap="toggleAgreement">
      <image
        class="agreement-checkbox"
        :src="
          isAgreed
            ? 'https://ic-img.ky-express.com/kye-miniapp/user/checked-1.png'
            : 'https://ic-img.ky-express.com/kye-miniapp/user/checked-0.png'
        "
      />
      <div class="agreement-text">
        应国家监管要求，寄件人须实名认证，请完善寄件人的实名信息，实名后将减少取货实名时间。我们需要收集您的姓名、证件信息，用于身份认证，我们将严格按照个人信息保护相关法律法规保护您的个人隐私安全，请确认您已知晓并同意提供以上信息
      </div>
    </div>

    <!-- <div class="tip-sub-text">
      {{ idTypeConfigOptions.subTips }}
    </div> -->
    <div class="safty-tip">信息仅用于身份核验，跨越速运提供技术支持</div>
  </div>
  <IdTypePopup
    title="证件类型"
    :show="showIdTypePicker"
    :model="localModel"
    @select="handlePickIdType"
    @close="showIdTypePicker = false"
  ></IdTypePopup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IdTypePopup from './id-type-popup/index.vue'
import Upload from './upload/index.vue'
import { IdType, IdTypeConfig, IdTypeEnum, PersonalModel, ForceVerifyObj } from '../hooks/type'
import { idTypeOptions, IdTypeOption, IDCard, GatIDCard, ForeignerIDCard } from '../hooks/constants'
import { isWxPcAppletEnv } from '@/public/utils'
import { setShowPopover } from './upload/upload'

interface Props {
  model: PersonalModel
  forceVerifyObj?: ForceVerifyObj
  personInfo?: any
  user: 'personal' | 'enterprise'
  isAgreed: boolean
}

const props = withDefaults(defineProps<Props>(), {
  forceVerifyObj: () => ({
    orderPageSource: undefined,
    uniqueId: undefined,
    forceFlag: undefined,
    otherPhone: '',
    idName: '',
    isFromShare: undefined,
    isFromBaqiang: undefined,
  }),
  personInfo: () => ({}),
  isAgreed: false,
})

const isShowTip = computed(() => {
  return (
    props.forceVerifyObj?.forceFlag === '20' &&
    localModel.value?.idCardName !== props.forceVerifyObj?.idName &&
    idTypeLabel.value !== '外国人永久居留身份证'
  )
})

const tipMessage = ref('修改后的姓名将同步更新为当前运单的寄件人姓名')

// 定义emits
const emit = defineEmits<{
  'toggle-agreement': [isAgreed: boolean]
  'update:model': [value: PersonalModel]
  'click-type': []
  complete: [data: any]
  validate: [prop: string]
}>()

const showIdTypePicker = ref(false)
const formRef = ref<any>(null)

// 创建本地响应式数据副本
const localModel = ref<PersonalModel>({ ...props.model })

// 监听props变化，同步到本地数据
watch(
  () => props.model,
  (newModel) => {
    localModel.value = { ...newModel }
  },
  { deep: true },
)

// 计算属性
const idTypeLabel = computed(() => {
  const existVal = idTypeOptions.find((f) => f.value === localModel.value.idType)
  return existVal ? existVal.label : ''
})

const isResidenIdNo = computed(() => localModel.value.idType === IdType.RESIDENT_ID_NO)
const isResidenGatIdNo = computed(() => localModel.value.idType === IdType.RESIDENT_GAT_ID_NO)
const isForeignIdNo = computed(() => localModel.value.idType === IdType.FOREIGNER_ID_NO)

const idTypeConfigOptions = computed(() => {
  const { RESIDENT, RESIDENT_GAT, FOREIGNER } = IdTypeConfig
  return isResidenIdNo.value ? RESIDENT : isForeignIdNo.value ? FOREIGNER : RESIDENT_GAT
})
const showOcrUploadBtn = computed(() => {
  if (isWxPcAppletEnv) return false
  return isResidenIdNo.value || isResidenGatIdNo.value || (isForeignIdNo.value && props.personInfo.isSupportForeignOCR)
})

// 姓名规则校验
const validateIdCardNameRules = computed(() => [
  { required: true, message: '姓名不能为空' },
  {
    validator: (val: string) => {
      if (isResidenIdNo.value || isResidenGatIdNo.value) {
        return /^[^0-9A-Za-z]*$/.test(val) && /[\u4e00-\u9fa5]/g.test(val)
      }
      return true
    },
    message: '姓名为"中文"或"中文+符号"',
  },
])

// const idNumberTips = computed(() => {
//   if (isResidenIdNo.value) {
//     return '居民身份证'
//   }
//   if (isResidenGatIdNo.value) {
//     return '公民身份证'
//   }
//   if (isForeignIdNo.value) {
//     return '外国人永久居留身份证'
//   }
//   return '居民身份证'
// })

// 证件规则校验
const validateIdCardNoRules = computed(() => [
  {
    required: true,
    // message: isResidenIdNo.value
    //   ? '居民身份证号码不能为空'
    //   : isForeignIdNo.value
    //     ? '外国人永久居留身份证号码不能为空'
    //     : '公民身份号码不能为空',
    message: `${idTypeConfigOptions.value.idNumberLabel}码不能为空`,
  },
  {
    validator: (val: string) => {
      if (isResidenIdNo.value) {
        return IDCard?.test(val) || false
      }
      if (isResidenGatIdNo.value) {
        return GatIDCard?.test(val) || false
      }
      if (isForeignIdNo.value) {
        return ForeignerIDCard?.test(val) || false
      }
      return true
    },
    message: `请输入正确的${idTypeConfigOptions.value.idNumberLabel}码`,
  },
])

const toggleAgreement = () => {
  emit('toggle-agreement', !props.isAgreed)
}

const getRules = (name: string) => {
  if (name === 'idCardName') {
    return validateIdCardNameRules.value
  } else if (name === 'idCardNo') {
    return validateIdCardNoRules.value
  }
  return []
}

// 处理字段更新
const handleFieldUpdate = (field: keyof PersonalModel, value: any) => {
  localModel.value = { ...localModel.value, [field]: value }
  emit('update:model', { ...localModel.value })
}

// 处理证件类型点击
const onClickType = () => {
  showIdTypePicker.value = true
  emit('click-type')
}

const idCardBlurValidate = (prop: string) => {
  formRef.value?.validate(prop).then(({ valid, errors }: { valid: boolean; errors: any[] }) => {
    if (valid) {
      console.log('success:', localModel.value)
      // id card验证成功之后，通知外部触发表单提交
      if (prop === 'idCardNo') {
        emit('complete', { type: 'form-complete', data: localModel.value })
      }
    } else {
      console.warn('error:', errors)
      setShowPopover(false)
    }
  })
  emit('validate', prop)
}

// 去除 切换证件类型时重置表单逻辑
watch(
  () => localModel.value.idType,
  () => {
    // handleResetIdCard()
    ;['idCardName', 'idCardNo'].forEach((propName) => {
      formRef.value?.reset(propName)
    })
    // formRef.value?.reset()
  },
)

// const handleResetIdCard = () => {
//   localModel.value = {
//     ...localModel.value,
//     idCardFrontReversePic: '',
//     idCardName: '',
//     idCardNo: '',
//     gender: 1,
//     address: '',
//   }
//   emit('update:model', { ...localModel.value })
// }

const handlePickIdType = (item: IdTypeOption) => {
  localModel.value = {
    ...localModel.value,
    idType: item.value,
  }
  emit('update:model', { ...localModel.value })
  showIdTypePicker.value = false
}

const onComplete = (data: any) => {
  if (!data) return
  const { type, bizId, ocrData } = data
  console.log('ocrData', data)

  if (type === '1') {
    if (!ocrData.name || !ocrData.idNum) {
      // 在父组件中处理toast
      emit('complete', { type: 'error', message: '请上传身份证人像照' })
    } else {
      formRef.value?.reset()
      localModel.value = {
        ...localModel.value,
        idCardFrontReversePic: bizId,
        idCardName: ocrData.name,
        idCardNo: ocrData.idNum,
        gender: ocrData.sex === '男' ? 1 : 2,
        address: ocrData.address,
      }
      emit('update:model', { ...localModel.value })
      emit('complete', { type: 'upload-success', data: { ...localModel.value } })

      // 使用 nextTick 确保 DOM 更新后再进行验证
      setTimeout(() => {
        formRef.value?.validate()
      }, 100)
    }
  } else if (type === '2') {
    if (!ocrData.authority || !ocrData.validDate) {
      emit('complete', { type: 'error', message: '请上传身份证国徽面' })
    } else {
      localModel.value = {
        ...localModel.value,
        idCardFrontPic: bizId,
      }
      emit('update:model', { ...localModel.value })
      emit('complete', { type: 'upload-success', data: { ...localModel.value } })
    }
  }
}

// 设置组件名称
defineOptions({ name: 'PersonalForm' })

// 暴露方法给父组件
defineExpose({
  validate: () => {
    return formRef.value?.validate()
  },
  reset: () => {
    formRef.value?.reset()
  },
  clearValidate: (props?: string | string[]) => {
    formRef.value?.clearValidate(props)
  },
})
</script>

<style lang="scss">
.personal-form-page-body {
  position: relative;
  height: 100%;
  flex: 1;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;

  .ky-cell {
    height: 64px;
    line-height: unset;
  }

  &--tip {
    margin-bottom: 24px;
    font-size: 32px;
    font-weight: 600;
    line-height: 46px;
    color: #24262b;
    padding-left: 24px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0px;
      top: 7px;
      width: 8px;
      height: 32px;
      border-radius: 0px 4px 4px 0px;
      background: #8365f6;
    }
  }

  .name_tip {
    position: relative;
    font-size: 22px;
    font-weight: normal;
    line-height: 30px;
    color: #fe743c;
    margin-top: -14px;
    margin-bottom: 10px;
  }

  .form-label {
    display: flex;
    align-items: center;
    font-size: 28px;
    font-weight: normal;
    line-height: 40px;
    color: #24262b;
    margin-bottom: 4px;

    &:after {
      content: '';
      width: 40px;
      height: 40px;
      margin-left: 4px;
      background: url('https://ic-img.ky-express.com/netc/20250110_99963189533_!!1736495331383_160_160.png') no-repeat
        center;
      background-size: 100% 100%;
    }
  }

  .idtype-select-cell {
    border: 2px solid #e6e8ed;
    border-radius: 12px;
    width: 100%;
    margin-bottom: 24px;
    padding: 0 16px;

    .ky-cell__value {
      text-align: left !important;
    }
  }

  .idcard-name-field {
    width: 100%;
    position: relative;

    .ky-input {
      width: 100%;
    }
  }

  .idcard-number-field {
    width: 100%;

    .ky-input {
      width: 100%;
    }
  }

  .tip-sub-text {
    font-size: 24px;
    font-weight: normal;
    line-height: 34px;
    color: #686b75;
    margin: 12px 0 0 0;
  }

  .agreement-row {
    display: flex;
    align-items: baseline;
    .agreement-text {
      flex: 1;
      margin-left: 5px;
      color: #686b75;
      font-size: 24px;
      line-height: 34px;
    }
    .agreement-checkbox {
      display: block;
      width: 22px;
      height: 22px;
    }
  }

  .safty-tip {
    font-size: 24px;
    font-weight: normal;
    line-height: 34px;
    text-align: center;
    color: #8c8f99;
    text-align: center;
    width: 100%;
    position: absolute;
    bottom: 32px;
    left: 0;
  }

  .ky-field {
    background: #ffffff;
    margin-bottom: 4px;

    .ky-field--top--content {
      width: 100%;
      height: 64px;

      input {
        background: transparent;
      }
    }

    .ky-popover-container {
      width: 100%;

      .ky-input {
        box-sizing: border-box;
        background: #ffffff;
        height: 64px;
      }
    }
  }
}
</style>
