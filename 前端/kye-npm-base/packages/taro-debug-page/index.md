# taro-debug-page

## 背景

Taro 小程序项目随业务增长，`app.config` 注册的页面会越来越多，开发调试时全量编译耗时长。手工注释 `wx.config.ts`、`subpackagesConfig.ts` 和首页组件虽然能缩短编译，但会污染工作区，且容易遗漏 `tabBar`、`preloadRule` 或组件依赖导致构建失败。

## 插件功能

👉 通过 `--debug-pages` 指定调试页面，构建期**内存过滤**页面注册配置

- 裁剪 `pages`、`subpackages`，移除无页面的分包
- 同步修正 `tabBar`、`entryPagePath`、`preloadRule`，保证引用完整
- 支持配置固定基础页面，每次调试自动加入
- 扫描首页依赖，报告保留模块与静态可识别的关联跳转
- 目标页面写错时**直接中止构建**，不会静默回退全量配置
- 未传入参数时完全 bypass，不影响日常构建

不会修改任何源配置文件。

## 安装

```shell
pnpm add @kye-netc/taro-debug-page -D
# 或
npm install @kye-netc/taro-debug-page --save-dev
```

## 用法

1️⃣ 配置插件

在 `config/index.ts` 中：

```typescript
export default defineConfig({
  plugins: [
    // ...已有插件
    [
      '@kye-netc/taro-debug-page',
      {
        // 每次调试构建固定加入的页面
        defaultPages: ['modules/user/pages/login/index', 'layout/pages/mine/index'],
        // 需要扫描依赖的目录（相对 src），通常传首页目录
        scanDirs: ['layout/pages/home'],
      },
    ],
  ],
})
```

2️⃣ 指定调试页面

```shell
npm run dev:wx -- --debug-pages modules/tools/message-center/home/index
```

多个页面用英文逗号分隔：

```shell
npm run dev:wx -- --debug-pages modules/tools/message-center/home/index,modules/user/pages/user-setting/index
```

页面路径必须是**完整注册路径**（分包页面 = `root/pages/...`）。

## 控制台报告

```text
[taro-debug-page] 已启用 weapp 按需调试，本次构建仅注册以下页面
[taro-debug-page] 目标页面:
[taro-debug-page]   - modules/tools/message-center/home/index
[taro-debug-page] 自动保留页面:
[taro-debug-page]   - modules/user/pages/login/index
[taro-debug-page] 保留模块(首页依赖):
[taro-debug-page]   - modules/order-build
[taro-debug-page] 静态关联跳转页面(请按需补充到 --debug-pages):
[taro-debug-page]   - modules/order-build/pages/order/index
[taro-debug-page] 已裁剪分包:
[taro-debug-page]   - packages/activity
[taro-debug-page] 动态风险:
[taro-debug-page]   无
```

## 注意事项

1. **路径必须完整**：分包页面要带 `root` 前缀，写错会直接中止构建。
2. **会自动保留**：`tabBar` 中的主包页面、`entryPagePath`、`defaultPages` 配置的页面。
3. **静态关联页面只报告不注册**：接口返回值、变量拼接的动态跳转无法在构建期确认，需自行补充到 `--debug-pages`。
4. **首页依赖模块保留**：首页通过静态/动态 import 引用的模块不受页面过滤影响，无需注释首页组件。
