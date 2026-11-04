<template>
  <ky-container v-bind="pageOptions" class="container order-print-warp" id="printerPageX">
    <!-- <Skeleton v-if="showSkeleton" /> -->
    <scroll-view :scroll-y="true" :show-scrollbar="false" @scroll="handlerScroll" class="order-print-scroll">
      <div class="print-content" @touchstart="handleCheckChange">
        <div class="box" v-if="!showSkeleton">
          <div class="xtitle flex-center">打印机<SvgIcon class="cell-left-required" name="required" /></div>
          <!-- 云打印 -->
          <ky-popover location="top-start" :offset="[0, 4]" theme="dark" :show="printerPopoverShow">
            <template #reference>
              <div
                data-validate="printerForm.printer"
                @click="jumpBluetoothDeviceList"
                v-if="printerForm.printerType === PrinterTypeEnum.云打印"
              >
                <div class="cloud-printer-info">
                  <div class="cloud-printer-info-name" v-if="printerForm.printer && printerForm.printer.name">
                    {{ printerForm.printer.localName || printerForm.printer.name }}
                  </div>
                  <div
                    v-else
                    class="cloud-printer-info-placeholder"
                    :class="{
                      'cloud-printer-info-placeholder__error': printerPopoverShow,
                    }"
                  >
                    请选择打印机
                  </div>
                  <SvgIcon name="right-arrow" class="right-icon" />
                </div>
              </div>
              <!-- 蓝牙打印 -->
              <div data-validate="printerForm.printer" @click="jumpBluetoothDeviceList" v-else>
                <KyCell placeholder="" class="printerForm_printer">
                  <template #title>
                    <div v-if="printerForm.printer && printerForm.printer.name">
                      {{ printerForm.printer.localName || printerForm.printer.name }}
                    </div>
                    <div
                      v-else
                      class="placeholder"
                      :class="{
                        placeholder__error: printerPopoverShow,
                      }"
                    >
                      请选择打印机
                    </div>
                  </template>
                </KyCell>
              </div>
            </template>
            <template #content>
              <view class="error-tips-padding">请选择打印机</view>
            </template>
          </ky-popover>

          <div class="xtitle mt-32 flex-center">
            面单类型
            <!-- <div class="xtitle_des">(可多选)</div> -->
            <SvgIcon class="cell-left-required" name="required" />
            <div
              class="tempng"
              @click="
                goTeplatepng('https://ic-img.ky-express.com/netc/20240419_68948541690_!!1713512637166_1578_11048.png')
              "
            >
              <div class="icon-img">打印说明</div>
            </div>
          </div>
          <div data-validate="printerForm.templateList">
            <KyCell placeholder="" class="printerForm_printer" @click="setPopVisible(true)">
              <template #title>
                <div v-if="printerForm.templateList && printerForm.templateList[0]">
                  {{ printerForm.templateList[0].typeName }}
                  <span class="printerForm_printer-text">
                    {{ printerForm.templateList[0].typeNameDes }}
                  </span>
                </div>
                <div v-else class="placeholder">请选择面单类型</div>
              </template>
            </KyCell>
            <PopupCheck v-model:visible="popVisible" @change="changeTemplateList" />

            <!-- <Check
            ref="templateListCheckRef"
            :btn-list="waybillTemplateList"
            :multiple="true"
            v-model="printerForm.templateList"
            @change="changeTemplateList"
          ></Check> -->
          </div>

          <div v-if="printGoodsAllyVisible">
            <div class="xtitle mt-32 flex-center-start">打印寄方存根<span v-if="isMotherVisible">/子母单</span></div>
            <Check
              ref="templateListCheckRef"
              class="stubChildData-checklist"
              :btn-list="stubChildTemplateList"
              :multiple="true"
              v-model="printerForm.stubChildData"
              @change="handleChangeStubChildTemplate"
            ></Check>
          </div>

          <!-- <div class="xtitle motherbox mt-48" v-if="isMotherVisible">
          同时打印子母单
          <KySwitch
            v-model="printerForm.isMother"
            size="17px"
            inactive-color="#ebedf5"
            active-color="#8365F6"
            @change="handleSwtichChange"
          />
        </div> -->
          <div v-if="printLabelVisible">
            <div class="xtitle mt-32">打印标签</div>
            <Check
              :btn-list="labelTagList"
              :checked="true"
              class="stubChildData-checklist"
              v-model="printerForm.tagList"
              @change="changeTagList"
            ></Check>
          </div>
        </div>
        <div
          class="box box-padding"
          :class="{ boxPadding: clickCountAddPadding }"
          v-if="(showBox || (!showBox && isUpdateShowCount)) && !showSkeleton"
        >
          <div class="xtitle mb0" v-if="tagAndCountVisible" style="display: block">
            <div class="xtitle-top">
              打印件数
              <div class="count">
                <KyStepper
                  input-stuffix="件"
                  :disableMinus="disableMinus"
                  v-model.number="printerForm.count"
                  :max="9999"
                  :min="1"
                  :type="'number'"
                  :maxlength="4"
                  :disabled="countDisabled"
                  :canEmpty="true"
                  @blur="onCountChange"
                  @minus="onCountChange"
                  @plus="onCountChange"
                ></KyStepper>
              </div>
            </div>
            <div class="xtitle_destips">修改后运单件数会同步更改</div>
          </div>

          <div class="xtitle mt-32" v-if="mdlistVisible">面单范围</div>
          <div v-if="mdlistVisible">
            <Check
              :btn-list="mdList"
              :flex-center="true"
              v-model="printerForm.mdList"
              @change="handleCheckChange"
            ></Check>
          </div>
          <div class="xtitle mt-32 flex-center" v-if="pageSizeVisible">
            面单页码
            <SvgIcon class="cell-left-required" name="required" />
          </div>
          <ky-popover v-if="pageSizeVisible" location="top-start" theme="dark" :show="bubbleVisible" :offset="[0, 5]">
            <template #reference>
              <ky-input
                data-validate="printerForm.pageSize"
                placeholder="请输入页码，如1，3-4"
                v-model="printerForm.pageSize"
                :customPlaceholder="true"
                :isError="bubbleVisible"
                :maxlength="20"
                :formatter="formatPerson"
                clearable
                class="yema"
                :cursor-spacing="100"
                @focus="onPageSizeFocus"
                @blur="onPageSizeBlur"
              />
            </template>
            <template #content> {{ `请输入1-${printerForm.count}之间的页码` }} </template>
          </ky-popover>
        </div>
        <div class="box" v-if="!showSkeleton">
          <div class="xtitle">备注字号</div>
          <KyRadio
            class="radio-item"
            type="buttonCheck"
            direction="horizontal"
            checkedIcon="checked-round"
            :radio-props="markFontList"
            v-model="printerForm.markFont"
            :showCheckErrorTip="false"
            @click="handleRadio"
          ></KyRadio>
        </div>
      </div>
    </scroll-view>

    <div class="flex items-center xfooter" v-if="!showSkeleton">
      <KyButton
        class="button-footer btn-left"
        type="default"
        size="normal"
        text="打印预览"
        @click="previewAndPrint"
      ></KyButton>
      <KyButton class="button-footer" type="primary" size="normal" text="打印面单" @click="handleSubmit"></KyButton>
    </div>
    <ky-popup v-model:show="popupVisible" :closeOnClickOverlay="true" safeAreaInsetBottom position="bottom">
      <view class="popup-check-info-header">
        <text>请确认打印信息</text>
        <image
          src="https://ic-img.ky-express.com/netc/20250726_41452_!!1753521106143_64_64.png"
          @tap.stop="popupVisible = false"
        />
      </view>
      <!-- <template v-slot:tips>
        <div class="popupTips">(共{{ waybillNumberList.length }}票运单)</div></template
      > -->
      <view class="popup-check-info-content">
        <Popup
          :formData="printerForm"
          :waybillNumberList="waybillNumberList"
          :isMotherVisible="isMotherVisible"
          :pageSizeVisible="pageSizeVisible"
        ></Popup>
      </view>
      <view class="popup-check-info-footer">
        <KyButton
          loading-text="立即打印"
          text="立即打印"
          class="nowbtn"
          type="primary"
          @click="onConfirm()"
          :loading="btnLoading"
        ></KyButton>
      </view>
    </ky-popup>

    <TransmitBluetoothPopup />
  </ky-container>
</template>

<script setup lang="ts">
import { onMounted, computed, onUnmounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from '@order-public-sub-public/vue-router/index'
import { closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
import KyStepper from '@order-public-sub-public/components/ui/stepper/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import Popup from './components/popup.vue'
import Skeleton from './components/skeleton/index.vue'
import Check from './check.vue'
import PopupCheck from './components/popup-check/index.vue'
import TransmitBluetoothPopup from './components/transmit-bluetooth/index.vue'
import { printerType as PrinterType, VisibleAuth, btnListType, PrinterTypeEnum } from './hooks/type'
import { localStorage } from '@order-public-sub-public/utils/storage'
import {
  mdList,
  markFontList,
  waybillLabelTemplateList,
  tagList,
  parentChildrenPermission,
  changeCountPermission,
  stubTemplateList,
  childTemplateList,
  bubbleVisible,
} from './hooks/state'
import { usePrintSource, PrintSourceEnum, usePopVisible } from './hooks/useState'

import { listPrintingWaybillQueue, getBindingCloundPrintStatus } from '@order-public-sub-public/apis/print'
import { sessionStorage } from '@order-public-sub-public/utils/storage'
import { isWxApplet } from '@order-public-sub-public/utils/device'
import { isJSON, getQueryObject } from '@order-public-sub-public/utils'
import { useValidate } from './hooks/useValidate'
// import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import {
  getPrinters,
  printerForm,
  isBatch,
  popupVisible,
  btnLoading,
  waybillNumberList,
  printTraceId,
  getSimpleWaybillInfoFn,
  getFinishTaskId,
  handleRadio,
  formatPerson,
  pageSizeChange,
  onCountChange,
  // handleSwtichChange,
  disableMinus,
  // jumpBluetoothDeviceList,
  getPrintSettingFn,
  updatePrintSettingFn,
  submit,
  // checkBluetooth,
  checkCloundPrinter,
  onConfirm,
  waybillNumberBatchList,
} from './hooks/useData'
import Taro, { useDidShow, usePageScroll } from '@tarojs/taro'
import { debounce } from 'lodash-es'
import { report_CLK_event, report_pv_event } from '@/public/utils'

// hasLabelAuth 标签权限
const {
  tagAndCountVisible,
  mdlistVisible,
  pageSizeVisible,
  isMotherVisible,
  printLabelVisible,
  printGoodsAllyVisible,
} = useValidate(printerForm, isBatch.value)

const { popVisible, setPopVisible } = usePopVisible()

const route = useRoute()
const router = useRouter()

const pageOptions = ref({
  navBarOptions: {
    showPlatList: [],
    title: '打印面单',
  },
  scrollOptions: {
    scrollViewPlatList: [],
  },
  toolOptions: {
    isHideShareMenu: true,
  },
  errorCheck: {
    // 监听弱网状态变化事件
    // onNetworkWeakChange: ({ errMsg, networkType, weakNet }) => {
    //   console.log('networkWeakChange', `${weakNet ? '弱网' : ''}`)
    // },
  },
})

const printerPopoverShow = ref(false)

const handleSubmit = () => {
  submit(() => {
    if (!printerForm?.printer?.name) {
      printerPopoverShow.value = true
    }
  })
  report_CLK_event('clk_page_order_print_pringbutton_v1', {
    event_code: 'clk_page_order_print_pringbutton_v1',
    page_code: 'page_order_print_v1',
  })
}

//  批量混合多个客户编码多个面单类型，不显示件数
const batchDealNumber = computed(() => {
  return !(route.query.showNumber === 'hidden' && route.query.type === 'print-batch')
})

console.log(batchDealNumber.value, 'batchDealNumber')

const isInit = ref(false)
const isWaybillRoute = computed(
  () => route?.query?.pageForm === 'waybillRoute' || changeCountPermission.value === VisibleAuth.全部隐藏,
)

const countDisabled = computed(() => {
  return isWaybillRoute.value || !(changeCountPermission.value !== VisibleAuth.全部隐藏 && tagAndCountVisible.value)
})

// 判断是否可以修改件数
const isUpdateShowCount = computed(() => {
  const isCheckChildFlag = printerForm.stubChildData.some((v) => v.type === '8')
  return (
    changeCountPermission.value === VisibleAuth.全部展示 &&
    printGoodsAllyVisible.value &&
    !showBox.value &&
    !isCheckChildFlag
  )
})

// 判断打印寄方存根或者打印标签是否勾选
const isCheckStubLabel = computed(() => {
  const formCheckObj = {
    stubChildData: printGoodsAllyVisible.value,
    tagList: printLabelVisible.value,
  }

  const keys = Object.keys(formCheckObj).filter((key) => formCheckObj[key as keyof typeof formCheckObj])
  const keysBool = keys.map((key) => (printerForm[key as keyof typeof printerForm] as btnListType[]).length > 0)

  return keysBool.every((item) => item)
})

// 定义组件名，用于keepAlive白名单判断
defineOptions({
  name: 'print',
})
const showSkeleton = ref(true)
nextTick(() => {
  // 提供给原生调用，刷新打印机
  // window.refreshPrintDevice = () => {
  //   getPrinters();
  // };
})
onMounted(async () => {
  printerForm.count = 0
  printerForm.pageSize = ''
  printerForm.tagList = []
  printerForm.mdList = []
  printerForm.markFont = '8'
  printerForm.stubChildData = []
  isInit.value = true
  closeSkeleton()
  localStorage?.setItem('printerhref', getQueryObject(location.href).bluetoothPrinter)
  showSkeleton.value = true
  Taro.showLoading({ mask: true, title: '加载中...' })
  printTraceId.value = route?.query?.printTraceId as string
  console.log('route?1111', route?.query)
  // 微信用来获取数据
  // window.addEventListener("popstate", getPrintersWxUrl, false);
  // app用来获取打印机
  // document.addEventListener("visibilitychange", getPrinters);
  // getPrinters();
  // getPrintersWx();
  try {
    await listPrintingWaybillQueueFn()
    await Promise.all([getSimpleWaybillInfoFn(), getPrintSettingFn()])
  } finally {
    showSkeleton.value = false
    Taro.hideLoading()
  }
  report_pv_event('page_order_print_v1')
})

const listPrintingWaybillQueueFn = () => {
  return new Promise<void>((resolve, reject) => {
    if (route.query.type === 'print-batch') {
      listPrintingWaybillQueue({ queueId: route.query.queueId })
        .then((res) => {
          console.log(res)
          waybillNumberBatchList.value = res.data
          resolve()
        })
        .catch(() => {
          reject()
        })
    } else {
      waybillNumberBatchList.value = []
      resolve()
    }
  })
}

// 解决 print使用了keepAlive 返回打印记录再进入打印面单界面不刷新问题
const printRecordsAginCome = ref(false)

// TODO-不支持,要处理
// onBeforeRouteLeave((to) => {
//   if (to.name === 'print-records') {
//     printRecordsAginCome.value = true
//   }
//   popupVisible.value = false
// })
// onBeforeRouteUpdate(async (to, from) => {
//   console.log(to.name)
//   if (from.name === 'batch-print' && isInit.value) {
//     try {
//       showSkeleton.value = true
//       Taro.showLoading({ mask: true, title: '加载中...' })
//       await Promise.all([getSimpleWaybillInfoFn(), getPrintSettingFn()])
//     } finally {
//       showSkeleton.value = false
//       Taro.hideLoading()
//     }
//   }
//   popupVisible.value = false
// })

useDidShow(async () => {
  const notPrinter = Taro.getApp().notPrinter
  if (notPrinter) {
    printerPopoverShow.value = true
    Taro.getApp().notPrinter = null
  }
  console.log('route222', route)
  getPrintersSync()

  if (route.query.waybillNumber) {
    waybillNumberList.value = (route.query.waybillNumber as string)?.split(',')
  }

  if (route.query.printSource) {
    const { setPrintSource } = usePrintSource()

    setPrintSource(route.query.printSource as keyof typeof PrintSourceEnum)
  }

  if (printRecordsAginCome.value) {
    showSkeleton.value = true
    Taro.showLoading({ mask: true, title: '加载中...' })
    try {
      await getSimpleWaybillInfoFn()
    } finally {
      showSkeleton.value = false
      Taro.hideLoading()
      printRecordsAginCome.value = false
    }
  }
})

onUnmounted(() => {
  // app用来获取打印机
  // document.removeEventListener("visibilitychange", getPrinters);
  // window.removeEventListener("popstate", getPrintersWxUrl);
  // window.refreshPrintDevice = null;
  console.log('返回或者退出当前页面的时候会触发这个么> ')
  // 返回或者退出当前页面的时候
  // 清除缓存 printerForm.count
  // 旧H5里面一样是有问题
  printerForm.count = 0
})

const changeTemplateList = (templateList: btnListType[], item: btnListType) => {
  console.log(templateList, 'templateList', item)
  printerForm.templateList = [item]
  updatePrintSettingFn()

  // 切换面单类型后清空面单页码
  printerForm.pageSize = ''
  printerForm.tagList = []
  printerForm.mdList = [
    {
      type: 'big',
      typeName: '全部面单',
      typeNameDes: '',
    },
  ]
}
const changeTagList = () => {
  updatePrintSettingFn()
}

// 寄方存/子母单点击选择
const handleChangeStubChildTemplate = () => {
  const currentStub = printerForm.stubChildData.find((item) => item.type === '8')
  if (currentStub) {
    printerForm.mdList = [
      {
        type: 'big',
        typeName: '全部面单',
        typeNameDes: '',
      },
    ]
  }
}

/** 从本地存储中获取打印机 */
const getPrintersSync = async () => {
  const storageData = Taro.getStorageSync('connect-printer')

  if (!isJSON(storageData)) {
    printerForm.printer = {
      name: '',
      localName: '',
      uuid: '',
      state: '',
    }
    return
  }

  const { printerType, ...querybluetoothPrinter } = JSON.parse(storageData)

  if (printerType === PrinterTypeEnum.云打印) {
    const { data } = await getBindingCloundPrintStatus({
      printerCode: querybluetoothPrinter?.deviceId,
      printerType: '20',
      deviceNo: querybluetoothPrinter?.deviceNo,
      deviceType: '20',
    })
    if (data?.onlineStatus === 10) {
      printerForm.printer = {
        ...querybluetoothPrinter,
        name: data.displayName,
        localName: data.displayName,
      }
      printerForm.printerType = printerType
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
    printerForm.printer = querybluetoothPrinter
    printerForm.printerType = printerType
  }
}

// wx获取当前打印机--废弃
const getPrintersWx = async () => {
  if (isWxApplet) {
    const params = getQueryObject(location.href)
    console.log(params, 'searchParams')
    const querybluetoothPrinterString = params.bluetoothPrinter as string
    const bluetoothAuthState = params.bluetoothAuthState as string
    const queryPrinterType = (params?.printerType || '') as string
    let querybluetoothPrinter = {} as PrinterType
    if (isJSON(querybluetoothPrinterString) && JSON.parse(querybluetoothPrinterString).uuid) {
      querybluetoothPrinter = JSON.parse(querybluetoothPrinterString) as PrinterType
    }
    if (isJSON(bluetoothAuthState)) {
      // const bluetoothAuthStateObj = JSON.parse(bluetoothAuthState)
      // printCheckBluetooth('', bluetoothAuthStateObj)
    }
    if (queryPrinterType === PrinterTypeEnum.云打印) {
      const { data } = await getBindingCloundPrintStatus({
        printerCode: querybluetoothPrinter?.deviceId,
        printerType: '20',
        deviceNo: querybluetoothPrinter?.deviceNo,
        deviceType: '20',
      })
      if (data?.onlineStatus === 10) {
        printerForm.printer = querybluetoothPrinter
        printerForm.printerType = queryPrinterType
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
      printerForm.printer = querybluetoothPrinter
      printerForm.printerType = queryPrinterType
    }
  }
}
// wx获取url连接数据 --- 废弃
const getPrintersWxUrl = async () => {
  if (isWxApplet && !location.href.includes('print-preview')) {
    console.log('print-----', sessionStorage.getItem('printPreview'))
    const printPreview = sessionStorage.getItem('printPreview')
    // 是否从打印预览回来
    if (printPreview === '1') {
      const printerhref = sessionStorage.getItem('printerhref') || ''
      const finishTaskId = getQueryObject(printerhref).finishTaskId ? getQueryObject(printerhref).finishTaskId : ''
      sessionStorage.removeItem('printPreview')
      getFinishTaskId(finishTaskId)
      history.back()
      return
    }
    const printerhref = sessionStorage.getItem('printerhref') || ''

    const finishTaskId = getQueryObject(printerhref).finishTaskId ? getQueryObject(printerhref).finishTaskId : ''

    let bluetoothPrinter = {} as PrinterType
    const bluetoothPrinterString = getQueryObject(printerhref).bluetoothPrinter
      ? getQueryObject(printerhref).bluetoothPrinter
      : ''
    if (isJSON(bluetoothPrinterString) && JSON.parse(bluetoothPrinterString).uuid) {
      bluetoothPrinter = JSON.parse(bluetoothPrinterString) as PrinterType
    }
    const queryPrinterType = getQueryObject(printerhref)?.printerType || ''
    if (history.length > 1) {
      sessionStorage?.setItem('printerhref', location.href)
      if (queryPrinterType === PrinterTypeEnum.云打印) {
        const { data } = await getBindingCloundPrintStatus({
          printerCode: bluetoothPrinter?.deviceId,
          printerType: '20',
          deviceNo: bluetoothPrinter?.deviceNo,
          deviceType: '20',
        })
        if (data?.onlineStatus === 10) {
          printerForm.printer = bluetoothPrinter
          printerForm.printerType = queryPrinterType
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
        printerForm.printer = bluetoothPrinter
        printerForm.printerType = queryPrinterType
      }
      getFinishTaskId(finishTaskId)
      // alert(1)
      history.go(-(history.length - 1))
    }
  }
}

// 跳转图例、
const goTeplatepng = (url?: string) => {
  router.push({
    path: '/teplatepng',
    query: {
      pngurl: url,
    },
  })
}

/**
 * @description: 跳转打印预览
 * @return {*}
 */
const previewAndPrint = async () => {
  // if (printerForm.printerType !== PrinterTypeEnum.云打印) {
  //   const check = await checkBluetooth()
  //   if (!check) {
  //     return
  //   }
  // }
  report_CLK_event('clk_page_order_print_browsenprint_v1', {
    event_code: 'clk_page_order_print_browsenprint_v1',
    page_code: 'page_order_print_v1',
  })

  const flag = await checkCloundPrinter(false)
  if (!flag) {
    return
  }

  router.push({
    name: 'print-preview',
    query: {
      printTraceId: printTraceId.value,
      waybillNumber: route.query.waybillNumber,
    },
  })
}

const showBox = computed(() => {
  const isOldCountRange =
    parentChildrenPermission.value === VisibleAuth.全部隐藏 &&
    (tagAndCountVisible.value || mdlistVisible.value || pageSizeVisible.value) &&
    !showSkeleton.value &&
    batchDealNumber.value
  // isCheckStubLabel.value;

  return isOldCountRange
})

// (小标签*3、大标签) / 小标签*2
const labelTagList = computed(() => {
  const templateInfo = printerForm.templateList.find((v) => v.typeName === '一联二面随货联')
  if (templateInfo) {
    return waybillLabelTemplateList
  }

  return tagList
})

// 获取寄方存根/子母单
const stubChildTemplateList = computed(() => {
  let list = [] as btnListType[]

  const templateInfo = printerForm.templateList.find((v) => v.typeName !== '寄方存根')

  if (templateInfo) {
    list = [...list, ...stubTemplateList]
  }

  if (isMotherVisible.value) {
    list = [...list, ...childTemplateList]
  }

  // 判断件数大于1时才显示子母单选项
  if (isUpdateShowCount.value && isMotherVisible.value) {
    if (Number(printerForm.count) > 1) {
      list = [...stubTemplateList, ...childTemplateList]
    }

    if (Number(printerForm.count) === 1) {
      list = [...stubTemplateList]
    }
  }

  // 一联二面随货联与随货联显示的大小文案是不一样的
  const isTwoFaceSheet = templateInfo?.typeName === '一联二面随货联'
  list = list.map((item) => ({
    ...item,
    typeNameDes: isTwoFaceSheet ? '(宽76mm*长88mm)' : '(宽76mm*长130mm)',
  }))

  return list
})

const isSelectSmallLabel = computed(() => {
  return printerForm.tagList.find((v) => v.type + '' === '11')
})

const clickCountAddPadding = ref(false)

const onPageSizeFocus = () => {
  // if (isSelectSmallLabel.value) {
  //   clickCountAddPadding.value = true
  // }

  handleCheckChange()
}

const handleCheckChange = () => {
  if (bubbleVisible.value) {
    bubbleVisible.value = false
  }

  if (printerPopoverShow.value) {
    printerPopoverShow.value = false
  }
}

const onPageSizeBlur = () => {
  clickCountAddPadding.value = false
}

const jumpBluetoothDeviceList = () => {
  printerPopoverShow.value = false
  Taro.navigateTo({ url: '/modules/waybill-build/pages/connect-printer/index' })
}

// 监听页面滚动
const handlerScroll = debounce(() => {
  console.log('页面滚动')
  handleCheckChange()
}, 200)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '@order-global-package-order-sub/styles/common.scss';
@import './index.scss';
</style>
