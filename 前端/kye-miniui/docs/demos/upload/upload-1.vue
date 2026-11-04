<template>
  <view>
    <text>upload demo</text>
    <ky-upload deletable @change="onFileChange"></ky-upload>
  </view>
  <view>
    <text>upload 多个预览</text>
    <ky-upload v-model="fileList" :maxCount="3" multiple deletable></ky-upload>
  </view>
  <view>
    <text>upload 多个预览</text>
    <ky-upload v-model="fileList" :maxCount="3">
      <view class="custom-upload-btn">
        <text>自定义上传样式</text>
      </view>
    </ky-upload>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const fileList = ref([
  { url: 'https://ic-img.ky-express.com/netc/20230920_59421882332_!!1695201540867_1380_500.png', status: 'success' },
  // upload 根据文件后缀来判断是否为图片文件
  // 如果图片 URL 中不包含类型信息，可以添加 isImage 标记来声明
  {
    name: 'image-2.png',
    type: 'image',
    url: 'https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png',
    status: 'uploading',
    message: '上传中....',
  },
])

const fileToDataURL = (fileItem) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = (e) => {
      resolve(e.target.result)
    }
    reader.readAsDataURL(fileItem)
  })
}
const dataURLToImage = (dataURL) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = dataURL
  })
}

const onFileChange = async ({ fileList }) => {
  console.log('onFileChange', fileList, fileList[0])
  console.log('onFileChange formData', fileList[0].content)
  // const value = await readFile(fileList[0].path, 'dataUrl')
  // const base64 = await fileToDataURL(fileList[0].originalFileObj)
  // console.log('base64', base64)
  console.log('base64', fileList[0].base64)
}

/**
 * 读取文件
 * @param { file } file 文件对象
 * @param { 'dataUrl' | 'text' | 'file' } resultType 文件读取结果的类型
 * @returns { Promise } 返回一个 Promise
 */
const readFile = (file, resultType) => {
  return new Promise((resolve) => {
    console.log('readTest')
    if (resultType === 'file') {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target && event.target.result)
    }
    if (resultType === 'dataUrl') {
      reader.readAsDataURL(file)
    } else if (resultType === 'text') {
      reader.readAsText(file)
    }
  })
}

const beforeRead = () => {
  let result = false
  return new Promise<undefined>((reslove, reject) => {
    ;(async () => {
      if (result) {
        reslove(undefined)
      } else {
        reject()
      }
    })()
  })
}
</script>

<style lang="scss">
.custom-upload-btn {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  border: 1px dashed red;
  image {
    width: 100%;
    height: 100%;
  }
}
</style>
