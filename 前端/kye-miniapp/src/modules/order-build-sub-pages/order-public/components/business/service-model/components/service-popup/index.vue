<template>
  <BottomPopup
    @open="openService"
    title="服务方式"
    :show="show"
    :show-footer="false"
    :close-on-click-overlay="true"
    @onClose="onClose"
    @closed="closed"
    popupMaxHeight="70vh"
    class="service-popup"
  >
    <ServiceTip :tipText="serviceTipText" v-if="serviceTipText"></ServiceTip>
    <div class="mar-t-18vh" v-if="showEmpty && show">
      <KyEmpty :type="emptyType" :custom-config="emptyConfig" />
    </div>
    <!-- 服务方式异常缺省页 -->
    <KyEmpty
      v-if="serviceModeError?.error"
      :type="EmptyTypeEnum.CUSTOM"
      :custom-config="{ image: EMPTY_CONFIGS.network.image, description: '加载超时，请重新加载' }"
    >
      <ky-button
        :loading="serviceLoading"
        plain
        loadingType="plain"
        text="重新加载"
        loading-text="重新加载"
        class="reload-btn"
        @click="reload"
      ></ky-button>
    </KyEmpty>
    <ServiceList
      v-else
      @selectService="selectService"
      @goEditGoodsTime="goEditGoodsTime"
      :serviceList="serviceTypes"
      :activeServiceCode="activeServiceCode"
      :loading="showSkeletonLoading"
    ></ServiceList>
  </BottomPopup>
</template>

<script lang="ts" setup>
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import ServiceList from './../service-list/index.vue'
import ServiceTip from './../service-tip/index.vue'
import { ref, computed, watch } from 'vue'
import { ChangeKeys, ServiceModeType } from '@order-public-sub-public/types'
import { EmptyTypeEnum, MIN_DEBOUNCE_TIME, ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import { service } from '@order-public-sub-public/components/business/service-model/components/service-list/type'
import { servicePopupProps } from '@order-public-sub-public/components/business/service-model/components/service-popup/type'
import { pickerLimit } from '@order-public-sub-public/validate/limit'
import { onCloseReport, selectServiceReport } from './report/index'
import { debounce } from 'lodash-es'
import { handleServiceMode } from '../../hooks/useServiceModeTypes'
import useEffect from '@order-public-sub-public/validate'
import apm from '@order-public-sub-public/utils/apm-sdk'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import { servicePopupClosedReport } from '@order-public-sub-public/components/business/service-model/report'
import { showServiceSkeleton } from '../../hooks/state'
import { openGoodsTime } from '@order-public-sub-public/components/business/goods-time/hooks/updateGoodsTime'
const piniaStore = useStore()

const emptyType = EmptyTypeEnum.CUSTOM

const { remoteCheck } = useEffect()

withDefaults(defineProps<servicePopupProps>(), {
  show: false,
})

const emit = defineEmits(['onClose', 'selectService'])

//缺省页配置
const emptyConfig = ref({
  image: 'https://ic-img.ky-express.com/netc/20250619_31981_!!1750313133365_560_560.png',
  description: '此线路未匹配到对应服务方式，请联系商务或更改寄收地址',
})
//服务方式飞机提醒文案
const serviceTipText = computed(() => {
  const { tipsInfos = [] } = serviceMode.value || {}
  return tipsInfos?.[0]
})

//获取服务方式数据
const serviceMode = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['服务方式']) || ({} as ServiceModeType)
})

//获取服务方式列表
const serviceTypes = computed<service[]>(() => {
  const { serviceTypes } = serviceMode.value || {}
  return serviceTypes || []
})

//展示缺省页，如果接口有异常不显示该缺省页
const showEmpty = computed(() => {
  return !serviceModeError.value?.error && serviceTypes.value?.length === 0 && !loading.value
})

//当前选中的服务方式
const activeServiceCode = computed(() => {
  const { serviceMode = null } = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
  return serviceMode
})
//请求中状态
const loading = computed(() => {
  return serviceLoading.value
})

const showSkeletonLoading = computed(() => {
  return loading.value && showServiceSkeleton.value
})

const goEditGoodsTime = (name: string) => {
  openGoodsTime('serviceMode', name)
}
//选择服务方式
const selectService = (value: service) => {
  selectServiceReport(value.serviceTypeName)
  emit('selectService', value.serviceTypeCode, {
    arriveTime: value.estimateArriveTime,
    prescriptionSource: value.prescriptionSource,
  })
}
//关闭服务方式面板
const onClose = () => {
  onCloseReport()
  emit('onClose')
}

const closed = () => {
  servicePopupClosedReport()
}

// 埋点
const setReport = () => {
  if (serviceTypes.value && serviceTypes.value.length > 0) {
    reportPerception('other_express_paymente_popup_perception_v1')
  }
}
//打开服务面板
const openService = () => {
  showServiceSkeleton.value = true
  try {
    if (loading?.value) {
      const stopLoadingWatch = watch(
        () => loading?.value,
        (value) => {
          if (!value) {
            showServiceModeShowLimit()
            stopLoadingWatch()
          }
        },
      )
      return
    }
    showServiceModeShowLimit()
    setReport()
  } catch (e) {
    console.error(e)
    showServiceSkeleton.value = false
  } finally {
    // 异常状态兜底
    setTimeout(() => {
      showServiceSkeleton.value = false
    }, 3000)
  }
}
//显示服务方式限制弹框提醒
const showServiceModeShowLimit = () => {
  const { serviceModeShowLimit } = (serviceMode.value as ServiceModeType) || {}
  if (!serviceModeShowLimit?.flag) {
    return
  }
  serviceModeShowLimit.customerRichTips = serviceModeShowLimit?.noticeMessage || ''
  pickerLimit(serviceModeShowLimit)
}

const serviceModeError = computed(() => piniaStore.globalData.serviceModeError)

const serviceLoading = computed(() => piniaStore.globalData.serviceModeLoading)

/**
 * @description 重新加载服务方式
 */
const reload = debounce(
  async () => {
    try {
      piniaStore.globalData.serServiceModeLoading({ loading: true })
      const remoteCheckParams = serviceModeError.value.remoteCheckParams
      // 如果存在参数，需要重试remoteCheck
      if (remoteCheckParams) {
        const { key, temporaryData, moduleStyle, cacheStrategy, extraRemoteCheckParams } = remoteCheckParams
        await remoteCheck(key as ChangeKeys, temporaryData, moduleStyle, cacheStrategy, extraRemoteCheckParams)
      } else {
        await handleServiceMode()
      }
      piniaStore.globalData.setServiceModeError({ error: false })
    } catch (error) {
      apm.reportError(new Error('重试服务方式失败'))
    } finally {
      piniaStore.globalData.serServiceModeLoading({ loading: false })
    }
  },
  MIN_DEBOUNCE_TIME,
  { leading: true },
)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.service-popup {
  // .ky-popup-content {
  //   height: 80%;
  // }
  .service-list {
    padding: 16px 24px;
  }
  .reload-btn {
    margin-top: 48px;
  }
  .container__body {
    padding: 0;
    min-height: 70vh;
    .mar-t-18vh {
      margin-top: 18vh;
    }
  }
}
</style>
