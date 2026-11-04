<template>
  <div @click="afterRead">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { fileAfterRead } from '@order-public-sub-public/utils/file'
import { chooseFiles } from '@order-public-sub-public/utils/upload'
const IMAGE_TYPE = ['jpg', 'png', 'jpeg', 'image', 'bmp']
defineProps({
  accept: {
    type: String,
    default: 'image/*',
  },
})

const emit = defineEmits(['uploaderAfterRead'])
//选择文件后
const afterRead = async () => {
  const files = await chooseFiles({
    maxSize: 10,
    type: 'image',
    extension: IMAGE_TYPE,
    maxCount: 1,
  })

  let res = await fileAfterRead({ fileList: files })
  if (res.length) {
    emit('uploaderAfterRead', res?.[0]?.path)
  }
}
</script>
