import type { App } from 'vue'
import Taro from '@tarojs/taro'
import nativeInput from './src/native.vue'
import h5Input from './src/h5.vue'

const env = Taro.getEnv()

// 根据运行环境动态选择组件
const Input = env === Taro.ENV_TYPE.WEB ? h5Input : nativeInput

// 组件名
Input.name = 'ky-input'

// 挂载 install
Input.install = (app: App): void => {
  app.component(Input.name || 'KyInput', Input)
}

export default Input
