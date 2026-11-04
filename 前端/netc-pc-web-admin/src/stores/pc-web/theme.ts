/**
 * pc-web 旧基座 theme 模块 (Pinia 版)
 * 来源: netc-pc-web/src/store/modules/theme.js (namespaced: 'theme')
 *
 * 使用场景(标注):
 *  - 【主题】themeInfo 主题配置(themeType 主题类型: 10常规/20国庆节; greyType 灰色主题: 10常规/20灰色皮肤)
 *    —— 应用初始化时拉取, greyType=20 时给 html 根节点加 kye-gray-event 灰色皮肤 class
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSoftwareTheme } from './deps/api'

type AnyRecord = Record<string, any>

export const usePcWebThemeStore = defineStore('pcWebTheme', () => {
  // ==================== state (旧 theme.js state) ====================
  const themeInfo = ref<AnyRecord>({
    themeType: '', // 主题类型，10-常规，20-国庆节主题 number
    greyType: '', // 灰色主题类型，10-常规，20-灰色皮肤
  })

  // ==================== mutations (旧 theme.js mutations) ====================
  function UPDATE_THEME_INFO(val: AnyRecord) {
    themeInfo.value = { ...val }
  }

  // ==================== actions (旧 theme.js actions) ====================
  /** 【主题】更新主题信息(greyType=20 挂载灰色皮肤 class)
   * (payload 为旧版遗留入参, 旧实现即未使用; 用 void 标注以通过 no-unused-vars)
   */
  async function update_theme_info(_payload?: AnyRecord) {
    void _payload
    try {
      const res = await getSoftwareTheme()
      if (res.code === 0 && res.data) {
        const { themeType, greyType } = res.data
        UPDATE_THEME_INFO({ themeType, greyType })
        if (greyType === 20) {
          document.documentElement.classList.add(`kye-gray-event`)
        } else {
          document.documentElement.classList.remove(`kye-gray-event`)
        }
      }
    } catch (e) {
      document.documentElement.classList.remove(`kye-gray-event`)
    }
  }

  return {
    // state
    themeInfo,
    // mutations
    UPDATE_THEME_INFO,
    // actions
    update_theme_info,
  }
})
