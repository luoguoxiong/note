<template>
  <view :class="classPrefix" v-if="isWeixinApp">
    <!-- 升级下载弹窗-->
    <ky-popup
      :class="[`${classPrefix}--body`]"
      v-model:show="show"
      :closeOnClickOverlay="false"
      position="center"
      @update:show="handleUpdateShow"
      :z-index="2000"
    >
      <view :class="[`${classPrefix}--wrapper`]">
        <view :class="[`${classPrefix}--header`]">
          <img
            :class="[`${classPrefix}--header-img`]"
            src="https://ic-img.ky-express.com/netc/20250903_17826_!!1756887340815_600_226.png"
          />
        </view>
        <view :class="[`${classPrefix}--bottom`]">
          <!--  更新内容展示   -->
          <view v-show="pageStatus === '10'">
            <view :class="[`${classPrefix}--content`]">
              <view :class="[`${classPrefix}--title`]">
                <view class="name">快来更新新版本</view>
                <view class="version">{{ updateVersionInfo.versionNo }}</view>
              </view>
              <scroll-view scroll-y="true" :class="[`${classPrefix}--list`]">
                <!--                <text id="version-manage-update-text">{{ updateVersionInfo.modifyContent }}</text>-->
                <version-text-clamp :text="updateVersionInfo.modifyContent" />
              </scroll-view>
            </view>
            <view :class="[`${classPrefix}--footer`]">
              <ky-button type="primary" size="large" plain @click="handleCancelRecord" v-if="isTipUpgradeMode"
                >当天不再提示</ky-button
              >
              <ky-button
                type="primary"
                size="large"
                plain
                @click="handleCancel"
                v-if="!isTipUpgradeMode && !isForceUpgradeMode"
                >以后再说</ky-button
              >
              <ky-button type="primary" size="large" @click="handleUpdate">立即更新</ky-button>
            </view>
          </view>
          <!--    pageStatus:20 apk安装      -->
          <view v-if="pageStatus === '20'">
            <view :class="[`${classPrefix}--content`]">
              <view :class="[`${classPrefix}--content-install-title`]">马上就好，请勿退出应用</view>
              <!--  下载进度条    -->
              <version-manage-progress :modelValue="androidDownloadProgress?.progress" />
              <view :class="[`${classPrefix}--progress-text`]">
                <text>正在下载…</text>
                <text>{{ androidDownloadProgress?.progress }}%</text>
              </view>
            </view>
            <view :class="[`${classPrefix}--footer`]">
              <ky-button type="primary" size="large" :disabled="installDisabled" @click="handleHomeAndroidInstall"
                >立即安装
              </ky-button>
            </view>
          </view>
        </view>
      </view>
      <!-- 关闭按钮  -->
      <view v-if="showCloseBtn" :class="[`${classPrefix}--close`]" @click="handleClose">
        <image src="https://ic-img.ky-express.com/netc/20250714_634_!!1752464249143_148_144.png"></image>
      </view>
    </ky-popup>
  </view>
</template>
<script setup lang="ts">
import './index.scss'
import { ref, computed, watch, nextTick } from 'vue'
import { isWeixinAppSync } from '@/public/config'
import useVersionManage from '@public/components/business/version-manage-popup/hooks/useVersionManage'
import { PropsType } from './type'
import { useThrottleAsync } from '@public/hooks/useThrottleAsync'
import { isWxAppIos } from '@public/appPlugins/utils/device'
import { useAppVersion } from '@public/components/business/version-manage-popup/platform'
import VersionManageProgress from '@public/components/business/version-manage-popup/version-manage-progress.vue'
import { showToast } from '@public/utils/useShowToast'
import { useHomeStore } from '@layout/pages/home/store'
import { MINI_APP_VERSION } from '@public/constants'
import VersionTextClamp from '@public/components/business/version-manage-popup/components/version-text-clamp.vue'
import Taro from '@tarojs/taro'
import { isWxAppIosEnv } from '@public/utils'

const classPrefix = 'version-manage-popup'

const props = withDefaults(defineProps<PropsType>(), {
  touchLocation: '10', // 默认首页
})

const emit = defineEmits(['update:show'])

const show = ref(false)
// 页面状态
const pageStatus = ref('10') // 10 展示 20 安卓(安装)
// 版本更新
const updateVersionInfo = ref({
  upgradeConfigId: '',
  modifyContent: '',
  versionNo: '',
  versionLink: '',
  fileMd5: '',
  releaseTime: '',
  upgradeMode: 10, // 升级方式 10-强制升级，20-提示升级，30-检测更新
})
const { fetchAppVersion, storageAddNoTipAppVersion, storageIsNoTipToday, setForceVersionPopupShow } = useVersionManage()
const { installDisabled, androidDownloadProgress, handleAndroidInstallUpdateApk, handleAppUpdate } = useAppVersion()
const homeStore = useHomeStore()

// 是否是APP模式
const isWeixinApp = computed(() => {
  return isWeixinAppSync()
})

// 是否强制升级展示
const isForceUpgradeMode = computed(() => {
  return updateVersionInfo.value?.upgradeMode === 10
})

// 是否是提示升级
const isTipUpgradeMode = computed(() => {
  return updateVersionInfo.value?.upgradeMode === 20
})

// 关闭按钮展示逻辑(提示升级展示 + 非下载界面)
const showCloseBtn = computed(() => {
  return isTipUpgradeMode.value && pageStatus.value !== '20'
})

// const hasUpdateVersion = computed(() => {
//   const { versionNo } = updateVersionInfo.value
//   return versionNo && APP_VERSION && APP_VERSION !== versionNo
// })

/* 触发弹窗show更新emit */
const handleUpdateShow = (visible: boolean) => {
  emit('update:show', visible)
}
/* 更新弹窗show */
const updateShow = (value) => {
  show.value = value
  if (!value) {
    homeStore.updateHomeVersionStatus(false)
    setForceVersionPopupShow(false)
  }
}
/* 更新页面状态 */
const updatePageStatus = (value: '10' | '20') => {
  pageStatus.value = value
}

/* 立即更新 */
const handleUpdate = async () => {
  if (props.touchLocation === '10') {
    handleHomeUpdate()
  } else if (props.touchLocation === '20') {
    handleSettingUpdate()
  }
}
/* 首页-立即更新 */
const handleHomeUpdate = async () => {
  const isWxAppIOS = await isWxAppIos()
  // 安卓 + 鸿蒙(鸿蒙:暂不支持跳应用市场待微信后续支持)
  if (!isWxAppIOS) {
    updatePageStatus('20')
  }
  // 唤起升级
  const { fileMd5, versionNo, versionLink } = updateVersionInfo.value
  const updateParams = {
    fileMd5,
    versionNo,
    versionLink,
    showNotification: props.touchLocation !== '10', // 首页(10)不展示通知栏
  }

  try {
    await handleAppUpdate(updateParams)
    // 非强升 - 关闭弹窗
    if (!isForceUpgradeMode.value) {
      // 下载完毕自动关闭弹窗
      updateShow(false)
    }
  } catch (e) {
    // 下载失败/下载取消
    updatePageStatus('10')
    console.log('handleAppUpdate catch', e)
  }
}
/* 首页-立即安装 */
const handleHomeAndroidInstall = () => {
  try {
    const { fileMd5, versionNo } = updateVersionInfo.value
    console.log('[app down]', '首页安装')
    handleAndroidInstallUpdateApk({
      fileMd5,
      versionNo,
    })
  } catch (e) {
    console.log('handleAppUpdate catch', e)
  }
}

/* 设置页 - 立即更新 */
const handleSettingUpdate = async () => {
  // 唤起升级
  const { fileMd5, versionNo, versionLink } = updateVersionInfo.value
  const updateParams = {
    fileMd5,
    versionNo,
    versionLink,
    showNotification: props.touchLocation !== '10', // 首页(10)不展示通知栏
  }
  try {
    // 使用原生toast-无需手动toast
    // showToast('开始下载应用，通知栏上可以查看下载进度')
    handleClose()
    await handleAppUpdate(updateParams)
    console.log('[app down]', 'handleSettingUpdate 下载完成')
    if (!isWxAppIosEnv) {
      handleAndroidInstallUpdateApk({
        fileMd5,
        versionNo,
      })
    }
  } catch (e) {
    console.log('handleAppUpdate catch', e)
  }
}

/* 当前页是否是首页 */
const checkIsHomePage = () => {
  const pages = Taro.getCurrentPages()
  return pages[0] && pages[0]?.route === 'layout/pages/home/index'
}

/* 按钮-以后再说 */
const handleCancel = () => {
  updateShow(false)
}

/* 按钮-关闭 */
const handleClose = () => {
  updateShow(false)
}
/* 按钮-今日不再提醒 */
const handleCancelRecord = () => {
  storageAddNoTipAppVersion(updateVersionInfo.value?.versionNo)
  handleCancel()
}

/* 手动唤起弹窗 */
const showDialog = () => {
  updateShow(true)
}
/* 设置页-手动打开升级弹窗 */
const showUpdate = () => {
  if (checkHasNewAppVersion()) {
    showDialog()
  } else {
    showToast('当前已是最新版本')
  }
}

/* 手动获得升级版本 */
const getAppVersionInfo = () => {
  return updateVersionInfo.value
}
/* 检查是否有新版本 */
const checkHasNewAppVersion = () => {
  const { versionNo } = updateVersionInfo.value
  return versionNo && MINI_APP_VERSION && MINI_APP_VERSION !== versionNo
}

const getData = async () => {
  try {
    // 重置弹窗状态
    updatePageStatus('10')
    updateShow(false)
    const res = await fetchAppVersion(props.touchLocation)
    console.log('getData', res)
    // 存在版本 + 非不再提醒版本
    if (res?.code === 0 && res?.data && res?.data.versionNo && !storageIsNoTipToday(res?.data.versionNo)) {
      updateVersionInfo.value = res.data
      // 首页 - 自动唤起弹窗
      if (props.touchLocation === '10') {
        updateShow(true)
        homeStore.updateHomeVersionStatus(true)
        // 强制升级弹窗对外保罗
        if (res.data?.upgradeMode === 10) {
          setForceVersionPopupShow(true)
        }
      }
    }
  } catch (e) {
    console.error('fetchAppVersion', e)
  }
}

const { run, forceRun } = useThrottleAsync(getData)

defineExpose({
  showDialog,
  getData: forceRun,
  getThrottleData: run,
  getAppVersionInfo,
  checkHasNewAppVersion,
  showUpdate,
})
</script>
