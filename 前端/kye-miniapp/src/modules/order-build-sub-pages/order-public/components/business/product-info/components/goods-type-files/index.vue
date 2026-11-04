<template>
  <view id="order-page" class="goods-type-files-box dialog_root_goods_type" @scroll="handleScroll" :scroll-y="true">
    <div class="content">
      <div class="top-title">上传托寄物资料</div>
      <div class="tip">
        {{ tips }}
      </div>
      <div class="upload-content has-border">
        <div class="uploadtip">支持jpg、jpeg、png格式，文件大小不可超过10M</div>
        <FileList
          v-if="isShowMoveReport"
          title="电池运输检测单"
          :file-types="fileTypesImage"
          v-model:list="fileListMap.moveReportList"
          :isOnlyImage="true"
          :biz-code="bizCodeMap.moveReport"
          dataValidate="goodsTypeFiles.moveReportList"
          @previewFile="previewFile"
          @afterRed="fileAfterRed"
          @deleteFile="deleteFile"
        >
          <template #rightSlot>
            <span class="template-down" @click="toDownLoadTemplate">
              <SvgIcon
                name=""
                imgUrl="https://ic-img.ky-express.com/netc/20251127_90049_!!1764251502917_22_22.svg+xml"
              ></SvgIcon>
              <span>下载模板</span>
            </span>
          </template>
        </FileList>
        <FileList
          title="检测报告"
          :file-types="fileTypesImage"
          v-model:list="fileListMap.testReportList"
          :isOnlyImage="true"
          :biz-code="bizCodeMap.testReport"
          dataValidate="goodsTypeFiles.testReportList"
          @previewFile="previewFile"
          @afterRed="fileAfterRed"
          @deleteFile="deleteFile"
        />
      </div>
      <div class="upload-content no-bottom">
        <FileList
          title="货物照片"
          :file-types="fileTypesImage"
          :isOnlyImage="true"
          v-model:list="fileListMap.shopImageList"
          :biz-code="bizCodeMap.shopImage"
          dataValidate="goodsTypeFiles.shopImageList"
          @previewFile="previewFile"
          @afterRed="fileAfterRed"
          @deleteFile="deleteFile"
        />
        <FileList
          title="电池内包装"
          :file-types="fileTypesImage"
          :isOnlyImage="true"
          v-model:list="fileListMap.inPackImageList"
          :biz-code="bizCodeMap.inPackImage"
          dataValidate="goodsTypeFiles.inPackImageList"
          @previewFile="previewFile"
          @afterRed="fileAfterRed"
          @deleteFile="deleteFile"
        />
        <FileList
          title="电池外包装"
          :isNoBottom="true"
          :file-types="fileTypesImage"
          :isOnlyImage="true"
          v-model:list="fileListMap.outPackImageList"
          :biz-code="bizCodeMap.outPackImage"
          dataValidate="goodsTypeFiles.outPackImageList"
          @previewFile="previewFile"
          @afterRed="fileAfterRed"
          @deleteFile="deleteFile"
        />
      </div>
    </div>
    <div class="bottom-box" id="order-footer-id">
      <div class="submit-btn" @click="toSubmit">提交</div>
    </div>
    <PageCommon pageValidateName="goodsTypeFiles"></PageCommon>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getFileByMultiBizCodeAndBizId } from '@order-public-sub-public/apis'
import { bizCodeMap } from './const'
import { IfileListMap, IsHitReviewEnum } from './type'
import { getBatchId } from '@order-public-sub-public/configs'
import { STATUS, YesOrNoString } from '@order-public-sub-public/constants'
import useEffect from '@order-public-sub-public/validate'
import { localCheckResult } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
import { makeFileItem } from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import {
  uploadGoodsTypeResolve,
  uploadGoodsTypeReject,
  pureBatteryFileUploadConfirm,
} from '@public/hooks/usePureBattery'
import { disableAlertUnload, enableAlertUnload } from './hooks'
import { sleep } from '@order-public-sub-public/utils/sleep'
import FileList from './components/fileList/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useRouter } from '@order-public-sub-public/vue-router/index'
// import { downLoadFileUtils } from '@order-public-sub-public/utils/downLoadFile'
import { clickGoodsTypeUploadReport, clickSubmitUpload, showGoodsTypeUploadPageReport } from './report'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import { useGoodsTypeUploadPageScroll } from './useScroll'
import Taro from '@tarojs/taro'
import { downLoadFile } from '@order-public-sub-public/utils/downLoadFile'
import { isH5FSEnv } from '@/public/utils'

const { handleScroll } = useGoodsTypeUploadPageScroll()

const route = useRoute()
const piniaStore = useStore()
const router = useRouter()

const { effectBubble } = useEffect()

const fileTypesImage = ['jpg', 'jpeg', 'png']
// const fileTypes = ['xls', 'xlsx', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png']

const previewFileFlag = ref(false) //判断预览文件
const hasChangeed = ref(false)

const downloadLink =
  'https://api.ky-express.com/router/download/excel_import_template/157133778141505911/5j82ba187b631a4b4197c2b069eda00dc0?params=f2796d480e9b56c6a2c491a03c8222b5a7575ec05b1d585673873ac8a9a5f936'

// 返回上一个页面的时候是否需要弹窗
const isNeedDialog = ref(true)

const fileListMap = ref<IfileListMap>({
  moveReportList: [],
  testReportList: [],
  shopImageList: [],
  inPackImageList: [],
  outPackImageList: [],
})

// 判断是否旧电池
const isShowMoveReport = computed(() => {
  console.log(route.query.goodsTypeApprovalStatus, 'route.query.goodsTypeApprovalStatus')
  return route.query.goodsTypeApprovalStatus === IsHitReviewEnum.未命中
})

//获取store的运单号
const waybillNumber = computed(() => {
  return piniaStore.order.waybillNumber || getBatchId()
})

const tips = computed(() => {
  return !isShowMoveReport.value
    ? '含电池托寄物需提交【检测报告、货物照片、电池内包装、电池外包装】四份资料，若资料与托寄物不一致，我司拒收且产生空跑费由贵司自行承担。'
    : '含电池托寄物需提交【检测报告、电池运输检测单、货物照片、电池内包装、电池外包装】五份资料，若维护的资料和下单的托寄物不一致，产生空跑费由贵司自行承担。'
})

const getFileList = async () => {
  let listParams = Object.keys(bizCodeMap).map((key: string) => {
    return {
      bizCode: bizCodeMap[key],
      bizId: waybillNumber.value,
    }
  })
  const { data } = await getFileByMultiBizCodeAndBizId({
    list: listParams,
  })
  console.log(data, 'datadatadatadata')
  data?.forEach((file) => {
    file = {
      ...file,
      ...makeFileItem(file),
      status: STATUS.SUCCESS,
    }
    switch (file.bizCode) {
      case bizCodeMap.testReport:
        fileListMap.value.testReportList.push(file)
        break
      case bizCodeMap.moveReport:
        fileListMap.value.moveReportList.push(file)
        break
      case bizCodeMap.shopImage:
        fileListMap.value.shopImageList.push(file)
        break
      case bizCodeMap.inPackImage:
        fileListMap.value.inPackImageList.push(file)
        break
      case bizCodeMap.outPackImage:
        fileListMap.value.outPackImageList.push(file)
        break
    }
  })
  console.log(fileListMap.value, 'fileListMap.value', data)
}

const toDownLoadTemplate = () => {
  if (isH5FSEnv) {
    location.href = downloadLink
  } else {
    downLoadFile(downloadLink, 'docx', '电池运输前检测单.docx')
  }

  clickGoodsTypeUploadReport('下载模板')
}
const toSubmit = async () => {
  // 是否有未上传的文件
  let isHasUploadingStatus = false
  // 上传失败的文件
  clickSubmitUpload()
  const result: localCheckResult[] = []
  Object.keys(fileListMap.value).forEach((key) => {
    // 如果没有电池运输检测单 不需要判断
    if (!isShowMoveReport.value && key === 'moveReportList') {
      return
    }
    // 判断是否有正在上传中的文件
    if (fileListMap.value[key]?.some((v: IfileListMap) => v.status === STATUS.UPLOADING)) {
      isHasUploadingStatus = true
    }

    // 过滤出上传失败的文件 如果长度为0
    const filterList = fileListMap.value[key]?.filter((v: IfileListMap) => v.status === STATUS.SUCCESS)
    // 如果长度为0
    if (!filterList.length) {
      result.push({
        key: `goodsTypeFiles.${key}`,
        passed: false,
        // content: ['moveReportList', 'testReportList'].includes(key) ? '请上传文件/照片' : '请上传照片',
        content: '请上传照片',
        bubbleConfig: { placement: 'top-start', offset: [0, 8] },
      })
    }
  })
  // 如果有没有上传的文件
  if (result.length) {
    try {
      await effectBubble(result)
    } catch (error) {
      console.log(error, 'kkkkkkkkkkkk', error.key.replace('.', '_'))
      Taro.pageScrollTo({
        selector: `#${error.key.replace('.', '_')}`,
        duration: 200,
        offsetTop: -80,
      })
    }
    return
  }

  // 如果有文件正在上传中需要提示
  if (isHasUploadingStatus) {
    showToast('文件正在上传中，请稍后提交...')
    return
  }

  // 不需要弹窗
  isNeedDialog.value = false
  pureBatteryFileUploadConfirm.value = YesOrNoString.YES
  showToast('保存成功')
  disableAlertUnload()
  await sleep(1000)
  // 返回到下单页面
  uploadGoodsTypeResolve.value(true)
  router.back()
}

onMounted(() => {
  getFileList()
  showGoodsTypeUploadPageReport()
})

// 如果每个类型的文件都没有上传文件
const isHasFile = computed(() => {
  return Object.keys(fileListMap.value).every((key) => fileListMap.value[key].length === 0)
})

const fileAfterRed = () => {
  beforeLeaveCheck()
}

const deleteFile = () => {
  beforeLeaveCheck()
}

const beforeLeaveCheck = () => {
  if (previewFileFlag.value) {
    // pdf预览需要要拦截提示语
    previewFileFlag.value = false
    return
  }
  const needDialog = !isHasFile.value && isNeedDialog.value
  console.log(needDialog, hasChangeed.value, 'hasChangeed')
  if (needDialog) {
    // 如果需要注册弹框，只需注册一次
    if (hasChangeed.value) {
      return
    }
    hasChangeed.value = true
    enableAlertUnload()
  } else {
    disableAlertUnload()
    hasChangeed.value = false
  }
}

onUnmounted(() => {
  console.log('kkkkkkkkkasdf')
  disableAlertUnload()
  previewFileFlag.value = false
  // if (pureBatteryFileUploadConfirm.value === YesOrNoString.NO) {
  uploadGoodsTypeReject.value(false)
  // }
})

const previewFile = () => {
  previewFileFlag.value = true
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
