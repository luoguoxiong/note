<template>
  <view class="waybill-search-item__Warp">
    <view
      class="waybill-search-item"
      v-for="(data, index) in state.search.waybill"
      :key="index"
      @tap="handleWaybillCardTap(data)"
    >
      <WaybillCard
        :waybillData="data"
        cardSource="home"
        @touchstart="null"
        @labelClick="() => handleWaybillLabel(data)"
        @limitRemind="() => onConfirmBarClick(data)"
        @applyStatusClick="() => handleApplyStatus(data)"
      >
        <template #headRight>
          <view class="waybill-card-head-right">
            <view>
              <view
                v-if="+data?.waybill?.baseInfo?.pickupMode !== 10 && getBarCodeBtn(data)"
                class="right-extra-btn"
                @click.stop="openBarCode(data?.waybill?.baseInfo?.waybillNumber)"
              >
                <KyImage src="https://ic-img.ky-express.com/default/20250724_85055_!!1753359202402_48_48.png" />
                <text class="right-extra-btn-text">寄件码</text>
              </view>
              <view v-if="getCustomerBtn(data)" class="right-extra-btn" @click.stop="openCustomerService(data)">
                <KyImage src="https://ic-img.ky-express.com/netc/20250724_49645_!!1753364856395_48_48.png" />
                <text class="right-extra-btn-text">客服</text>
              </view>
            </view>
            <view>
              <ky-tag
                v-if="data?.waybill?.baseInfo?.waybillType === 20"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >回单</ky-tag
              >
              <ky-tag
                v-if="data?.waybill?.baseInfo?.waybillType === 30"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >发票</ky-tag
              >
              <ky-tag
                v-if="data?.functionInfo?.waybillRoundFlag?.operateStatus === 10"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >去程单</ky-tag
              >
              <ky-tag
                v-if="data?.functionInfo?.waybillRoundFlag?.operateStatus === 20"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >返程单</ky-tag
              >
              <!-- 这里与后端约定好，取data?.waybill?.baseInfo?.deliveryMode，
                        后端：文豪
                       +data?.waybill?.baseInfo?.deliveryMode === 10"
                       -->
              <ky-tag
                v-if="+data?.waybill?.baseInfo?.deliveryMode === 10"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >网点自提</ky-tag
              >
              <ky-tag
                v-if="+data?.waybill?.baseInfo?.pickupMode === 10 && +data?.waybill?.baseInfo?.waybillStatus === 20"
                size="3"
                bgColor="#FFF3E5"
                borderColor="#FFD194"
                textColor="#FF9300"
                >服务点自寄</ky-tag
              >
            </view>
          </view>
        </template>
        <template #cardBottom>
          <view
            v-if="
              +data?.waybill?.baseInfo?.waybillStatus === 20 &&
              (+data?.tipsInfo?.showWatermarkType === 110 || +data?.tipsInfo?.showWatermarkType === 111)
            "
            class="waybill-card-bottom"
          >
            <view class="waybill-card-bottom-right">
              <view class="waybill-card-bottom-right">
                <view v-for="item in getRelieveButtons(data)" :key="item.label" class="waybill-card-bottom-right-btn">
                  <ky-button size="small" plain @click.stop="() => chooseMenu(item.type, data)">
                    {{ item.label }}
                  </ky-button>
                </view>
              </view>
            </view>
          </view>
          <view v-else-if="Boolean(data?.waybill?.baseInfo?.waybillNumber)" class="waybill-card-bottom" @click.stop>
            <ky-popover-menu
              v-if="getMenus(data).slice(0, -3).length"
              class="waybill-card-bottom-more"
              :menus="getMenus(data).slice(0, -3)"
              listenClickId="search-result-list-page"
              @chooseMenu="(type: string) => chooseMenu(type, data)"
            />
            <view class="waybill-card-bottom-right">
              <view v-for="item in getMenus(data).slice(-3)" :key="item.label" class="waybill-card-bottom-right-btn">
                <ky-button
                  size="small"
                  :open-type="item.openType"
                  :id="item?.id"
                  plain
                  @click.stop="() => chooseMenu(item.type, data)"
                >
                  {{ item.label }}
                </ky-button>
                <view
                  :class="['waybill-card-button-tips', isExpiredDisabled(item.type, data)]"
                  v-if="isExpired(item.type, data)"
                >
                  <text class="waybill-card-button-tips-txt">{{ isExpired(item.type, data) }}</text>
                </view>
              </view>
            </view>
          </view>
          <view v-else-if="showCancelOrderBtn(data)" class="waybill-card-bottom" @click.stop>
            <view></view>
            <view class="waybill-card-bottom-right">
              <ky-button size="small" plain @click.stop="() => cancelOrder(data)">取消订单</ky-button>
            </view>
          </view>
        </template>
      </WaybillCard>
    </view>
    <!-- 寄件码弹窗 -->
    <BarcodePopup ref="barcodePopupRef" />

    <!-- 添加、查看展会 -->
    <ExhibitionPop ref="exhibitionPopRef" @updateExhibitionHandle="updateExhibitionHandle" />

    <!-- 运单标签 -->
    <TagPopup
      v-model:show="showTagPopup"
      ref="tagPopupRef"
      :loading="tagSubmitLoading"
      :waybill="tagCurrentWaybill"
      @cancel="showTagPopup = false"
      @confirm="updateTagHandle"
    ></TagPopup>

    <!-- 催取，催派 -->
    <UrgeOverlay
      ref="urgeOverlayRef"
      source="waybill-search-page"
      :waybill-number="tagCurrentWaybill?.waybillNumber"
    ></UrgeOverlay>

    <!-- 联系商务 -->
    <ContactBusiness ref="contactBusinessRef" v-model:show="showBussiness" :phone="userInfo?.phone || ''" />

    <!-- 分享 -->
    <!-- <ShareWaybill v-model:show="showShareWaybill" /> -->

    <!-- 导出提示 -->
    <SuspendedBlock :items="suspendedList" @close="closeSuspended" @goRecord="goRecord" />

    <!-- 司机评价 -->
    <EvaluationPopup ref="evaluationPopupRef" />
  </view>
</template>

<script setup lang="ts">
import './waybill-list.scss'

import Taro, { navigateTo, useDidHide, useDidShow } from '@tarojs/taro'
import { ref, onUnmounted, onMounted } from 'vue'

import KyImage from '@public/components/base/ky-image/index.vue'
import WaybillCard from '@public/components/business/waybill-card/index.vue'
import WaybillSearchHeader from '@/modules/waybill-build/components/waybill-search/components/waybill-search-header/index.vue'
import BarcodePopup from '@/modules/waybill-build/components/waybill-search/components/barcode-popup/index.vue'
import EvaluationPopup from '@/modules/waybill-build/components/waybill-search/components/evaluation-popup/index.vue'
import ExhibitionPop from '@public/components/business/exhibition-pop/index.vue'
import {
  updateTag,
  getMobileExportStatus,
  getPhotoFlag,
  globalCancelOrder,
} from '@/modules/waybill-build/apis/waybill-search/index'
import {
  setSelfSign,
  pickupOrderDelete,
  queryWarehousingPrice,
  newBatchUpdateClearanceStorage,
} from '@/modules/waybill-build/apis/waybill-route/index'
import { getPrintTraceToken } from '@/modules/waybill-build/apis/batch-print/index'
import type { ISearchWeb } from '@/modules/waybill-build/apis/waybill-search/types'
import { getFallbackINvoiceUrl } from '@/modules/waybill-build/constants/invoice'
import { getBaseUrl, getInternationalDetailUrl } from '@/modules/waybill-build/constants/externalLink'
import { openURL } from '@modules/webview/utils'
import TagPopup from '@/modules/waybill-build/components/waybill-search/components/tag-popup/index.vue'
import UrgeOverlay from '@public/components/business/urge-overlay/index.vue'
import { handleUrgeDelivery } from '@/modules/waybill-build/hooks/urgeDispatch'
import ContactBusiness from '@public/components/business/contact-business/index.vue'
import { getUserInfoStorage } from '@/public/storage/user'
import { onStorageTokenChange, offStorageTokenChange } from '@public/storage'
import { showDialog } from '@kye-netc/kye-miniui'
// import ShareWaybill from '@public/components/business/share-waybill/index.vue'
import { getToken } from '@public/storage'
import kyeNavigate from '@public/utils/native/navigate'

import SuspendedBlock from '@/modules/waybill-build/components/waybill-search/components/suspended-block/index.vue'
import { suspendedConfigMap } from '@/modules/waybill-build/constants/suspended'
import { CHANNEL } from '@/modules/waybill-build/constants/channel'
import { WAYBILL_TYPE } from '@/modules/waybill-build/constants/waybillSearch'
import { useCustomerCodeEvent } from '@public/storage/hooks/useCustomerCodeEvent'

import { useSearchContext } from '../../context'
import { getNotifyReceiveShare, notifyReceiveShareWaybill } from '@/public/hooks/useNotifyReceiveShare'
import { getEnvConfig, isWeixinAppSync } from '@/public/config'
import { isH5FSEnv, isPcFSEnv, isWechatEnv, report_CLK_event, report_EXP_event, getDeleteSource } from '@/public/utils'
import { convertHtml } from '@/public/utils/createTagConverter'
// 判断当前是否是微信的环境
const isALIPAY: boolean = Taro.getEnv() === Taro.ENV_TYPE.ALIPAY

const { state } = useSearchContext()
/* 客户编码code-变更事件*/
const { onRefGlobalDataCustomerCodeChange, offRefGlobalDataCustomerCodeChange } = useCustomerCodeEvent()

const emits = defineEmits(['refresh'])

const handleWaybillCardTap = (params: any) => {
  const waybillNumber = params.waybill?.baseInfo?.waybillNumber || ''
  const orderNumber = params.waybill?.baseInfo?.orderNumber || ''
  const vehicleToken = params.otherInfo?.vehicleToken || ''

  report_CLK_event('clk_home_search_card_v1', {
    event_code: 'clk_home_search_card_v1',
    page_code: 'page_home_head_v1',
    region_code: 'search_bar',
    event_name: '主页_首页搜索栏搜索结果_卡片_点击',
    region_name: '搜索栏',
    search_card: '运单',
    waybill_number: waybillNumber,
    work_id: state.workId,
  })

  // 跳转整车详情
  if (vehicleToken) {
    const { isProd } = getEnvConfig()
    let link = ''
    if (isProd) {
      link = 'https://vts-public-h5.kyslb.com/vts-zc-h5/#/pages/sub-order/detail/index'
    } else {
      link = 'https://vts-uat-public-h5.kyslb.com/vts-zc-h5/#/pages/sub-order/detail/index'
    }
    link += `?vehicleToken=${vehicleToken}&actionType=routerReplace&waybillNumber=${waybillNumber}`
    if (orderNumber) {
      link += `&demandOrderCode=${orderNumber}`
    }
    openURL(link, {
      needLogin: true,
    })
    return
  }

  if (+params.waybill.baseInfo.waybillBusinessRange === WAYBILL_TYPE.国际件) {
    const link = getInternationalDetailUrl()
    openURL(`${link}/#/waybill-details?waybillNo=${waybillNumber}`, { needLogin: true })
    return
  }

  if (+params.waybill.baseInfo.waybillStatus === 40) {
    navigateTo({
      url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${waybillNumber}&fromExternal=0`,
    })
    return
  }
  navigateTo({
    url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${waybillNumber}&orderNumber=${
      waybillNumber ? '' : orderNumber
    }&fromExternal=0`,
  })
}

function formateQueryParams(query: object): string {
  return Object.keys(query)
    .map((key) => `${key}=${query[key] === undefined ? null : query[key]}`)
    .join('&')
}

const noLogin = ref<boolean>(!getToken())
const waybillSearchHeaderRef = ref<InstanceType<typeof WaybillSearchHeader>>()
const waybillSearchListRef = ref<any>(null)
const barcodePopupRef = ref<InstanceType<typeof BarcodePopup>>()
const exhibitionPopRef = ref<InstanceType<typeof ExhibitionPop>>()
const evaluationPopupRef = ref<InstanceType<typeof EvaluationPopup>>()

/** 打开寄件码弹窗 */
const openBarCode = (waybillNumber: string) => {
  barcodePopupRef.value?.openPopup(waybillNumber)
}

/** 打开客服弹窗 */
const openCustomerService = (params: string) => {
  console.log('打开客服弹窗', params)
  let waybillNumber = params?.waybill?.baseInfo?.waybillNumber
  // Taro.navigateTo({ url: `/modules/webview/pages/online-service/index?paramsNum=${waybillNumber}&type=reminder` })
  Taro.navigateTo({ url: `/modules/webview/pages/online-service/index?paramsNum=${waybillNumber}&type=''` })
}

/** 菜单原数据 */
const MENU_LIST = [
  {
    label: '去支付',
    icon: '',
    type: 'canNeedPay',
    fn: (v) => handleGoPay(v),
    show: () => !isH5FSEnv,
  },
  { label: '催取', icon: '', type: 'canTake', fn: (v) => handleUrgePickUpPackage(v) },
  {
    label: '催派',
    icon: '',
    type: 'canExpediting',
    fn: (v) => handleUrgeDeliveryPackage(v),
  },
  {
    label: '修改运单',
    icon: '',
    type: 'canModify',
    show: ({ extra, showStatus }) => showStatus && !extra?.isWaitPickupAndNotLimit,
    fn: (v) => handleModifyWaybill(v),
  },
  {
    label: '恢复下单',
    icon: '',
    type: 'canModify',
    show: ({ extra, showStatus }) => showStatus && !!extra?.isWaitPickupAndNotLimit,
    fn: (v) => handleResumeWaybill(v),
  },
  {
    label: '添加展会',
    icon: '',
    type: 'pickupExhibition',
    show: ({ operateStatus, extra }) => {
      return +operateStatus === 2 && !extra.pickupExhibitionHallNumber
    },
    fn: (v) => handleAddExhibition(v, true),
  },
  {
    label: '查看展会',
    icon: '',
    type: 'pickupExhibition',
    show: ({ operateStatus, extra }) => {
      return (+operateStatus === 2 && extra.pickupExhibitionHallNumber) || +operateStatus === 1
    },
    fn: (v) => handleAddExhibition(v, false),
  },

  {
    label: '取货评价',
    icon: '',
    type: 'addDeliveryScoreFlag',
    fn: (v) => handlePickUpEvaluation(v, 'add'),
  },
  {
    label: '派货评价',
    icon: '',
    type: 'addPickupScoreFlag',
    fn: (v) => handleUrgeDeliveryEvaluate(v, 'add'),
  },
  {
    label: '签收确认',
    icon: '',
    type: 'signReceiptConfirm',
    fn: (v) => handleSignForConfirmation(v),
  },

  {
    label: '查看取货评价',
    icon: '',
    type: 'viewDeliveryScoreFlag',
    fn: (v) => viewEvaluation(v, '0'),
  },
  {
    label: '修改取货评价',
    icon: '',
    type: 'modifyDeliveryScoreFlag',
    fn: (v) => handlePickUpEvaluation(v, 'modify'),
  },

  {
    label: '查看派货评价',
    icon: '',
    type: 'viewPickupScoreFlag',
    fn: (v) => viewEvaluation(v, '1'),
  },
  {
    label: '修改派货评价',
    icon: '',
    type: 'modifyPickupScoreFlag',
    fn: (v) => handleUrgeDeliveryEvaluate(v, 'modify'),
  },

  {
    label: '通知收件人',
    icon: '',
    type: 'notice',
    openType: 'share',
    id: 'notify_recipient',
    show: ({ isALIPAY }) => !(isALIPAY || isH5FSEnv || isPcFSEnv),
    fn: (v) => handleNotifyReceiver(v),
  },
  { label: '取消运单', icon: '', type: 'canCancel', fn: (v) => handleCancelWaybill(v) },
  {
    label: '运单标签',
    icon: '',
    type: 'showLabelFlag',
    fn: (v) => handleWaybillLabel(v),
  },
  {
    label: '再来一单',
    icon: '',
    type: 'canAnotherOrder',
    fn: (v) => handleAnotherWaybill(v),
  },
  {
    label: '打印面单',
    icon: '',
    type: 'canPrint',
    show: ({ isALIPAY }) => !(isALIPAY || isH5FSEnv),
    fn: (v) => handlePrintWaybill(v),
  },
  {
    label: '派货照片',
    icon: '',
    type: 'canShowDispatchPhoto',
    fn: (v) => handleDeliveryPhotos(v),
  },
]

const getMenus = (params: ISearchWeb) => {
  const { functionInfo } = params
  const result = MENU_LIST.filter((v) => {
    if (v?.show) {
      return v?.show?.({ ...functionInfo[v.type], isALIPAY })
    } else {
      return functionInfo[v.type]?.showStatus
    }
  })
  return result.reverse()
}

// 待揽件，解除管控相关按钮
const getRelieveButtons = (params: ISearchWeb) => {
  const data = getMenus(params)
  const list = data.filter((v) => v.type === 'canModify' || v.type === 'canCancel')
  // 如果是订单 则调用取消订单接口
  if (!data?.waybill?.baseInfo?.waybillNumber) {
    const obj = list.find((v) => v.type === 'canCancel')
    if (obj) {
      obj.label = '取消订单'
      obj.fn = (data) => cancelOrder(data)
    }
  }
  return list
}

/**
 * 是否显示取消订单按钮
 */
const showCancelOrderBtn = (params: ISearchWeb) => {
  const { functionInfo } = params || {}
  return functionInfo.canCancel?.showStatus
}

/**
 * 是否显示客服按钮
 */
const getCustomerBtn = (params: ISearchWeb) => {
  const { functionInfo } = params || {}
  return functionInfo.hasCustomerService?.showStatus && !isALIPAY && !isH5FSEnv && !isPcFSEnv
}

/**
 * 是否显示寄件码按钮
 */
const getBarCodeBtn = (params: ISearchWeb) => {
  const { functionInfo } = params || {}
  return functionInfo.hasDeliveryCode?.showStatus
}

/** 选择更多菜单 */
const chooseMenu = (type: string, params: ISearchWeb) => {
  console.log('chooseMenu', type, params)
  const currentMenu = getMenus(params).filter((v) => v.type === type)?.[0]
  console.log('🚀 ~ chooseMenu ~ currentMenu:', currentMenu)
  console.log(currentMenu.fn)
  currentMenu?.fn?.(params)
}

/** 取消运单 */
const handleCancelWaybill = (params: any) => {
  const { waybillNumber, projectName, configId, configVersion, waybillBusinessRange } = params?.waybill?.baseInfo

  // 国际件
  if (waybillBusinessRange === WAYBILL_TYPE.国际件) {
    return cancelInternationalWaybill(waybillNumber)
  }

  let parameter = `waybillNumber=${waybillNumber}&projectName=${projectName}&routeFrom=waybill-search&configId=${
    configId || ''
  }&configVersion=${configVersion || ''}`
  navigateTo({
    url: `/modules/waybill-build/pages/waybill-cancel/index?${parameter}`,
    fail() {
      // 子项目单独启动时的兜底
      navigateTo({
        url: `@/modules/waybill-build/pages/waybill-cancel/index?${parameter}`,
      })
    },
  })
}

const cancelInternationalWaybill = (waybillNumber) => {
  showDialog({
    parentClassName: 'waybill-search-page',
    zIndex: 1000,
    title: '温馨提示',
    message: `确认取消运单吗？`,
    cancelButtonText: '取消',
    confirmButtonText: '确认',
    showCancelButton: true,
  })
    .then(async () => {
      await globalCancelOrder({
        cancelType: '10',
        cancelSource: '430',
        waybillNumber: waybillNumber,
      })
      setTimeout(() => {
        Taro.showToast({
          title: '取消成功',
          icon: 'none',
        })
        // 通知刷新查件页
        waybillSearchListRef.value?.init()
      }, 2000)
    })
    .catch((err) => {
      if (err && err.code) {
        Taro.showToast({
          title: '暂不可取消，请联系商务',
          icon: 'none',
        })
      }
    })
}

/** 添加展会 */
const handleAddExhibition = (params: ISearchWeb, canEdit: boolean) => {
  console.log('添加展会', params, params.waybill.baseInfo.waybillNumber)
  exhibitionPopRef.value?.openDialog({
    waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
    ...params.functionInfo?.pickupExhibition?.extra,
    canEdit,
  })
}

/** 签收确认 */
const handleSignForConfirmation = (params: any) => {
  console.log('签收确认', params)
  showDialog({
    parentClassName: 'waybill-search-page',
    zIndex: 1000,
    title: '温馨提示',
    message: `为了保障您的权益，请收到商品(${params?.waybill?.baseInfo?.waybillNumber})确认无误后再确认收货`,
    cancelButtonText: '未收到货',
    confirmButtonText: '确认收货',
    showCancelButton: true,
  })
    .then(async () => {
      await setSelfSign({
        waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
        confirmSign: 10,
      })
        .then(() => {
          Taro.showToast({ title: '确认签收，运输已完成', icon: 'none' })
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch(async () => {
      await setSelfSign({
        waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
        confirmSign: 20,
      })
        .then(() => {
          Taro.showToast({ title: '已收到您的反馈，请耐心等待', icon: 'none' })
        })
        .catch((err) => {
          console.log(err)
        })
    })
}

/** 派货照片 */
const handleDeliveryPhotos = (params: any) => {
  console.log('派货照片', params)
  Taro.showLoading({ mask: true, title: '加载中' })
  getPhotoFlag({ waybillNumbers: [params?.waybill?.baseInfo?.waybillNumber] })
    .then((res) => {
      Taro.hideLoading()
      if (+res.data?.[0].dispatchPhotoFlag === 10) {
        navigateTo({
          url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${params?.waybill?.baseInfo?.waybillNumber}&openType=deliveryPicture`,
        })
      } else {
        Taro.showToast({
          title: '当前运单无派货照片',
          icon: 'none',
        })
      }
    })
    .catch(() => {
      Taro.hideLoading()
    })
}

/** 再来一单 */
const handleAnotherWaybill = (params: any) => {
  console.log('再来一单', params, CHANNEL)
  kyeNavigate.navigateBefore('navigateTo', {
    url: `/modules/order-build/pages/order/index?waybillNo=${params?.waybill?.baseInfo?.waybillNumber}&channel=${CHANNEL.AGAIN}`,
  })
}

const showTagPopup = ref(false)
const tagSubmitLoading = ref(false)
const tagCurrentWaybill = ref({})
/** 运单标签 */
const handleWaybillLabel = (params: any) => {
  console.log('运单标签', params)
  tagCurrentWaybill.value = {
    ...params?.waybill?.baseInfo,
    showLabel: params?.functionInfo?.showLabelFlag || '',
  }
  showTagPopup.value = true
}

/**货好时间更改 */
const handleApplyStatus = (params: any) => {
  console.log('更改货好时间：', params, getBaseUrl())
  // const webViewUrl = `${getBaseUrl()}/change-feedback-new-version-one.html#/goods-home?batchNo=${}`
}

const updateTagHandle = async (item: any) => {
  tagSubmitLoading.value = true
  const { waybillNumber, showLabel, orderNumber } = item
  try {
    await updateTag({
      waybillNumber,
      label: showLabel,
    })
    showTagPopup.value = false
    Taro.showToast({
      title: '保存成功',
      icon: 'none',
    })
    // 更新数组某一项
    // emit('updateItem', item)
    const obj = ((waybillSearchListRef.value && waybillSearchListRef.value.allData) || state.search.waybill).find(
      (v) => {
        const { waybill } = v || {}
        const { baseInfo } = waybill || {}
        return (
          (waybillNumber && baseInfo?.waybillNumber === waybillNumber) ||
          (orderNumber && baseInfo.orderNumber === orderNumber)
        )
      },
    )
    if (obj) {
      obj.functionInfo.showLabelFlag.showText = showLabel
    }
  } finally {
    tagSubmitLoading.value = false
  }
}

const getPrintTraceId = (waybillNumberList: string[]) =>
  new Promise((resolve, reject) => {
    getPrintTraceToken({ clientType: '20', waybillNumberList })
      .then((res) => {
        resolve(res.data)
      })
      .catch(() => {
        reject(null)
      })
  })

/** 打印面单 */
const handlePrintWaybill = async (params: any) => {
  const baseInfo = params?.waybill?.baseInfo
  const printTraceId = await getPrintTraceId([baseInfo.waybillNumber])
  if (!printTraceId) return

  Taro.navigateTo({
    url: `/modules/order-build-sub-pages/pages/print/index?printTraceId=${printTraceId}&waybillNumber=${baseInfo.waybillNumber}&printSource=waybill-search`,
  })

  // Taro.navigateTo({
  //   url: `/modules/order-build/pages/print/index?printTraceId=${printTraceId}&waybillNumber=${baseInfo.waybillNumber}&printSource=waybill-search`,
  // })
  console.log('打印面单', params)
}

/** 通知收件人 */
// const showShareWaybill = ref(false)
const handleNotifyReceiver = (params: any) => {
  console.log('isWeixinAppSync >> >>>> ', isWeixinAppSync())
  // if (!isWeixinAppSync()) {
  //   showShareWaybill.value = true
  //   return
  // }
  const env = process.env.TARO_APP_ENV
  const BASE_URL = {
    PROD: 'https://ic-h5.kye-erp.com',
    DEV: 'https://ic-h5-uat.kye-erp.com',
  }

  const getBaseUrl = () => (env === 'prod' ? BASE_URL.PROD : BASE_URL.DEV)

  const onlineH5Url = `${getBaseUrl()}/h5-offline/netc-h5-order-offline/#`

  // showShareWaybill.value = true
  // 微信小程序走useShareAppMessage分享
  if (isWechatEnv) {
    notifyReceiveShareWaybill.value = params?.waybill?.baseInfo.waybillNumber
    return
  }

  getNotifyReceiveShare({
    waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
    onlineH5Url: onlineH5Url,
  })
}

/** 修改运单 */
const handleModifyWaybill = (params: any) => {
  console.log('修改运单', params)
  const baseInfo = params.waybill?.baseInfo || {}
  const query = {
    type: 'edit',
    waybillNo: baseInfo.waybillNumber,
    orderNo: baseInfo.orderNumber,
    sourcePage: 'waybillRoute',
    sourceAction: 'editOrder',
    channel: CHANNEL.EDIT,
    configId: baseInfo.configId,
    configVersion: baseInfo.configVersion,
  }
  kyeNavigate.navigateBefore('navigateTo', {
    url: `/modules/order-build/pages/order/index?${formateQueryParams(query)}`,
  })
}

/** 恢复下单 */
const handleResumeWaybill = (params: any) => {
  console.log('恢复下单', params)
  const baseInfo = params.waybill?.baseInfo || {}
  const query = {
    type: 'edit',
    waybillNo: baseInfo.waybillNumber,
    orderNo: baseInfo.orderNumber,
    sourcePage: 'waybillRoute',
    sourceAction: 'recoverOrder',
    channel: CHANNEL.EDIT,
    configId: baseInfo.configId,
    configVersion: baseInfo.configVersion,
  }
  kyeNavigate.navigateBefore('navigateTo', {
    url: `/modules/order-build/pages/order/index?${formateQueryParams(query)}`,
  })
}

const urgeOverlayRef = ref()
/** 催取 */
const handleUrgePickUpPackage = (params: any) => {
  console.log('催取', params)
  const data = {
    waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
    remindType: '10',
  }
  urgeOverlayRef.value.openPopup(data)
}

/** 催派 */
const handleUrgeDeliveryPackage = async (params: any) => {
  console.log('催派', params)
  const data = {
    waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
    remindType: '20',
  }
  const { waybillNumber } = params?.waybill?.baseInfo
  const { deliveryControlType } = params?.otherInfo
  if (deliveryControlType === 140 || deliveryControlType === 150) {
    const text = deliveryControlType === 140 ? '发运' : '派送'
    showDialog({
      parentClassName: 'common-search-page',
      zIndex: 1000,
      title: '温馨提示',
      message: `因运单发起【等通知${text}】，若需要催派，请先恢复${text}`,
      confirmButtonText: '我知道了',
      showCancelButton: false,
    })
  } else {
    const res = await handleUrgeDelivery({ handleBusinessContact, source: 'common-search-page' }, waybillNumber)
    res && urgeOverlayRef.value.openPopup(data)
  }
  return
}

/** 去支付 */
const handleGoPay = (params: any) => {
  console.log('去支付', params)
  let url = params?.functionInfo?.canNeedPay?.showText
  const waybillNo = params?.waybill?.baseInfo.waybillNumber || params?.waybill?.baseInfo.orderNumber
  if (url) {
    const hasSearch = new URL(url).search
    url = `${url}${hasSearch ? '&' : '?'}waybillNo=${waybillNo}`
    return openURL(url, { needLogin: true })
  }

  openURL(`${getFallbackINvoiceUrl()}?waybillNo=${params?.waybill?.baseInfo.waybillNumber}`, { needLogin: true })
}

/** 查看取货评价/派货评价 */
const viewEvaluation = (params: any, type: '0' | '1') => {
  evaluationPopupRef.value?.openPopup?.({
    orderNumber: params?.waybill?.baseInfo.orderNumber,
    waybillNumber: params?.waybill?.baseInfo.waybillNumber,
    type,
  })
}

/** 取货评价 */
const handlePickUpEvaluation = (params: any, flag: string) => {
  console.log('取货评价', params)
  const queryParams = {
    flag,
    waybillNo: params?.waybill?.baseInfo?.waybillNumber,
    orderNo: params?.waybill?.baseInfo?.orderNumber,
    scoreType: '0',
  }
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  openURL(`/h5-offline/netc-h5-order-offline/#/evaluation-driver-list?${queryString}`, {
    needLogin: true,
  })
}

/** 派货评价 */
const handleUrgeDeliveryEvaluate = (params: any, flag: string) => {
  console.log('派货评价', params)
  const queryParams = {
    flag,
    waybillNo: params?.waybill?.baseInfo?.waybillNumber,
    orderNo: params?.waybill?.baseInfo?.orderNumber,
    scoreType: '1',
  }
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  openURL(`/h5-offline/netc-h5-order-offline/#/evaluation-driver-list?${queryString}`, {
    needLogin: true,
  })
}

const updateExhibitionHandle = () => {
  //
}

/** 取消订单 */
const cancelOrder = (params: any) => {
  showDialog({
    parentClassName: 'waybill-search-page',
    zIndex: 1000,
    title: '温馨提示',
    message: `您确定要取消该订单吗？`,
    cancelButtonText: '狠心取消',
    confirmButtonText: '我再想想',
    showCancelButton: true,
    cancle: () => {
      Taro.showLoading({ mask: true, title: '加载中' })
      pickupOrderDelete({
        orderNumber: params?.waybill?.baseInfo?.orderNumber,
        operateSource: getDeleteSource(),
      })
        .then((res) => {
          // 没走这里，先注释
          // setTimeout(() => {
          Taro.showToast({
            title: '取消成功',
            icon: 'none',
          })
          // 通知刷新查件页
          //   console.log('waybillSearchListRef.value >>> ', waybillSearchListRef.value)
          //   waybillSearchListRef.value?.init()
          // }, 2000)
        })
        .finally(() => {
          Taro.hideLoading()
          emits('refresh', params?.waybill?.baseInfo?.orderNumber)
        })
    },
  })
}

const showBussiness = ref(false)
const userInfo = getUserInfoStorage()
const handleBusinessContact = () => {
  showBussiness.value = true
}

const suspendedList = ref([])
const isPolling = ref(true) // 是否轮询
const taskTimerMap = ref(new Map())
const pollingTime = ref(1000) // 轮询延迟时间
// 成功弹框点击确认
const handleSuccessDialog = () => {
  const exportSuccessParams = Taro.getApp().exportSuccessParams
  const taskId = exportSuccessParams?.taskId
  const exportType = exportSuccessParams?.taskId
  if (suspendedList.value.length < 5 && taskId && exportType !== 2) {
    isPolling.value = true
    pollingGetUnDownTask(taskId)
  }
}

const pollingGetUnDownTask = (id: string) => {
  if (!isPolling.value) return
  getMobileExportStatus({
    id,
  }).then(async (res) => {
    if (res.code === 0) {
      const status = res.data?.exportStatus
      const taskId = res.data?.id

      if (!status) return

      const targetItem = suspendedConfigMap[status]

      // 更新导出数组状态
      if (targetItem) {
        const newItem = { ...targetItem, id }
        const existingIndex = suspendedList.value.findIndex((ele) => ele.id === id)

        existingIndex > -1
          ? suspendedList.value.splice(existingIndex, 1, newItem)
          : suspendedList.value.unshift(newItem)
      }

      if (status !== -1) return
      // 清理当前任务的历史定时器（可选）
      if (taskTimerMap.value.has(taskId)) {
        clearTimeout(taskTimerMap.value.get(taskId))
      }

      // 启动新轮询并记录定时器 ID
      const timerId = setTimeout(() => {
        pollingGetUnDownTask(taskId)
      }, pollingTime.value)

      taskTimerMap.value.set(taskId, timerId)
    }
  })
}

const closeSuspended = (item) => {
  suspendedList.value = suspendedList.value.filter((ele) => ele.id !== item.id)
}

const goRecord = (item) => {
  navigateTo({
    url: `/modules/waybill-build/pages/export-record/index?taskId=${item.id}`,
    fail() {
      // 子项目单独启动时的兜底逻辑
      navigateTo({ url: `@/modules/waybill-build/pages/export-record/index` })
    },
  })
}

const clearPolling = () => {
  isPolling.value = false
  suspendedList.value = []
}

const handlerMessage = (tips, tipsH5, value) => {
  const str = tipsH5 || tips
  if (!str) return
  return str.replace(new RegExp(`(${value})`, 'ig'), "<span class='high-amount'>$1</span>")
}
const updateClearanceStorage = (type: string, waybillStatus, waybillNumber, endTitleType?: string) => {
  const params: any = {
    waybillStatus: waybillStatus,
    wareHouseStatus: [
      {
        adjustPriceFlag: '10',
        clearanceStorageFlag: type,
        waybillNumber: waybillNumber,
      },
    ],
    sourceId: 10, //请求来源 10 列表 20 路由
  }
  if (endTitleType) {
    params.pickupAdjustTitleTypeTag = endTitleType
  }
  newBatchUpdateClearanceStorage(params).then(() => {
    if (type === '10') {
      // showLimitRemindConfirmBar.value = false
    }
  })
}
/**
 * 确认横条，点击
 * isNeedPop: 刚进页面调用传true，否则为false
 */
const onConfirmBarClick = async (params: any) => {
  try {
    const { data } = await queryWarehousingPrice({
      waybillNumber: params?.waybill?.baseInfo?.waybillNumber,
      requestSource: 10, //请求来源 10 列表 20 路由
    })

    /**
     * totalAmount 报关手续费
     * excTotalAmount 异常操作费
     */
    const { totalAmount, excTotalAmount } = data || {}
    if (!totalAmount) {
      // TODO: 异常提示
      return
    }

    let message = ''
    // 报关提醒
    const str1 = handlerMessage(data?.fenceTips, data?.fenceTipsText, data?.totalAmount)
    const str2 = handlerMessage(data?.excTips, data?.excTipsText, data?.excTotalAmount)
    message = `<div class="tips ql-editor"><div class="content">${str1}</div></div><div class="tips ql-editor"><div class="content">${str2}</div></div>`
    const endTips = data?.endCalculateTipsH5?.trim()
    if (endTips) {
      message += `<div class="calculate-tips-block"><rich-text>${convertHtml(endTips)}</rich-text></div>`
    }
    showDialog({
      parentClassName: 'common-search-page',
      zIndex: 1000,
      title: '收费提示',
      message,
      cancelButtonText: '不同意',
      confirmButtonText: '同意',
      showCancelButton: true,
    })
      .then(() => {
        updateClearanceStorage(
          '10',
          params?.waybill?.baseInfo?.waybillStatus,
          params?.waybill?.baseInfo?.waybillNumber,
          data?.endTitleType,
        )
      })
      .catch(() => {
        updateClearanceStorage(
          '20',
          params?.waybill?.baseInfo?.waybillStatus,
          params?.waybill?.baseInfo?.waybillNumber,
          data?.endTitleType,
        )
      })
  } catch (error) {
    console.log('err', error)
    if (error.code === 80013) {
      // showLimitRemindConfirmBar.value = false
    }
  }
}

const isExpired = (type: string, data: any) => {
  // 派货
  if (type && type === 'addPickupScoreFlag') {
    return data?.functionInfo?.addPickupScoreFlag?.showText || ''
  }
  // 取货
  if (type && type === 'addDeliveryScoreFlag') {
    return data?.functionInfo?.addDeliveryScoreFlag?.showText || ''
  }
}

const isExpiredDisabled = (type: string, data: any) => {
  // 派货
  if (type && type === 'addPickupScoreFlag') {
    return data?.functionInfo?.addPickupScoreFlag?.operateStatus === 2 ? 'disabled' : ''
  }
  // 取货
  if (type && type === 'addDeliveryScoreFlag') {
    return data?.functionInfo?.addDeliveryScoreFlag?.operateStatus === 2 ? 'disabled' : ''
  }
}

const handleCustomerCodeChange = (data) => {
  waybillSearchListRef.value?.init()
}

useDidHide(() => {
  clearPolling()
})

onMounted(() => {
  console.log('onActivated')
  report_EXP_event('exp_home_search_card_display_v1', {
    page_code: 'page_home_head_v1',
    event_code: 'exp_home_search_card_display_v1',
    region_code: 'search_bar',
    event_name: '主页_首页搜索栏搜索结果_卡片_展示',
    region_name: '搜索栏',
    search_card: '运单',
    work_id: state.workId,
  })
  const exportSuccessParams = Taro.getApp().exportSuccessParams
  const taskId = exportSuccessParams?.taskId
  if (taskId) {
    handleSuccessDialog()
  }
  onStorageTokenChange((data) => {
    console.log('onActivated', data)
    noLogin.value = !data.value
    // token变化需要重新刷新数据
    waybillSearchListRef.value?.init()
    waybillSearchHeaderRef.value?.handleShowExportDrawer(false)
  })
  onRefGlobalDataCustomerCodeChange(handleCustomerCodeChange)
})

onUnmounted(() => {
  offStorageTokenChange()
  offRefGlobalDataCustomerCodeChange(handleCustomerCodeChange)
})

useDidShow(() => {
  const isCancelWaybill = Taro.getApp().isCancelWaybill
  if (isCancelWaybill) {
    waybillSearchListRef.value?.init()
    Taro.getApp().isCancelWaybill = null
  }
})
</script>
