import type { App } from 'vue'
import KyInput from './input.vue'
import TextArea from './textarea.vue'

export default Object.assign(KyInput, {
  TextArea,
  install: (app: App) => {
    app.component(TextArea.name, TextArea)
    return app
  },
})
