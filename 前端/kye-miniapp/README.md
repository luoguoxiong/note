# KYE-MINIAPP

## 快速开始

```shell
# 微信小程序、app开发模式
yarn dev:wx
# 微信小程序预览 开发模式
dev:wx:preview
# 支付宝、高度小程序开发模式
yarn dev:alipay
# 打制定包
yarn start
# 打各个端uat包
yarn build:uat
# 打各个端生产包
yarn build
```

## 项目初始化

```shell
git submodule init
git submodule update
```

✅ 添加子模块的命令：

```
git submodule add <子模块仓库地址> <子模块存放路径>
```

🧱 示例（按你提供的结构添加）：

添加子仓库

```
git submodule add git@gitlab.ky-tech.com.cn:KYE-NETC-FRONTEND/kye-miniapp-waybill.git src/modules/kye-miniapp-waybill
```

提交子仓库代码：

```
git add .gitmodules src/modules/kye-miniapp-waybill src/modules/kye-miniapp-order
git commit -m "feat: add submodules kye-miniapp-waybill and kye-miniapp-order"
```

## ⚙️ Eslint 代码格式化配置（AutoFix）vscode为例

为统一代码风格，建议启用保存时自动修复：

安装 `eslint`、`styleint` 、`Vue - Official`、`Prettier - Code formatter` vscode插件

1. 打开设置文件：
   - 输入 `settings` → 选择 `settings.json`

2. 添加以下配置：

   ```
    "editor.codeActionsOnSave": {
     "source.fixAll.eslint": true,
     "source.fixAll.stylelint": true
   }
   ```

3. 保存后，编辑器将自动处理 ESLint 与 Stylelint 的格式问题（如空格、顺序等）。

## 分包异步化

分包模块： src/libs/\*\*

引入异步分包模块：

```js
__non_webpack_require__('libs/qt/index', ({ initQTSDK }) => {
  initQTSDK(aplusConfig)
})
```
