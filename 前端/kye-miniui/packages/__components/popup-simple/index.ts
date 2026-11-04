import PopupSimple from './src/index.vue'
import { App } from 'vue'

PopupSimple.name = 'ky-popup-simple'

PopupSimple.install = (app: App): void => {
  app.component(PopupSimple.name as string, PopupSimple)
}

export {}

export default PopupSimple
