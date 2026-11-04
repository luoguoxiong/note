<template>
  <div class="ky-message-popup-wrapper">
    <KyActivityPopup ref="activityPopupRef" />
    <KyTextImagePopup ref="textImagePopupRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import native from '@/utils/native'
import { getAdvertisementDetails } from '@/apis/home'
import type { BannerDetailItem, BannerReq, BannerRes } from '@/apis/home/types'
import KyActivityPopup from './activity-popup.vue'
import KyTextImagePopup from './text-image-popup.vue'
import { isActivityStyle, isTextImageStyle } from './types'

defineOptions({ name: 'ky-message-popup' })

const props = defineProps<{
  /** 弹窗广告区域数据（advertisementType 20）；传入后首页场景无需再单独请求接口 */
  advertisementData?: BannerRes | null
}>()

interface ActivityPopupExpose {
  showDialog: (detail: BannerDetailItem) => Promise<void>
  dialogVisible: { value: boolean }
}
interface TextImagePopupExpose {
  showDialog: (detail: BannerDetailItem) => Promise<void>
  dialogVisible: { value: boolean }
}

const route = useRoute()
const activityPopupRef = ref<ActivityPopupExpose | null>(null)
const textImagePopupRef = ref<TextImagePopupExpose | null>(null)

/** 按区域样式编码分发弹窗 */
async function showByModel(model: BannerRes): Promise<boolean> {
  if (model.advertisementType !== '20' || !model.detailsList?.length) return false

  const detail: BannerDetailItem = model.detailsList[0]
  const code = model.areaStyleCode

  if (isActivityStyle(code)) {
    await activityPopupRef.value?.showDialog(detail)
    return true
  }
  if (isTextImageStyle(code)) {
    await textImagePopupRef.value?.showDialog(detail)
    return true
  }
  return false
}

/**
 * 拉取广告配置并按 areaStyleCode 弹出对应弹窗
 * @param pageCode 业务页 code（由调用方从 iframe postMessage 收到后传入）
 * @returns 是否成功弹出
 */
async function loadNotice(pageCode: string): Promise<boolean> {
  const params: BannerReq = {
    channelCode: 'pc',
    pageCode,
    adTypeList: ['20'],
    latestUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    operatePort: 'PC',
    operatorSystem: native.isClientMode() ? 'pcClient' : 'pc',
  }

  const res = await getAdvertisementDetails(params)
  if (res.code !== 0 || !res.data?.length) return false

  return showByModel(res.data[0])
}

/** props 模式会话级守卫：仅首页使用，弹过一次后本会话不再弹（对齐原首页 homeNoticeLoaded 行为） */
let propsPopupShown = false

// 首页通过 props 传入弹窗数据（来自 store.getBannerData），不再单独请求接口
watch(
  () => props.advertisementData,
  (model) => {
    if (propsPopupShown || !model) return
    propsPopupShown = true
    // 延迟弹窗，对齐原首页实现
    setTimeout(() => {
      void showByModel(model)
    }, 100)
  },
  { immediate: true }
)

// 路由切换时强制关闭两个子弹窗，避免遮罩残留 Bug（旧实现遗留的修复）
watch(
  () => route.path,
  () => {
    if (activityPopupRef.value?.dialogVisible) {
      activityPopupRef.value.dialogVisible.value = false
    }
    if (textImagePopupRef.value?.dialogVisible) {
      textImagePopupRef.value.dialogVisible.value = false
    }
  }
)

defineExpose<{ loadNotice: typeof loadNotice }>({ loadNotice })
</script>

<style lang="scss" scoped>
.ky-message-popup-wrapper {
  display: contents;
}
</style>
