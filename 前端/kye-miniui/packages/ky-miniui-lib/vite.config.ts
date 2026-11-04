import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import VueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// @ts-ignore
export default defineConfig({
  root: './',
  resolve: {
    alias: [
      {
        find: '@packages',
        replacement: path.resolve(__dirname, '../../packages'),
      },
      { find: '@', replacement: path.resolve(__dirname, '../../packages') },
    ],
    extensions: ['.ts', '.tsx', '.d.ts', '.vue', '.js', '.json'],
  },
  plugins: [
    vue(),
    VueJsx(),
    dts({
      insertTypesEntry: true,
      staticImport: true,
      copyDtsFiles: true,
    }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: '../../packages/__native/', // 原生组件目录
    //       dest: 'packages/', // dist 下的目标文件夹
    //     },
    //     {
    //       src: '../../packages', // 要复制的源文件夹或文件
    //       dest: '', // 复制到 dist 中的目标文件夹
    //     },
    //   ],
    // }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 自动注入全局变量、函数或混合
        additionalData: `@use "../scss/base/variable.scss" as *;`,
      },
    },
  },
  build: {
    cssMinify: false,
    minify: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, './index.ts'),
      name: 'ky-miniui-lib',
      fileName: (format) => `ky-miniui-lib.${format}.js`,
    },
    outDir: path.resolve(__dirname, '../../lib'),
    rollupOptions: {
      external: ['vue', '@tarojs/taro', '@kye-netc/plateform', 'daysjs'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
