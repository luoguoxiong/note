import { computed, ref, type Ref } from 'vue'
import { clientCheckVersion } from '../api'
import { getMachineId, getVersion } from '@/native/electron'

/** update 组件(../update.vue) defineExpose 的实例方法 */
export interface UpdateExpose {
  getVersionUpdate: (self?: boolean) => Promise<void>
  submitUpdate: (versionInfo?: Record<string, any>) => Promise<void>
}

/**
 * 壳版本与更新: 版本号拉取/灰度版本检查/新版本小红点
 */
export function useClientVersion(userInfo: Ref<Record<string, any>>, refUpdate: Ref<UpdateExpose | null>) {
  const clientVersion = ref('')
  const lastVersion = ref('')
  const showNewIcon = ref(false)
  const newClientVersion = ref<Record<string, any> | null>(null)

  const setNewIcon = computed(() => {
    return !!(showNewIcon.value || newClientVersion.value)
  })

  async function fetchVersion() {
    const version = await getVersion()
    clientVersion.value = version
  }

  async function checkUpdate() {
    const { customCode, phone } = userInfo.value
    const shellId = await getMachineId()
    const { data } = await clientCheckVersion({
      grayPhone: phone,
      grayCustomer: customCode,
      appVersion: clientVersion.value,
      appType: 'pc',
      touchLocation: 20,
      equipmentId: shellId,
      equipmentType: '10',
    })
    newClientVersion.value = data
  }

  function startUpdate() {
    refUpdate.value?.submitUpdate(newClientVersion.value as Record<string, any>)
  }

  function updateLastVersion(e: string) {
    if (!e) return
    lastVersion.value = e
  }

  function initNewIcon() {
    if (!localStorage.getItem('electronNewIconFlag') || newClientVersion.value) {
      showNewIcon.value = true
    }
  }

  return {
    clientVersion,
    lastVersion,
    showNewIcon,
    newClientVersion,
    setNewIcon,
    fetchVersion,
    checkUpdate,
    startUpdate,
    updateLastVersion,
    initNewIcon,
  }
}
