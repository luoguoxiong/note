基于 Vue3 + Vite 独立组件库脚手架

脚手架采用 monorepo 风格，使用 pnpm 作为包管理工具。

## 组件库在线文档
[文档地址](http://miniui-doc.ky-tech.com.cn/)

## 外部引用说明
### 组件前置依赖插件@tarojs/plugin-html
```ts
// config/index.ts
    plugins: ['@tarojs/plugin-html'],
```
### install

#### 方法一：添加.yarnrc配置(推荐)
`"@kye-netc:registry" "http://nexus.ky-tech.com.cn:8081/repository/npmjs-group/"`

#### 方法二：手动安装
`yarn add  @kye-netc/kye-miniui -D --registry=http://nexus.ky-tech.com.cn:8081/repository/npmjs-group/`

### 全局引入

```ts
import KyeMiniUi from '@kye-netc/kye-miniui'
import '@kye-netc/kye-miniui/style.css'
const App = createApp({
})
// @ts-ignore
App.use(KyeMiniUi)
```

### 组件库开发分支流程

* master: 主干
* release: 预发布归档分支                    (用于归档到master)
* release-(version): 预发布版本 如：0.1.441  (用于归档到release)
* uat：测试分支-用于测试环境并行迭代测试

dev-xx: 开发分支-从master拉取,合并到对应release-(version分支)
![分支流程](https://ic-img.ky-express.com/netc/20251225_66625_!!1766648340900_2856_3048.png)

## 组件库脚手架内容

- 组件库开发、打包、发布
- 组件库文档编写、打包、一套代码编写和演示 Demo
- 快速创建组件命令行 cli
- 组件库搭建的 example 演示

## 组件库脚手架技术栈

- Vite 4
- Vue 3
- TypeScript
- Vitepress 1.0
- ESLint

#### 安装依赖

如果您没有安装 pnpm，需要先按照 pnpm

```shell
npm install -g pnpm
```

安装依赖：

```shell
pnpm i
```

#### 本地开发

在 example 中开发组件，使用命令：

```shell
pnpm run dev:dev
```



访问地址为 http://localhost:3000/

在组件库文档中开发组件，使用命令：

```shell
pnpm run docs:dev
```

访问地址为 http://localhost:3100/

#### 本地开发-开发者工具

在微信开发者工具开发组件：
```shell
pnpm run dev:wx
```

本地小程序地址: kye-miniui\preview\taro-demo\dist\weapp


在支付宝开发者工具开发组件：
```shell
pnpm run dev:alipay
```
本地小程序地址: kye-miniui\preview\taro-demo\dist\alipay


打包demo-微信小程序
```shell
pnpm run build:wx
```
打包demo-支付宝小程序
```shell
pnpm run build:alipay
```

#### 创建新组件

```shell
pnpm run gen:cli
```
按照提示输入组件名称、组件中文名称

#### 构建文档
```shell
pnpm run build:docs
```
打包构建后的文件位于 _docs/.vitepress/dist_ 目录

#### 构建 example
```shell
pnpm run build:dev
```
打包构建后的文件位于 _dist_ 目录

#### 发布组件库

组件库打包：

```shell
pnpm run build:lib
```
组件库版本更新 + 版本日志:
```shell
pnpm run build:log
```

在发布 npm 前可以在本地私服进行测试。
启动本地私服：
```shell
pnpm run start:verdaccio
```
启动成功后在浏览器中访问 http://localhost:4873/

如果初次使用，需要创建用户。

发布组件库到本地私服中：
```shell
pnpm run pub:local
```


## 组件库命令说明

组件库的命令入口均在根目录的 _package.json_ 中的 _scripts_ 中。由于采用了 monorepo 的方式，大多命令的实现都在各自的模块中。

所有命令如下：

```
- dev:dev
- dev:uat
- dev:prod
- build:dev
- build:uat
- build:prod
- preview:example
- build:lib
- docs:dev
- docs:build
- docs:preview
- gen:cli
- start:verdaccio
- pub:local
```

#### pnpm run dev:dev

本地开发 example，使用 dev 环境配置，访问地址为 http://localhost:3000/

#### pnpm run dev:uat

本地开发 example，使用 uat 环境配置，访问地址为 http://localhost:3000/

#### pnpm run dev:prod

本地开发 example，使用 prod 环境配置，访问地址为 http://localhost:3000/

#### pnpm run build:dev

打包 dev 环境 example，打包生成的文件位于项目根目录的 _dist_ 目录

#### pnpm run build:uat

打包 uat 环境 example，打包生成的文件位于项目根目录的 _dist_ 目录

#### pnpm run build:prod

打包 prod 环境 example，打包生成的文件位于项目根目录的 _dist_ 目录

#### pnpm run preview:example

预览打包后的 example，访问地址为：http://localhost:4173/

#### pnpm run build:lib

打包组件库，打包生成的文件位于项目根目录的 _lib_ 目录

#### pnpm run docs:dev

本地开发组件库文档，访问地址为：http://localhost:3100/

#### pnpm run docs:build

组件库文档打包，打包生成的文件位于项目根目录下的 _docs/.vitepress/dist_ 目录

#### pnpm run docs:preview

预览打包后的组件库文档，访问地址为：http://localhost:4173/

#### pnpm run gen:cli

运行脚手架，目前支持 create-components、refresh-doc
create-components 创建新组件。依次输入组件名、组件描述（中文名称），组件类型（vue）即可自动生成组件并完成配置。
refresh-doc 更新某组件的docs/components 下的md文档，vue3仅支持props和emit

使用该命令可避免组件开发人员分散精力到各种配置、基础目录和文件的创建中，可以让其聚焦于组件本身的开发。

#### pnpm run start:verdaccio

启动 verdaccio。 本地开发时，使用 verdaccio 作为测试使用的本地 npm 私服。
使用该命令启动 verdaccio 私服，启动成功后在浏览器中访问 http://localhost:4873/

如果初次使用，需要创建用户，可以搜索 _verdaccio_，查看其具体使用。

#### pnpm run pub:local

发布组件库到本地私服。

#### 天工智能运维平台-ci/cd 构建命令
```
// 发布组件库
publish:kye-miniui
// 发布组件库 + 原生组件引入插件
publish:all
```


---
