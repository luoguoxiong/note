export interface MiniuiConfig {
  isH5Pc: boolean
  H5PcWidth: number
}

const defaultConfig: MiniuiConfig = {
  isH5Pc: false,
  H5PcWidth: 375,
}

export const miniuiConfig = (() => {
  let _config: MiniuiConfig = defaultConfig

  return {
    get config(): Readonly<MiniuiConfig> {
      return _config
    },
    setConfig(config: MiniuiConfig) {
      _config = Object.freeze(config)
    },
  }
})()
