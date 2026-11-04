<template>
  <view
    id="exp-home-waybill"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_latest_waybill_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'waybill_todo_list',
      },
    }"
  >
    <view v-if="newestWaybillInfo">
      <view class="waybill-item" @tap="handleNavigateToDetail">
        <view class="waybill-item__header">
          <text @tap.stop="handleCopyText" class="waybill-item__header__order">
            {{ newestWaybillInfo.waybillNumber || '--' }}
          </text>
          <ky-lazy-image
            :delay="500"
            v-if="newestWaybillInfo.waybillNumber"
            @tap.stop="handleCopyText"
            class="waybill-item__header__copy"
            src="https://ic-img.ky-express.com/netc/20250707_29173_!!1751854611555_56_56.png"
            mode="aspectFit"
          />
          <view v-if="Number(newestWaybillInfo?.hasSelfMention) === 1" className="waybill-card__title--tag">
            网点自提
          </view>
          <view class="waybill-item__header__right" @tap.stop="$emit('show-barcode', newestWaybillInfo.waybillNumber)">
            <ky-lazy-image
              :delay="500"
              mode="aspectFit"
              src="https://ic-img.ky-express.com/netc/20250707_96938_!!1751859135881_48_48.png"
            />
            <text>寄件码</text>
          </view>
        </view>
        <view class="waybill-item__content">
          <view
            class="waybill-item__tips"
            v-if="newestWaybillInfo.storageFeeStatus === 10 || newestWaybillInfo.storageFeeStatus === 20"
          >
            {{ newestWaybillInfo.storageFeeStatus === 20 ? '即将产生货物保管费' : '已产生货物保管费' }}
          </view>
          <view class="waybill-item__info">
            <view class="waybill-item__info__customer">
              <text>{{ newestWaybillInfo.deliveryCity || '' }}</text>
              <text>{{ newestWaybillInfo.deliveryPerson || '' }}</text>
              <text>{{ newestWaybillInfo.deliveryCustomerName || '' }}</text>
            </view>
            <view class="waybill-item__info__type">
              <view
                :style="{
                  color: Number(newestWaybillInfo?.newExteriorRouteInfo?.routeStep) === 70 ? '#ff706d' : 'inherit',
                }"
              >
                {{ statusField.status || (Number(newestWaybillInfo?.waybillStatus) === 20 ? '待揽件' : '') }}
              </view>
              <ky-lazy-image
                :delay="500"
                :src="statusField.img || 'https://ic-img.ky-express.com/netc/20250707_57522_!!1751859388938_276_24.png'"
                mode="aspectFit"
              />
              <view>{{ newestWaybillInfo.serviceModeDesc || '-' }}</view>
            </view>
            <view class="waybill-item__info__customer">
              <text>{{ newestWaybillInfo.pickupCity || '' }}</text>
              <text>{{ newestWaybillInfo.pickupPerson || '' }}</text>
              <text>{{ newestWaybillInfo.pickupCustomerName || '' }}</text>
            </view>
          </view>
          <view class="waybill-item__content-form">
            <view class="waybill-item__content-form__item" v-if="statusField.text">
              <text>{{ statusField.text }}：</text>
              <text>{{ statusField.routeDescription || '--' }}</text>
            </view>
            <view class="waybill-item__content-form__item">
              <text>{{ datetimeField.text }}：</text>
              <view>
                {{ formatterDateTime(datetimeField.time) || '--' }}
                <ky-tag
                  v-if="newestWaybillInfo.goodsTimeChangeFlag"
                  border-color="#7DE3B7"
                  text-color="#00C58C"
                  style="background-color: #f0fff7"
                >
                  已改货好时间
                </ky-tag>
                <ky-tag
                  v-if="Number(newestWaybillInfo.printStatus) === 10"
                  border-color="#7DE3B7"
                  text-color="#00C58C"
                  style="background-color: #f0fff7"
                >
                  已打印
                </ky-tag>
              </view>
            </view>
            <view class="waybill-item__content-form__item" v-if="newestWaybillInfo.waybillStatus === 30">
              <text>预计派送时间：</text>
              <view class="mr4">
                {{ finalAging || '--' }}
              </view>
              <ky-tag
                v-if="newestWaybillInfo.finalAgingChangeFlag === '10'"
                size="3"
                bgColor="#f0fff7"
                borderColor="#7DE3B7"
                textColor="#00c58c"
              >
                已改派送时间
              </ky-tag>
            </view>
          </view>
          <view class="waybill-item-stamp-box">
            <ky-lazy-image
              v-if="newestWaybillInfo.clearanceControlFlag"
              :src="STAMP_IMAGE_DIC[newestWaybillInfo?.limitReason!]"
            />
          </view>
          <view v-if="newestWaybillInfo.showPaperwork" class="waybill-card__limit-bar" @tap="handleExpenseComfire">
            <NetcLimitRemindBar :message="newestWaybillInfo?.showPaperwork" :reason="limitRemindBarReaon" />
          </view>
        </view>
      </view>
      <load-more @load-more="handleNavigateToList" />
    </view>

    <view class="waybill-empty-status" v-else>
      <text>暂无运单信息</text>
      <ky-button @tap="handleGoSendPackage" type="primary" size="small">去寄件</ky-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import LoadMore from '../load-more.vue'
import kyeNavigate from '@/public/utils/native/navigate'
import { computed } from 'vue'
import { useHomeStore } from '../../../store'
import { formatterDateTime } from '../formatter'
// @ts-ignore
import { showDialog } from '@kye-netc/kye-miniui'
import { copyText } from '@/public/utils/copy'
import { getWarehousingPrice } from '../../../apis'
import NetcLimitRemindBar from './netc-limit-remind-bar.vue'
import './index.scss'
import { STAMP_IMAGE_DIC } from '@/public/components/business/waybill-card/constant'
import { report_CLK_event, report_wrapper } from '@/public/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import dayjs from 'dayjs'
import { openURL } from '@/modules/webview/utils'
import { getEnvConfig } from '@/public/config'
import { WAYBILL_TYPE } from '@/modules/waybill-build/constants/waybillSearch'
import { getInternationalDetailUrl } from '@/modules/waybill-build/constants/externalLink'

defineOptions({ name: 'todo-list-waybill-item' })

defineProps({ teleportSelector: String, default: () => 'home-page' })

useExposureReport(['exp-home-waybill'])

const store = useHomeStore()

const newestWaybillInfo = computed(() => {
  return store.data.newestWaybillInfo.itemDetail
})

const handleGoSendPackage = () => {
  kyeNavigate.navigateBefore('navigateTo', {
    url: '/modules/order-build/pages/order/index',
  })
}

const handleNavigateToDetail = () => {
  report_CLK_event('clk_homepage_latest_waybill_card', {
    region_code: 'waybill_todo_list',
    page_code: 'page_homepage_v1',
  })
  console.error('newestWaybillInfo.value', newestWaybillInfo.value)
  if (newestWaybillInfo.value?.vehicleToken) {
    const { isProd } = getEnvConfig()
    let link = ''
    if (isProd) {
      link = 'https://vts-public-h5.kyslb.com/vts-zc-h5/#/pages/sub-order/detail/index'
    } else {
      link = 'https://vts-uat-public-h5.kyslb.com/vts-zc-h5/#/pages/sub-order/detail/index'
    }
    link += `?vehicleToken=${newestWaybillInfo.value?.vehicleToken}&actionType=routerReplace&waybillNumber=${newestWaybillInfo.value?.waybillNumber}`
    if (newestWaybillInfo.value?.orderNumber) {
      link += `&demandOrderCode=${newestWaybillInfo.value?.orderNumber}`
    }
    openURL(link, {
      needLogin: true,
    })
    return
  }
  if (+newestWaybillInfo.value?.waybillBusinessRange === WAYBILL_TYPE.国际件) {
    const link = getInternationalDetailUrl()
    openURL(`${link}/#/waybill-details?waybillNo=${newestWaybillInfo.value?.waybillNumber}`, { needLogin: true })
    return
  }
  if (newestWaybillInfo.value?.waybillStatus === 40) {
    return Taro.navigateTo({
      url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${newestWaybillInfo.value?.waybillNumber}&fromExternal=0`,
    })
  }
  Taro.navigateTo({
    url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${newestWaybillInfo.value?.waybillNumber}&fromExternal=0`,
  })
}

const handleNavigateToList = () => {
  report_CLK_event('clk_homepage_latest_waybill_view_more', {
    region_code: 'waybill_todo_list',
    event_code: 'clk_homepage_latest_waybill_view_more',
    page_code: 'page_homepage_v1',
    region_name: '最新运单',
    event_name: '移动端首页_最新运单_查看更多_点击',
  })
  Taro.switchTab({ url: '/layout/pages/waybill/index' })
}

const statusField = computed(() => {
  const result: { status?: string; text?: string; routeDescription?: string; img?: string } = {}

  if (!newestWaybillInfo.value || !newestWaybillInfo.value.newExteriorRouteInfo) return result

  result.status = newestWaybillInfo.value?.newExteriorRouteInfo?.routeStepDesc
  result.text = newestWaybillInfo.value?.newExteriorRouteInfo?.routeStepDesc
  result.routeDescription = newestWaybillInfo.value?.newExteriorRouteInfo?.routeDescription

  switch (Number(newestWaybillInfo.value?.newExteriorRouteInfo?.routeStep)) {
    case 0:
    case 10:
    case 20:
    case 30:
    case 90:
      result.img = 'https://ic-img.ky-express.com/netc/20221024_24751702280_!!1666594467845_207_21.png'
      break
    case 70:
      result.status = '派送异常'
      result.text = '派送中'
      result.img = 'https://ic-img.ky-express.com/netc/20221024_26651702265_!!1666594452088_207_21.png'
      break
    case 80:
      result.status = newestWaybillInfo.value.waybillStatusDesc
      result.text = '签收人'
      result.img = 'https://ic-img.ky-express.com/netc/20221024_6755170220_!!1666594418055_207_21.png'
      result.routeDescription = newestWaybillInfo.value.receiver
      break
    default:
      result.img = 'https://ic-img.ky-express.com/netc/20221024_89051702247_!!1666594380930_207_21.png'
  }
  if (!newestWaybillInfo.value.newExteriorRouteInfo.routeStep) {
    result.img = 'https://ic-img.ky-express.com/netc/20221024_24751702280_!!1666594467845_207_21.png'
  }
  return result
})

const datetimeField = computed(() => {
  let datetime: { text?: string; time?: string | number } = {}

  switch (newestWaybillInfo.value?.waybillStatus) {
    case 20:
      datetime.text = '货好时间'
      datetime.time = newestWaybillInfo.value?.goodsTime
      break
    case 30:
      datetime.text = '寄件时间'
      datetime.time = newestWaybillInfo.value?.deliveryTime
      break
    case 40:
      datetime.text = '签收时间'
      datetime.time = newestWaybillInfo.value?.receiveTime
      break
  }
  return datetime
})

const finalAging = computed(() => {
  if (!newestWaybillInfo.value?.finalAging) return ''
  return formatterDateTime(dayjs(newestWaybillInfo.value?.finalAging).valueOf())
})

/**
 * 横条原因
 * @returns {number|*}
 */
const limitRemindBarReaon = computed(() => {
  const waybill = newestWaybillInfo.value

  if (!waybill) return ''

  if (Number(waybill.showWatermarkType) === 1 || Number(waybill.showWatermarkType) === 111) {
    return 200
  } else if (Number(waybill.showWatermarkType) === 110) {
    return Number(waybill.historyLimitReason) || ''
  } else if (Number(waybill.showWatermarkType) === 20) {
    return 100
  } else if (Number(waybill.showWatermarkType) === 10) {
    return 1010
  } else {
    return Number(waybill.limitReason) || ''
  }
})

const handlerMessage = (tips, tipsH5, value) => {
  const str = tipsH5 || tips
  if (!str) return

  return str.replace(new RegExp(`(${value})`, 'ig'), '##$1##')
}

const handleExpenseComfire = async () => {
  const waybill = newestWaybillInfo.value

  if (!waybill) return

  if (Number(waybill.clearanceControlFlag) !== 10 && Number(waybill.clearanceControlFlag) !== 20) {
    return
  }

  try {
    let { data } = await getWarehousingPrice({
      waybillNumber: waybill.waybillNumber!,
      requestSource: 10, //请求来源 10列表 20路由
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
    // 报关异常
    if (Number(waybill.clearanceControlFlag) === 10) {
      message = `该运单因实际需要报关入仓服务，需缴纳报关入仓服务费<span style="color: #ff706d">${totalAmount}</span>元/票，请确认`
      if (parseFloat(excTotalAmount || '0')) {
        message = `该运单因实际需要报关入仓服务，需缴纳报关入仓服务费<span style="color: #ff706d">${totalAmount}</span>元/票，并额外加收异常操作费<span style="color: #ff706d">${excTotalAmount}</span>元/票，请确认`
      }
    }
    // 报关提醒
    if (Number(waybill.clearanceControlFlag) === 20) {
      const str1 = handlerMessage(data.fenceTips, data.fenceTipsText, data.totalAmount)
      const str2 = handlerMessage(data.excTips, data.excTipsText, data.excTotalAmount)
      message = `<div class='tips ql-editor'><div class='content'>${str1}</div></div><br /><div class='tips ql-editor'><div class='content'>${str2}</div></div>`
    }
    showDialog({
      parentClassName: 'waybill-search-page',
      zIndex: 1000,
      title: '收费提示',
      message,
      cancelButtonText: '不同意',
      confirmButtonText: '同意',
      showCancelButton: true,
    })
  } catch (error) {
    if (error.code === 80013) {
      const clearanceControlFlag = Number(waybill.clearanceControlFlag) === 10 ? 0 : waybill.clearanceControlFlag

      store.updateData({
        newestWaybillInfo: {
          count: 1,
          itemDetail: { ...waybill, showPaperwork: '', clearanceControlFlag },
        },
      })
    }
    Taro.showToast({ icon: 'none', title: error.msg || '服务错误' })
  }
}

const handleCopyText = report_wrapper(
  () => copyText(newestWaybillInfo.value?.waybillNumber),
  ['clk_homepage_latest_waybill_copy_v1', 'CLK', { page_code: 'page_homepage_v1', region_code: 'waybill_todo_list' }],
)
</script>
