import NeteWorkImage from './network-image/index.vue'
import Redirct from './redirct/index.vue'
import RedirctWebview from './redirct/webview.vue'
import PreloadImage from './preload-image/index.vue'
import LazyImage from './lazy-image/index.vue'
import UrgeDialog from '@public/components/business/urge-overlay/urge-dialog.vue'
import Vue from 'vue'

export const install = (app: Vue.App) => {
  app.component('network-image', NeteWorkImage)
  app.component('ky-redirct', Redirct)
  app.component('ky-redirct-webview', RedirctWebview)
  app.component('ky-preload-image', PreloadImage)
  app.component('ky-lazy-image', LazyImage)
  app.component('urge-dialog', UrgeDialog)
}
