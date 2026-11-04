import Calendar from './src/calendar.vue'
import { App } from 'vue'

Calendar.name = 'ky-calendar'

Calendar.install = (app: App): void => {
  // 注册组件
  app.component(Calendar.name, Calendar)
}

export default Calendar
