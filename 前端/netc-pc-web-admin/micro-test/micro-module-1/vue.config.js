const { defineConfig } = require('@vue/cli-service')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  // 运行时由 src/public-path.js 动态覆盖,这里用 '/' 作为兜底默认值
  publicPath: '/',
  outputDir: 'dist',
  // 开启文件名哈希:prod 产物为 main.[contenthash:8].js,配合 manifest 映射
  filenameHashing: true,
  configureWebpack: {
    // 不再使用 UMD library 输出:registerSubApp 已显式写 window[name],
    // UMD 包装器会在 factory 返回后用空模块导出覆盖该赋值。
    // externals 保留:vue/vue-router 仍共享主应用实例(裸全局变量引用)
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter'
    },
    optimization: {
      splitChunks: false
    },
    plugins: [
      // 生成 manifest.json,主应用通过它解析带 hash 的入口文件名
      new WebpackManifestPlugin({
        fileName: 'manifest.json',
        publicPath: '/'
      })
    ]
  },
  devServer: {
    port: 8001,
    historyApiFallback: true,
    hot: false,
    open: true,
    client: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
})
