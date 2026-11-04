<template>
  <div class="upload-icon-content">
    <image class="upload-icon" src="https://ic-img.ky-express.com/netc/20260108_81089_!!1767836285819_28_28.svg+xml" />
    <div @click.stop="handelUploadFunc" class="click-mark"></div>
    <div class="tip-wrap" :class="{ 'shot-tip': tipNew.length < 10 }" v-if="showPopover">
      {{ tipNew }}
    </div>
  </div>
  <CompressImage ref="compressCanvas" />
</template>
<script setup lang="ts">
import CompressImage from './compress-image.vue'
import {
  useInitUpload,
  showPopover,
  setShowPopover,
  personVerifyOptions,
  handleFilePathToBase64,
  afterRead,
  toUnitSize,
  onReportClickUpload,
  inputUpload,
} from './upload'
import plateform from '@kye-netc/plateform'
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import { isH5Env } from '@/public/utils'
import { IdType } from '../../hooks/type'
import { showDialog } from '@kye-netc/kye-miniui'
defineOptions({ name: 'Upload' })
const props = defineProps<{ type: string; idType?: number | undefined; user: string }>()
const emit = defineEmits(['complete'])

const compressCanvas = ref<InstanceType<typeof CompressImage>>()
const getShowPopover = () => {
  let tipOver = Taro.getStorageSync('tipOver')
  if (tipOver) {
    setShowPopover(false)
  } else {
    setShowPopover(true)
  }
}
getShowPopover()

const isResidentGatIdNo = computed(() => {
  return props.idType + '' === IdType.RESIDENT_GAT_ID_NO + ''
})

const tipNew = computed(() => {
  const type = props.type
  let text = ''
  switch (type) {
    case '1':
      text = `上传${isResidentGatIdNo.value ? '居住' : '身份'}证正面图片，快速识别`
      break
    default:
      text = '上传图片，快速识别'
      break
  }
  return text
})

const afterReadCallback = (data) => {
  emit('complete', data)
}

const handelUpload = async (afterReadCallback) => {
  const MAX_SIZE = personVerifyOptions.maxSize
  const MAX_SIZE_LIMIT = personVerifyOptions.maxSizeLimit

  try {
    onReportClickUpload()
    if (isH5Env) {
      const fileInfo = await inputUpload(
        {
          type: 'image',
          extension: ['jpg', 'png', 'jpeg', 'image', 'bmp'],
          maxCount: 1,
        },
        true,
      )

      Taro.showLoading({
        title: '加载中...',
      })

      if (fileInfo?.[0]?.size > MAX_SIZE) {
        Taro.hideLoading()
        setTimeout(() => {
          Taro.showToast({
            icon: 'none',
            title: `文件大小限制为${toUnitSize(MAX_SIZE)},当前为${toUnitSize(fileInfo?.[0]?.size)}`,
          })
        }, 100)
        return
      }
      console.log('fileInfo', fileInfo)
      const resData = await afterRead({ content: fileInfo?.[0]?.base64 })
      afterReadCallback(resData)
      Taro.hideLoading()
    } else {
      const res: any = await plateform.chooseMedia({
        mediaType: ['image'],
        sourceType: ['camera', 'album'],
        sizeType: ['compressed'], // 压缩图
        count: 1,
      })

      console.log('chooseMedia', res)

      Taro.showLoading({
        title: '加载中...',
      })

      let tempFile = res.tempFiles[0]
      await new Promise((r) => setTimeout(r, 200))
      // await showDialog({
      //   zIndex: 1000,
      //   title: '个人认证',
      //   message: tempFile.tempFilePath,
      //   parentClassName: 'personal-form-page-body',
      //   showCancelButton: true,
      //   confirmButtonText: '复制',
      //   cancelButtonText: '不使用',
      //   confirm: async () => {
      //     await Taro.setClipboardData({ data: tempFile.tempFilePath })
      //   },
      // })
      // 超出压缩限制则不进行压缩直接提示
      if (tempFile.size > MAX_SIZE_LIMIT) {
        Taro.hideLoading()
        setTimeout(() => {
          Taro.showToast({
            icon: 'none',
            title: `文件大小限制为${toUnitSize(MAX_SIZE)},当前文件大小为${toUnitSize(tempFile.size)}`,
          })
        }, 100)
        return
      }

      // // 图片大小超过 2MB 时进行压缩
      // if (tempFile.size > MAX_SIZE) {
      //   tempFile = await compressCanvas.value!.compressImage(tempFile.tempFilePath, 1500)
      //   console.log('res2', tempFile)
      //   await showDialog({
      //     zIndex: 1000,
      //     title: '个人认证',
      //     message: tempFile.tempFilePath || '123321',
      //     parentClassName: 'personal-form-page-body',
      //     showCancelButton: true,
      //     confirmButtonText: '使用',
      //     cancelButtonText: '不使用',
      //   })
      // }

      if (tempFile.size > MAX_SIZE) {
        // 根据图片大小动态计算压缩质量：文件越大，压缩比越低
        // 2MB ~ 4MB → quality 80；4MB ~ 8MB → quality 60；8MB 以上 → quality 40
        let quality = 50
        if (tempFile.size > 1024 * 1024 * 8) {
          quality = 20
        } else if (tempFile.size > 1024 * 1024 * 4) {
          quality = 30
        }
        console.log(`图片大小 ${(tempFile.size / 1024 / 1024).toFixed(2)}MB，尝试以 quality=${quality} 压缩`)
        try {
          const compressRes = await Taro.compressImage({
            src: tempFile.tempFilePath,
            compressedWidth: 1800,
            quality,
          })
          // 获取压缩后文件信息
          const compressedFileInfo = await new Promise<{ path: string; size: number }>((resolve, reject) => {
            Taro.getFileInfo({
              filePath: compressRes.tempFilePath,
              success: (info: any) => resolve({ path: compressRes.tempFilePath, size: info.size }),
              fail: reject,
            })
          })
          console.log(`压缩后大小 ${(compressedFileInfo.size / 1024 / 1024).toFixed(2)}MB`)
          if (compressedFileInfo.size > MAX_SIZE) {
            Taro.hideLoading()
            setTimeout(() => {
              Taro.showToast({
                icon: 'none',
                title: `文件大小限制为${toUnitSize(MAX_SIZE)}.`,
              })
            }, 100)
            return
          }
          // 用压缩后的文件替换原始文件
          tempFile = { ...tempFile, tempFilePath: compressRes.tempFilePath, size: compressedFileInfo.size }
          // 同步更新 res.tempFiles 供 filterImage 使用
          res.tempFiles[0] = tempFile
        } catch (compressError) {
          console.log('压缩图片失败', compressError)
          Taro.hideLoading()
          setTimeout(() => {
            Taro.showToast({
              icon: 'none',
              title: `文件大小限制为${toUnitSize(MAX_SIZE)},压缩图片失败`,
            })
          }, 100)
          return
        }
      }

      const fileData = await handleFilePathToBase64(tempFile.tempFilePath)
      // await showDialog({
      //   zIndex: 1000,
      //   title: '个人认证',
      //   message: fileData?.base64,
      //   parentClassName: 'personal-form-page-body',
      //   showCancelButton: true,
      //   confirmButtonText: '使用Base64',
      //   cancelButtonText: '不使用',
      //   confirm: async () => {
      //     await Taro.setClipboardData({ data: fileData?.base64 })
      //   },
      // })
      console.log('base64', fileData)
      const resData = await afterRead({ content: fileData?.base64 })
      afterReadCallback(resData)
      Taro.hideLoading()
    }
  } catch (error) {
    console.log(error)
    Taro.hideLoading()
  }
}

const handelUploadFunc = () => {
  Taro.setStorageSync('tipOver', 1)
  useInitUpload(props)
  handelUpload(afterReadCallback)
  showPopover.value = false
}
</script>
<style lang="scss">
.upload-icon-content {
  height: 32px;
  .upload-icon {
    height: 32px;
    width: 32px;
  }
  .click-mark {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 999;
    background: transparent;
    height: 68px;
    width: 60px;
  }
  .tip-wrap {
    max-height: 90px;
    max-width: 316px;
    background: #000;
    opacity: 0.7;
    border-radius: 12px;
    font-size: 24px;
    font-weight: normal;
    line-height: 34px;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: -100px;
    right: -8px;
    padding: 12px 16px;
    box-sizing: border-box;
    z-index: 999;
    &.shot-tip {
      top: -65px;
    }

    &::after {
      content: '';
      bottom: -10px;
      right: 30px;
      position: absolute;
      width: 30px;
      height: 30px;
      background: #000;
      border-radius: 4px;
      transform: rotate(-45deg);
      z-index: -1;
    }
  }
}
</style>
