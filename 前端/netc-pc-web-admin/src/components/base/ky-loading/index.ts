import type { App } from 'vue'
import loading from './commonLoading.vue'
import carLoading from './carLoading.vue'

export default Object.assign(loading, {
  carLoading,
  install: (app: App) => {
    app.component(carLoading.name, carLoading)
    return app
  },
})
