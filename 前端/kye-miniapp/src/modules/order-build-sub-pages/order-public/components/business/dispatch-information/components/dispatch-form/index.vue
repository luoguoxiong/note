<template>
  <div>
    <CardBlock
      :class="['dispatch-form-org', styles['dispatch-form']]"
      title="派货信息"
      :showClear="showClear"
      @clearForm="clearForm"
    >
      <div :class="[styles['form-value']]">
        <div v-for="(item, index) in formConfigList" :key="index">
          <div class="value-item">
            <!-- 预约时间自定义展示 -->
            <div v-if="item.fieldName === 'appointDate'" class="appoint-date-field">
              <span class="appoint-date-label">
                {{ item.optionName }}
                <span @click.stop="showAppointDesc(item)" class="appoint-date-question-box">
                  <image
                    v-if="item.optionTips"
                    class="appoint-date-question"
                    src="https://ic-img.ky-express.com/netc/20250613_85057_!!1749787046424_64_64.png"
                    @click="showAppointDesc(item)"
                  />
                </span>
              </span>
              <span class="appoint-date-remark" v-if="item.disableFlag == '1'">
                {{ item.optionRemark }}
              </span>
              <span
                class="appoint-date-value"
                v-else-if="formData[item.fieldName]"
                @click.stop="filedClick(item, formData[item.fieldName] as string)"
              >
                {{ formData[item.fieldName] }}
              </span>
              <span
                class="appoint-date-placeholder"
                @click.stop="filedClick(item, formData[item.fieldName] as string)"
                v-else
                >请选择</span
              >
            </div>
            <!-- 其他字段使用 ky-field -->
            <ky-field
              v-else
              autocomplete="off"
              :modelValue="formData[item.fieldName]"
              :class="{
                'is-focus-value': focusType === item.fieldName,
                disabled: item.disableFlag && +item.disableFlag,
                'last-item': index === formConfigList.length - 1,
                blod: formData[item.fieldName],
              }"
              :placeholder="getPlaceholder(item)"
              :maxlength="item.maxLength"
              input-align="right"
              textAlign="right"
              :clearDisplaySpace="true"
              @update:model-value="(val) => onInput(val, item.fieldName)"
              @focus="onfocus(item.fieldName)"
              @blur="onBlur(item, formData[item.fieldName])"
              :formatter="(v) => valueFormatter(v, item.fieldName)"
              clearable
              :readonly="item.disableFlag == '1'"
              :disabled="item.disableFlag == '1'"
              @click.stop="filedClick(item, formData[item.fieldName])"
              v-keyboard
              :data-validate="`dispatchInformation.${item.fieldName}`"
              :isError="getFieldError(item.fieldName)"
              :id="`dispatchInformation_${item.fieldName}`"
            >
              <template #label>
                {{ item.optionName }}
              </template>
            </ky-field>
          </div>
        </div>
      </div>
    </CardBlock>

    <!-- 预约时间弹窗 -->
    <AppointDatePopup
      v-model="showAppointDatePopup"
      :config="appointDateConfig"
      :notificationData="appointDateNotification"
      :choosableTimes="choosableTimes || []"
      :exactTimeEarliestStartTime="exactTimeEarliestStartTime"
      @confirm="onAppointDateConfirm"
      @reload="(done) => onReloadChoosableTimes(done)"
    />
  </div>
</template>

<script lang="ts" setup>
// import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import CardBlock from '@order-public-sub-public/components/ui/card-block/index.vue'
import AppointDatePopup from '../appoint-date-popup/index.vue'
import { computed, ref } from 'vue'
import {
  dispatchFormProps,
  NotificationData,
} from '@order-public-sub-public/components/business/dispatch-information/components/dispatch-form/types'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { pickupConfig } from '@order-public-sub-public/apis/pickup/type'
import { valueFormatter } from '@order-public-sub-public/components/business/dispatch-information/utils'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'
import vKeyboard from '@order-global-package-order-sub/directives/keyboard'
import styles from './index.module.scss'

const { validateObj, removeValidateKey } = useValidate()

const props = withDefaults(defineProps<dispatchFormProps>(), {
  formConfigList: () => [],
  appointDateNotification: null,
  choosableTimes: () => [],
  exactTimeEarliestStartTime: '',
})

const focusType = ref('')
const emit = defineEmits([
  'clearForm',
  'onInput',
  'onFieldClick',
  'onFieldBlur',
  'onAppointDateChange',
  'onReloadChoosableTimes',
])

// 预约时间弹窗状态
const showAppointDatePopup = ref(false)
const appointDateConfig = ref<pickupConfig | null>(null)
const appointDateNotification = computed(() => props.appointDateNotification)

const onAppointDateConfirm = (displayStr: string, notification: NotificationData | null) => {
  emit('onInput', displayStr, 'appointDate')
  emit('onAppointDateChange', notification)
}

const onReloadChoosableTimes = (done: () => void) => {
  emit('onReloadChoosableTimes', done)
}

//展示清空按钮
const showClear = computed(() => {
  return (
    Object.values(props.formData)
      .filter((i) => i)
      .join() !== ''
  )
})

//清空表单
const clearForm = () => {
  emit('clearForm')
}
const onInput = (value: string, fieldName: string) => {
  emit('onInput', value, fieldName)
  closeBubble(fieldName)
}
const onfocus = (fieldName: string) => {
  focusType.value = fieldName
  closeBubble(fieldName)
}

const closeBubble = (fieldName: string) => {
  setTimeout(() => {
    removeValidateKey(`dispatchInformation.${fieldName}`)
  }, 300)
}
const onBlur = (item: pickupConfig, value: string) => {
  focusType.value = ''
  emit('onFieldBlur', { item, value })
}

//输入框点击
const filedClick = (item: pickupConfig, value: string) => {
  if (item.fieldName === 'appointDate') {
    appointDateConfig.value = item
    showAppointDatePopup.value = true
    emit('onFieldClick', { item, value })
    return
  }
  const { disableFlag, optionTips } = item
  if (+disableFlag) {
    showToast(optionTips)
  }
  emit('onFieldClick', { item, value })
}

// 预约时间问号点击
const showAppointDesc = (item: pickupConfig) => {
  console.log(item, 'item11111111111')
  if (item.optionTips) {
    showToast(item.optionTips)
  }
}

const getPlaceholder = (item: pickupConfig) => {
  if (item.fieldName === 'purchaseNumber') {
    return props.warehouseType === '40' ? '请输入京东采购单号，多个用逗号隔开' : '请输入采购单号'
  }
  return item?.disableFlag && +item.disableFlag ? item.optionTips : item?.textBoxTips || '请输入'
}

const getFieldError = (fieldName: string) => {
  return !!validateObj[`dispatchInformation.${fieldName}`]?.content
}
</script>

<style lang="scss">
@import './index.scss';
</style>
