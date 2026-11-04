<template>
  <div class="ocr-help-popup">
    <BottomPopup title="智能识别帮助" :show="show" :showFooter="false" class="ocr-help-popup-inner" @onClose="onClose">
      <div v-if="show">
        <div class="list" v-for="(item, index) in list" :key="index">
          <div class="list__header">
            <img class="list__header__icon" :src="item.icon" alt="" />
            <div class="list__header__text">{{ item.title }}</div>
          </div>
          <div class="list__content" v-for="(child, idx) in item.child" :key="idx">
            <div class="list__content__text">{{ child.text }}</div>
            <img class="list__content__img" :src="child.src" alt="" />
          </div>
        </div>
      </div>

      <div class="tips-des">* 如果信息不准确，可继续编辑修改再提交</div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
// 组件
import BottomPopup from '../../../../ui/bottom-popup-ui/index.vue'
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
  },
  fromSource: {
    type: String,
    default: '',
  },
})

const listConfig = [
  {
    icon: 'https://ic-img.ky-express.com/netc/20250619_90815_!!1750313371279_64_64.png',
    title: '地址粘贴说明',
    child: [
      {
        text: '点击“粘贴并识别”按钮，自动识别地址信息',
        src: 'https://ic-img.ky-express.com/netc/20260831_42892_!!1788147045148_1280_400.png',
      },
    ],
  },
  {
    icon: 'https://ic-img.ky-express.com/netc/20250619_21331_!!1750313882399_72_72.png',
    title: '图片识别说明',
    child: [
      {
        text: '点击相机上传包含完整的地址信息图片',
        src: 'https://ic-img.ky-express.com/netc/20260831_45052_!!1788146800809_1280_400.png',
      },
      {
        text: '截取信息后自动识别',
        src: 'https://ic-img.ky-express.com/netc/20250619_21135_!!1750313864573_1188_388.png',
      },
    ],
  },
  {
    icon: 'https://ic-img.ky-express.com/netc/20260828_21191_!!1787905855993_72_72.png',
    title: '语音识别说明',
    child: [
      {
        text: '点击语音识别开始录音，语音说出地址信息',
        src: 'https://ic-img.ky-express.com/netc/20260831_28572_!!1788146715010_1280_400.png',
      },
      {
        text: '收集录音信息，结束录音后识别',
        src: 'https://ic-img.ky-express.com/netc/20260831_35486_!!1788145462698_1280_396.png',
      },
    ],
  },
]

const list = computed(() => {
  return props.fromSource === 'dispatch' ? listConfig.slice(0, 1) : listConfig
})

const emit = defineEmits(['onClose'])

const onClose = () => {
  emit('onClose')
}
</script>

<style lang="scss">
/* @import '@order-public/styles/index.scss';  已移除，样式已内联 */
@import './index.scss';
</style>
