import wxConfig from './wx.config'
import aliConfig from './alipay.config'

const config = process.env.TARO_ENV === 'alipay' ? aliConfig : wxConfig

export default config
