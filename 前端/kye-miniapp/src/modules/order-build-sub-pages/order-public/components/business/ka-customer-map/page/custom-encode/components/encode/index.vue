<template>
  <div class="encode">
    <div class="tool-content">
      <div class="title">
        <text class="title-text">{{ info.customerFieldName }}</text>
        <SvgIcon v-if="info.requiredStatus" class="required" name="required"></SvgIcon>
      </div>
      <div class="right-content" v-if="info.isSelectFlag !== KaFieldType.tag">
        <div class="item-icon" :class="{ disabled: !info.editable }" @click="openNotepad(info.editable)">
          <SvgIcon class="notepad" name="notepad-icon"></SvgIcon>
          <div>记事本</div>
        </div>
        <div class="item-icon scan-code-content" :class="{ disabled: !info.editable }" @click="toScan(info.editable)">
          <SvgIcon class="scan-code" name="scan-code-icon"></SvgIcon>
          <div>扫一扫</div>
        </div>
      </div>
    </div>
    <div v-if="info.isSelectFlag !== KaFieldType.tag" class="field-content">
      <!-- 用于气泡定位 -->
      <TextArea
        :data-validate="`kaCustomerMap.customerFieldValue.${info.kyField}`"
        @update:model-value="change"
        v-model:value="inputValue"
        :disabled="!info.editable"
        :show-word-limit="true"
        :cursor-spacing="100"
        :placeholder="`请输入${info.customerFieldName || ''}`"
        :formatter="formatter"
        :id="`kaCustomerMap_customerFieldValue_${info.kyField}`"
      />
    </div>
    <!-- <EncodeTag v-if="info.isSelectFlag === KaFieldType.tag" :info="info" @toggle="tagChange" /> -->
    <EncodeSelect v-if="info.isSelectFlag === KaFieldType.tag" :info="info" @toggle="tagChange"></EncodeSelect>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import TextArea from '@order-public-sub-public/components/business/ka-customer-map/components/textarea/index.vue'
import { ref, watchEffect, getCurrentInstance } from 'vue'
import { customerFieldDetailListType, kaCustomerMapItem } from '@order-public-sub-public/types'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { debounce } from 'lodash-es'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import EncodeSelect from '../encode-select/index.vue'
import { KaFieldType } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useConfirm'
import { isWxPcApplet } from '@order-public-sub-public/utils/device'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import plateform from '@kye-netc/plateform'
// import { clkCustomerButton } from '@order-public-sub-public/components/business/ka-customer-map/report'
const router = useRouter()

interface InfoProp {
  info: kaCustomerMapItem
}
// const native = getCurrentInstance()?.appContext.config.globalProperties.$native
const emit = defineEmits<{
  (event: 'change', data: { customerFieldValue: string; kyField: string }): void
}>()
const props = defineProps<InfoProp>()
const inputValue = ref('')

const { closeTippyGloabl, removeValidateKeyByType } = globalUseValidate()

const change = debounce(() => {
  emit('change', {
    customerFieldValue: inputValue.value,
    kyField: props.info.kyField,
  })
}, 200)

const tagChange = (item: customerFieldDetailListType) => {
  // clkCustomerButton('选项', props.info.customerFieldName)
  inputValue.value = item.msg
  emit('change', {
    customerFieldValue: item.msg,
    kyField: props.info.kyField,
  })
}

const openNotepad = debounce((isEditbale: boolean) => {
  // clkCustomerButton('记事本', props.info.customerFieldName)
  if (!isEditbale) {
    return
  }
  closeTippyGloabl()
  removeValidateKeyByType('kaCustomerMap')
  router.push({
    path: '/notepad',
    query: {
      kyField: props.info.kyField,
    },
  })
}, 300)

const toScan = debounce(async (isEditbale: boolean) => {
  // clkCustomerButton('扫一扫', props.info.customerFieldName)
  if (!isEditbale) {
    return
  }
  if (isWxPcApplet) {
    // PC微信小程序 不支持此功能
    showToast('当前登录设备，暂不支持扫一扫功能')
    return
  }
  try {
    const res = await plateform.scanCode()
    const str = res?.result || ''
    if (str) {
      inputValue.value = inputValue.value ? `${inputValue.value}、${str}` : `${str}`
      change()
    }
    closeTippyGloabl()
  } catch (error: unknown) {
    if ((error as Error).message) {
      showToast((error as Error).message)
    }
  }
}, 300)

watchEffect(() => {
  inputValue.value = props.info.customerFieldValue
})

const formatter = (value: string) => {
  return value.trim()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
