import type { UserConfigExport } from '@tarojs/cli'

import copyConfig from './copyConfig'
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  // cache: {
  //   buildDependencies: {
  //     config: [path.join(appPath, 'config/index.js')],
  //   },
  // },
  mini: {},
  h5: {},
  copy: copyConfig,
} satisfies UserConfigExport<'webpack5'>
