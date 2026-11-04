<template>
  <CardBlock title="取货联系人" :showClear="showClear" @clearForm="clearForm" class="pickup-information-form">
    <div class="form-value" id="exp_express_entrust_pickupInfo_v1">
      <KyReport eventCode="exp_express_entrust_pickupInfo_v1"></KyReport>
      <KyReport v-if="showItem.picker" eventCode="exp_express_pickup_person_v1"></KyReport>
      <KyReport v-if="showItem.pickerMobile" eventCode="exp_express_pickup_mobile_v1"></KyReport>
      <KyReport eventCode="exp_express_pickup_telephone_v1"></KyReport>
      <div class="form-item flex flex-items-center" id="suggestTarget">
        <KyField
          data-validate="pickupInformation.person"
          placeholder="姓名"
          @onInput="personChange"
          @onFocus="personChangeFocus"
          @blur="blur('person', personValue)"
          @click="onInputClick"
          :modelValue="personValue"
          v-if="showItem.picker"
          :maxlength="20"
          :clearDisplaySpace="true"
          :formatter="formatPerson"
          clearable
          class="person"
          :disabled="!editableItem.picker"
          v-keyboard
        />
        <KyField
          placeholder="手机号(司机优先联系)"
          @onInput="mobileInput"
          @onFocus="mobileChangeFocus"
          :modelValue="mobileValue"
          data-validate="pickupInformation.mobile"
          :maxlength="11"
          :clearDisplaySpace="true"
          v-if="showItem.pickerMobile"
          @blur="blur('mobile', mobileValue)"
          clearable
          @click="onInputClick"
          class="mobile"
          :disabled="!editableItem.pickerMobile"
          type="number"
          v-keyboard
        />
        <SuggestMenu
          :keyword="keyword"
          @onSelectSuggest="onSelectSuggest"
          :visible="showSuggest"
          :suggestList="suggestList"
          @onCloseDropdownMenu="onCloseDropDownMenu"
        />
      </div>
      <TelephoneExt
        v-if="showItem.pickerPhone"
        :telephone="telephoneValue"
        :extension="extensionValue"
        :telephone-config="{
          visible: true,
          editable: editableItem.pickerPhone,
          dataValidate: 'pickupInformation.telephone',
        }"
        :extension-config="{ maxlength: '8', format: formatExtension }"
        :source="''"
        :mobile="mobileValue"
        @on-focus-telephone="telephoneChangeFocus"
        @on-input-telephone="telephoneChange"
        @on-blur-telephone="onBlurTelephone"
        @on-input-extension="exitChange"
        @on-blur-extension="onBlurExtension"
      />
    </div>
  </CardBlock>
</template>

<script lang="ts" setup>
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'

import CardBlock from '@order-public-sub-public/components/ui/card-block/index.vue'
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import SuggestMenu from './../suggest-menu/index.vue'
import TelephoneExt from '@order-public-sub-public/components/ui/address-unfold/components/telephone-ext/index.vue'
import { computed, nextTick, ref } from 'vue'
import { pickupFormProps } from '@order-public-sub-public/components/business/pickup-information/components/pickup-form/types'
import { formatMobile, formatExtension } from '@order-public-sub-public/utils/index'
import { RecommendType } from '@order-public-sub-public/apis/pickup/type'
import { FieldKey } from '@order-public-sub-public/components/business/pickup-information/types/types'
import {
  clk_express_pickup_mobile_v1,
  clk_express_pickup_person_v1,
  clk_express_pickup_telephone_v1,
  reportPickupFormField,
} from '../../report'
import vKeyboard from '@order-global-package-order-sub/directives/keyboard'
import { isH5FSEnv } from '@/public/utils'

const suggestVisible = ref(false)
const emit = defineEmits([
  'clearForm',
  'telephoneChange',
  'personChange',
  'mobileChange',
  'onSelectSuggest',
  'blur',
  'exitChange',
])
const props = withDefaults(defineProps<pickupFormProps>(), {
  personValue: '',
  telephoneValue: '',
  mobileValue: '',
  extensionValue: '',
  suggestList: () => [],
  keyword: '',
})
const inputClickRef = ref(false)

//展示输入建议
const showSuggest = computed(() => {
  return inputClickRef.value && suggestVisible.value && props.suggestList?.length > 0
})
//展示清空按钮
const showClear = computed(() => {
  return props.mobileValue + props.personValue + props.telephoneValue !== ''
})
//切换推荐面板显示隐藏
const switchDropdownMenu = (flag: boolean) => {
  suggestVisible.value = flag
}
//选择推荐
const onSelectSuggest = async (value: RecommendType) => {
  await emit('onSelectSuggest', value)
  switchDropdownMenu(false)
  inputClickRef.value = false
}
// 关闭推荐
const onCloseDropDownMenu = () => {
  switchDropdownMenu(false)
  inputClickRef.value = false
}
//清空表单
const clearForm = () => {
  emit('clearForm')
}
// 固定电话输入
const telephoneChange = (value: string) => {
  emit('telephoneChange', value)
}
//固定电话分机号输入
const exitChange = (value: string) => {
  emit('exitChange', value)
}
//名字输入
const personChange = (value: string) => {
  emit('personChange', value)
  switchDropdownMenu(true)
}
const personChangeFocus = () => {
  emit('personChange', props.personValue, 'focus')
  switchDropdownMenu(true)
  clk_express_pickup_person_v1()
}

// 手机号实时输入
const mobileInput = (value: string, event: any) => {
  const currentCursor = event?.detail?.cursor
  let formatValue = value
  // if (formatMobile) {
  //   formatValue = formatMobile(value, 13)
  // }
  formatValue = formatValue.replace(/[^\d]/g, '').substring(0, 11)
  nextTick(() => {
    // 当前光标在中间,不执行格式化（处理中间删除-光标跳转尾部）
    if (value && currentCursor < value?.length) {
      return
    }
    mobileChange(value)
    setTimeout(() => {
      mobileChange(formatValue)
    }, 10)
  })
}

//手机号输入
const mobileChange = (value: string) => {
  emit('mobileChange', value)
  switchDropdownMenu(true)
}
const mobileChangeFocus = () => {
  emit('mobileChange', props.mobileValue, 'focus')
  switchDropdownMenu(true)
  clk_express_pickup_mobile_v1()
}
const telephoneChangeFocus = () => {
  clk_express_pickup_telephone_v1()
}
const onInputClick = () => {
  inputClickRef.value = true
}
//失焦
const blur = (key: FieldKey, value: string) => {
  emit('blur', key)
  reportPickupFormField('OTHER', { fieldName: key, value })
}

const formatPerson = (value: string): string => {
  /* eslint-disable-next-line */
  return value.trim()
}

// telephone-ext 组件的 blur 回调
const onBlurTelephone = () => {
  blur('telephone', `${props.telephoneValue}${props.extensionValue ? '-' : ''}${props.extensionValue}`)
}

const onBlurExtension = () => {
  reportPickupFormField('OTHER', { fieldName: 'extension', value: props.extensionValue })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
