<template>
  <view class="app">
  <ky-popup  v-model:show="dialogShow" position="bottom">
    <button @click="showPopup">函数式提示弹窗弹窗</button>
    <ky-dialog
      title="dialog title"
      :is-root="false"
      v-model:show="dialogShow2"
      show-cancle-button
      z-index="99999"
      closeOnClickOverlay
    >
      <view>This is the content of the dialog.</view>
    </ky-dialog>
  </ky-popup>
    <button @click="dialogShow = true">函数式提示弹窗弹窗</button>
   
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import  { showDialog } from '@ky-miniui-lib/ky-miniui-lib'

const dialogShow = ref(false)

const dialogShow2 = ref(false)

const showPopup = async () => {
  dialogShow2.value = true
}

</script>
