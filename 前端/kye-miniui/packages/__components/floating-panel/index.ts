import FloatingPanel from './src/floating-panel.vue'
import FloatingPanelWx from './src/floating-panel-wx.vue'
import FloatingPanelH5 from './src/floating-panel-h5.vue'
import { App } from 'vue'

FloatingPanel.name = 'ky-floating-panel'
FloatingPanelWx.name = 'ky-floating-panel-wx'
FloatingPanelH5.name = 'ky-floating-panel-h5'

FloatingPanel.install = (app: App): void => {
  // 注册组件
  app.component(FloatingPanel.name, FloatingPanel)
  app.component(FloatingPanelWx.name, FloatingPanelWx)
  app.component(FloatingPanelH5.name, FloatingPanelH5)
}

export default FloatingPanel
