<template>
  <ky-popup
    v-if="show"
    round
    catchMove
    position="bottom"
    :show="show"
    :lazy-render="false"
    @click-overlay="emits('update:show', false)"
  >
    <view class="add-popup">
      <view class="add-popup__header">
        <text>{{ title }}</text>
        <image
          @tap="emits('update:show', false)"
          class="add-popup__header-close"
          src="https://ic-img.ky-express.com/netc/20250731_84451_!!1753952732865_64_64.png"
        />
      </view>
      <view class="add-popup__body">
        <view class="add-popup__form-item">
          <view class="add-popup__label">
            {{ fieldLabel }}
            <view class="add-popup__label--required"></view>
          </view>
          <view class="add-popup__input-wrap">
            <view class="input-popover" v-if="isErr">
              <image
                class="input-popover-arrow"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAYAAAAMJL+VAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAB9SURBVDiNtdS7EYAgEEXRi9iO/WiFUJD2Y+BvRFhWZV+CJPcEzOi45jCYS04TwCwO0FnGAXpgBCajfvDAsl+G1nEgerY3mBsjAYgAB0BD5IynQAvkFs8Bf5BHvAR8QbJxCXiDFOM1QIOIcQ0gIdW4FsghqjhsvwrtYuFb3ArpMhoBGamKoQAAAABJRU5ErkJggg=="
              ></image>
              {{ errMsg }}
            </view>
            <ky-input
              v-if="isWxMiniApp"
              :type="'number'"
              :maxlength="maxLength"
              :placeholder="placeholder"
              :model-value="form.phone"
              :enableNative="isWxMiniApp"
              :enableWxNative="isWxMiniApp"
              @blur="handleBlur"
              @focus="handleFocus"
              @update:model-value="handleInput"
              :is-error="isErr"
              :always-system="true"
              :cursor-spacing="200"
              clearable
              required
            ></ky-input>
            <ky-input
              v-else
              :type="'text'"
              :maxlength="maxLength"
              :placeholder="placeholder"
              v-model="form.phone"
              :enableNative="isWxMiniApp"
              :enableWxNative="isWxMiniApp"
              @blur="handleBlur"
              @focus="handleFocus"
              :is-error="isErr"
              :always-system="true"
              :cursor-spacing="200"
              :formatter="telFormatter"
              clearable
              required
            ></ky-input>
          </view>
        </view>
        <view class="add-popup__form-item" v-if="form.phone.includes('-')">
          <view class="add-popup__label">分机号</view>
          <view class="add-popup__input-wrap">
            <ky-input
              type="number"
              placeholder="请输入座机分机号"
              :maxlength="4"
              v-model="form.subNumber"
              :enableNative="isWxMiniApp"
              :enableWxNative="isWxMiniApp"
              :always-system="true"
              :cursor-spacing="200"
              :formatter="numberFormatter"
              clearable
              required
            ></ky-input>
          </view>
        </view>
      </view>
      <view class="add-popup__footer">
        <ky-button :loading="loading" size="large" type="primary" block @click="handleAddPhone">确定</ky-button>
      </view>
    </view>
  </ky-popup>
</template>
<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import { isWxMiniApp } from '@/public/utils'
import { debounce } from 'lodash-es'
import { areaCodeMatch, getCityTelephoneCodes } from './cityTelephoneCodes'

defineOptions({ name: 'AddPhonePopup' })

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '添加手机号' },
  fieldLabel: { type: String, default: '手机号' },
  okText: { type: String, default: '确定' },
  requiredMessage: { type: String, default: '请输入11位手机号码' },
  placeholder: { type: String, default: '请输入手机号' },
  loading: { type: Boolean, default: false },
  inputType: { type: String, default: 'number' },

  allowTel: { type: Boolean, default: false },
})

const emits = defineEmits(['update:show', 'submit', 'validate'])

const form = reactive({ phone: '', subNumber: '' })
const errMsg = ref('')
const isErr = ref(false)
const maxLength = computed(() => (props.allowTel ? 14 : 11))

const numberFormatter = (value: string) => {
  return value.replaceAll(/[^0-9]/g, '')
}

const validator = (value: string) => {
  if (props.allowTel) {
    if (!/^1[3-9]\d{9}$/.test(value) && !/^(\d{3,4}-\d{3,8})+(-\d{1,4})?$/.test(value)) {
      return '请输入正确的手机号或座机号'
    }
    return ''
  }

  if (!/^1[3-9]\d{9}$/.test(value) || value.length !== 11) {
    return '请输入11位手机号码'
  }
  return ''
}

const validate = (showToast = false) => {
  const error = validator(form.phone)

  if (error && showToast) {
    Taro.showToast({ title: error, icon: 'none' })
  }
  errMsg.value = error
  isErr.value = Boolean(error)

  return error
}

const handleBlur = debounce(() => validate(), 500, { leading: true })

const handleAddPhone = () => {
  const error = validate()
  const value = [form.phone, form.subNumber].filter(Boolean).join('-')

  emits('validate', { error, value })

  if (error) return

  emits('submit', value)
}

const telFormatter = (value: string) => {
  let phone = props.allowTel ? value.replaceAll(/[^-0-9]/g, '') : numberFormatter(value)

  if (!props.allowTel || value.includes('-')) {
    return phone
  }

  const code = getCityTelephoneCodes()

  if (value.startsWith('0') || value.startsWith('400') || value.startsWith('800')) {
    phone = areaCodeMatch(phone, code)
  }
  return phone
}

const handleInput = (value: string) => {
  form.phone = telFormatter(value)
}

const handleFocus = () => {
  isErr.value = false
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal === true) {
      form.phone = ''
      form.subNumber = ''
      errMsg.value = ''
      isErr.value = false
    }
  },
)
</script>
