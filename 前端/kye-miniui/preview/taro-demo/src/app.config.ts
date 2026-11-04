import H5Config from './h5.config'
import nativeConfig from './native.config'

const config = process.env.TARO_ENV === 'h5' ? H5Config : nativeConfig

export default config
