// 动态设置 webpack publicPath(MicroApp 约定)
//  - 集成模式(MicroApp 注入):读 window.__MICRO_APP_PUBLIC_PATH__,确保资源从子应用自身域加载
//  - 独立模式:回退到 '/'
// 必须在子应用入口第一行(其它 import 之前)执行
if (window.__MICRO_APP_ENVIRONMENT__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__MICRO_APP_PUBLIC_PATH__;
}
