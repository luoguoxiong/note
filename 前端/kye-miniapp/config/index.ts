/* eslint-disable no-undef */
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import fs from 'fs'
import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { BuildAsyncPackagePlugin } from '@kye-netc/taro-subpackage-plugin'
import PlatformPlugin from './plateformPlugin'
import devConfig from './dev'
import prodConfig from './prod'
import copyConfig from './copyConfig'
import pxTransform from 'postcss-pxtransform'

const ignoreClassList = [
  'container__body',
  'ky-picker-roller-item-tile',
  'ky-picker-roller-item-tarotile',
  'ky-cell',
  'ky-cell__value',
  'no-bottom-line',
  'cell-right-arrow',
  'required-icon',
  'ky-switch',
  'footer',
  'cell-content',
  'ky-cell-extra',
  'ky-loading',
  'ky-loading-text',
  'h5-input',
  'h5-div',
  'h5-span',
  'h5-img',
]

const externalVueDir = path.resolve(__dirname, '../node_modules/@kye-netc/kye-miniui/packages/')

const isAnalyze = process.argv.includes('--analyze')

const isPreview = process.argv.includes('--preview')

const miniuiPath = path.resolve(__dirname, '../node_modules/@kye-netc/kye-miniui')

// 版本信息
const projectConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../project.miniapp.json'), 'utf-8'))
// APP版本信息
const APP_VERSION = projectConfig?.version || '1.0.0'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'kye-minapp',
    date: '2024-11-5',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    alias: {
      '@': 'src',
      '@public': 'src/public',
      '@modules': 'src/modules',
      '@layout': 'src/layout',
      '@order-public': 'src/modules/order-build/order-public',
      '@pages': 'src/modules/order-build/pages',
      '@order-public-sub-public': 'src/modules/order-build-sub-pages/order-public',
      '@order-public-sub-root-pages': 'src/modules/order-build-sub-pages/root-pages',
      '@order-global-package-order': 'src/modules/order-build/order-global-package',
      '@order-global-package-order-sub': 'src/modules/order-build-sub-pages/order-global-package',
      '@order-global-package-freight-time': 'src/modules/freight-time/order-global-package',
      '@packages': externalVueDir,
      '@ky-miniui-lib/ky-miniui-lib': path.resolve(externalVueDir, './ky-miniui-lib'),
      '@ky-miniui-lib/utils': path.resolve(externalVueDir, './utils'),
      '@ky-miniui-lib': path.resolve(externalVueDir, './__components'),
      '@freight-time': 'src/modules/freight-time',
    },
    sourceRoot: 'src',
    baseLevel: 34,
    outputRoot: `dist/${process.env.TARO_ENV}`,
    plugins: [
      '@tarojs/plugin-http',
      '@tarojs/plugin-html',
      '@kye-netc/miniapp-plugins',
      [
        '@kye-netc/taro-import-plugin',
        {
          dynamicPackageCount: 2,
        },
      ],
      // 按需调试页面过滤：仅当命令行传入 --debug-pages 时启用，未传参时完全 bypass
      // 依赖未安装时跳过，不影响正常构建
      ...(fs.existsSync(path.resolve(__dirname, '../node_modules/@kye-netc/taro-debug-page'))
        ? [
            [
              '@kye-netc/taro-debug-page',
              {
                defaultPages: [
                  'modules/user/pages/login/index',
                  'layout/pages/mine/index',
                  'modules/setting/pages/index/index',
                ],
                scanDirs: ['layout/pages/home'],
              },
            ],
          ]
        : []),
    ],
    defineConstants: {
      APPLICATION_ENV: JSON.stringify('MainApp'),
      APP_VERSION: JSON.stringify(APP_VERSION),
    },
    copy: copyConfig,
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false,
      },
    },
    cache: {
      // 小程序不开启缓存，开启缓存会出现原生组件不渲染的情况
      enable: process.env.TARO_ENV === 'h5', // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      compile: {
        include: [externalVueDir],
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            overrideBrowserslist: [], // 这里清空，就不会加 -webkit-
          },
        },
        // 开发时干掉 rootVars，避免小程序开发者工具无法预览样式
        // eslint-disable-next-line no-undef
        './remove-root-vars': { enable: process.env.NODE_ENV === 'development' },
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: (localName, absoluteFilePath) => {
              if (ignoreClassList.includes(localName)) {
                return localName
              }
              const hash = require('crypto').createHash('md5')
              hash.update(localName)
              const hashDigest = hash
                .digest('base64')
                .substr(0, 5)
                .replace(/[^a-zA-Z0-9]/g, '')
              // const fileName = path.basename(absoluteFilePath, '.css')
              const fileName = path.basename(path.dirname(absoluteFilePath))
              const shortFileName = fileName.charAt(0) // 文件名首字母
              const shortLocalName = localName.charAt(0) // 类名首字母
              const className = process.env.NODE_ENV === 'production' ? shortLocalName : localName // 开发阶段能看到具体类名方便调试
              return `${shortFileName}_${className}_${hashDigest}`
            },
          },
        },
      },
      optimizeMainPackage: {
        enable: true,
        // exclude: [(modulePath) => /[\\/]node_modules[\\/]lodash-es[\\/]/.test(modulePath)],
      },
      webpackChain(chain) {
        // 忽略组件库的scss文件样式，不打包
        chain.module
          .rule('miniui-scss')
          .test(/\.scss$/)
          .include.add(miniuiPath)
          .end()
          .use('null-loader')
          .loader('null-loader')
        chain.resolve.symlinks(false)
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.plugin('BuildAsyncPackagePlugin').use(new BuildAsyncPackagePlugin())
        if (isAnalyze) {
          chain.plugin('analyzer').use(BundleAnalyzerPlugin, [{}])
        }
        chain.plugin('PlatformPlugin').use(new PlatformPlugin())
        if (process.env.NODE_ENV === 'production' || isPreview) {
          chain.merge({
            plugin: {
              // 解决包体积过大无法进行预览的问题
              terse: {
                plugin: TerserPlugin,
                args: [
                  {
                    test: /\.js(\?.*)?$/i,
                    minify: TerserPlugin.swcMinify,
                    exclude: [
                      /components\/custom-input\/index\.js$/,
                      /components\/custom-input\/utils\.js$/,
                      /components\/custom-login-btn\/index\.js$/,
                      /components\/custom-textarea\/index\.js$/,
                      /components\/custom-textarea\/utils\.js$/,
                      /node_modules\/crypto-js/,
                      /image-cropper\.js/,
                      /location-net\/utils\/mapbox\.js/,
                    ], // 排除整个 crypto-js 库],
                    terserOptions: {
                      compress: {
                        drop_console: process.env.NODE_ENV === 'production',
                        drop_debugger: process.env.NODE_ENV === 'production',
                        // pure_funcs: ['console.log', 'console.info', 'console.warn'] // 更安全的 console 移除
                      },
                      mangle: true,
                      format: {
                        comments: false,
                      },
                      sourceMap: false,
                    },
                  },
                ],
              },
            },
            // mode: 'production',
          })
        }
      },
    },
    h5: {
      devServer: {
        proxy: {
          '/router/rest': {
            target: process.env.TARO_APP_BASE_URL,
            changeOrigin: true,
            pathRewrite: { '^/router/rest': '/router/rest' },
          },
          '/router/upload': {
            target: 'https://api-uat.kyeapi.com',
            changeOrigin: true,
          },
        },
        port: 8080,
        hot: true,
        open: true,
        client: {
          overlay: false, // 隐藏浮层
          logging: 'error',
        },
      },
      publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
      staticDirectory: 'static',
      output: {
        filename: process.env.NODE_ENV !== 'production' ? 'js/[name].js' : 'js/[name].[contenthash:8].js',

        chunkFilename: process.env.NODE_ENV !== 'production' ? 'js/[name].chunk.js' : 'js/[name].[contenthash:8].js',
      },

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: process.env.NODE_ENV !== 'production' ? 'css/[name].css' : 'css/[name].[contenthash:8].css',

        chunkFilename:
          process.env.NODE_ENV !== 'production' ? 'css/[name].chunk.css' : 'css/[name].[contenthash:8].css',
      },
      compile: {
        include: [path.resolve(__dirname, '../node_modules/')],
        //  include: [externalVueDir, externalPlatformDir, path.resolve(__dirname, '../node_modules/')],
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        pxtransform: {
          enable: true,
          config: {
            designWidth: 750,
          },
        },
        cssModules: {
          enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: (localName, absoluteFilePath) => {
              if (ignoreClassList.includes(localName)) {
                return localName
              }
              const hash = require('crypto').createHash('md5')
              hash.update(localName)
              const hashDigest = hash
                .digest('base64')
                .substr(0, 5)
                .replace(/[^a-zA-Z0-9]/g, '')
              // const fileName = path.basename(absoluteFilePath, '.css')
              const fileName = path.basename(path.dirname(absoluteFilePath))
              const shortFileName = fileName.charAt(0) // 文件名首字母
              const shortLocalName = localName.charAt(0) // 类名首字母
              const className = process.env.NODE_ENV === 'production' ? shortLocalName : localName // 开发阶段能看到具体类名方便调试
              return `${shortFileName}_${className}_${hashDigest}`
            },
          },
        },
      },
      htmlPluginOption: {
        templates: path.resolve(__dirname, '../src/index.h5.html'),
        filename: 'index.html',
        inject: true,
      },
      webpackChain(chain) {
        chain.plugin('PlatformPlugin').use(new PlatformPlugin())
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        // 移除waring
        chain.stats({ warnings: false })

        // 忽略组件库的scss文件样式，不打包
        chain.module
          .rule('miniui-scss')
          .test(/\.scss$/)
          .include.add(miniuiPath)
          .end()
          .use('null-loader')
          .loader('null-loader')

        // 组件库的样式转rem
        chain.module
          .rule('kye-miniui-css')
          .test(/\.css$/)
          .include.add(miniuiPath)
          .end()
          .use('postcss-loader')
          .loader('postcss-loader')
          .options({
            postcssOptions: {
              plugins: [
                pxTransform({
                  designWidth: 750,
                  deviceRatio: { 750: 1 },
                  platform: 'h5', // 强制 H5 转 rem
                }),
              ],
            },
          })
        chain.plugin('htmlWebpackPlugin').tap((options) => {
          return [
            {
              ...options[0],
              template: path.resolve(__dirname, '../src/index.h5.html'),
            },
          ]
        })
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
    sass: {
      resource: path.resolve(externalVueDir, './scss/base/variable.scss'),
    },
  }

  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
