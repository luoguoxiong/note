// @ts-nocheck

// 引用组件库暴露的方法
import { registerNativeComponents } from '../register-native-components'
import { NativeComponentEntryOptions } from '../types'

function miniNativeImport(ctx, options: NativeComponentEntryOptions) {
  // ctx.onBuildFinish(() => {
  ctx.onBuildComplete(() => {
    console.log('开始注册原生组件...', options)

    const projectRoot = process.cwd()
    // components: ['custom-input', 'custom-textarea'], // 业务自行决定哪些原生组件
    registerNativeComponents({
      ...(options || {}),
      projectRoot,
      components: options?.components ?? [],
    })
  })
}

export default miniNativeImport
