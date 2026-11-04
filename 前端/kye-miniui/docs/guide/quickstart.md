# 快速开始
通过本文你可以掌握 kye-miniui 的安装和使用方法，操作简单易上手，开发简洁快速。

## 安装

```js
# pnpm
pnpm add @kye-netc/kye-miniui
# yarn
yarn add @kye-netc/kye-miniui
# npm
npm i @kye-netc/kye-miniui
```

### 第一次安装
#### 方法一：添加.yarnrc配置(推荐)
`"@kye-netc:registry" "http://nexus.ky-tech.com.cn:8081/repository/npmjs-group/"`

#### 方法二：手动安装
`yarn add  @kye-netc/kye-miniui -D --registry=http://nexus.ky-tech.com.cn:8081/repository/npmjs-group/`

### Taro相关配置

#### 组件前置依赖插件@tarojs/plugin-html
::: warning
注意，这里安装的版本 version 必须与项目中 Taro 版本保持一致！
:::
```ts
// config/index.ts
config = {
  // 开启 HTML 插件
  plugins: ['@tarojs/plugin-html'],
}
```

## 组件使用
```ts
import KyeMiniUi from '@kye-netc/kye-miniui'
// 引入所有组件的样式文件
import '@kye-netc/kye-miniui/style.css'
const App = createApp({
})

App.use(KyeMiniUi)
```
