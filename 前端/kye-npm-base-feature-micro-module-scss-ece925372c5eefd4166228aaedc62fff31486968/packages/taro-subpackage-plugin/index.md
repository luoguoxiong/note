# taro-subpackage-plugin

**taro-subpackage-plugin** 是一个适用于 **Taro + Webpack**
的构建插件，用于自动构建 `src/libs` 目录下的异步分包（Async
Packages），并将其自动注入到 `dist/[platform]/app.json`
中。同时支持平台差异化文件替换与开发环境的文件监听自动重构。

适用于需要按需加载、分包、优化主包大小和首屏性能的 Taro 小程序项目。

## 🚀 功能特性

-   **自动构建 `src/libs` 子目录为分包**
    -   每个目录自动输出为 `libs/[packageName]/index.js`
    -   使用 `esbuild` 高速构建
-   **自动写入 `app.json.subPackages`**
    -   无需手动维护分包配置
-   **支持平台差异化加载**
    -   使用 `@platform.esm.js` 根据 `TARO_ENV` 自动替换
    -   如 `weapp.esm.js、alipay.esm.js` 自动映射
-   **开发环境自动监听**
    -   文件变更 → 自动重建所有分包 → 自动更新 `app.json`
-   **构建优化**
    -   生产模式自动压缩
    -   自动移除 `console` 和 `debugger`

## 📦 安装

``` bash
npm i @kye-netc/taro-subpackage-plugin -D
# 或
yarn add @kye-netc/taro-subpackage-plugin -D
```

## 🔧 使用方法

在 Taro 的 Webpack 配置中添加插件，例如 `config/index.js`：

``` js
import { BuildAsyncPackagePlugin } from '@kye-netc/taro-subpackage-plugin'

const config = {
  mini: {
    webpackChain(chain) {
      chain
        .plugin('BuildAsyncPackagePlugin')
        .use(
          new BuildAsyncPackagePlugin({
            envs: ['weapp', 'alipay'],
            watch: true,
          })
        )
    },
  },
}
```

## ⚙️ 插件配置

  选项      类型         默认值                  说明

--------- ------------ ----------------------- ----------------------------

  `envs`    `string[]`   `['weapp', 'alipay']`   指定哪些平台启用插件
  `watch`   `boolean`    `true`                  是否开启开发环境的监听模式

### 示例：

``` js
new BuildAsyncPackagePlugin({
  envs: ['weapp'], // 只在微信小程序启用
  watch: false,    // 只构建一次，不监听
})
```

## 📂 项目结构要求

插件会读取：

    src/libs/
      ├── pkgA/
      │   ├── index.ts
      │   └── weapp.esm.js
      ├── pkgB/
      │   ├── index.ts
      │   └── alipay.esm.js
      └── ...

构建输出：

    dist/[platform]/libs/[pkgName]/index.js

自动写入 `app.json`：

``` json
{
  "subPackages": [
    {
      "root": "libs/pkgA",
      "pages": []
    }
  ]
}
```

## 🔄 平台差异化文件加载

在分包中可以引用：

``` ts
import platform from '@platform.esm.js'
```

插件会自动按平台替换对应文件：

  TARO_ENV   实际加载文件

---------- -----------------

  weapp      `weapp.esm.js`
  alipay     `alipay.esm.js`
  jd         `jd.esm.js`

示例：\
`index.ts`

``` ts
import platform from '@platform.esm.js'

export function sayHi() {
  platform.log('Hello')
}
```

`weapp.esm.js`

``` js
export default {
  log(...msg) {
    console.log('[weapp]', ...msg)
  },
}
```

## 🛠️ 开发环境行为（NODE_ENV=development）

-   自动监听 `src/libs/**/*.{ts,js}`
-   文件新增/修改/删除自动触发重构
-   自动更新 `dist/[platform]/app.json`

## 🧱 生产环境行为（NODE_ENV=production）

-   构建一次，不监听变化
-   自动压缩代码
-   自动移除 `console` / `debugger`
-   自动更新分包配置

## 🧩 最小可运行示例

    src/libs/logger/
      ├── index.ts
      └── weapp.esm.js

`index.ts`:

``` ts
import platform from '@platform.esm.js'

export function log(...args: any[]) {
  platform.log('[Logger]', ...args)
}
```

`weapp.esm.js`:

``` js
export default {
  log: (...args) => console.log('[WeApp]', ...args),
}
```

构建后生成：

    dist/weapp/libs/logger/index.js

并写入 `app.json`：

``` json
{
  "subPackages": [
    {
      "root": "libs/logger",
      "pages": []
    }
  ]
}
```