// vite.config.node.ts (构建原生组件引用插件)
import { defineConfig } from 'vite'
import * as path from 'path'

export default defineConfig({
  build: {
    minify: false,
    target: 'ES2019',
    lib: {
      entry: path.resolve(__dirname, './taro-plugin-miniui-native/index.ts'),
      formats: ['cjs'],
      fileName: () => 'taro-plugin-miniui-native.cjs',
    },
    outDir: path.resolve(__dirname, './dist'),
    rollupOptions: {
      external: ['fs', 'path'], // Node 内置模块不要打包
      output: { exports: 'named' },
    },
  },
})
