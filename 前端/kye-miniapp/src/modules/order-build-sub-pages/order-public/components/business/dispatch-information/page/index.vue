<template>
  <template v-if="initSuccess">
    <div
      :class="[styles['dispatch-container-page'], 'dispatch-container-page-org', 'dialog_root_dispatch']"
      @click="closeTippyGloabl"
    >
      <view :class="[styles['dispatchTip']]">
        <SvgIcon :class="[styles['dispatch-icon']]" name="icon-tips" />
        <view>
          {{ resTopTips }}
          <text
            v-if="showAttachmentObj?.existsReminderAttachments"
            :class="[styles['attachments-tip']]"
            @tap="goAttachments"
          >
            查看收方要求 ></text
          >
        </view>
      </view>
      <div :class="[styles['dispatch-container']]">
        <KyReport eventCode="exp_express_dispatch_info_v1"></KyReport>
        <div class="ocr-container">
          <KyReport eventCode="exp_express_dispatch_intellect_v1"></KyReport>
          <!-- <div v-if="!expandOcr" class="container__ocr" @click.stop="expandOcr = true">
            <div class="container__ocr__text">支持智能填写，自动识别信息</div>
            <PasteAndRecognize :ocrMessage="ocrMessage" @onPasteAndRecognize="onPasteAndRecognize" />
          </div> -->
          <Ocr
            :maxlength="500"
            :loading="ocrLoading"
            :rows="3"
            ref="refOcr"
            :showImageOcr="false"
            :showOcrPlaceholderButton="false"
            @onInputOcr="onInputOcr"
            @onClickIdentify="clickIdentify"
            v-model:ocrMessage="ocrMessage"
            placeholder="仓库名称：跨越速运仓库
预约单号：32099998888
采购单号：32199998888"
          />
        </div>
        <DispatchForm
          :formConfigList="formConfigList"
          :formData="formData"
          @onInput="onInput"
          @clearForm="clearForm"
          @onFieldClick="onFieldClick"
          @onFieldBlur="onFieldBlur"
          :warehouseType="warehouseType"
          :appointDateNotification="appointDateNotification"
          :choosableTimes="choosableTimes"
          :exactTimeEarliestStartTime="exactTimeEarliestStartTime"
          @onAppointDateChange="onAppointDateChange"
          @onReloadChoosableTimes="(done) => onReloadChoosableTimes(done)"
        />
        <CardBlock
          :tip="cardTip"
          title="派货资料"
          v-if="showItem.deliveryData"
          data-validate="dispatchInformation.deliveryData"
          id="dispatchInformation_deliveryData"
          exposure-report-id="exp_express_dispatch_file_v1"
        >
          <FileList
            :bizId="bizId"
            :bizCode="bizCode"
            @afterRed="afterRed"
            @afterRedPC="afterRedPC"
            @onDeleteFile="onDeleteFile"
            :list="list"
            :maxCount="maxCount"
            :type="'dispatchInformation'"
            @onClickAddFile="onClickAddFile"
            @onClickAddImage="onClickAddImage"
            @onReadFileError="onReadFileError"
            @previewFile="previewFile"
            type="dispatchInformation"
          />
        </CardBlock>
      </div>
      <div :class="[styles['footer']]" id="isElementShow">
        <KyButton text="提交" :loading="loading" @click="submit" :disabled="ocrLoading" :loading-text="loadingText" />
      </div>
      <PageCommon pageValidateName="dispatchInformation" />
    </div>
  </template>
  <template v-else>
    <Skeleton />
  </template>
</template>

<script lang="ts" setup>
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'

import { $native, getH5OrderUrl } from '@order-public-sub-public/utils'
// import NoticeBar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import FileList from '@order-public-sub-public/components/business/pickup-information/components/file-list/index.vue'
import DispatchForm from '../components/dispatch-form/index.vue'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import CardBlock from '@order-public-sub-public/components/ui/card-block/index.vue'
import Ocr from '@order-global-package-order-sub/components/ui/ocr/index.vue'
import PasteAndRecognize from '@order-global-package-order-sub/components/ui/ocr/components/paste-and-recognize/index.vue'
import { getFileByMultiBizCodeAndBizId, getPickupMaterialConfig, pickupOcr } from '@order-public-sub-public/apis'
import { cloneDeep, isEqual, sortBy } from 'lodash-es'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { computed, nextTick, onMounted, reactive, ref, onUnmounted } from 'vue'
import { DispatchInformation, DispatchInformationConfig, AddedService } from '@order-public-sub-public/types'
import { ModuleType, STATUS, MaterialTypes, Channel, MaterialSource, WEEK_DAYS } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import { filterAllSpace, pollingCheckStatus } from '@order-public-sub-public/utils/index'
import dayjs from 'dayjs'
import { IChoosableTimesItem } from '@order-public-sub-public/apis/waybill/types'
import { queryDispatchTimeRange } from '@order-public-sub-public/apis/waybill/index'
import {
  makeFileItem,
  getFileType,
  formatDate,
} from '@order-public-sub-public/components/business/pickup-information/components/upload-file/utils'
import { fileType, pickupConfig } from '@order-public-sub-public/apis/pickup/type'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { useRouter, onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import useEffect from '@order-public-sub-public/validate'
import useUpload from '@order-public-sub-public/components/business/pickup-information/hooks/upload'
import useValidate from '@order-public-sub-public/components/business/dispatch-information/hooks/useValidate'
import { useValidate as useGlobalValidate } from '@order-public-sub-public/hooks/useValidate'
import {
  FileError,
  dispatchFormConfig,
  dispatchFormVal,
} from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { valueFormatterAll } from '@order-public-sub-public/components/business/dispatch-information/utils'
import { getChannel } from '@order-public-sub-public/configs'
import { isWxMiniApp } from '@/public/utils'
import { useUnload, useDidShow } from '@tarojs/taro'

import {
  reportDispatchSubmit,
  reportAddFile,
  reportAddImage,
  reportClickOcr,
  reportDispatchFormField,
  reportClickDeleteFile,
  reportReadFileFail,
  reportLeavePage,
  reportLeaveDialog,
  reportClickLeaveDialog,
  exp_express_dispatch_topbanner_v1,
  exp_express_dispatch_upflash_v1,
  exp_express_dispatch_topbanner_view_v1,
} from '@order-public-sub-public/components/business/dispatch-information/report'
import { formConfigList, initSuccess } from '../hooks/state'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { disableAlertUnload, enableAlertUnload, onChangeSingleFile } from '@order-public-sub-public/utils/upload'
import PageCommon from '@order-public-sub-public/components/ui/page-common/index.vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isH5FSEnv } from '@/public/utils'

import { getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { openURL } from '@/modules/webview/utils'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import styles from './index.module.scss'
const piniaStore = useStore()
const { startConfig, removeLast, submitConfig, getData } = useInitMulitFielConfigChild()
const { remoteCheck, effectBubble } = useEffect()
const { validateCollection } = useValidate()
const { validateObj, removeValidateKey, removeValidateKeyByType, closeTippyGloabl } = useGlobalValidate()
const { deleteFileFunAsync } = useUpload()

const router = useRouter()
// const formConfigList = ref<pickupConfig[]>([])
const topTips = ref('')
const showAttachmentObj = ref({})
const ocrMessage = ref('')
const list = ref<fileType[]>([])
const listHash = ref<fileType[]>([])
const waybillNumber = computed(() => piniaStore.order.waybillNumber)
const maxCount = ref(30)
const loading = ref(false)
const loadingFile = ref(false)

const expandOcr = ref(true)
const ocrLoading = ref(false)
const hasDialogTip = ref(false) //已经提醒过文件未上传弹框

const hasChangeed = ref(false)
const previewFileFlag = ref(false) //判断预览文件
const cardTip = computed(() => {
  const fileLength = list.value?.length || 0
  return `${fileLength}/${maxCount.value}（每个文件最大10M）`
})

const resTopTips = computed(() => {
  return topTips.value || '上传货物图片、发票清单等资料，方便司机快速派货'
})

const formData: DispatchInformation = reactive({
  appointNumber: '',
  purchaseNumber: '',
  appointWareHouse: '',
  appointmentNo: '',
  warehouseName: '',
  appointDate: '',
})

// 预约时间通知数据
const appointDateNotification = ref<{
  timeType?: number
  customFlag?: boolean
  startTime?: string
  endTime?: string
} | null>(null)

// 预约时间可选时段数据（由 getConfig 中获取）
const choosableTimes = ref<IChoosableTimesItem[]>([])
const exactTimeEarliestStartTime = ref('')

// 格式化预约时间展示文本
const formatAppointDateDisplay = (n: {
  timeType?: number
  customFlag?: boolean
  startTime?: string
  endTime?: string
}): string => {
  if (!n?.timeType) return ''
  if (n.timeType === 20) {
    if (!n.startTime || !n.endTime) return ''
    const start = dayjs(n.startTime)
    const end = dayjs(n.endTime)
    return `${start.format('MM/DD')} ${WEEK_DAYS[start.day()]} ${start.format('HH:mm')}-${end.format('HH:mm')}`
  } else if (n.timeType === 10) {
    if (!n.endTime) return ''
    const t = dayjs(n.endTime)
    return `${t.format('MM/DD')} ${WEEK_DAYS[t.day()]} ${t.format('HH:mm')}`
  }
  return ''
}

//各组件的显示隐藏
const showItem = reactive<dispatchFormConfig>({
  deliveryData: true, //派货资料
})

const warehouseType = computed(() => {
  const dimension = piniaStore.schema.moduleDimensionData(ModuleType['派货资料'])
  console.log(dimension)
  return (dimension as any)?.warehouseType || ''
})

const lastGoodsControl = ref('')
const setLastGoodsControl = () => {
  const goodsControl = piniaStore.order.moduleFormData(ModuleType['增值服务'])?.goodsControl || ''
  lastGoodsControl.value = goodsControl || ''
  console.log(lastGoodsControl.value, 'lastGoodsControllastGoodsControl')
}

onMounted(() => {
  initData()
  getConfig()
  getHistoryFile()
  setLastGoodsControl()
})

//未上传的文件
const hasWaitFile = computed(() => {
  return list.value?.find((file) => file.status && [STATUS.WAIT, STATUS.UPLOADING, STATUS.FAIL].includes(file.status))
})

// 按钮文案
const loadingText = computed(() => {
  return loadingFile.value && list.value.length ? '上传中' : '提交'
})

const isFormSame = () => {
  const orderFormData = piniaStore.order.moduleFormData(ModuleType['派货资料']) || {}
  const oldAppointDate = formatAppointDateDisplay(notificationInfo.value)

  const isSame =
    (orderFormData.appointNumber || '') === (formData.appointNumber || '') &&
    (orderFormData.purchaseNumber || '') === (formData.purchaseNumber || '') &&
    (orderFormData.appointWareHouse || '') === (formData.appointWareHouse || '') &&
    (oldAppointDate || orderFormData.appointDate || '') === (formData.appointDate || '')
  return isSame
}

useUnload(() => {
  beforeLeaveChange()
})

useDidShow(() => {
  umpOtherReport('EXP', {
    eventCode: 'page_express_single_delivery_v1',
  })
})

const goAttachments = async () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_dispatch_topbanner_view_v1',
  })
  const h5OrderUrl = await getH5OrderUrl()
  const baseUrl = h5OrderUrl ? `${h5OrderUrl}#` : getOnlineH5Url()
  const logConfigId = showAttachmentObj.value?.logConfigId
  const url = `${baseUrl}/dispatch-receiver-intro?logConfigId=${logConfigId}`
  openURL(url, { needLogin: true })
}

//路由钩子，离开页面,判断文件未上传，弹框提示
const beforeLeaveChange = () => {
  const needDialog = checkNeedDialog()
  reportLeavePage()
  if (needDialog) {
    reportClickLeaveDialog('confirm')
  } else {
    remoteCheck('dispatchInformation', {
      addedService: {
        ...addedServiceData.value,
      },
    }).catch((e) => {
      console.warn(e)
    })
  }
}
//智能识别输入
const onInputOcr = (value: string) => {
  ocrMessage.value = value
}

//文件未上传的流程逻辑
const saveDialogHandle = async () => {
  try {
    await showNeedSaveDialog()
    reportClickLeaveDialog('confirm')
  } catch (e) {
    reportClickLeaveDialog('cancel')
    router.back()
  } finally {
    hasDialogTip.value = true
  }
}

//未上传文件的弹框提醒
const showNeedSaveDialog = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await showKyDialog({
          zIndex: 1000,
          title: '温馨提示',
          message: '您是否要保存当前数据？',
          cancelButtonText: '否',
          showCancelButton: true,
          confirmButtonText: '是',
        })
        await submit()
        resolve(true)
      } catch (e) {
        reject(e)
      }
    }, 100)
  })
}

const uploadFiles = async () => {
  const promiseAll: Promise<any>[] = []
  await setBizIdAndCode()
  list.value.forEach((item) => {
    if (item.status !== STATUS['WAIT'] && item.status !== STATUS['FAIL']) return
    item.status = STATUS['UPLOADING']
    const file = {
      path: item.path,
      name: item.name,
    }
    if (isH5FSEnv) {
      file.type = item.type
      file.file = item.file
    }
    const formData = {
      bizId: bizId.value,
      bizCode: bizCode.value,
    }
    promiseAll.push(
      (async (item) => {
        let res = null
        try {
          const r = (await onChangeSingleFile(file, formData)) as any
          const firstUrl = r?.url
          const id = r?.id
          if (firstUrl) {
            item.status = STATUS['SUCCESS']
            item.url = firstUrl
            item.id = id
            item.fileName = r.name || r.originalName
            item.size = r.size
          } else {
            item.status = STATUS['FAIL']
            exp_express_dispatch_upflash_v1(item)
            res = 'uploadFail'
          }
        } catch (error) {
          item.status = STATUS['FAIL']
          exp_express_dispatch_upflash_v1(item)
          res = 'uploadFail'
        }
        return res
      })(item),
    )
  })
  return Promise.all(promiseAll)
}

//获取历史文件
const getHistoryFile = async () => {
  try {
    const channel = getChannel()
    await startConfig(
      tmpCacheKey.value || waybillNumber.value,
      channel === Channel.修改运单 ? MaterialSource.修改运单 : undefined,
      true,
    )
    await setBizIdAndCode()
    let listParams = [
      {
        bizId: bizId.value,
        bizCode: bizCode.value,
      },
    ]
    const { data } = await getFileByMultiBizCodeAndBizId({
      list: listParams,
    })
    let fileList = data
    if (!Array.isArray(fileList)) {
      return
    }
    fileList = fileList.map((i) => makeFileItem(i))
    list.value = fileList
    listHash.value = cloneDeep(fileList)
  } catch (e) {
    console.warn(e)
  }
}
//提交
const submit = async () => {
  loading.value = true
  try {
    await validate()
    await uploadFiles()
    const delList = listHash.value.filter((v) => {
      return !list.value.find((m) => m.id === v.id)
    })
    await deleteFileFunAsync(delList)
    try {
      loadingFile.value = true
      await pollingCheckStatus(1, list.value)
      loadingFile.value = false
    } catch (error) {
      loadingFile.value = false
      loading.value = false
      return
    }
    await submitConfig()
    updateFormData()
    reportDispatchSubmit(
      {
        formData: formData,
        fileList: list.value,
      },
      true,
    )
    showSuccessMessage()
    disableAlertUnload()
    setTimeout(() => {
      loading.value = false
      router.back()
    }, 300)
  } catch (e) {
    console.warn('submit', e)
    loading.value = false
    reportDispatchSubmit(
      {
        formData: formData,
        fileList: list.value,
      },
      true,
      e,
    )
  }
}
//显示不同的成功提示语
const showSuccessMessage = () => {
  let msg = '保存成功'
  const fileNum = list.value?.length
  const hasValue = Object.values(formData).find((i) => i)
  if (fileNum > 0) {
    msg = hasValue ? '文件与信息保存成功' : `已成功上传${fileNum}份文件`
  }
  showToast(msg)
}
//触发校验，只走本地校验
const validate = async () => {
  const formDataParam = {
    deliveryData: list.value.length,
  }
  //校验结果
  let resultList: any[] = []

  // warehouseType = '40' 时校验采购单号
  if (warehouseType.value === '40' && formData.purchaseNumber) {
    let purchaseError = ''
    const val = formData.purchaseNumber
    const parts = val.split(',').filter(Boolean)
    if (parts.length === 1) {
      if (parts[0].length > 50) {
        purchaseError = '京东采购单号限制50个字'
      }
    } else {
      const overLimit = parts.some((p) => p.length > 50)
      if (overLimit) {
        purchaseError = '京东采购单号字数超过上限，逗号之间仅支持50个字'
      }
    }
    if (purchaseError) {
      validateObj['dispatchInformation.purchaseNumber'] = { content: purchaseError }
      resultList.push({
        key: 'dispatchInformation.purchaseNumber',
        passed: false,
        content: purchaseError,
        blockedFlag: true,
      })
    }
    // 校验通过时清除错误
    if (!purchaseError && formData.purchaseNumber) {
      removeValidateKey('dispatchInformation.purchaseNumber')
    }
  }

  const tempList = await validateCollection(formDataParam)
  resultList = resultList.concat(tempList)
  console.log(resultList, 'resultListresultList')

  const failPass = resultList.find((i) => !i.passed)
  if (failPass) {
    await effectBubble(resultList)
  }
}

//更新表单数据
const updateFormData = () => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['派货资料'],
    data: {
      ...formData,
      uploadNum: list.value.length,
    },
  })

  // 如果appointDateNotification有值才会去设置
  const { timeType, startTime, endTime } = appointDateNotification.value || {}
  if (appointDateNotification.value && timeType && (startTime || endTime)) {
    // 同步更新增值服务store中的预约时间数据
    piniaStore.order.updateOrderByType({
      type: ModuleType['增值服务'],
      data: {
        ...addedServiceData.value,
        goodsControl: '50',
        notification: { notification: appointDateNotification.value },
      },
    })
  } else {
    const data = {
      ...addedServiceData.value,
      notification: {
        notification: {
          timeType: '',
          startTime: '',
          endTime: '',
        },
      },
    }
    if (lastGoodsControl.value === '50') {
      data.goodsControl = ''
    }

    piniaStore.order.updateOrderByType({
      type: ModuleType['增值服务'],
      data,
    })
  }

  listHash.value = cloneDeep(list.value)
}

//删除文件
const onDeleteFile = async (file: fileType) => {
  reportClickDeleteFile(file)
  setTimeout(async () => {
    try {
      deleteFileFunAsync([file])
      beforeLeaveCheck()
    } catch (e) {
      console.warn('onDeleteFile:', e)
    }
  }, 100)
}
//上传文件后的钩子
const afterRed = (file: fileType[]) => {
  file = file.map((item) => makeFileItem(item))
  list.value = file.concat(list.value)

  uploadFiles()
  beforeLeaveCheck()
}

const afterRedPC = (_list) => {
  list.value = _list?.map((item) => {
    const firstUrl = item?.visit
    if (firstUrl) {
      item.status = STATUS['SUCCESS']
      item.url = firstUrl
      item.id = item.id
      item.fileName = item.name || item.originalName
      item.size = item.size
      item.updateTime = formatDate(item.updationDate)
      if (item.type) {
        // 使用文件中心返回的类型
        item.type = getFileType(item)
      }
    } else {
      item.status = STATUS['FAIL']
      exp_express_dispatch_upflash_v1(item)
    }
    return item
  })
  enableAlertUnload()
}
/**
 * 智能解析派货资料
 */
const clickIdentify = async () => {
  let message = '没有识别到有效信息'
  try {
    if (!ocrMessage.value) {
      return showToast('请粘贴或输入文本')
    }
    ocrLoading.value = true
    const { data = [] } = await pickupOcr({
      text: ocrMessage.value,
    })
    data.forEach((item) => {
      const configItem = formConfigList.value.findIndex((i) => {
        return i?.fieldName === item.type && !(i?.disableFlag === '1')
      })
      if (configItem > -1) {
        const value = valueFormatterAll(filterAllSpace(item.value), item.type)
        if (value) {
          formData[item.type] = value
          message = '识别成功，请核对信息'
        }
      }
    })
    // OCR识别到采购单号后，清除采购单号的校验错误和飘红
    if (formData.purchaseNumber) {
      removeValidateKey('dispatchInformation.purchaseNumber')
    }
    showToast(message)
    reportClickOcr(formData, { request_status: 'success', request_result: '' })
  } catch (e) {
    console.error(e)
    reportClickOcr(formData, { request_status: 'failure', request_result: (e as Error).message })
  } finally {
    ocrLoading.value = false
  }
}

const addedServiceData = computed(() => piniaStore.order.moduleFormData(ModuleType['增值服务']) || {})

const isAppointTime = computed(() => addedServiceData.value.goodsControl === '50')

const notificationInfo = computed(() => {
  return (
    (addedServiceData.value as { notification?: { notification?: typeof appointDateNotification.value } })?.notification
      ?.notification ?? {}
  )
})

/**
 * 获取初始化数据
 */
const initData = () => {
  const data = piniaStore.order.moduleFormData(ModuleType['派货资料']) || {}
  console.log(data, 'datadatadatadata')
  for (let dataKey in data) {
    if (Object.prototype.hasOwnProperty?.call(formData, dataKey) && dataKey in formData) {
      formData[dataKey as keyof typeof formData] = data[dataKey as keyof typeof formData] || ''
    }
  }

  if (isAppointTime.value) {
    // 如果展示了预约时间，从增值服务store获取预约时间数据并回显
    if (notificationInfo.value && notificationInfo.value.timeType) {
      appointDateNotification.value = notificationInfo.value
      formData.appointDate = formatAppointDateDisplay(notificationInfo.value)
    } else {
      appointDateNotification.value = null
      formData.appointDate = ''
    }
  } else {
    appointDateNotification.value = null
  }

  const config = piniaStore.schema.moduleConfigData(ModuleType['派货资料'])?.fieldsConfig

  nextTick(() => {
    umpOtherReport('OTHER', {
      eventCode: 'other_express_dispatch_perception_v1',
    })
  })

  if (!Array.isArray(config)) {
    return
  }
  config.forEach((i) => {
    showItem[i.name] = i.visible
  })
}

/**
 * 获取预约时间可选时段
 */
const fetchChoosableTimes = async () => {
  try {
    const waybillNumber = piniaStore.order.waybillNumber
    if (!waybillNumber) return
    console.log(queryDispatchTimeRange, 'queryDispatchTimeRange')
    const res = await queryDispatchTimeRange(waybillNumber)
    if (res.data?.choosableTimes?.length > 0) {
      choosableTimes.value = res.data.choosableTimes
      exactTimeEarliestStartTime.value = res?.data?.exactTimeEarliestStartTime || ''
    }
  } catch (e) {
    console.error('queryDispatchTimeRange error', e)
  }
}

const onReloadChoosableTimes = async (done: () => void) => {
  choosableTimes.value = []
  try {
    await fetchChoosableTimes()
  } catch (e) {
    console.error('fetchChoosableTimes error', e)
  } finally {
    done()
  }
}

/**
 * 获取表单配置
 */
const getConfig = async () => {
  try {
    const waybillId = piniaStore.order.waybillId || ''
    const serviceMode = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
    const receive = piniaStore.order.moduleFormData(ModuleType['收方信息']) || {}
    const overAreaDelivery = piniaStore.order.moduleFormData(ModuleType['超区派送']) || {}
    const branchSelfPickUp = piniaStore.order.moduleFormData(ModuleType['网点自提']) || {}
    let extPrams: any = {
      serviceMode,
      receive,
      overAreaDelivery,
      branchSelfPickUp,
    }
    const { data } = await getPickupMaterialConfig(undefined, waybillId as string, extPrams)
    const { appointConfig, existsReminderAttachments, logConfigId } = data
    let { orderTips = '' } = data
    formConfigList.value = appointConfig.optionConfigList || []
    if (orderTips?.length > 80) {
      orderTips = `${orderTips?.slice(0, 80)}...`
    }
    topTips.value = orderTips
    showAttachmentObj.value = {
      existsReminderAttachments,
      logConfigId,
    }

    // 如果有预约时间选项，拉取可选时段数据
    if (formConfigList.value.some((item) => item.fieldName === 'appointDate')) {
      fetchChoosableTimes()
    }
  } catch (e) {
    console.error(e)
  } finally {
    initSuccess.value = true
    setTimeout(() => {
      exp_express_dispatch_topbanner_v1(resTopTips.value)
      if (showAttachmentObj.value.existsReminderAttachments) {
        exp_express_dispatch_topbanner_view_v1()
      }
    }, 300)
  }
}

/**
 * 输入
 */
const onInput = (val: string, type: dispatchFormVal) => {
  formData[type] = val
  beforeLeaveCheck()
}

/**
 * 预约时间变更
 */
const onAppointDateChange = (
  notification: {
    timeType?: number
    customFlag?: boolean
    startTime?: string
    endTime?: string
  } | null,
) => {
  appointDateNotification.value = notification
}

/**
 * 清空表单
 */
const clearForm = () => {
  for (const key in formData) {
    formData[key as keyof typeof formData] = ''
  }
  appointDateNotification.value = null
  removeValidateKeyByType('dispatchInformation')
  beforeLeaveCheck()
}
const refOcr = ref<InstanceType<typeof Ocr> | null>()
const onPasteAndRecognize = () => {
  expandOcr.value = true
  nextTick(() => {
    refOcr.value?.onPasteAndRecognize()
  })
}

const onFieldClick = (params: { item: pickupConfig; value: string }) => {
  reportDispatchFormField('CLK', params)
}

const onFieldBlur = (params: { item: pickupConfig; value: string }) => {
  reportDispatchFormField('OTHER', params)
}

const onClickAddFile = () => {
  reportAddFile()
}

const onClickAddImage = () => {
  reportAddImage()
}

const onReadFileError = (params: FileError) => {
  reportReadFileFail(params)
}

onUnmounted(() => {
  removeLast()
  hasChangeed.value = false
  previewFileFlag.value = false
  disableAlertUnload()
})

/**
 * 检查是否需要弹框
 */
const checkNeedDialog = () => {
  const isSame = isFormSame()
  // 弹窗条件：（1.存在文件未上传 || 2.存在变更的表单数据 || 2.文件数据有差异 也需要弹框） && 首次弹
  const newOldEqual = !isEqual(sortBy(list.value), sortBy(listHash.value))
  const needDialog = (hasWaitFile.value || !isSame || newOldEqual) && !hasDialogTip.value
  return needDialog
}

const beforeLeaveCheck = () => {
  if (previewFileFlag.value) {
    // pdf预览需要要拦截提示语
    previewFileFlag.value = false
    return
  }

  const needDialog = checkNeedDialog()
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
const previewFile = () => {
  previewFileFlag.value = true
}

/**
 * 抽取获取bizid bizcode的逻辑
 * 因为要传入公共组件用于pc上传
 */
const bizId = ref('')
const bizCode = ref('')
const setBizIdAndCode = async () => {
  const { configData, getBizCode } = await getData()
  bizId.value = configData?.value?.bizId
  bizCode.value = getBizCode(MaterialTypes.派货资料)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
