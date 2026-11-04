# netc-pc-web-admin

跨越速运 PC 管理端门户（微前端基座）。基于 Vue 3 + TypeScript 构建，承载原生页面、iframe 嵌入页（老 PC 端轻应用）与 micro-app 微前端子应用三类路由，统一提供登录校验、菜单权限、埋点上报与主题能力。

## 技术栈

| 分类     | 技术                                                   |
| -------- | ------------------------------------------------------ |
| 框架     | Vue 3.3 + TypeScript 5.0                               |
| 路由     | vue-router 4（hash 模式）                              |
| 状态管理 | Pinia 3（新）+ Vuex 4（存量）                          |
| UI       | Element Plus 2.5 + @netc-design-pc（公司组件库）       |
| 微前端   | @micro-zoe/micro-app 1.0 + @kye-netc/micro-module  |
| 构建     | @vue/cli-service 5（webpack 5）、CDN externals、mockjs |
| 监控埋点 | apm-sdk、UMP 场景化埋点（PV / 点击 / 曝光）            |

## 环境与命令

**必须使用 Yarn 安装依赖**（preinstall 有强校验）。

```bash
yarn install        # 安装依赖（husky 自动初始化）

# 本地开发（--mode 对应 .env.<mode> 中的 API 地址）
yarn serve:dev      # dev  → http://open-dev.kyepm.com
yarn serve:uat      # uat  → https://api-uat.kyeapi.com
yarn serve:stg      # stg  → https://api-stg.kyeapi.com
yarn serve:prod     # prod → https://api.ky-express.com
yarn serve:preview  # 预览模式（ENV_ISPREVIEW=true，基于 uat）

yarn build          # 生产构建
yarn analyse        # 构建并分析包体积
yarn tsc            # vue-tsc 类型检查
yarn lint           # ESLint + Stylelint
yarn test:unit      # Jest 单元测试
yarn test:e2e       # Cypress E2E 测试
```

## 目录结构

```
netc-pc-web-admin/
├── docs/                    # 方案文档（权限、路由、侧边栏）
├── mock/                    # 接口 mock（按 web.xxx.yyy 命名，与后端接口一一对应）
├── public/                  # 静态资源、echarts 独立包、CDN 全局脚本
├── src/
│   ├── apis/                # 接口层：按业务域分目录，统一 index.ts 导出、types 声明
│   ├── components/          # 全局通用组件（ky-button / ky-dialog / ky-input 等）
│   ├── configs/             # 全局配置（响应错误、上报配置）
│   ├── constants/           # 常量
│   ├── hooks/               # 通用 hooks
│   ├── libs/kyeIframeBridge/# iframe 通信桥（postmate）
│   ├── native/              # 客户端（Electron / 跨声）原生能力封装
│   ├── reportUmp/           # UMP 埋点（pv / 点击 / 曝光 / 加密 / 性能）
│   ├── router/
│   │   ├── admin.ts         # /admin 主布局路由
│   │   ├── guard.ts         # 唯一路由守卫：登录校验 + menuCode 权限拦截
│   │   ├── internal/        # 原生页路由
│   │   ├── iframe/          # iframe 轻应用路由（tools / order / settlement ...）
│   │   └── micro-app/        # 微前端子应用路由
│   ├── store/               # Vuex（存量模块：theme / orderConfig ...）
│   ├── stores/              # Pinia（lightapp 菜单 / user / permission / home ...）
│   ├── styles/              # 全局样式、Element Plus 主题覆盖
│   ├── utils/               # request（axios 封装）/ auth / storage / 上报等
│   ├── views/               # 原生页面（admin 布局、首页、关于跨越）
│   ├── views-iframe/        # iframe 容器页（对应老 PC 端轻应用）
│   └── views-micro/         # 微前端子应用挂载页
└── vue.config.js            # 构建配置（CDN externals / mock / 分包）
```

## 架构说明

### 三类路由

路由在 `src/router/index.ts` 静态全量注册，默认重定向 `/admin/home`，`/admin` 下分三类：

1. **internal 原生页**：Vue 原生组件，位于 `src/views/`
2. **iframe 嵌入页**：通过 iframe 容器加载老 PC 端轻应用，位于 `src/views-iframe/`
3. **micro-app 子应用**：由基座路由驱动加载微前端子应用，位于 `src/views-micro/`

### 路由权限

- 唯一守卫 `src/router/guard.ts`：登录校验（token 取自 URL query / sessionStorage）+ 基于路由 `meta.auth` 声明式权限拦截
- 权限数据源为后端菜单接口 `web.lightApplication.getApplicationInfoListByArea`（已按用户过滤），localStorage 缓存秒显，失败降级 mock
- 详细设计见 [docs/路由权限方案.md](docs/路由权限方案.md)

### iframe 轻应用接入约定

- iframe 页面组件位于 `src/views-iframe/tools/` 等目录，**必须指定与 mock 数据一致的 menu-code**，用于解析真实加载地址（loadAddress）
- 对应路由统一注册在 `src/router/iframe/` 下（如 tools 页面注册于 `tools.ts`）
- mock 数据以 `mock/web.lightApplication.getApplicationInfoListByArea.js` 为基准，路由解析一律走 menu-code 匹配，**不允许写特例逻辑**

### 微前端基座

- `src/main.ts` 通过 `createMicroMainApp`（@kye-netc/micro-module）创建基座，支持子应用预加载（`preload` + `priority`）
- 子应用 entry 由 `useLightAppStore().getAppLoadModuleEntry(menuCode)` 按菜单码动态解析
- `microApp.start({ 'router-mode': 'pure' })`，已关闭对子应用请求的拦截

### 构建特性

- **CDN 外部化**：vue / vue-router / element-plus / vuex / pinia 构建时不打入 bundle，通过 `public/index.html` 注入的 CDN 全局变量提供
- **按需引入**：unplugin-auto-import + unplugin-vue-components（ElementPlusResolver）
- **mock**：本地开发按需启用（`mock/isUseMock.js` 控制）
- **文件系统缓存**：webpack filesystem cache 加速二次构建

## 接口层规范

接口统一维护在 `src/apis/`，按业务域分目录，目录内 `index.ts` 维护接口函数（必须有入参、返回类型），类型定义在 `types.ts`；引用时统一从 `apis/index.ts` 入口引入。详见 [src/apis/readme.md](src/apis/readme.md)。

## 相关文档

- [路由权限方案](docs/路由权限方案.md)
- [权限说明](docs/permission.md)
- [侧边栏技术方案](docs/侧边栏技术方案.md)
- [侧边栏加载方案](docs/侧边栏加载方案.md)
