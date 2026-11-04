<template>
  <div class="notice" v-if="showMarquee && marqueeData && marqueeData.detailsList && marqueeData.detailsList.length">
    <el-carousel
      class="list"
      indicator-position="none"
      arrow="never"
      direction="vertical"
      :loop="true"
      :interval="3000"
      @change="handleNoticeReport"
    >
      <el-carousel-item
        v-for="(item, index) in marqueeData.detailsList"
        :class="isClientMode ? 'compatibility' : ''"
        :key="index"
      >
        <div class="item">
          <div
            class="content-icon"
            :style="'background-image: url(' + item.advertisementNoticeDto.posterLink + ')'"
          ></div>
          <k-tooltip :offset="8" placement="bottom-start" :content="item.advertisementNoticeDto.noticeText">
            <div class="content" @click="clickNotice(item.advertisementNoticeDto, index)">
              {{ item.advertisementNoticeDto.noticeText }}
            </div>
          </k-tooltip>
          <div class="close">
            <i
              v-if="!!marqueeData.allowClose && item.advertisementNoticeDto.noticeText"
              class="iconfont icon-window-close"
              @click="close"
            ></i>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ADVERTISEMENT_JUMPMODE_ENUM, ADVERTISEMENT_TYPE_ENUM } from './enums'
import { advertisementConfirmByUser, eventReport, getAdvertisementDetails } from '@/views/admin/components/header/api'
import { reportNotice } from './report'
import { isClientMode as isClientModeFn } from '@/native/electron'
import EE, { EE_EVENT } from '@/views/admin/components/header/eventBus'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import { useAdvertisementJump } from '@/hooks/useAdvertisementJump'
import { KTooltip } from '@netc-design-pc/ui'

defineOptions({
  name: 'Notice',
})

/* 广告详情明细 */
interface AdvertisementDetail {
  advertisementCode: string
  pushToStyle?: string | number
  advertisementNoticeDto: AdvertisementNoticeDto
}

/* 广告通知内容 */
interface AdvertisementNoticeDto {
  posterLink?: string
  noticeText?: string
  jumpMode?: number
  modelRoute?: string
  h5Link?: string
  pcH5JumpType?: number | string
  customeParam?: Record<string, any>
}

/* 广告项 */
interface AdvertisementItem {
  advertisementType?: string
  allowClose?: boolean
  detailsList?: AdvertisementDetail[]
}

/** 事件上报参数 */
interface UniqueReportParams {
  adCodes: (string | undefined)[]
  eventType: number
}

// ==================== 组件逻辑 ====================

const { jumpByAdvertisement } = useAdvertisementJump()
const rootStore = usePcWebRootStore()

// 老项目 main.js 全局 mixin 注入 isClientMode(是否在壳里)
const isClientMode = isClientModeFn()

const showMarquee = ref(true)
const advertisement = ref<AdvertisementItem[]>([])

/**
 * 上一次曝光的广告code
 */
const lastReportCodes = ref<string[]>([])

const marqueeData = computed<AdvertisementItem | undefined>(() => {
  return advertisement.value?.find((i) => i.advertisementType === ADVERTISEMENT_TYPE_ENUM.MARQUEE)
})

// 跑马灯接口调用(序号守卫: 丢弃过期响应, 防止旧请求覆盖新数据)
let requestSeq = 0
const getAdvertisement = async () => {
  requestSeq += 1
  const seq = requestSeq
  const detail = await getAdvertisementDetails({
    channelCode: 'pc',
    pageCode: 'pcHomePage',
    adTypeList: ['30'],
    latestUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    operatePort: 'PC',
    operatorSystem: isClientMode ? 'pcClient' : 'pc',
  })
  if (seq !== requestSeq) return
  // advertisement.value = detail.data || []
  advertisement.value = detail.data?.[0] ? [detail.data[0]] : []
  // 老项目 this.$store.commit('SET_ADVERTISEMENT', detail.data)
  rootStore.setAdvertisement(detail.data)
  handleNoticeReport(0)
}

const clickNotice = async (item: AdvertisementNoticeDto, index: number) => {
  reportNotice(item.noticeText || '')
  const detailItem = marqueeData.value?.detailsList?.[index]
  /**
   * 跑马灯支持四种交互
   * 无交互
   * 弹窗
   * 内部链接
   * 外部链接
   * 统一走 useAdvertisementJump（H5 含 CRM 视频壳版本兼容、pcH5JumpType=10、function-feedback 站内跳转）
   * */
  if (item.jumpMode !== ADVERTISEMENT_JUMPMODE_ENUM.NONE) {
    await jumpByAdvertisement(item, { pushToStyle: detailItem?.pushToStyle })
  }
  // 运单审核成功的跑马灯提示：用户点击跑马灯后，跳转到下单审核-调价审核，用户手动切换页签到"运单审核"，此时再点击跑马灯，因为路由没发生变化，下单审核的页签是不会改变的,通过eventBus来实现
  if (item.jumpMode === ADVERTISEMENT_JUMPMODE_ENUM.NORMAL && item.modelRoute) {
    EE.emit(EE_EVENT.REVIEW_TAB_TOGGLE)
  }
  advertisementConfirmByUser({
    advertisementCodeList: [detailItem?.advertisementCode],
    channelSource: 'pc',
    eventType: 1,
  }).finally(() => {
    getAdvertisement()
  })
  uniqueReport({
    adCodes: [detailItem?.advertisementCode],
    eventType: 4,
  })
}

const close = () => {
  reportNotice('关闭')
  const advertisementCodeList = (marqueeData.value?.detailsList || []).map((i) => i.advertisementCode)
  advertisementConfirmByUser({
    advertisementCodeList,
    channelSource: 'pc',
    eventType: 2,
  })
  uniqueReport({
    adCodes: advertisementCodeList,
    eventType: 2,
  })
  showMarquee.value = false
}

const handleNoticeReport = (index: number) => {
  const adCode = marqueeData.value?.detailsList?.[index]?.advertisementCode

  uniqueReport({ adCodes: [adCode], eventType: 3 })
}

// 去重的事件上报
const uniqueReport = (params: UniqueReportParams) => {
  if (params.eventType !== 3) {
    eventReport(params)
    return
  }

  if (lastReportCodes.value.sort().join('') === params.adCodes.sort().join('')) return

  eventReport(params)
  lastReportCodes.value = (params.adCodes || []) as string[]
}

// 老项目 created() 钩子逻辑
getAdvertisement()

// 运单审核通知：用户在处理完运单的后续操作后，需要刷新跑马灯数据
const refreshNotice = () => {
  getAdvertisement()
}
EE.on(EE_EVENT.REFRESH_NOTICE, refreshNotice)
onUnmounted(() => {
  EE.off(EE_EVENT.REFRESH_NOTICE, refreshNotice)
})
</script>
<style lang="scss">
// .custom-tooltip-notice {
//   transform: translate(-14px, -3px);
//   .el-popper__arrow {
//     left: 12px !important;
//   }
// }
</style>
<style lang="scss" scoped>
$notice-height: 20px;
.notice {
  width: 277px;
  display: flex;
  align-items: center;
  //position: absolute;
  //left: 50%;
  //transform: translateX(-50%);

  .list {
    position: relative;
    width: calc(100% - 6px);
    margin: 0 6px;
    height: $notice-height;
    line-height: $notice-height;
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 12px;
      opacity: 0.4;
      background-color: #fff;
      transform: translate(0, -50%);
    }

    :deep(.el-carousel__container) {
      height: $notice-height;
    }

    .item {
      width: 253px;
      height: $notice-height;
      color: #ffffff;
      font-size: 14px;
      //animation: 10s wordsLoop linear infinite normal;
      cursor: pointer;
      box-sizing: border-box;
      padding-left: 24px;
      text-align: right;
      padding-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      .content-icon {
        width: 16px;
        height: 16px;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }

      .content {
        max-width: calc(100% - 46px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-left: 8px;
        box-sizing: border-box;
        line-height: $notice-height;
      }

      .close {
        display: inline-block;
        line-height: 45px;
        overflow: hidden;
        margin-left: 12px;
        .iconfont {
          font-size: 8px;
          color: #ffffff;
        }
      }
    }
  }
}

.compatibility {
  // 带壳端transition属性实现有问题，可能引起页面刷新
  transition: unset !important;
}
</style>
