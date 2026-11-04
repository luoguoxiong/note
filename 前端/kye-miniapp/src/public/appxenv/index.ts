import Taro from '@tarojs/taro'
import { ref, onMounted } from 'vue'
import { getVirtualEnv } from './api'
import { EnvItem } from './type'

export const xEnvId = ref<string | undefined>(Taro.getStorageSync('kye-xenvId'))

export const getXenvId = (): string | undefined => {
  if (process.env.TARO_APP_ENV === 'prod') {
    return process.env.TARO_APP_XENVID
  }
  return xEnvId.value
}

export const setXenvId = (item: EnvItem) => {
  xEnvId.value = item.envId
  Taro.setStorageSync('kye-xenvId', item.envId)
}

export const useXenvId = () => {
  const xEnvList = ref<EnvItem[]>([])
  const loading = ref(false)

  const showXenv = ref(false)

  const showSelectItem = process.env.TARO_APP_ENV !== 'prod'

  const fetchXEnvList = async () => {
    try {
      loading.value = true

      const { data } = await getVirtualEnv()

      const list = [
        {
          envId: '',
          envName: '不设置灰度',
        } as any,
        ...(data?.[0].envList || []),
      ]
      xEnvList.value = list

      // 初始化泳道
      if (!xEnvId.value) {
        const env = process.env.TARO_APP_XENVID
        if (env && list.some((i) => i.envName === env)) {
          xEnvId.value = env
          Taro.setStorageSync('kye-xenvId', env)
        }
      }
    } catch (err) {
      console.error('获取泳道列表失败', err)
    } finally {
      loading.value = false
    }
  }

  const openVitruList = () => {
    showXenv.value = true
  }

  onMounted(() => {
    if (showSelectItem) {
      fetchXEnvList()
    }
  })

  return {
    xEnvList,
    xEnvId,
    loading,
    fetchXEnvList,
    setXenvId,
    openVitruList,
    showXenv,
    showSelectItem,
  }
}
