import Popup from './src/index.vue'
import { App } from 'vue'

Popup.name = 'ky-popup'

Popup.install = (app: App): void => {
  app.component(Popup.name as string, Popup)
}

export {}

export default Popup
