<template>

  <view class="app">
    <button @click="showPopup('bottom')">底部弹出</button>
    2323
      <ky-popup v-model:show="popupVisible" style="transition: 0.3s;z-index: 100;max-height: 80%;bottom: 0px;" :position="position" safe-area-inset-top @update:show="popupVisible = $event">
        <scroll-view style="height: 200px" :scroll-y="true">
          <view class="popup-content">
              <button @click="showPopup2 = true">底部弹出第二层</button>
              <button @click="popupVisible = false">关闭</button>
              <ky-dialog
                  title="dialog title"
                  v-model:show="showPopup2"
                  show-cancle-button
                  @cancel="showPopup2 = false"
                  @confirm="showPopup2 = false"
                >
                <view>This is the content of the dialog.</view>
              </ky-dialog>
            </view>
            <view style="height:300px"></view>
        </scroll-view>
      </ky-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import "./index.scss"
import { RootPortal } from '@tarojs/components'
import Other from './other.vue'
const activeIndex = ref(0)

const tab1 = ref([
  {
    label: '基本用法',
  },
  {
    label: 'scroll-view',
  },
  {
    label: 'overflow-auto',
  },
])


const popupVisible = ref(false)

const position = ref('')

const showPopup = (position1: string) => {
  popupVisible.value = true
  position.value = position1
}

const showPopup2 = ref(false)
</script>
