import TimeSelect from './src/time-select.vue'
import PreciseTimeSelect from './src/components/precise-time-select.vue'
import TimeRangePicker from './src/components/time-range-picker.vue'
import { App } from 'vue'

TimeSelect.name = 'ky-time-select'
PreciseTimeSelect.name = 'ky-precise-time-select'
TimeRangePicker.name = 'ky-time-range-picker'

TimeSelect.install = (app: App): void => {
  // 注册聚合组件
  app.component(TimeSelect.name, TimeSelect)
}

PreciseTimeSelect.install = (app: App): void => {
  app.component(PreciseTimeSelect.name as string, PreciseTimeSelect)
}

TimeRangePicker.install = (app: App): void => {
  app.component(TimeRangePicker.name as string, TimeRangePicker)
}

export default TimeSelect
export { TimeSelect, PreciseTimeSelect, TimeRangePicker }
