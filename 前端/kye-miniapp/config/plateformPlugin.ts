import webpack from 'webpack'

interface PlatformPluginOptions {
  platform?: string
}

export default class PlatformPlugin {
  private platform: string

  constructor(options: PlatformPluginOptions = {}) {
    this.platform = options.platform || process.env.TARO_ENV || 'weapp'
  }

  apply(compiler: webpack.Compiler) {
    new webpack.NormalModuleReplacementPlugin(/^@platform\.(\w+)$/, (resource) => {
      const ext = resource.request.match(/\.(\w+)$/)?.[1]
      resource.request = `./${this.platform}.${ext}`
    }).apply(compiler)
  }
}
