import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { isAmapMiniApp, sleep } from '@/public/utils'
import { getAppThemeInfo } from '@public/apis/theme'

const defaultConfig = {
  home_background: '',
  mine_background: 'https://ic-img.ky-express.com/netc/20251203_29093_!!1764755742763_1500_760.png',
  mine_avatar_background: '',
}

const updateTabBar = (themeInfo: Record<string, string | undefined>, onFail?: () => void) => {
  if (isAmapMiniApp) return

  const tabItems = [
    { index: 0, text: '首页', iconPath: themeInfo?.home_tab_normal, selectedIconPath: themeInfo?.home_tab_high_light },
    {
      index: 1,
      text: '寄件',
      iconPath: themeInfo?.order_tab_normal,
      selectedIconPath: themeInfo?.order_tab_high_light,
    },
    {
      index: 2,
      text: '查件',
      iconPath: themeInfo?.search_tab_normal,
      selectedIconPath: themeInfo?.search_tab_high_light,
    },
    { index: 3, text: '我的', iconPath: themeInfo?.mine_tab_normal, selectedIconPath: themeInfo?.mine_tab_high_light },
  ]

  let hasFailed = false

  tabItems.forEach(({ index, text, iconPath, selectedIconPath }) => {
    if (!iconPath || !selectedIconPath) return

    Taro.setTabBarItem({
      index,
      text,
      iconPath,
      selectedIconPath,
      fail: () => {
        if (!hasFailed) {
          hasFailed = true
          onFail?.()
        }
      },
    })
  })
}

let themePromise: Promise<void> | null = null

/** 🔥 单例状态（放在函数外，真正全局） */
const themeConfig = ref({
  isGrayTheme: false,
  config: { ...defaultConfig },
})

const isSetTabbar = ref(false)

export function useThemeStore() {
  /** 初始化（只做一次） */
  if (!themeConfig.value.config.home_background) {
    const storageTheme = Taro.getStorageSync('kye-theme')
    if (storageTheme) {
      themeConfig.value = storageTheme
    }
  }

  const fetchThemeConfig = async () => {
    if (themePromise) return themePromise

    themePromise = (async () => {
      try {
        const {
          data: { style, theme },
        } = await getAppThemeInfo()

        const materialList = style?.[0]?.detailsList?.[0]?.advertisementBackgroundDto?.configMaterialData || []

        const themeInfo = materialList.reduce(
          (acc, item) => ({
            ...acc,
            ...item?.areaValues,
          }),
          {},
        )

        themeConfig.value = {
          isGrayTheme: theme.greyType === 20,
          config: {
            ...defaultConfig,
            ...themeInfo,
            themeType: theme.themeType,
          },
        }

        Taro.setStorageSync('kye-theme', themeConfig.value)
      } catch (err) {
        console.error('fetchThemeConfig error:', err)
      }
    })()

    return themePromise
  }

  const setTabbar = async () => {
    if (isSetTabbar.value) return

    updateTabBar(themeConfig.value.config)

    await sleep(3000)
    await fetchThemeConfig()

    updateTabBar(themeConfig.value.config, () => {
      isSetTabbar.value = false
    })

    isSetTabbar.value = true
  }

  return {
    themeConfig,
    isSetTabbar,
    fetchThemeConfig,
    setTabbar,
  }
}
