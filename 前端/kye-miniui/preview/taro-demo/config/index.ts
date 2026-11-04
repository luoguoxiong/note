// @ts-nocheck
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'
import path from 'path'
import { demoComponents } from '../src/utils/demoImport'
import pluginsConfig from './pluginsConfig'

const externalVueDir = path.resolve(__dirname, '../../../packages') // 替换为你的外部 Vue 文件路径
const externalDocDir = path.resolve(__dirname, '../../../docs')
// 是否dev预览模式
const isPreview = process.argv.includes('--preview')

//@ts-ignore
// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  //@ts-ignore
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
      '@packages': externalVueDir,
      '@doc': externalDocDir,
    },
    sourceRoot: 'src',
    outputRoot: `dist/${process.env.TARO_ENV}`,
    plugins: pluginsConfig,
    defineConstants: {},
    copy: {
      patterns: [
        {
          from: path.resolve(externalVueDir, './__native'), // 项目外的原生组件目录
          to: 'dist/weapp/components/', // 会复制到 dist/weapp/
        },
      ], // 必须是数组
      options: {},
    },
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false,
      },
    },
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      compile: {
        include: [externalVueDir, externalDocDir],
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        // 预览模式开启压缩
        if (isPreview) {
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
                      /components\/custom-textarea\/index\.js$/,
                      /components\/custom-textarea\/utils\.js$/,
                      /node_modules\/crypto-js/,
                    ], // 排除整个 crypto-js 库],
                    terserOptions: {
                      compress: {
                        drop_console: process.env.NODE_ENV === 'production',
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
        /*        // 添加外部目录支持到 Babel
        chain.module.rule('script').include.add(externalVueDir).end()
        chain.module.rule('script').include.add(externalDocDir).end()*/
      },
    },
    h5: {
       devServer: {
        client: {
          overlay: false, // 隐藏浮层
        },
      },
      compile: {
        include: [externalVueDir, externalDocDir],
      },
      publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js',
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.stats({ warnings: false })
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
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
