<template>
  <view class="app">
    <!-- <button @click="showPopup('bottom')">底部弹出{{ popupVisible }}</button>
    <button @click="showPopup('top')">顶部弹出</button>
    <button @click="showPopup('center')">中间弹出</button>
    <button @click="showPopup('right')">右边弹出</button>
    <button @click="showPopup('left')">左边弹出</button> -->
    <button @click="popupFormVisible=true">底部form弹出</button>
    <ky-popup-simple v-model:show="popupVisible" :position="position" safe-area-inset-top @update:show="popupVisible = $event"
      :style="{height: '100%',maxHeight: '100%'}" class="abc bcd"
    >
      <view class="popup-content">
        <view>我是弹窗内容</view>
        <view>我是弹窗内容</view>
        <view>我是弹窗内容</view>
        <button @click="popupVisible = false">关闭</button>
      </view>
    </ky-popup-simple>
    <ky-popup-simple v-model:show="popupFormVisible" position="bottom" @update:show="popupFormVisible = $event">
      <view style="padding: 24px;">
        <ky-form ref="formRef" :model-value="formData">
          <ky-field
            prop="proxyPickupPerson"
            clearable
            :maxlength="40"
            class="receiver-input"
            placeholder="请输入"
            ref="proxyPickupPerson"
            label="代收人姓名"
            :required="true"
          ></ky-field>
        </ky-form>
      </view>
    </ky-popup-simple>
  </view>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'

const popupVisible = ref(false)

const position = ref('')

const showPopup = (position1: string) => {
  position.value = position1
  setTimeout(() => {
    popupVisible.value = true
  }, 1000)
}
/* popup form */
const popupFormVisible = ref(false)
const formData = ref({
  proxyPickupPerson: '',
  proxyPickupMobile: '',
})
</script>
