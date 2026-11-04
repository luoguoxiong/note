import type { UserConfigExport } from '@tarojs/cli'
import path from 'path'
const externalVueDir = path.resolve(__dirname, '../../../packages') // 替换为你的外部 Vue 文件路径

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
  copy: {
    patterns: [
      {
        from: path.resolve(externalVueDir, './__native/custom-input'), // 项目外的目录
        to: 'dist/weapp/components/custom-input', // 会复制到 dist/weapp/
      },
    ],
    options: {},
  },
} satisfies UserConfigExport<'webpack5'>
