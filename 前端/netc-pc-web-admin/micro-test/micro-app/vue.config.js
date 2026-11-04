const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  // 运行时由 src/public-path.js 在微前端环境下动态覆盖
  publicPath: '/',
  outputDir: 'dist',
  filenameHashing: true,
  devServer: {
    port: 8004,
    historyApiFallback: true,
    hot: false,
    open: true,
    client: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
});
