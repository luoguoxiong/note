import type { App } from 'vue'
import KyInput from './input.vue'
import TextArea from './textarea.vue'
import Search from './search.vue'

export default Object.assign(KyInput, {
  TextArea,
  Search,
  install: (app: App) => {
    app.component(TextArea.name, TextArea)
    app.component(Search.name, Search)
    return app
  },
})
