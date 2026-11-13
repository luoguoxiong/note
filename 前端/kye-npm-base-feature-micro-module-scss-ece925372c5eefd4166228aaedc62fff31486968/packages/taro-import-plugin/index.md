# taro-import-plugin

## 背景

在 Taro 小程序项目中，随着业务增长，常见问题包括：

主包体积过大（超过小程序限制）

多页面依赖重复（vendors / common 膨胀）

import() 异步加载在小程序中无法真正生效

样式（wxss）无法按需加载

Webpack 的异步 chunk 机制在 Web 端有效，但在小程序环境中：

❌ 无法通过 <script> 动态加载
❌ 异步资源通常仍被打入主包或分包

## 插件功能

👉 将 Webpack 异步 chunk 转换为“小程序动态公共分包”

实现：

异步 JS → 动态分包加载

异步 CSS → 合并注入主包

## 安装

```shell
pnpm add @kye-netc/taro-import-plugin -D
# 或
npm install @kye-netc/taro-import-plugin --save-dev
```

## 用法

1️⃣ 配置插件

在 config/index.ts 中：

```typescript
import { defineConfig } from '@tarojs/cli'

export default defineConfig({
  plugins: [['@kye-netc/taro-import-plugin']],
})
```

2️⃣babel.config.js，dynamic-import-node 改为false

```typescript
module.exports = {
  presets: [
    [
      'taro',
      {
        framework: 'vue3',
        ts: true,
        compiler: 'webpack5',
        'dynamic-import-node': false,
      },
    ],
  ],
}
```

3️⃣ 正常开发即可（Vue / React 通用）

无需额外改造代码，照常使用异步加载：

```typescript
// 异步组件
const PageWaybillSearch = defineAsyncComponent({
  loader: async () => {
    Taro.showLoading({ title: '加载中...' })
    const comp = await import(
      '@modules/waybill-build/components/waybill-search/index.vue'
    )
    Taro.hideLoading()
    return comp
  },
})
// 异步JS
import('@/utils/heavy-module')
```

## 注意事项

1. 小程序环境，异步分包引入没有缓存，加载资源有一定延迟，**_建议非首屏内容异步引入，来规避白屏_**
2. 小程序环境，样式没有动态引入的概念，**异步引入的组件的样式都是打包到主包内，要注意样式对主包体积的影响**
