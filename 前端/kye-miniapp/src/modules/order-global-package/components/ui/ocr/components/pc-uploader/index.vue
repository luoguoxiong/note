<template>
  <div @click="afterRead">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { fileAfterRead } from '../../../../../utils/file'
import { chooseFiles } from '../../../../../utils/upload'
import { isWxAppIosEnv } from '@/public/utils'
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
  let isAmage = false
  if (isWxAppIosEnv) {
    isAmage = true
  }
  const files = await chooseFiles(
    {
      maxSize: 10,
      type: 'image',
      extension: IMAGE_TYPE,
      maxCount: 1,
    },
    isAmage,
  )

  let res = await fileAfterRead({ fileList: files })
  if (res.length) {
    emit('uploaderAfterRead', res?.[0]?.path)
  }
}
</script>
