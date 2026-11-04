/**
 * @Desc: pluginsConfig
 * @Author: wu xingtao
 * @Date: 2024/12/13
 */
// @ts-nocheck
import path from 'path'
const ModifyBaseAxmlPlugin = path.resolve('./plugins/modify-base-axml-plugin.ts')
const plugins = [
  ['@tarojs/plugin-html'],
  [
    '@tarojs/plugin-inject',
    {
      components: {
        ScrollView: {
          throttle: 'throttle',
        },
      },
    },
  ],
]
/* 匹配支付宝环境-插件配置 */
if (process && ['alipay', 'weapp'].includes(process.env.TARO_ENV)) {
  plugins.push([ModifyBaseAxmlPlugin, {}])
}

export default plugins
