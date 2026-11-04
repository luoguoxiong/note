const path = require('path')
const webpack = require('webpack')
const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { createGranlarChunks } = require('./webpack.build')
const proxyTarget = process.env.API

const isProd = process.env.NODE_ENV?.trim() === 'production'

const isAnalyse = process.env.ANAYLYSE === 'true'

// CDN 外部化：构建时 vue / vue-router / element-plus 不打入 bundle，改为引用全局变量
// 注意：
// 1. 对象形式 externals 为精确匹配，而 unplugin 的 ElementPlusResolver 生成的是
//    `import { ElXxx } from 'element-plus/es'`，故需额外登记 'element-plus/es'
// 2. 'element-plus/dist/*'（如 zh-cn 语言包）不外部化，仍正常打包
// 3. '@element-plus/icons-vue' 为独立包，CDN 的 element-plus.js 不含其导出，
//    由 icons-vue@2.3.1.js 单独提供全局变量 ElementPlusIconsVue
const cdnExternals = {
  vue: 'Vue',
  'vue-router': 'VueRouter',
  'element-plus': 'ElementPlus',
  'element-plus/es': 'ElementPlus',
  '@element-plus/icons-vue': 'ElementPlusIconsVue',
  vuex: 'Vuex',
  pinia: 'Pinia',
}

// index.html 注入的 CDN 资源（见 chainWebpack 中 html 插件配置）
// dev 模式必须使用开发版 vue 全局构建：生产版不含 __VUE_HMR_RUNTIME__，
// vue-loader 注入的 HMR 代码会报 "__VUE_HMR_RUNTIME__ is not defined"。
// 可通过 VUE_DEV_CDN 环境变量指向内网镜像（需为 dev 版 vue.global.js）
const vueDevCdn = 'https://unpkg.com/vue@3.3.6/dist/vue.global.js'

const cdnResources = {
  css: ['https://ic-img-test.ky-express.com/20250911cmsbak/element-plus@2.5.6.css'],
  js: [
    isProd ? 'https://ic-img-test.ky-express.com/20250911cmsbak/vue@3.3.6.js' : vueDevCdn,
    'https://ic-img-test.ky-express.com/20250911cmsbak/vue-router@4.2.2.js',
    'https://ic-img-test.ky-express.com/20250911cmsbak/element-plus@2.5.6.js',
    'https://ic-img-test.ky-express.com/20250911cmsbak/icons-vue@2.3.1.js',
    'https://ic-img-test.ky-express.com/20250911cmsbak/vuex@4.1.0.js',
    'https://ic-img-test.ky-express.com/20250911cmsbak/pinia@3.04.js',
  ],
}

const mock = require('./mock')

module.exports = defineConfig({
  publicPath: './',
  productionSourceMap: false,
  lintOnSave: !isProd,
  configureWebpack: {
    devtool: isProd ? false : 'eval-source-map',
    externals: cdnExternals,
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, './node_modules/.webpack_cache'),
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    plugins: [
      // 临时绕过：@netc-design-pc/ui 的 ESM 入口 index.mjs 是 barrel 全量导出，
      // 会静态引用 table / datetime-picker，连带解析其 peer 依赖（vxe-table、
      // vxe-pc-ui、@vuepic/vue-datepicker 等）
      new webpack.IgnorePlugin({
        resourceRegExp: /^(vxe-table|vxe-pc-ui|xe-utils|dom-zindex|@vuepic\/vue-datepicker)(\/.*)?$/,
      }),
      // 关闭 Element Plus 按需样式注入：@netc-design-pc/theme-chalk 已经通过
      // @use 'element-plus/theme-chalk/src/index.scss' 编译了 EP 全量主题，
      // 且公司在 element-override 里做了变量覆盖。
      // 若再注入 EP 预编译 CSS（el-xxx.css + base.css），base.css 里的默认变量
      // （:root{--el-color-primary:#409eff}）会在 theme-chalk 之后加载，
      // 与 theme-chalk 的 :root 覆盖同优先级，后加载者胜出，导致主题色覆盖失效。
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: false })],
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: false })],
      }),
      // new PreloadWebpackPlugin({
      //   rel: 'prefetch',
      //   include: 'asyncChunks',
      //   as: 'script',
      //   fileBlacklist: [/(\.png)|(\.gif)|(\.svg)|(\.jpg)/],
      // }),
    ],
    output: {
      filename: `[name]${isProd ? '.[contenthash]' : ''}.js`,
      pathinfo: false,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: /node_modules\/@vuepic/,
        },
      ],
    },
    optimization: {
      sideEffects: isProd ? true : 'flag',
      providedExports: true,
      splitChunks: isProd
        ? {
            chunks: 'all',
            minSize: 30000,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            cacheGroups: {
              ...createGranlarChunks({
                // vue / vue-router / vuex 已走 CDN externals，此处仅保留仍需打包的 vue 生态包
                'vue-packages': ['@vue', '@vueuse'],
                'core-js': ['core-js'],
              }),
            },
          }
        : {},
      minimizer: [
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      ],
    },
  },
  chainWebpack: (config) => {
    // 获取 vue-loader 的配置
    const vueLoader = config.module.rule('vue').use('vue-loader').get('options')

    // 禁用 babel-loader 的缓存
    vueLoader.compilerOptions = {
      ...vueLoader.compilerOptions,
      cacheDirectory: false,
    }

    config.plugins.delete('ESLintWebpackPlugin')

    config.when(!isProd, (config) => {
      config.optimization.removeAvailableModules(false)
      config.optimization.removeEmptyChunks(false)
    })

    config.when(isProd, (config) => {
      config.plugin('extract-css').tap((args) => {
        args[0].ignoreOrder = true // 因开启scoped css，忽略顺序该警告
        return args
      })
    })

    // 向 index.html 模板传递 CDN 资源列表，模板据此注入 <link>/<script> 标签
    // dev / prod 均注入：externals 在两种模式下都生效，CDN 脚本必须先于业务 bundle 加载
    config.plugin('html').tap((args) => {
      args[0].cdn = cdnResources
      // 首屏 loading gif 按环境区分 prod / uat 地址
      args[0].isProduction = isProd
      return args
    })

    config.module.rule('svg').exclude.add(path.join(__dirname, 'src/icons/svg')).end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(path.join(__dirname, 'src/icons/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end()

    config.optimization.minimizer('terser').tap((args) => {
      Object.assign(args[0], {
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.table'],
          },
        },
        extractComments: false,
      })
      return args
    })

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options.compilerOptions = options.compilerOptions || {}
        options.compilerOptions.hoistStatic = false
        // micro-app 使用 Web Components 自定义元素，需告知 Vue 模板编译器跳过解析
        options.compilerOptions.isCustomElement = (tag) => tag === 'micro-app'
        return options
      })

    // 构建计时
    config.when(isAnalyse, (config) => {
      config.plugin('speed-measure-webpack-plugin').use(SpeedMeasurePlugin).end()
      // 构建分析
      config.plugin('webpack-bundle-analyzer').use(BundleAnalyzerPlugin).end()
    })
  },
  css: {
    loaderOptions: {
      scss: {
        // additionalData 会被注入到每一个经 sass-loader 处理的 .scss 文件最前面。
        // 若不做过滤，node_modules 的第三方样式（如 @netc-design-pc/theme-chalk/src/index.scss）
        // 会在其 @use 之前被塞入 @import，触发 Sass 报错
        // “@use rules must be written before any other rules”。
        // 故改为函数形式：仅对项目自身源码注入，第三方包原样透传。
        additionalData: (content, loaderContext) => {
          if (loaderContext.resourcePath.includes('node_modules')) {
            return content
          }
          return [
            '@import "@/styles/tools/mixins.scss";',
            '@import "@/components/styles/settings/variable.scss";',
            '@import "@/components/styles/tools/mixins.scss";',
            content,
          ].join('\n')
        },
      },
    },
  },
  /** 配置本地代理 */
  devServer: {
    https: process.env.ENV_ISPREVIEW ? true : false,
    // 此处写法由before改为setupMiddlewares
    onBeforeSetupMiddleware: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      if (!isProd) {
        mock(devServer.app)
      }

      return devServer
    },
    client: {
      overlay: false,
    },
    proxy: {
      '/router/rest': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/router/upload': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
    open: true,
  },
})
