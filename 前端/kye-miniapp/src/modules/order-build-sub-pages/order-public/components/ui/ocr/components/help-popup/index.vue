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
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'

defineProps({
  show: {
    type: Boolean,
  },
})

const list = [
  {
    icon: 'https://ic-img.ky-express.com/netc/20250619_90815_!!1750313371279_64_64.png',
    title: '地址粘贴说明',
    child: [
      {
        text: '粘贴完整的地址信息到输入框，点击“识别”',
        src: 'https://ic-img.ky-express.com/netc/20250619_20082_!!1750313820134_1188_394.png',
      },
    ],
  },
  {
    icon: 'https://ic-img.ky-express.com/netc/20250619_21331_!!1750313882399_72_72.png',
    title: '图片识别说明',
    child: [
      {
        text: '点击相机上传包含完整的地址信息图片',
        src: 'https://ic-img.ky-express.com/netc/20250619_32133_!!1750313845758_1188_372.png',
      },
      {
        text: '截取信息后自动识别',
        src: 'https://ic-img.ky-express.com/netc/20250619_21135_!!1750313864573_1188_388.png',
      },
    ],
  },
]

const emit = defineEmits(['onClose'])

const onClose = () => {
  emit('onClose')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
