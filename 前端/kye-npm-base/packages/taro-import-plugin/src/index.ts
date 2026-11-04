import type { IPluginContext } from '@tarojs/service'
import type { PathData } from 'webpack'
import { transformWebpackRuntime } from './transform-webpack-runtime'
import {
  TransformOpt,
  TransformBeforeCompressionPlugin,
  PLUGIN_NAME as TransformBeforeCompressionPluginName,
} from './transform-before-compression-plugin'
import { transformAppConfig } from './transform-app-config'
import {
  generateDynamicPackageName,
  hashModBigInt,
  isDynamicPackageName,
  isDynamicPackageAsset,
  getExt,
} from './utils'
import { AsyncPackOpts } from './types'
import { transformAppStylesheet } from './transform-app-stylesheet'
import {
  MergeOutputPlugin,
  PLUGIN_NAME as MergeOutputPluginName,
} from './merge-output'

export { AsyncPackOpts } from './types'


const dynamicPackOptsDefaultOpt: AsyncPackOpts = {
  dynamicPackageNamePrefix: 'kye-import',
  dynamicPackageCount: 1,
}

export default (ctx: IPluginContext) => {
  if (!['weapp', 'alipay'].includes(process.env.TARO_ENV!)) return

  const finalOpts = { ...dynamicPackOptsDefaultOpt }

  ctx.modifyWebpackChain(({ chain }) => {
    // 动态获取现有的 splitChunks 配置
    const existingSplitChunks = chain.optimization.get('splitChunks') || {}

    const { common, vendors } = existingSplitChunks.cacheGroups

    /**
     * 修改 chunks 类型
     * 默认是 all
     * 这里改为 initial
     * 避免 async chunk 被错误拆分
     */
    const newCommonChunks = common ? { ...common, chunks: 'initial' } : common

    const newVendorsChunks = vendors
      ? { ...vendors, chunks: 'initial' }
      : vendors

    const generateChunkFilename = (pathData: PathData, ext: string) => {
      const { chunk } = pathData
      const order = hashModBigInt(
        chunk?.hash || '',
        finalOpts.dynamicPackageCount,
      )
      return `${generateDynamicPackageName({ ...finalOpts, order })}/[chunkhash]${ext}`
    }

    chain.optimization.merge({
      splitChunks: {
        ...existingSplitChunks,
        cacheGroups: {
          ...existingSplitChunks.cacheGroups,
          common: {
            ...common,
            chunks: 'initial', // 保守
          },
          vendors: {
            ...vendors,
            chunks: 'all', // 👈 关键
            enforce: true,
          },
        },
      },
    })

    // 异步js文件统一拆分到dynamic-common目录下
    chain.merge({
      output: {
        chunkFilename: (pathData: PathData) =>
          generateChunkFilename(pathData, '.js'),
        path: ctx.paths.outputPath,
        clean: false,
      },
    })

    // 异步css文件统一拆分到dynamic-common目录下
    chain.plugin('miniCssExtractPlugin').tap((args: any) => {
      const [options] = args
      const chunkFilename = (pathData: PathData) =>
        generateChunkFilename(pathData, `.${getExt()}`)
      return [{ ...options, chunkFilename }]
    })

    // 把异步dynamic-common目录下的xwxss文件统一整合到根目录的dynamic-common.wxss
    chain.plugin(MergeOutputPluginName).use(MergeOutputPlugin, [
      {
        test: (assetName: string) =>
          isDynamicPackageAsset(finalOpts.dynamicPackageNamePrefix, assetName),
        outputFile: `${finalOpts.dynamicPackageNamePrefix}.${getExt()}`,
      },
    ])

    /**
     * 在压缩之前，整合runtime
     * 1. css:修改runtime，app.wxss 引入异步分包的dynamic-common.wxss css文件
     * 2. js：修改runtime, webpack默认打包把异步chunks，通过script标签引入->小程序require.async
     */
    chain
      .plugin(TransformBeforeCompressionPluginName)
      .use(TransformBeforeCompressionPlugin, [
        {
          test: /^(runtime\.js|app\.(wxss|acss))$/,
          transform: (opt: TransformOpt) => {
            const { source, assetName, assets } = opt
            const transformOpts = { ...finalOpts, assets }
            if (/^app\.(?:wxss|acss)$/.test(assetName))
              return transformAppStylesheet(source as string, transformOpts)
            if (/^runtime\.js$/.test(assetName))
              return transformWebpackRuntime(source as string, transformOpts)
            return source as string
          },
        },
      ])
  })

  // 修改app.json,异步分包写入subPackages
  ctx.modifyBuildAssets(({ assets }) => {
    const hasDynamicModule = Object.keys(assets).some((key) =>
      isDynamicPackageName(finalOpts.dynamicPackageNamePrefix, key),
    )

    if (!hasDynamicModule) return

    transformAppConfig({ ...finalOpts, assets })
  })
}
