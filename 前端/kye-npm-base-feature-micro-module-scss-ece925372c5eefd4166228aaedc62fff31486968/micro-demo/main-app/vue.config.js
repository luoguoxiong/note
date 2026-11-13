const { defineConfig } = require('@vue/cli-service')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// 共享依赖 CDN 清单(与子应用 netc-pc-web-order-utils-new 的 vue.config.js 保持同一份):
// vue dev 必须用 unpkg dev 构建(含 __VUE_HMR_RUNTIME__,dev 模式 vue-loader HMR 依赖),
// prod 用 ic-img-test prod 构建;其余全局构建无 dev/prod 区分
const vueDevCdn = 'https://unpkg.com/vue@3.3.6/dist/vue.global.js'
const cdnCmsHost = 'https://ic-img-test.ky-express.com/20250911cmsbak'
const isProdBuild = process.env.NODE_ENV === 'production'
const cdnScripts = [
  isProdBuild ? `${cdnCmsHost}/vue@3.3.6.js` : vueDevCdn,
  `${cdnCmsHost}/vue-router@4.2.2.js`,
  `${cdnCmsHost}/vuex@4.1.0.js`,
  `${cdnCmsHost}/pinia@3.04.js`,
  `${cdnCmsHost}/element-plus@2.5.6.js`,
]

/** CDN script 注入:按数组顺序插入 head 最前,保证依赖顺序(vue 最先) */
class CdnInjectPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('CdnInjectPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapPromise('CdnInjectPlugin', async (data) => {
        data.headTags.unshift(
          ...cdnScripts.map((src) => ({
            tagName: 'script',
            voidTag: false,
            meta: { plugin: 'cdn-inject' },
            attributes: { src },
          })),
        )
        return data
      })
    })
  }
}

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    // 与子应用 externals 契约一致:主/子应用共享同一份 CDN 全局依赖,
    // 避免双 Vue 实例及主子应用版本漂移;全局变量由 index.html 按序加载的 CDN script 提供
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      pinia: 'Pinia',
      'element-plus': 'ElementPlus',
    },
  },
  chainWebpack: (config) => {
    // CDN 依赖注入:与子应用 CdnInjectPlugin 相同实现
    config.plugin('cdn-inject').use(CdnInjectPlugin)
    // MicroApp(京东)使用 <micro-app> 自定义元素
    // 告知 Vue 模板编译器将其视为自定义元素,而非待解析的 Vue 组件
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options.compilerOptions = {
          ...(options.compilerOptions || {}),
          isCustomElement: (tag) => tag === 'micro-app',
        }
        return options
      })
  },
  devServer: {
    port: 8000,
    open: true,
    hot: true,
    client: {
      // 子应用经沙箱加载,部分运行时告警/rejection 会被主应用 overlay 捕获展示,联调期关闭
      overlay: false,
    },
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/sub-app-1\/.*$/, to: '/index.html' },
        { from: /^\/sub-app-2\/.*$/, to: '/index.html' },
      ],
    },
    // order-utils 子应用页面跑在主应用域名下,其接口请求需由主应用代理
    // (与子应用 .env.dev 的 API 目标一致)
    proxy: {
      '/router/rest': {
        target: 'http://open-dev.kyepm.com',
        changeOrigin: true,
      },
      '/router/upload': {
        target: 'http://open-dev.kyepm.com',
        changeOrigin: true,
      },
      // 子应用模板里的字面量图片路径(img/xxx.svg,CopyPlugin 拷贝、无 hash)
      // 浏览器按页面域名解析,联调期代理到子应用 devServer
      '/img': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
})
