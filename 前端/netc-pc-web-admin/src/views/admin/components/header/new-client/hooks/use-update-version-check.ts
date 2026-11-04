/**
 * useUpdateVersionCheck 客户端更新版本检查/数据上报/打印组件联动 hook
 * 来源: netc-pc-web/src/views/new-client/update.vue (自 update.vue 拆分, 行为不变)
 *
 * 迁移说明(自 update.vue 移入):
 *  - vuex: mapState userInfo(root) -> usePcWebRootStore().userInfo(空对象时回退 getUserData)
 *  - API: @/services/api/{admin,vts/index} -> ../api (clientCheckVersion/clientVersionReportData/getCache/saveOrUpdate)
 *  - this.$native.* -> @/native/electron
 */
import { computed, ref, watch, type Ref } from 'vue'
import { getCacheInfo, getMachineId, getSystemInfo, getVersion, setCacheInfo, startKYEPrinter } from '@/native/electron'
import { clientCheckVersion, clientVersionReportData, getCache, saveOrUpdate } from '../api'
import { getUserData } from '@/stores/pc-web/deps/storage'
import { usePcWebRootStore } from '@/stores/pc-web/root'

export const useUpdateVersionCheck = ({
  props,
  versionInfo,
  modalShow,
  setUpIng,
  switchModal,
  emit,
}: {
  props: { source?: string }
  versionInfo: Ref<Record<string, any> | null>
  modalShow: Ref<boolean>
  setUpIng: Ref<boolean>
  switchModal: (s: number) => void
  emit: {
    (e: 'updateLastVersion', version: string): void
  }
}) => {
  const rootStore = usePcWebRootStore()

  const clientVersion = ref('')
  const sourceSelf = ref(false)
  const isLoading = ref(false)
  // 旧代码未在 data 中声明的实例属性(首次为 undefined)
  let notFirstLoginCustomCode: string | null | undefined

  const userInfo = computed<Record<string, any>>(() => {
    return Object.keys(rootStore.userInfo).length ? rootStore.userInfo : getUserData() || {}
  })

  watch(
    () => userInfo.value.phone,
    () => {
      const notFirstLogin = sessionStorage.getItem('notFirstLogin')
      if (props.source === 'login' || notFirstLogin || isLoading.value) return
      getVersionUpdate()
      saveClientVersionReportData()
      sessionStorage.setItem('notFirstLogin', '1')
      sessionStorage.setItem('notFirstLoginCustomCode', userInfo.value.customCode)
    }
  )

  watch(
    () => userInfo.value.customCode,
    (newCode) => {
      const notFirstLoginCustomCodeCache = sessionStorage.getItem('notFirstLoginCustomCode')
      if (props.source === 'login' || notFirstLoginCustomCodeCache === newCode || isLoading.value) return
      getVersionUpdate()
      saveClientVersionReportData()
      notFirstLoginCustomCode = notFirstLoginCustomCodeCache
      sessionStorage.setItem('notFirstLoginCustomCode', newCode)
    }
  )

  const setUpkYEPrinter = async (state?: boolean) => {
    if (localStorage.getItem('hasSetUpkYEPrinter') && state) return
    const { data } = await clientCheckVersion({
      appType: 'printApp',
    })
    if (!data || !data.versionLink) return
    const kyePrinterLink = data.versionLink
    setCacheInfo('kyePrinterLink', kyePrinterLink)
    localStorage.setItem('hasSetUpkYEPrinter', '1')
    try {
      await startKYEPrinter(true as any)
    } catch (e) {
      console.log('安装启动失败', e)
      localStorage.removeItem('hasSetUpkYEPrinter')
    }
  }

  const getVersionUpdate = async (self = false) => {
    if (isLoading.value) return
    isLoading.value = true
    setUpIng.value = false
    const clientVersionCache = await getVersion()
    const onlyKey = await getMachineId()
    clientVersion.value = clientVersionCache
    const { customCode, phone } = userInfo.value
    const { data } = await clientCheckVersion({
      grayPhone: phone,
      grayCustomer: customCode,
      appVersion: clientVersionCache,
      appType: 'pc',
      touchLocation: self ? 20 : 10,
      equipmentId: onlyKey,
      equipmentType: '10',
    })
    isLoading.value = false
    // 保存最新请求时间
    setCacheInfo('lastVersionUpdateTime', new Date().getTime() + 1209600000)
    // 已经最新,设置只提示upgradeLocation为20的
    if (!data || (String(data.upgradeLocation) === '10' && self)) {
      localStorage.setItem('lastVersion', clientVersionCache)
      emit('updateLastVersion', clientVersionCache)
      if (self) {
        switchModal(4)
      }
      return
    }
    versionInfo.value = data
    // 保存versionInfo是为了页面刷新后能继续展示进度条
    localStorage.setItem('versionInfo', JSON.stringify(data))
    // 主动设置检测小红点
    const lastVersion = String(data.upgradeLocation) === '20' ? data.versionNo : clientVersionCache
    emit('updateLastVersion', lastVersion)
    localStorage.setItem('lastVersion', lastVersion)

    // 非主动检查，返回首页的更新提示
    if (String(data.upgradeLocation) === '20' && !self) {
      return
    }
    // 主动检测
    if (self) {
      sourceSelf.value = true
      switchModal(String(data.upgradeMode) === '10' ? 2 : 5)
      return
    }
    // 判断是否今日不再提醒
    getUpdateFlag(data, self)
  }

  const getUpdateFlag = async (obj: Record<string, any>, self: boolean) => {
    const onlyKey = await getMachineId()
    const { upgradeMode, upgradeConfigId } = obj
    const { customCode } = userInfo.value
    const temporaryCloseInfo = sessionStorage.getItem('temporaryClose')
    if (temporaryCloseInfo === JSON.stringify(obj) && notFirstLoginCustomCode === customCode) {
      return
    }
    const { data } = await getCache({
      onlyKey,
      upgradeId: upgradeConfigId,
      cacheType: 6,
    })
    if (String(data.flag) === '0' && !self) return
    switchModal(String(upgradeMode) === '10' ? 2 : 5)
  }

  const saveTodayNoTip = async () => {
    const onlyKey = await getMachineId()
    const { upgradeConfigId } = versionInfo.value as Record<string, any>
    await saveOrUpdate({
      flag: 0,
      cacheType: 6,
      onlyKey,
      upgradeId: upgradeConfigId,
    })
    modalShow.value = false
  }

  const saveClientVersionReportData = async () => {
    const systemInfo = await getSystemInfo()
    const { customCode, phone } = userInfo.value
    const clientVersionCache = await getVersion()
    const grayObject = phone || customCode || clientVersionCache
    let grayType = 50
    if (phone) {
      grayType = 10
    } else if (customCode) {
      grayType = 20
    }
    const params = {
      grayObject: grayObject,
      grayType,
      appType: 'pc',
      appCurrentVersion: clientVersionCache,
      appUnitType: systemInfo?.type + systemInfo?.arch,
      systemVersion: systemInfo?.release,
    }
    const data = await getCacheInfo('versionReportData')
    // 如果不一致就上报
    if (JSON.stringify(data) === JSON.stringify(params)) {
      return
    }
    setCacheInfo('versionReportData', params)
    clientVersionReportData(params)
    // 版本不一致重新安装一次打印组件
    if (data && data?.appCurrentVersion !== params.appCurrentVersion) {
      setUpkYEPrinter()
    }
  }

  const temporaryClose = () => {
    if (!sourceSelf.value) {
      sessionStorage.setItem('temporaryClose', JSON.stringify(versionInfo.value))
    }
    modalShow.value = false
  }

  return {
    clientVersion,
    sourceSelf,
    isLoading,
    userInfo,
    setUpkYEPrinter,
    getVersionUpdate,
    getUpdateFlag,
    saveTodayNoTip,
    saveClientVersionReportData,
    temporaryClose,
  }
}
