<template>
  <div class="bottom-popup-customer-map">
    <BottomPopup
      footerText="确定"
      @onConfirm="onConfirm"
      v-model:show="visible"
      @onClose="close"
      :title="isEdit ? '编辑' : '新增'"
      :catchMove="false"
    >
      <div class="field-content">
        <!--  v-show用于解决app 组件渲染不全异常    -->
        <TextArea
          v-show="true"
          @clear="clear"
          clearbal
          v-model="inputValue"
          :inputValue="inputValue"
          :enableWxNative="true"
          :cursor-spacing="isEdit ? 200 : 220"
          placeholder="请输入自定义编码常用内容"
          :formatter="formatter"
        />
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { NotepadItemConfig } from '@order-public-sub-public/apis/notepad/type'
import { ref, useModel, watchEffect } from 'vue'
import { addNotepad, updateNotepad } from '@order-public-sub-public/apis/notepad/index'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import TextArea from '@order-public-sub-public/components/business/ka-customer-map/components/textarea/index.vue'

import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

interface PopupProps {
  visible?: boolean
  info?: NotepadItemConfig
}
const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
})

const visible = useModel(props, 'visible')
const isEdit = ref(false)
const inputValue = ref('')
const emits = defineEmits<{
  (event: 'update:visible', visible: boolean): void
  (event: 'reload'): void
  // (event: 'submit', data: confirmData): void
}>()

const close = () => {
  isEdit.value = false
  inputValue.value = ''
  emits('update:visible', false)
}

const clear = () => {
  inputValue.value = ''
}

watchEffect(() => {
  if (props?.info?.content) {
    inputValue.value = props?.info?.content || ''
  }
  if (props?.info?.id) {
    isEdit.value = true
    umpOtherReport('OTHER', {
      eventCode: 'other_express_custom_notepad_edit_perception_v1',
    })
  } else {
    umpOtherReport('OTHER', {
      eventCode: 'other_express_custom_notepad_add_perception_v1',
    })
  }
})

const onConfirm = () => {
  if (!inputValue.value.trim()) {
    showToast('请输入自定义编码常用内容')
    return
  }
  if (isEdit.value) {
    updateFun()
  } else {
    addFun()
  }
}

const updateFun = async () => {
  if (props.info?.id) {
    const params = {
      bizType: '10',
      id: props.info?.id,
      content: inputValue.value.trim(),
    }
    try {
      await updateNotepad(params)
      showToast('保存成功')
      emits('reload')
      close()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err?.msg || '保存失败，请重新提交')
    }
  }
}
const addFun = async () => {
  const params = {
    bizType: '10',
    content: inputValue.value.trim(),
  }
  try {
    await addNotepad(params)
    showToast('保存成功')
    emits('reload')
    close()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    showToast(err?.msg || '保存失败，请重新提交')
  }
}

const formatter = (value: string) => {
  return value.trim()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
