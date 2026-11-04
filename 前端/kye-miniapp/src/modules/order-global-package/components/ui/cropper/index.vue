<template>
  <root-portal>
    <div v-bind="$attrs" class="cropper-popup" :close-on-click-overlay="false" :lock-scroll="false" v-if="show">
      <div class="cropper">
        <div v-if="describe" class="cropper__describe">{{ describe }}</div>
        <div class="cropper-image-wrap">
          <ky-cropper-image :imagePath="img" @ok="handleComplete" ref="cropper" />
        </div>
        <div class="cropper__footer">
          <div @click="handleCancel">取消</div>
          <div @click="handleChoose">换个照片</div>
          <div @click="doComplete">完成</div>
        </div>
      </div>
    </div>
  </root-portal>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, watch } from 'vue'

const visible = ref(true)
const props = defineProps({
  show: { type: Boolean, default: false },
  img: { type: String, default: '' },
  describe: { type: String, default: '截取包含地址的区域' },
  autoCropWidth: { type: Number, default: 400 },
  autoCropHeight: { type: Number, default: 300 },
})

const emit = defineEmits(['onCancel', 'onChoose', 'onComplete', 'update:maskerVisible'])

watch(
  () => props.show,
  (val) => {
    if (val) {
      emit('update:maskerVisible', true)
    } else {
      emit('update:maskerVisible', false)
    }
  },
)

const state = reactive({
  cropWidth: 0,
  cropHeight: 0,
})

const cropper = ref()
/**
 * 取消
 */
const handleCancel = () => {
  emit('onCancel', {})
}

/**
 * 换个照片
 */
const handleChoose = () => {
  cropper.value.reInit()
  emit('onChoose', {})
}

const doComplete = () => {
  cropper.value.crop()
}

function removeBase64Prefix(base64String) {
  // 常见的Base64前缀模式
  const base64PrefixPattern = /^data:[a-z]+\/[a-z]+;base64,/i

  // 检查并去除前缀
  if (base64PrefixPattern.test(base64String)) {
    return base64String.split(',')[1]
  }

  // 如果没有前缀，直接返回原字符串
  return base64String
}
/**
 * 完成
 */
const handleComplete = async (base64: string) => {
  try {
    emit('onComplete', removeBase64Prefix(base64))
  } catch (error) {
    console.log('error>>', error)
  }
}

onMounted(() => {
  emit('update:maskerVisible', false)
  cropper.value?.reInit()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
