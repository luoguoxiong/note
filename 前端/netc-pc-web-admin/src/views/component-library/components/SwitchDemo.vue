<template>
  <div class="ky-switch-content">
    <div class="switch-item">
      <div class="title">正常大小关闭</div>
      <KSwitch v-model="switch1" />
    </div>
    <div class="switch-item">
      <div class="title">正常大小打开</div>
      <KSwitch v-model="switch2" />
    </div>
    <div class="switch-item">
      <div class="title">自定义颜色打开</div>
      <KSwitch v-model="switch3" activeColor="#BDA5F8" />
    </div>

    <div class="switch-item">
      <div class="title">显示文案</div>
      <KSwitch inline-prompt active-text="开" inactive-text="关" v-model="switch4" />
    </div>

    <div class="switch-item">
      <div class="title">小尺寸关闭</div>
      <KSwitch size="small" v-model="switch1" />
    </div>

    <div class="switch-item">
      <div class="title">小尺寸打开</div>
      <KSwitch size="small" v-model="switch2" />
    </div>

    <div class="switch-item">
      <div class="title">小尺寸自定义颜色</div>
      <KSwitch size="small" v-model="switch3" activeColor="#BDA5F8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { KSwitch } from '@netc-design-pc/ui'
import { ref } from 'vue'

const switch1 = ref(false)
const switch2 = ref(true)
const switch3 = ref(true)
const switch4 = ref(false)
</script>

<style scoped>
.ky-switch-content {
  width: 100%;
  padding-left: 20px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .title {
    margin-bottom: 10px;
  }

  .switch-item {
    width: 164px;
  }
}
</style>
