import { App } from 'vue'
import List from './src/alipay.vue'
import WxList from './src/wx.vue'
import Taro from '@tarojs/taro'
const ListCom = Taro.getEnv() === 'WEAPP' ? WxList : List

// const ListCom = List

ListCom.name = 'ky-list'

ListCom.install = (app: App): void => {
  // 注册组件
  app.component(ListCom.name, ListCom)
}

export default ListCom
