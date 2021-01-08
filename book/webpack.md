# Webpack

## 一、webpack 原理

![webpack流程图](https://user-images.githubusercontent.com/26785201/89747816-fe344280-daf2-11ea-820a-6a1a99e34f14.png)

### 二、webpack 打包速度优化

https://juejin.cn/post/6844904071736852487

1. 多进程打包 thread-loader、HappyPack
2. 打包缓存
   * cache-loader
   * dll
   * hardSourceWebpackPlugin
3. 优化搜索范围
   * Loader 时可以通过 `test` 、 `include` 、 `exclude` 三个配置项来命中 Loader 要应用规则的文件

webpack 预加载

https://www.cnblogs.com/skychx/p/webpack-webpackChunkName-webpackPreload-webpackPreload.html

