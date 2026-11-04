import ActionSheet from './src/action-sheet.vue'
import { App } from 'vue'

ActionSheet.name = 'ky-action-sheet'

ActionSheet.install = (app: App): void => {
  // 注册组件
  app.component(ActionSheet.name, ActionSheet)
}

export default ActionSheet
