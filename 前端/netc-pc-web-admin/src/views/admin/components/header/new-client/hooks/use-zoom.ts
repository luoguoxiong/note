import { ref } from 'vue'
import { compareVersions } from '@/utils'
import { getVersion } from '@/native/electron'

/**
 * zoom 展示区显隐: 壳版本 3.0.5 以上渲染 zoomOperate, 否则渲染 zoomPanel
 * zoom-panel/zoom-operate 在各自 onMounted 中挂载 window.showZoomPanel,
 * 本 composable 必须在 setup 中同步调用, 以保持原有渲染与注册时机
 */
export function useZoom(props: { source?: string }) {
  const showZoomOperate = ref(false)
  const showZoomPanel = ref(false)
  const needWheel = ref(false)

  // 3.0.5以上渲染zoomOperate
  async function judgeZoomComponent() {
    const version = await getVersion()
    const maxNotSupportVersion = compareVersions(version, 'V3.0.5') === 1
    const needShowZoomOperate = maxNotSupportVersion && props.source !== 'login'
    needWheel.value = maxNotSupportVersion
    if (needShowZoomOperate) {
      showZoomOperate.value = true
      return
    }
    showZoomPanel.value = true
  }

  judgeZoomComponent()

  return { showZoomOperate, showZoomPanel, needWheel }
}
