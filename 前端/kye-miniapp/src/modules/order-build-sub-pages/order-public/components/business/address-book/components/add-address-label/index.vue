<template>
  <ky-dialog
    v-model:show="show"
    :title="`${isEdit ? '编辑标签' : '添加标签'}`"
    show-cancel-button
    confirm-button-text="保存"
    :before-close="beforeClose"
    :z-index="200"
  >
    <div class="add-label-container">
      <KyInput
        :no-padding="true"
        :clearable="true"
        v-model="name"
        placeholder="请输入标签名称"
        :maxlength="maxLength"
        :show-word-limit="true"
        :formatter="formatter"
        :maxlengthFit="true"
        v-keyboard
        show-border
      >
        <template #right>
          <span>{{ name.length || 0 }}/6</span>
        </template>
      </KyInput>
    </div>
    <template v-slot:footer>
      <div class="label-footer-content">
        <div class="btn cancel" @click="close">取消</div>
        <div class="btn confirm" @click="confirm">保存</div>
      </div>
    </template>
  </ky-dialog>
</template>

<script setup lang="ts">
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { AddressLabel } from '@order-public-sub-public/apis/address/types'
import { ref } from 'vue'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { filterEmojis } from '@order-public-sub-public/utils/pattern'
import { clk_express_book_address_tag_add_v1 } from '../../page/report/index'

const show = ref(false)
const name = ref()
const isEdit = ref<AddressLabel>()
const maxLength = ref<number>(6)

const props = defineProps({
  recognitionType: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['save', 'edit'])

const open = (data?: AddressLabel) => {
  show.value = true
  if (data) {
    name.value = data?.labelName
    isEdit.value = data
  } else {
    name.value = ''
    isEdit.value = undefined
  }
}
const close = () => {
  try {
    clk_express_book_address_tag_add_v1('取消', props.recognitionType)
  } catch (error) {
    console.error(error)
  }
  show.value = false
  setTimeout(() => {
    name.value = ''
  }, 500)
}

const beforeClose = (action: string) => {
  if (action === 'confirm') {
    if (!name.value) {
      showToast('请输入标签名称')
    } else {
      return true
    }
  } else {
    return true
  }
}

// 格式化空格和表情
const formatter = (value: string): string => filterAllSpace(value.replace(filterEmojis, '')).slice(0, maxLength.value)

const confirm = () => {
  try {
    clk_express_book_address_tag_add_v1('保存', props.recognitionType)
  } catch (error) {
    console.error(error)
  }
  if (!name.value) {
    showToast('请输入标签名称')
    return
  }
  if (isEdit.value) {
    emit('edit', [{ ...isEdit.value, labelName: name.value }], isEdit.value.labelName, name.value)
  } else {
    emit('save', name.value)
  }
  return false
}
defineExpose({
  open,
  close,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
