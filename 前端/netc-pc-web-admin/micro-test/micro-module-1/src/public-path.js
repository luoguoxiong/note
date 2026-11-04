// 动态设置 webpack publicPath
// 由子应用源码直接赋值 __webpack_public_path__,webpack 编译时识别该自由变量
// 并替换为运行时 __webpack_require__.p。通过 resolvePublicPath 统一解析:
//  - 沙箱模式:读 window.__SANDBOX_ENTRY_URL__(主应用注入)
//  - 独立模式:读 document.currentScript.src
//  - 回退:取最后一个 <script> 标签
// 必须在子应用入口第一行(其它 import 之前)执行,确保异步 chunk 从子应用自身域加载
import { resolvePublicPath } from '@kye-netc/micro-module/sub-app';

__webpack_public_path__ = resolvePublicPath();
