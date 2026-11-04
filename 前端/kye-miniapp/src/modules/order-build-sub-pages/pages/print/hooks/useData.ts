import { $native, debounce, isAndroid, isJSON } from '@order-public-sub-public/utils'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import Taro from '@tarojs/taro'
import { computed, reactive, ref, watch } from 'vue'
import {
  // waybillStatusDisabled,
  changeCountPermission,
  childTemplateList,
  labelPermission,
  parentChildrenPermission,
  printSource,
  stubTemplateList,
  tagList,
  templateList,
  waybillLabelTemplateList,
} from './state'
import { useValidate } from './useValidate'

import {
  createMobileCloudPrint,
  createPrintTask,
  getAsyncPrintDataByPage,
  getBindingCloundPrintStatus,
  getCloundPrintStatus,
  getPrintPreviewList,
  getPrintSetting,
  getPrintTaskFinishResult,
  getRetryPrintTask,
  getSimpleWaybillInfo,
  setBindPrinter,
  updatePrintSetting,
  uploadPrintLog,
} from '@order-public-sub-public/apis/print'
import { createPrintTaskResultResponse } from '@order-public-sub-public/apis/print/types'
import { OrderPageType } from '@order-public-sub-public/constants'
import { commonSetPolling } from '@order-public-sub-public/hooks/usePolling'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
import { isAppBrowse, isIphone } from '@order-public-sub-public/utils/device'
import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import { HttpResponse } from '@order-public-sub-public/utils/types'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'

import {
  btnListType,
  CloundPrintStatusEnum,
  printerFormType,
  printerType,
  // ParentChildrenPermissionType,
  // labelPermissionType,
  // changeCountPermissionType,
  PrinterTypeEnum,
  VisibleAuth,
} from './type'
import { report_EXP_event } from '@public/utils/reportUtil'
import { getEnvConfig } from '@public/config'
const { systemType } = getEnvConfig()

const beforeFinishTaskId = ref('-1')
export const printTraceId = ref('')
export const printerForm: printerFormType = reactive({
  printer: {} as printerType,
  templateList: [{ type: '4', typeName: '随货联', typeNameDes: '(宽76mm*长130mm)' }] as btnListType[],
  count: 0,
  tagList: [] as btnListType[],
  mdList: [] as btnListType[],
  pageSize: '',
  markFont: '8',
  isMother: false,
  printerType: PrinterTypeEnum.蓝牙打印, // 打印机的类型 是蓝牙还是云打印 buleTooth:蓝牙 cloud:云打印机
  stubChildData: [],
})

export const isBatch = ref(false)
export const popupVisible = ref(false)
export const btnLoading = ref(false)
export const waybillNumberList = ref<string[]>([])
export const waybillNumberBatchList = ref<string[]>([])
export const transmitBluetooth = ref<boolean>(false)
export const transmitBluetoothProportion = ref<number>(0)

watch(
  () => printerForm.printer.name,
  (val) => {
    if (!val) {
      popupVisible.value = false
    }
  },
)
// 获取是否是全是子母单
export const getSimpleWaybillInfoFn = async () => {
  const route = useRoute()
  let waybillNumber: string[] = []
  if (waybillNumberBatchList.value.length) {
    waybillNumber = waybillNumberBatchList.value
  } else {
    waybillNumber = (route.query.waybillNumber as string)?.split(',')
  }
  waybillNumberList.value = waybillNumber
  const res = await getSimpleWaybillInfo({ waybillNumberList: waybillNumber }).catch((err) => {
    console.log('err', err)
  })
  if (res && res.data && res.data.length) {
    parentChildrenPermission.value = handleSimpleWaybillInfoAuth(res.data, 'parentChildrenPermission')
    changeCountPermission.value = handleSimpleWaybillInfoAuth(res.data, 'changeCountPermission')
    labelPermission.value = handleSimpleWaybillInfoAuth(res.data, 'labelPermissionNew')

    if (res.data.length === 1) {
      printerForm.count = res.data[0].totalCount
      // 批量修改非多个客户编码多个面单类型的场景，不带出件数
      if (route.query.showNumber === 'show' || +res.data[0].waybillParentInden === 20) {
        printerForm.count = ''
      }
      if (Number(printerForm.count) > 1 && printerForm.tagList.some((v) => v.typeName === '大标签')) {
        printerForm.mdList = [
          {
            type: 'big',
            typeName: '全部面单',
            typeNameDes: '',
          },
        ]
      }
    }
  }
}

// 判断对应的权限是否是10,20,30
// 针对getSimpleWaybillInfoFn方法写的
const handleSimpleWaybillInfoAuth = (array: any[], key: string) => {
  if (array.every((item) => item[key] === VisibleAuth.全部展示)) {
    return VisibleAuth.全部展示
  }
  if (array.every((item) => !item[key] || item[key] === VisibleAuth.全部隐藏)) {
    return VisibleAuth.全部隐藏
  }
  return VisibleAuth.部分展示
}

// 获取当前打印机
export const getFinishTaskId = (finishTaskId: string) => {
  console.log(finishTaskId, 'finishTaskId')
  if (finishTaskId && beforeFinishTaskId.value !== finishTaskId) {
    beforeFinishTaskId.value = finishTaskId
    isWantToReprint({
      taskId: finishTaskId,
    })
  }
}
// 获取当前打印机
export const getPrinters = async () => {
  const isWxApplet = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  if (isWxApplet) {
    return false
  } else if (isAppBrowse) {
    const res = (await $native.getBluetoothDevice()) as any
    console.log(res)
    const print = res as printerType
    if (print?.name && print.name !== printerForm.printer.name) {
      bindPrinter(print)
    }

    if (res?.printerType === PrinterTypeEnum.云打印) {
      const { data } = await getBindingCloundPrintStatus({
        printerCode: print?.deviceId,
        printerType: '20',
        deviceNo: print?.deviceNo,
        deviceType: '20',
      })
      if (data?.onlineStatus === 10) {
        printerForm.printer = print
        printerForm.printerType = res?.printerType
      } else {
        printerForm.printer = {
          name: '',
          localName: '',
          uuid: '',
          state: '',
        }
        printerForm.printerType = PrinterTypeEnum.蓝牙打印
      }
    } else {
      printerForm.printerType = res?.printerType
      printerForm.printer = print
    }
  } else {
    console.log(printerForm.printer)
    // printerForm.printer = {
    //   name: 'KJ-X3MSF-A-47DA',
    //   uuid: '04:7F:0E:11:47:DA',
    //   state: '1',
    // }
    printerForm.printer = {
      name: '',
      localName: '',
      uuid: '',
      state: '',
    }
    printerForm.printerType = PrinterTypeEnum.蓝牙打印
  }
}

/**
 * @description: 切换打印机时，兜底调用一次绑定
 * @param {printerType} printer
 * @return {*}
 */
const bindPrinter = async (printer: printerType) => {
  try {
    setBindPrinter({
      printTraceId: printTraceId.value,
      clientType: '20',
      printer,
      platformType,
      name: printer.name,
      localName: printer.localName,
    })
  } catch (error) {
    console.log(error)
  }
}

// 字号
export const handleRadio = (item: any) => {
  printerForm.markFont = item
  updatePrintSettingFn()
}
export const formatPerson = (value: string): string => {
  /* eslint-disable-next-line */
  const val = value.trim()
  if (val.match(/^[0-9,，-]+$/g)) {
    return val
  } else {
    return !val ? val : printerForm.pageSize
  }
}
// 页码
export const pageSizeChange = (e: string) => {
  printerForm.pageSize = e
}
// 件数
export const onCountChange = debounce(async () => {
  const route = useRoute()
  if (!printerForm.count && route.query.type === 'print-batch') {
    updateMdList()
    return
  }
  if (!printerForm.count) {
    printerForm.count = 1
  }
  updateMdList()
}, 100)
const updateMdList = () => {
  const selectWaybillLabel = printerForm?.tagList?.find((v) => v.type === '11') // 小标签*2
  const tagKeys = ['10', '20'] // 大标签、小标签*3

  if (
    Number(printerForm.count) > 1 &&
    (printerForm.tagList.some((v) => tagKeys.includes(v.type)) || !!selectWaybillLabel)
  ) {
    if (printerForm.mdList.length === 0) {
      printerForm.mdList = [
        {
          type: 'big',
          typeName: '全部面单',
          typeNameDes: '',
        },
      ]
    }
  } else {
    printerForm.mdList = []
    printerForm.pageSize = ''
  }
}
// 字母单
export const handleSwtichChange = (value: any) => {
  console.log(value)
  printerForm.isMother = value
  updatePrintSettingFn()
}
export const disableMinus = computed(() => {
  return Number(printerForm.count) < 1
})

// eslint-disable-next-line max-lines-per-function
const { usePrinterValidate, platformType } = useValidate(printerForm, isBatch.value)

// 获取打印配置
export const getPrintSettingFn = async () => {
  const res = await getPrintSetting({
    printTraceId: printTraceId.value,
    clientType: '20',
    platformType,
  })
  if (res && res.data) {
    const { templateSizeType, labelType, remarkFontSize, childrenFlag } = res.data.printSetting
    const templateTypeList = [...templateList].find((v) => templateSizeType.includes(v.type))
    printerForm.templateList = templateTypeList ? [templateTypeList] : []
    printerForm.stubChildData = [...stubTemplateList, ...childTemplateList].filter((v) =>
      templateSizeType.includes(v.type),
    )
    //有12和10的代表选择的一联二面随货联，寄方存根，需要转换成前端显示的类型,需求509971
    if (templateSizeType?.includes('12') && templateSizeType?.includes('10')) {
      printerForm.stubChildData = [
        {
          ...stubTemplateList[0],
          typeNameDes: '(宽76mm*长88mm)',
        },
      ]
    }
    //有选子母单，转换成前端显示的类型
    if (childrenFlag === '10') {
      printerForm.stubChildData.push(...childTemplateList)
    }
    const labelTypeValue = labelType === '30' ? '11' : labelType //入参时候会转成30，获取到后再转回来
    printerForm.tagList = [...tagList, ...waybillLabelTemplateList].filter((v) => v.type === labelTypeValue)
    // printerForm.isMother = false // 默认给false
    printerForm.markFont = remarkFontSize
  }
}
// 更新打印配置
export const updatePrintSettingFn = () => {
  updateMdList()
  try {
    const childrenFlag = printerForm.stubChildData.some((v) => v.typeName === '子母单') ? '10' : '20'
    updatePrintSetting({
      printTraceId: printTraceId.value,
      clientType: '20',
      platformType,
      printSetting: {
        labelType: labelTypeFunc(),
        templateSizeType: printerForm.templateList.map((v) => v.type),
        childrenFlag: childrenFlag,
        remarkFontSize: printerForm.markFont,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

// 跳转打印机列表页面
export const jumpBluetoothDeviceList = debounce(() => {
  $native.jumpBluetoothDeviceList({
    traceId: printTraceId.value,
  })
}, 300)

export const checkBluetooth = async (msg?: string) => {
  const isWxApplet = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  console.log('isWxApplet', Taro.getEnv())
  let flag = await printCheckBluetooth(msg)
  if (flag) {
    if (!isWxApplet) {
      await getPrinters()
    }
    // 已开启蓝牙时 需要校验数据填写
    const validated = await usePrinterValidate()
    if (!validated) {
      flag = false
    }
  }
  return flag
}

export const checkCloundPrinter = async (isValidatePrint = true) => {
  let flag = true
  const validated = await usePrinterValidate(isValidatePrint)
  if (!validated) {
    flag = false
  }
  return flag
}

// 打印面单
export const submit = async (fn?: any) => {
  // 需要区分是否是蓝牙打印还是云打印 只有蓝牙打印才需要校验蓝牙
  const check = printerForm.printerType === PrinterTypeEnum.云打印 ? await checkCloundPrinter() : await checkBluetooth()
  console.log('🚀 ~ submit ~ check:', check)

  if (!check) {
    // 这里只有打印机是必填的
    fn && fn()
    return
  }
  popupVisible.value = true
}
const labelTypeFunc = () => {
  let labelType = ''
  printerForm.tagList.forEach((v) => {
    if (v.type === '10') {
      labelType = '10'
      return
    } else if (v.type === '20') {
      labelType = '20'
      return
    }
  })

  if (printerForm.tagList.some((v) => v.type === '11')) {
    labelType = '30'
  }
  return labelType
}

export const printParams = () => {
  const route = useRoute()

  let waybillInfos = waybillNumberList.value.map((v) => {
    return {
      waybillNumber: v,
    }
  })

  if (route.query.type === 'batch-type') {
    waybillInfos = waybillNumberBatchList.value.map((v) => {
      return {
        waybillNumber: v,
      }
    })
  }

  const templateSizeType = printerForm.templateList.length > 0 ? printerForm.templateList[0].type : ''

  console.log(printerForm.templateList, 'printerForm.stubChildData:', printerForm.stubChildData)
  const stubFlag = [...printerForm.stubChildData, ...printerForm.templateList].some((v) => v.typeName === '寄方存根')
    ? '10'
    : '20'

  const isSelectChildFlag = printerForm.stubChildData.some((v) => v.typeName === '子母单')
  const childrenFlag = isSelectChildFlag ? '10' : '20'
  // 如果选中了子母单件数就要为空
  if (isSelectChildFlag) {
    printerForm.count = ''
  }

  // 判断是否是否子单情况，是的话直接不传count
  // if () {
  //   printerForm.count = ''
  // }

  const params = {
    printTraceId: route?.query?.printTraceId,
    clientType: '20',
    platformType,
    waybillInfos,
    printSettingRequest: {
      templateSizeType: templateSizeType, // 面单类型
      stubFlag: stubFlag,
      childrenFlag: childrenFlag,
      multipleLabelFlag: printerForm.tagList.length ? '10' : '20',
      printCount: printerForm.count || '', // 为0时 传空
      labelType: labelTypeFunc(),
      userConfiguration: {
        specifyPageNumber: printerForm.mdList.find((v) => v.typeName === '面单页码') ? printerForm.pageSize : '',
        remarkFontSize: printerForm.markFont,
      },
    },
    printer: printerForm.printer,
    printChannelSource: '',
  }

  console.log(params)
  if (printSource.value) {
    params.printChannelSource = printSource.value
  }
  return params
}

// 立即打印
export const onConfirm = debounce(async () => {
  // 判断是否是云打印
  if (printerForm.printerType === PrinterTypeEnum.云打印) {
    cloundPrintConfirm()
    return
  }
  btnLoading.value = true
  const check = await checkBluetooth()
  if (!check) {
    btnLoading.value = false
    return
  }
  if (!btnLoading.value) {
    btnLoading.value = false
    return
  }

  try {
    const res = await createPrintTask(printParams())
    console.log(res, 'createPrintTask')
    await sendBluetoothPrint(res)
  } finally {
    setTimeout(() => {
      btnLoading.value = false
    }, 2000)
  }
}, 300)

// 云打印
export const cloundPrintConfirm = async () => {
  btnLoading.value = true
  try {
    const { data } = await createMobileCloudPrint(printParams())
    const printStatusData = await commonSetPolling({
      delay: 1000,
      count: 60,
      polling: () => getCloundTaskStatus(data?.taskId),
      finishStatus: (data) => {
        // 返回true 终止轮询 10:下单成功  30: 全部下单失败
        return data?.task?.state === CloundPrintStatusEnum.成功 || data?.task?.state === CloundPrintStatusEnum.失败
      },
      args: undefined,
    })
    cloundPrintCallback(printStatusData)
  } catch (error) {
    console.error(error)
  } finally {
    btnLoading.value = false
  }
}
// 云打印轮询
export const getCloundTaskStatus = async (taskId: string) => {
  const { data } = await getCloundPrintStatus({ taskCode: taskId })
  return data
}
// 云打印结束后结果处理
export const cloundPrintCallback = (printStatusData: any) => {
  if (printStatusData?.task?.state === CloundPrintStatusEnum.成功) {
    showToast('打印任务已发送到您的打印机请检查')
    report_EXP_event('exp_page_order_print_pringbutton_print_succeed_v1')
    popupVisible.value = false
  } else {
    btnLoading.value = false
    showKyDialog({
      zIndex: 1000,
      title: '是否重新打印失败的运单',
      message: '运单打印失败，是否重新打印失败的运单？',
      cancelButtonText: '暂不打印',
      confirmButtonText: '重新打印',
      showCancelButton: true,
      allowHtml: true,
    })
      .then(async () => {
        cloundPrintConfirm()
      })
      .catch((err) => {
        console.error(err)
      })
  }
}
export const retryPrintTask = async (taskId: string) => {
  const check = await checkBluetooth()
  if (!check) {
    return
  }
  btnLoading.value = true
  try {
    const res = await getRetryPrintTask({
      taskId: taskId,
      clientType: '20',
      platformType,
      printer: printerForm.printer,
    })
    console.log(res)
    await sendBluetoothPrint(res)
  } finally {
    btnLoading.value = false
  }
}
/**
 * @description: 发送数据到蓝牙
 * @param {*} res
 * @return {*}
 */
export const sendBluetoothPrint = async (res: HttpResponse<createPrintTaskResultResponse>) => {
  const isWxApplet = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  if (res && res.data) {
    if (isWxApplet) {
      await starBluetoothPrint({
        batchNos: res.data.printBatches.map((v) => v.batchNo),
        taskId: res.data.taskId,
        traceId: printTraceId.value,
      })
      // $native.jumpPrintPage({
      //   batchNos: res.data.printBatches.map((v) => v.batchNo),
      //   taskId: res.data.taskId,
      //   traceId: printTraceId.value,
      // })
    } else {
      $native
        .jumpPrintPage({
          batchNos: res.data.printBatches.map((v) => v.batchNo),
          taskId: res.data.taskId,
          traceId: printTraceId.value,
        })
        .then((res: any) => {
          if (res.nativeBack + '' !== '1') {
            isWantToReprint(res)
          }
        })
    }
  } else {
    btnLoading.value = false
  }
}

/** 把字符串转成 ArrayBuffer */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const lookup = new Uint8Array(256)
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i
  }

  const bufferLength = base64.length * 0.75
  const len = base64.length
  const uint8Array = new Uint8Array(bufferLength)
  let p = 0
  let triplet
  for (let i = 0; i < len; i += 4) {
    triplet =
      (lookup[base64.charCodeAt(i)] << 18) |
      (lookup[base64.charCodeAt(i + 1)] << 12) |
      (lookup[base64.charCodeAt(i + 2)] << 6) |
      lookup[base64.charCodeAt(i + 3)]
    uint8Array[p++] = (triplet >> 16) & 255
    uint8Array[p++] = (triplet >> 8) & 255
    uint8Array[p++] = triplet & 255
  }
  return uint8Array
}
//判断安卓端的快麦打印机
function isAndroidKJ() {
  try {
    const name = printerForm?.printer?.name || ''
    return name?.indexOf('KJ-X3MSF') > -1 && systemType === 'Android'
  } catch (e) {
    return false
  }
}

// 分包写入
async function writeBLE(
  deviceId: string,
  serviceId: string,
  characteristicId: string,
  buffer: ArrayBuffer,
  startProportion: number,
  endProportion: number,
) {
  //安卓端快麦打印机写入过快会没反应
  const maxChunk = isAndroidKJ() ? 20 : 128
  let pos = 0

  while (pos < buffer.byteLength) {
    const chunk = buffer.slice(pos, pos + maxChunk)
    await Taro.writeBLECharacteristicValue({
      deviceId,
      serviceId,
      characteristicId,
      value: chunk,
      fail: () => {
        showToast('蓝牙打印机连接异常')
      },
    })
    pos += maxChunk

    transmitBluetoothProportion.value = Math.ceil(
      startProportion + (pos / buffer.byteLength) * (endProportion - startProportion),
    )
  }
}

function createBLEConnectionWithTimeout(deviceId: string, timeout = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    let finished = false

    // 启动超时定时器
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true
        reject(new Error(`createBLEConnection 超时 ${timeout}ms`))
      }
    }, timeout)

    // 调用微信 API
    Taro.createBLEConnection({ deviceId })
      .then((res) => {
        if (!finished) {
          finished = true
          clearTimeout(timer)
          resolve(res)
        }
      })
      .catch((err) => {
        if (!finished) {
          finished = true
          clearTimeout(timer)
          reject(err)
        }
      })
  })
}

const getServicesWithRetry = async (uuid, retries = 2) => {
  try {
    await Taro.openBluetoothAdapter()
  } catch (e) {
    const state = e?.state
    if ([3, 4].includes(state)) {
      Taro.removeStorageSync('connect-printer')
      return showToast('蓝牙打印机连接异常')
    }
    console.log(e)
  }
  // ===== 先尝试多次获取服务 =====
  for (let i = 0; i < retries; i++) {
    try {
      const res = await Taro.getBLEDeviceServices({ deviceId: uuid })
      if (res.services && res.services.length > 0) return res
    } catch (e) {
      console.warn('getBLEDeviceServices 失败，重试', i + 1)
    }
    await sleep(500)
  }

  // ===== 如果还没成功，额外尝试两次连接 =====
  for (let j = 0; j < 2; j++) {
    try {
      console.warn('尝试重新连接设备，第', j + 1, '次')
      try {
        // await Taro.createBLEConnection({ deviceId: uuid, timeout: 3000 })
        await createBLEConnectionWithTimeout(uuid, 3000)
      } catch (err) {
        console.log('尝试重新连接设备，失败', err)
        if (err?.errno === 1509007) {
          console.warn('设备已连接，无需重新连接')
        } else {
          continue
          // throw err
        }
      }
      await sleep(800) // 连接完成后等一下再查服务

      // 重连成功后去获取设备号
      for (let i = 0; i < retries; i++) {
        try {
          const res = await Taro.getBLEDeviceServices({ deviceId: uuid })
          if (res.services && res.services.length > 0) return res
        } catch (e) {
          console.warn('getBLEDeviceServices 失败，重试', i + 1)
        }
        await sleep(500)
      }
    } catch (e) {
      console.warn('重新连接失败', j + 1, e)
    }
    await sleep(500)
  }

  showToast('蓝牙打印机连接异常')
  Taro.removeStorageSync('connect-printer')
  throw new Error('获取服务失败')
}

//打印上报的数组组装
const getReportResult = (totalCommonds: [], taskId: string) => {
  return (
    totalCommonds?.map((i) => {
      return {
        waybillNumber: i?.waybillNumber,
        documentId: i?.id,
        printStatus: 20,
        originalWaybillNo: '',
        logType: 40,
        errorMsg: '',
        seq: 0,
        taskId: taskId,
      }
    }) || []
  )
}

const starBluetoothPrint = async ({ batchNos, taskId, traceId }) => {
  let totalCommonds = [] // 二位数组存放接口返回的所有指令和发送数据百分比[[{commond: 1, num: 1}]]
  const taskIds = []

  // batchNos.forEach((v) => {
  //   if (!taskIds.includes(v)) {
  //     taskIds.push(v)
  //     totalCommonds.push([])
  //   }
  // })

  const storageData = Taro.getStorageSync('connect-printer')

  if (!isJSON(storageData)) {
    // 此时需要把连接的打印机清空
    printerForm.printer = {
      name: '',
      localName: '',
      uuid: '',
      state: '',
    }
    showToast('蓝牙打印机连接异常')
    return
  }

  const { uuid: deviceId } = JSON.parse(storageData)

  // 1. 获取服务列表
  const servicesRes = await getServicesWithRetry(deviceId)
  // const servicesRes = await Taro.getBLEDeviceServices({
  //   deviceId,
  //   fail: () => {
  //     showToast('蓝牙打印机连接异常')
  //     Taro.removeStorageSync('connect-printer')
  //   }
  // })
  console.log('服务列表', servicesRes.services)

  // 一般取第一个主服务（isPrimary: true 的）
  const service = servicesRes.services.find((s) => s.isPrimary)
  if (!service) {
    throw new Error('未找到可用的主服务')
  }

  // 2. 获取该服务下的特征值
  const characteristicsRes = await Taro.getBLEDeviceCharacteristics({
    deviceId,
    serviceId: service.uuid,
    fail: () => {
      showToast('蓝牙打印机连接异常')
      Taro.removeStorageSync('connect-printer')
    },
  })
  console.log('特征值列表', characteristicsRes.characteristics)

  // 找到一个支持写入的 characteristic
  const writable = characteristicsRes.characteristics.find((c) => c.properties.write)
  if (!writable) {
    throw new Error('未找到可写入的特征值')
  }

  const serviceId = service.uuid
  const characteristicId = writable.uuid

  // 假设前面已经获取到 deviceId / serviceId / characteristicId

  console.log('开始发送打印数据')
  transmitBluetoothProportion.value = 0
  transmitBluetooth.value = true
  // 开始请求接口数据进行数据转换
  let seq = 0
  let id = ''
  const copies = 100 / batchNos.length

  for (let i = 0; i < batchNos.length; i++) {
    // const startProportion = transmitBluetoothProportion.value
    // const endProportion = startProportion + copies
    // const res = await loopResult({
    //   printTraceId: traceId,
    //   batchNo: batchNos[i],
    //   clientType: '20',
    //   platformType: isIphone ? 'ios-wechat' : 'android-wechat',
    //   pageRow: 20,
    //   id,
    // })
    // const commands = res.data.commands || []
    // const copies2 = copies / (res.data.commands.length || 1)
    const getCommonds = async (params: { id: string }) => {
      const { id } = params
      const res = await loopResult({
        printTraceId: traceId,
        batchNo: batchNos[i],
        clientType: '20',
        platformType: isIphone ? 'ios-wechat' : 'android-wechat',
        pageRow: 20,
        id,
      })
      const { commands = [], haveNext } = res?.data || {}
      console.log('测试数据', haveNext)
      totalCommonds = totalCommonds.concat(commands)
      if (haveNext) {
        await getCommonds({
          id: totalCommonds[totalCommonds?.length - 1]?.id,
        })
      }
    }
    const copies2 = copies / (totalCommonds.length || 1)
    await getCommonds({
      id: '',
    })

    try {
      for (let j = 0; j < totalCommonds.length; j++) {
        const startProportion = transmitBluetoothProportion.value
        const endProportion = startProportion + copies2 < 100 ? startProportion + copies2 : 100
        const buffer = base64ToArrayBuffer(totalCommonds[j].command).buffer
        await writeBLE(deviceId, serviceId, characteristicId, buffer, startProportion, endProportion)
      }
      uploadPrintLog({
        printTraceId: traceId,
        operationType: 10,
        platformType: isIphone ? 'ios-wechat' : 'android-wechat',
        clientId: deviceId,
        saveRequest: getReportResult(totalCommonds, taskId),
      })
      // console.log('res.data.commands', res.data.commands, res)
      // transmitBluetoothProportion.value = Math.ceil((i + 1) / batchNos.length)
      await sleep(500)
      totalCommonds = []
    } catch (e) {
      uploadPrintLog({
        printTraceId: traceId,
        operationType: 10,
        platformType: isIphone ? 'ios-wechat' : 'android-wechat',
        clientId: deviceId,
        saveRequest: getReportResult(totalCommonds, taskId),
      })
    }
  }
  transmitBluetoothProportion.value = 100

  transmitBluetooth.value = false
  console.log('结束发送打印数据')
  showToast('打印任务已发送到您的打印机请检查')
  report_EXP_event('exp_page_order_print_pringbutton_print_succeed_v1')
  popupVisible.value = false
}

const loopResult = (queryParams, interval = 300, maxRetry = 30) => {
  let count = 0

  return new Promise((resolve, reject) => {
    const poll = () => {
      getAsyncPrintDataByPage(queryParams)
        .then((res) => {
          if (res.data.finishState) {
            resolve(res)
          } else {
            count++
            if (count >= maxRetry) {
              reject(new Error('轮询超时'))
            } else {
              setTimeout(poll, interval) // 过 interval 毫秒后继续请求
            }
          }
        })
        .catch((err) => reject(err))
    }

    poll() // 启动轮询
  })
}

/**
 * @description: 从原生回来，查询打印结果
 * @param {*} res
 * @return {*}
 */
export const isWantToReprint = async (res: any) => {
  if (res.taskId) {
    popupVisible.value = false
    const check = await checkBluetooth('终端蓝牙已断开，无法完成面单打印，请在设置页打开蓝牙，重新发起打印。')
    if (!check) {
      btnLoading.value = false
      return
    }
    try {
      const data = await getPrintTaskFinishResult({
        taskId: res.taskId,
        clientType: '20',
        platformType,
      })
      console.log(data, '获取打印成功数据')
      if (data?.data?.waybillTotal > 0 && data?.data?.waybillTotal === data?.data?.finishedWaybillCount) {
        // 全部成功
        showToast('打印任务已发送到您的打印机请检查')
        report_EXP_event('exp_page_order_print_pringbutton_print_succeed_v1')
        getSimpleWaybillInfoFn()
      } else if (data?.data?.errorWaybillCount > 0) {
        let message = '<div style="text-align: left">运单打印失败，是否重新打印失败的运单？</div>'
        const orderStore = useStore()
        if (orderStore.orderPageType === OrderPageType.批量寄 || data?.data?.finishedWaybillCount > 0) {
          message = `<div style="text-align: left">已成功打印运单<span style="color: #FF8C00">${data?.data?.finishedWaybillCount}</span>票,失败运单<span style="color: #FF8C00">${data?.data?.errorWaybillCount}</span>票,是否重新打印失败的运单？</div>`
        }
        againPrintDialog(message, res.taskId)
      } else {
        showToast('返回数据异常')
      }
    } catch (err) {
      console.log(err)
    } finally {
      btnLoading.value = false
    }
  } else {
    btnLoading.value = false
    showToast('taskId不能为空')
  }
}
export const againPrintDialog = async (message: string, taskId: string) => {
  const check = await checkBluetooth()
  if (!check) {
    return
  }
  showKyDialog({
    zIndex: 1000,
    title: '是否重新打印失败的运单',
    message,
    cancelButtonText: '暂不打印',
    confirmButtonText: '重新打印',
    showCancelButton: true,
    allowHtml: true,
  })
    .then(async () => {
      retryPrintTask(taskId)
    })
    .catch((err) => {
      console.error(err)
    })
}

export const getPrintPreview = async (index: number) => {
  const params = {
    type: '10',
    ...printParams(),
    waybillNumber: waybillNumberList.value[index],
  }
  return getPrintPreviewList(params)
}
