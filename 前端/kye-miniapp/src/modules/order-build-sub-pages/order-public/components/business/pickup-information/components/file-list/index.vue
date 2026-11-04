<template>
  <div class="upload-container upload-container-file-list">
    <UploadFile
      :bizId="bizId"
      :bizCode="bizCode"
      @afterRed="afterRed"
      @afterRedPC="afterRedPC"
      :maxCount="maxCount"
      :listLength="list.length"
      @onClickAddFile="onClickAddFile"
      @onClickAddImage="onClickAddImage"
      @onReadFileError="onReadFileError"
      v-if="!isUseNew"
    />
    <div :class="[styles['file-list'], isUseNew ? styles['new-file-list'] : '']">
      <FileItem
        v-for="file in list"
        :fileItem="file"
        :key="file.id"
        :type="type"
        @onDeleteFile="onDeleteFile"
        @preFile="previewFile"
      />
    </div>
    <UploadFile
      :bizId="bizId"
      :bizCode="bizCode"
      @afterRed="afterRed"
      @afterRedPC="afterRedPC"
      :maxCount="maxCount"
      :listLength="list.length"
      @onClickAddFile="onClickAddFile"
      @onClickAddImage="onClickAddImage"
      @onReadFileError="onReadFileError"
      v-if="isUseNew"
      :isUseNewUpload="isUseNew"
    />
  </div>
</template>

<script lang="ts" setup>
import FileItem from './../file-item/index.vue'
import UploadFile from './../upload-file/index.vue'
import { ref } from 'vue'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { fileListProps } from '@order-public-sub-public/components/business/pickup-information/components/file-list/types'
import { useRouter } from '@order-public-sub-public/vue-router/index'
// import { previewOtherFile } from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { FileError } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import { openPreviewFile, openPreviewImg } from '@order-public-sub-public/utils/upload'
import { openURL } from '@modules/webview/utils'
import styles from './index.module.scss'

const router = useRouter()
const { deleteFileFun } = useUpload()

const emit = defineEmits([
  'afterRed',
  'afterRedPC',
  'onDeleteFile',
  'onClickAddFile',
  'onClickAddImage',
  'onReadFileError',
])
const currentUrl = ref('')
const images = ref<string[]>([])

const props = withDefaults(defineProps<fileListProps>(), {
  bizId: 'ccccc',
  bizCode: '',
  list: () => [],
  maxCount: 15,
  type: 'pickupInformation',
  isUseNew: false,
})
//上传文件后
const afterRed = (file) => {
  const num = props.maxCount - props.list.length
  if (file?.length > num) {
    if (num > 0 && file.length) {
      emit('afterRed', file.slice(0, num))
    }
    return showToast(`最多可添加${props.maxCount}份文件`)
  }
  emit('afterRed', file)
}

//上传文件后
const afterRedPC = (file) => {
  if (file.length > props.maxCount) {
    emit('afterRedPC', file.slice(0, props.maxCount))
    return showToast(`最多可添加${props.maxCount}份文件`)
  }
  emit('afterRedPC', file)
}
//删除
const onDeleteFile = async (file: fileType) => {
  if (props.deleteValidate) {
    const pass = await props.deleteValidate(file)
    if (!pass) return
  }
  deleteFileFun(file, props.list)
  emit('onDeleteFile', file)
}

//预览pdf
const previewPdf = (file: fileType) => {
  const { url } = file
  if (!url) {
    return showToast('该文件上传后才可预览')
  }
  router.push({
    name: 'pdf',
    query: {
      url,
    },
  })
}
//预览文件
const previewFile = (file: fileType) => {
  console.log(file)
  const { type, url = '' } = file
  const urls = props.list.filter((item) => ['img', 'image'].includes(item.type)).map((x) => x.url)
  switch (type) {
    case 'image':
      // previewImage(file)
      openPreviewImg(urls, url, 'upload-container-file-list', true)
      break
    case 'img':
      openPreviewImg(urls, url, 'upload-container-file-list', true)
      break
    case 'pdf':
      openPreviewFile(url, type)
      break
    default:
      openPreviewFile(url, type)
  }
}

const onClickAddFile = () => {
  emit('onClickAddFile')
}

const onClickAddImage = () => {
  emit('onClickAddImage')
}

const onReadFileError = (params: FileError) => {
  emit('onReadFileError', params)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
</style>
