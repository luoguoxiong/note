<template>
  <div class="ky-noticebar" v-if="isShow">
    <div class="ky-navbar" :style="{ color: color, backgroundColor: background }">
      <!-- 左侧图标 -->
      <div class="left-icon">
        <slot name="leftIcon">
          <SvgIcon name="icon-tips" />
        </slot>
      </div>

      <!-- 中间内容 -->
      <div class="nav-content">
        <div class="text-content">
          <slot>
            {{ text }}
          </slot>
          <slot name="operational">
            <div class="operational-content" v-if="isShowOperate" @click="operationalEvents">
              {{ handelText }}
              {{ ' >' }}
            </div>
          </slot>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="right-icon" v-if="isShowClose" @click="close">
        <div class="close-btn">
          <SvgIcon class="arrow" name="close-icon-padding" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '../../ui/svg-icon/index.vue'
import { ref } from 'vue'

const isShow = ref(true)

export interface KYNoticeProps {
  text?: string
  color?: string
  background?: string
  handelText?: string
  isShowOperate?: boolean
  isShowClose?: boolean
}

withDefaults(defineProps<KYNoticeProps>(), {
  text: '',
  color: '#FF9300',
  background: '#FFF3E5',
  isShowClose: true,
  handelText: '去绑定',
})

const emit = defineEmits(['close', 'operationalEvents'])

const operationalEvents = () => {
  emit('operationalEvents')
}

const close = () => {
  emit('close')
  isShow.value = false
}
</script>

<style lang="scss">
@import '../../../styles/index.scss';
.ky-noticebar {
  .ky-navbar {
    display: flex;
    align-items: flex-start;
    padding: 16px 32px;
    font-size: 24px;
    line-height: 34px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  .left-icon {
    margin-right: 8px;
    // display: flex;
    // align-items: center;
    flex-shrink: 0;
  }

  .nav-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  // .text-content {
  //   white-space: nowrap;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }

  .right-icon {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 8px;
    padding: 0 10px;
  }

  .operational-content {
    // display: flex;
    // align-items: center;
    display: inline;
    margin-left: 20px;
    cursor: pointer;
    color: #8365f6;
    font-size: 24px;
    margin-right: 10px;
  }

  .close-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    .svg-icon {
      margin-top: 0;
    }
  }
  .svg-icon {
    width: 24px;
    height: 34px;
    margin-top: -2px;
    flex-shrink: 0;
  }
}
</style>
