import Tab from './src/tab.vue'
import { App } from 'vue'

Tab.name = 'ky-tab'

Tab.install = (app: App): void => {
  app.component(Tab.name, Tab)
}

export default Tab
