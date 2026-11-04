<template>
  <div :class="[styles['pickup-information-file-item'], 'flex', 'space-between']">
    <div :class="[styles['field_container']]" @click="preFile(fileItem)">
      <div :class="[styles['thumbnail_img']]" @touchstart="preFile(fileItem)">
        <image
          :class="[styles['card_container_thumbnail_img']]"
          width="100%"
          height="100%"
          fit="cover"
          :src="getIcon()"
        />
      </div>
      <div :class="[styles['message']]">
        <div class="file_top">
          <div :class="[styles['file-name']]">
            {{ isAmapMiniApp || isAliMiniApp ? fileItem?.fileName?.replace('.JPEG', '') : fileItem.fileName }}
          </div>
        </div>
        <div :class="[styles['message_bottom']]">
          <div :class="[styles['update_time']]">{{ fileItem.updateTime }}</div>
          <div class="file_size">{{ formatFileSize(fileItem.size) }}</div>
        </div>
      </div>
    </div>
    <div :class="[styles['right'], 'flex', 'flex-items-center']">
      <div :class="[styles['status']]">
        <div :class="[styles['fail']]" v-if="fileItem.status === STATUS.FAIL">上传失败</div>
        <div class="loading" v-if="fileItem.status === STATUS.UPLOADING">
          <ky-loading>上传中</ky-loading>
        </div>
        <div class="loading" v-if="fileItem.status === STATUS.DELETING">
          <ky-loading>删除中</ky-loading>
        </div>
      </div>
      <div :class="[styles['delete-icon'], 'file-delete-icon']" v-if="fileItem.status !== STATUS.UPLOADING">
        <SvgIcon name="delete" @click="onDeleteFile(fileItem)" v-if="fileItem.status !== STATUS.DELETING"></SvgIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { STATUS, THUMBNAIL_ICONS } from '@order-public-sub-public/constants'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { fileItemProps } from '@order-public-sub-public/components/business/pickup-information/components/file-item/types'
import { formatFileSize } from '@order-public-sub-public/utils/upload'
import { isAmapMiniApp, isAliMiniApp } from '@public/utils'
import styles from './index.module.scss'

const emit = defineEmits(['onDeleteFile', 'preFile'])

const props = defineProps<fileItemProps>()

//获取文件的默认icon
const getIcon = () => {
  const { type = '', url } = props.fileItem
  if (['image', 'img'].includes(type)) {
    return url
  }
  return THUMBNAIL_ICONS[type] || THUMBNAIL_ICONS.default
}
//删除文件
const onDeleteFile = (file: fileType) => {
  emit('onDeleteFile', file)
}
//文件预览
const preFile = (file: fileType) => {
  emit('preFile', file)
}
</script>

<style lang="scss"></style>
