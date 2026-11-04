# React Native 八股文

## Q1: React Native 是什么？它凭什么能用 JS 写原生 App？

### 定位

Meta 开源的**跨端框架**：用 React 语法写 UI，最终渲染成**真正的原生控件**（不是 WebView），一套代码同时跑 iOS/Android（新架构还支持 Windows/macOS）。

### 核心原理（一句话版）

```
JS(React 代码) ⇄ [通信层] ⇄ Native(UI 渲染 + 系统能力)
```

- UI 描述在 JS 侧生成（Virtual DOM），通过通信层同步给原生侧，由原生创建/更新 UIKit / Android View 渲染。
- 逻辑跑在 JS 引擎里（默认 **Hermes**），系统能力（相机、推送、存储）通过原生模块暴露给 JS。

### 关键理解（加分点）

- "learn once, write anywhere"：不是编译成两端原生代码（那是 Flutter Dart AOT 的思路），而是**运行时驱动原生 UI**，所以 RN 的两端一致性靠组件层抹平，平台差异是显式存在的（Platform.OS、.ios.js/.android.js）。
- 渲染的是原生 View，因此**手势、滚动、无障碍、系统字体等体验接近原生**，但复杂列表/动画性能依赖框架优化（见 Q12/Q13）。

## Q2: 新架构 vs 旧架构：Bridge、JSI、Fabric、TurboModules 分别是什么？

### 旧架构（< 0.68）：异步 Bridge

```
JS 线程 ⇄（JSON 序列化消息，异步批量）⇄ Native（Shadow Tree + UI）
```

问题：**异步 + 序列化**——所有通信都要 JSON 编解码、排队批处理，无法同步调用、无法传复杂对象，高频通信/大列表成为瓶颈。

### 新架构（0.68+ 默认，0.76 起强制）：三大件

| 组件 | 解决什么 | 一句话 |
|------|----------|--------|
| **JSI**（JS Interface） | 取代 Bridge 的通信层 | C++ 层的接口，JS 引擎可直接**持有/调用 C++ HostObject**，**同步调用、零序列化**；JSI 与引擎解耦（Hermes/JSC/V8 都能接） |
| **Fabric** | 取代旧渲染器 | C++ 共享的渲染器：Shadow Tree 在 C++ 里可**同步布局/渲染**，支持并发特性（Suspense、优先级）、更准确的同步布局测量 |
| **TurboModules** | 取代旧 Native Modules | 原生模块**按需懒加载**，基于 JSI 类型安全直调，不再全量注册到桥 |

配套：**Codegen** —— 从带类型标注的 JS/TS 规范自动生成 C++/Java/ObjC 胶水代码，保证 JS 与 Native 两端类型一致。

### 关键理解（加分点）

- 面试一句总结：**新架构 = JSI 打通同步调用（通信）+ Fabric 统一 C++ 渲染（渲染）+ TurboModules 按需加载（模块）**，解决旧 Bridge 异步序列化的三大性能痛点。
- 0.76+ 还有 **Bridgeless 模式**：彻底去掉旧 bridge 初始化路径，启动更快、内存更低；0.77/0.8x 逐步默认并清理旧架构代码。

## Q3: RN、Flutter、原生开发怎么选？

| 维度 | React Native | Flutter | 原生 |
|------|--------------|---------|------|
| 语言 | JS/TS（复用前端栈） | Dart | Swift/Kotlin、ObjC/Java |
| UI 渲染 | 原生控件（新架构自绘部分） | Skia/Impeller **自绘** | 原生控件 |
| 两端一致性 | 依赖组件抹平，偶有差异 | 极高（自绘不依赖平台控件） | — |
| 动态化 | JS bundle 可热更（受限） | 受限 | 受限 |
| 性能 | 好（新架构后接近原生常规场景） | 好（自绘 + AOT，动画最稳） | 最佳 |
| 生态 | npm + React 生态 | pub.dev，增长快 | 最全 |
| 团队成本 | 前端团队最低成本跨端 | 需学 Dart | 两端各养人 |

- 经验结论：**业务型 App、前端团队 → RN；重动画/重一致性/新团队 → Flutter；核心交易/媒体重场景 → 原生 + 混合**。大型 App 常是"原生壳 + RN/Flutter 业务页"混合。

## Q4: 旧版 Bridge 通信的具体机制？有什么问题？（面试常追问底层）

### 机制

1. JS 调原生：模块名 + 方法名 + 参数 → 序列化为 JSON → 放入消息队列 → 批量（每若干 ms 或事件循环）过桥 → 原生反序列化 → 反射/注册表找到模块执行；
2. 原生调 JS：事件/回调同样序列化回传，JS 单线程事件循环处理；
3. 三条线程：**JS Thread、Native/UI Thread、Shadow/Layout Thread**（旧架构），通信全异步。

### 问题

- **异步**：无法同步拿结果（如原生同步测量）；
- **序列化开销**：大对象（长列表数据、图片字节）编解码慢；
- **单桥拥塞**：高频事件（滚动、触摸）排队，掉帧；
- 全量初始化：所有 Native Module 启动即注册，拖慢启动。

### 关键理解（加分点）

- 能答出"为什么列表滚动会卡"就有区分度：滚动事件高频过桥 + JS 处理慢时，UI 线程等不到新内容（旧架构需预留 windowSize 缓冲）。新架构 JSI/Fabric 后这类问题从机制上缓解。

## Q5: JSI 是什么？它和 Bridge 的本质区别？

- JSI 是 C++ 写的**轻量 JS 引擎抽象层**：定义了 JS 与 C++ 互操作的接口（HostObject、HostFunction、Value 等）。
- JS 侧拿到的是一个 **HostObject 代理对象**，属性访问/方法调用直接映射到 C++ 实现——**同步、直接、无需序列化**（参数按 JSI Value 转换，可传 TypedArray 等二进制零拷贝）。
- 区别本质：Bridge 是"**消息传递**"（异步、跨线程、序列化），JSI 是"**函数调用**"（可同步、同线程语义、类型化）。
- 附带收益：引擎无关（JSC/Hermes/V8 都可实现 JSI），Hermes 得以替换 JSC。

### 关键理解（加分点）

- JSI 只是**接口**，不是实现；新架构里 Fabric/TurboModules 都构建在 JSI 之上。能说出"JSI 让 JS 可以持有 C++ 对象引用"这句话，基本就到位了。

## Q6: Fabric 渲染器的新在哪？渲染流程是怎样的？

### 新渲染管线（0.76 默认 Fabric）

```
JS: 组件树（React 元素）
 → C++ Shadow Tree（不可变树，clone 构建）
 → Yoga 同步计算布局
 → C++ Commit：diff 出最小变更
 → 挂载（Mounting）：在 UI 线程批量创建/更新/删除原生 View
```

### 相比旧渲染器

| 能力 | 说明 |
|------|------|
| C++ 共享核心 | iOS/Android 渲染逻辑统一在 C++，双端一致性更好 |
| 同步布局测量 | 原生可同步问 JS 要尺寸（旧版要异步回调，嵌套原生组件常算错） |
| 并发渲染兼容 | 配合 React 18 并发特性（Suspense、transition 优先级） |
| 更细粒度挂载 | diff 后最小化 View 操作，减少开销 |

### 关键理解（加分点）

- Shadow Tree 用**不可变 + 结构共享（clone-on-write）**，读线程安全，是 React 并发模式能在原生侧落地的关键。

## Q7: TurboModules 和 Codegen 是什么？怎么写一个新架构原生模块？

- **TurboModules**：基于 JSI 的原生模块体系——**按需加载**（首次访问才初始化，旧版启动全量注册）、方法经由 JSI 直调（类型化、可同步返回）、生命周期可控。
- **Codegen**：把 JS/TS 里的**规范（spec）文件**（带类型注释的对象）在构建期生成两端的接口胶水代码（C++/Java/Kotlin、ObjC/Swift），编译期就校验类型，替代旧版的运行时动态注册。

### 写法骨架（Android 为例，新架构）

```ts
// NativeMyToast.ts —— spec，Codegen 输入
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
export interface Spec extends TurboModule {
  show(message: string): void;          // void 返回可同步
  getDeviceName(): Promise<string>;     // 异步用 Promise
}
export default TurboModuleRegistry.getEnforcing<Spec>('MyToast');
```

```kotlin
// MyToastModule.kt —— 实现 Spec 生成的接口
class MyToastModule(reactContext: ReactApplicationContext) :
  NativeMyToastSpec(reactContext) {
  override fun show(message: String) { Toast.makeText(reactContext, message, 1).show() }
  override fun getName() = NAME
}
```

- iOS 侧实现生成的协议（ObjC++/Swift）；`pod install` 时 Codegen 自动跑。
- 双端差异：用 `Platform.OS` 分流或 `.ios.ts`/`.android.ts` 文件后缀。

## Q8: Hermes 引擎是什么？为什么比 JSC 快、省内存？

- Meta 为 RN 定制的 **JS 引擎**（0.70 起默认）：编译期把 JS 预编译成**字节码（HBC，.hbc）**，运行时直接执行，省去解析/编译 JS 源码的时间。

| 收益 | 原因 |
|------|------|
| 启动快 TTI | 不再 runtime 解析 JS（大 bundle 解析是启动大头）；字节码 mmap 加载 |
| 内存更低 | 字节码紧凑 + 不需要 JIT（对比 JSC 的 JIT 元数据） |
| GC 更稳 | 分代 + 增量 GC，减少长任务卡顿 |

- 代价：纯解释执行，**长任务吞吐略低于 JIT 引擎**；调试要支持 source map（字节码无源码）。
- 相关：`hermes-engine`、`React.createElement` 的静态优化、`Intl` polyfill 需显式开启。

### 关键理解（加分点）

- Hermes 体现了移动端 JS 的取舍：**移动端冷启动敏感、包体敏感，而对极致吞吐不敏感 → 放弃 JIT 换启动与内存**。

## Q9: RN 的布局：Flexbox 和 Web 上的差异？

- RN 用 **Yoga**（C++ 跨平台布局引擎）实现 Flexbox 子集：
  - 默认 `flexDirection: 'column'`（Web 是 row）、`alignContent: 'flex-start'`；
  - 数字单位都是 **dp（密度无关像素）**，没有 px/em/rem；`fontWeight` 等用枚举不用字符串数字混搭；
  - **不支持**：CSS grid（部分版本实验性）、float、伪类、媒体查询、`vh/vw`；
  - 样式只能是对象/数组（`StyleSheet.create`），无级联继承（少量可继承如 color/fontSize 只作用于 Text 内）；
  - `position` 默认 `relative`；`zIndex`、`overflow`、`shadow*`（新版本用 `boxShadow`/`elevation`）双端行为有差异。
- 定位：`SafeAreaView`（或 react-native-safe-area-context）处理刘海；`useWindowDimensions` 响应屏幕变化（旋转）。

### 关键理解（加分点）

- `StyleSheet.create` 的价值：静态校验 + 样式对象引用稳定（利于 memo）+ 原生侧 ID 化传输；`Dimensions.get('window')` 是静态值，旋转不更新——用 hook。

## Q10: 函数组件常用 Hooks 在 RN 里怎么用？有哪些 RN 特有的注意点？

| Hook | RN 场景要点 |
|------|-------------|
| `useState` / `useReducer` | 状态更新是**异步批处理**（React 18 自动批处理也覆盖原生事件） |
| `useEffect` | 网络请求/订阅；清理函数防泄漏；**Strict Mode 下开发期双调用**，别依赖"只跑一次" |
| `useMemo` / `useCallback` / `memo` | 配合 FlatList 的 `renderItem` 稳定引用，防整表重渲染 |
| `useRef` | 存定时器、动画值、节流锁 |
| `useLayoutEffect` | 需要"渲染前同步测量"的场景（配合 onLayout） |
| `useWindowDimensions` | 替代静态 Dimensions，响应旋转/分屏 |

- RN 特有 hooks：`useColorScheme`（暗黑模式）、`useWindowDimensions`、社区 `useCameraPermissions` 等权限 hooks。
- 自定义 hook 抽离请求/轮询/键盘监听逻辑；`onLayout` 拿测量结果（异步回调，不阻塞渲染）。

### 关键理解（加分点）

- React 18 并发特性在 RN 新架构下才完整生效（旧架构白屏/不一致风险），这也是 Fabric 与 React 18 绑定的原因——面试能关联"为什么 Fabric 和并发 React 一起出"是加分项。

## Q11: RN 的渲染更新流程？setState 后发生了什么？

```
setState → JS 侧 React 调度（优先级/批处理）
 → reconciler diff 出变更（Virtual DOM）
 → 新架构：生成 C++ Shadow Tree 提交 → Yoga 布局 → Mounting 在 UI 线程更新原生 View
```

- JS 线程负责 diff/布局指令生成；**UI 线程只做最后的 View 操作**——所以 JS 线程长任务（大计算、同步网络回调风暴）会让所有 UI 更新排队，表现为"点击无反应/动画掉帧"。
- 减少重渲染三板斧：稳定 props 引用（memo + useCallback）、拆小组件、状态下沉。

### 关键理解（加分点）

- RN 里"白屏/卡顿"三类根因：**JS 线程忙**（逻辑重）、**UI 线程忙**（层级深/过度绘制/原生动画未用 UI 线程驱动）、**过桥拥塞**（旧架构）。排查先分清是哪条线程（Perf Monitor 的 UI/JS FPS 分开显示）。

## Q12: FlatList 原理与优化？为什么列表会白屏/卡顿？

### 原理（VirtualizedList）

- **虚拟化**：只渲染可视区 ± window 的 item；`windowSize`（默认 21，即可视区上下各 10 屏）、`initialNumToRender` 首屏条数、`maxToRenderPerBatch` 批量上限、`updateCellsBatchingPeriod` 批间隔；
- 滚动接近边界时异步批量渲染离屏 item（JS 线程），跟不上 → **白屏/空白 cell**；
- `getItemLayout`：已知行高时跳过异步测量，跳转/滚动定位直接算，消除布局抖动；
- `keyExtractor` 稳定 key；`removeClippedSubviews`（Android 有效）回收离屏视图。

### 优化清单

1. `renderItem` 与 props 用 memo/useCallback 稳定；
2. item 组件拆细、图片用 `react-native-fast-image`（原生 GLIDE/SDWebImage 缓存）+ 固定宽高（防跳动）；
3. 复杂列表换 **FlashList**（Shopify，回收复用 cell，重用率高，内存/掉帧显著优于 FlatList）；
4. 数据去抖：滚动时暂停刷新（`onScrollBeginDrag/EndDrag`）、`scrollEventThrottle` 控制；
5. 分页预取（onEndReachedThreshold 配合提前 fetch）。

### 关键理解（加分点）

- FlatList 白屏本质：**离屏渲染的批任务跑在 JS 线程，滚动太快就追不上**；所以优化方向就两类——让它算得快（item 简单、getItemLayout）或让它别用 JS 算（FlashList 原生回收、`masonry` 布局）。

## Q13: RN 动画体系：Animated、useNativeDriver、Reanimated 的区别？

| 方案 | 运行位置 | 特点 |
|------|----------|------|
| Animated（内置） | 默认 JS 线程逐帧驱动；`useNativeDriver: true` 时驱动逻辑下沉 UI 线程 | useNativeDriver 仅支持**非布局属性**（transform/opacity），布局属性（width/left）仍走 JS，掉帧 |
| **Reanimated**（社区主流） | **worklet 在 UI 线程跑 JS 子集**，手势/动画与原生 60/120fps 同步 | 配合 Gesture Handler 手势全在 UI 线程闭环（拖拽、跟手交互不经过桥）；3.x 用 `runOnJS`/`runOnUI` 通信 |
| Layout Animations | 原生侧自动补间 | 增删布局的进场/退场动画，零逐帧成本 |
| Lottie | 原生渲染 AE 动画 | 复杂动效最省心，牺牲包体 |

- 原则：**能 UI 线程的绝不上 JS 线程**——跟手/手势类一律 Reanimated；简单透明度/缩放用 Animated + native driver。

### 关键理解（加分点）

- Reanimated worklet 本质：把小函数**预编译**成能在 UI 线程执行的字节码，共享内存（SharedValue）代替跨线程消息——这是"JSI 时代"性能思路的代表案例，可以和 Q5 呼应。

## Q14: 启动速度怎么优化？（白屏问题）

### 启动各阶段

```
App 冷启动 → 原生初始化（RN 实例/JSC/Hermes）
 → 加载 JS bundle（Hermes 加载 .hbc）
 → JS 执行入口（require 依赖图）→ 首帧渲染
```

### 手段

| 阶段 | 优化 |
|------|------|
| 原生层 | 开 Bridgeless/新架构（初始化更快）、懒加载 TurboModule |
| Bundle 层 | **Hermes 字节码**（省解析）、拆分 bundle（业务分包 + 预加载 base）、`metro` 分包共享公共依赖 |
| JS 执行 | 减少 require 副作用、延迟 require 非首屏模块（懒加载 import）、首屏只渲染必要组件 |
| 渲染层 | 首屏骨架屏/Splash 占位、避免首屏同步大请求（先缓存后刷新）、图片预解码 |
| 架构层 | 预建 RN 实例（多 bundle/多 engine 复用）、模块按需注册（TurboModule） |

- 监控：埋点 TTI（首帧可交互）、`adb shell am start -W`、iOS `os_signpost`/Instruments；React DevTools Profile 看 require 阻塞。

## Q15: 状态管理怎么选？Redux/Zustand/MobX 在 RN 里的特别之处？

| 方案 | 特点 | 适合 |
|------|------|------|
| Redux Toolkit | 单一 store、devtools 强、模板多 | 大型团队、复杂状态流、需要中间件（持久化、上报） |
| **Zustand** | 极简、选择器订阅（按需渲染）、体积小 | 中小型首选，RN 生态友好 |
| MobX | 响应式、自动依赖收集 | OOP 风格团队 |
| Jotai/Recoil | 原子化状态 | 细粒度依赖 |
| Context | 内置，但 value 变化全子树重渲染 | 低频全局配置（主题/语言） |

### RN 特别注意

- store 更新驱动的是 React 渲染 → 仍会走 diff + 原生更新，**高频更新（传感器/进度）别进 React 状态**，用 Reanimated SharedValue 或原生组件直通；
- 持久化：`redux-persist`/`zustand/middleware persist` + AsyncStorage/MMKV（**MMKV 原生同步读写，远快于 AsyncStorage**）；
- 服务端状态用 React Query/SWR（缓存、重试、失效），别塞进全局 store。

## Q16: React Navigation 的原理？导航栈怎么管理？

- 本质：**JS 层的状态机**——导航状态（stack 数组：routes + index）就是普通 state；`navigate/push/pop` 只是改状态，React 重渲染出对应 Screen（配合原生容器做转场动画）。
- 架构：`@react-navigation/core`（状态机）+ `native-stack`（原生屏幕容器：iOS UINavigationController / Android Fragment，转场/手势原生级）vs `stack`（JS 实现转场，可定制性高）。
- 与旧版 react-navigation 3 的区别：从"社区全 JS"到核心库 + 原生容器拆分（react-native-screens 利用原生容器，非激活屏 detach 视图，省内存）。
- 常考点：
  - 页面间传参：`navigation.navigate('Detail', { id })` + `route.params`；
  - 返回传值：`navigate` 回传 / 全局事件 / 状态管理；
  - `useFocusEffect` / `addListener('focus')`：Tab 切换时刷新（组件不卸载，useEffect 不够）；
  - Android 返回键：`BackHandler`。

### 关键理解（加分点）

- "页面没被销毁但看不到"是 RN 导航默认行为（栈内保留）→ 轮询/定时器/订阅要在 blur 时暂停，否则后台页耗电耗流量。

## Q17: 怎么和原生通信？（事件、回调、Promise、双端差异）

| 通信方向 | 方式 |
|----------|------|
| JS → Native（一次调用） | TurboModule 方法：同步（少量）/ Promise / 回调 |
| JS → Native（持续） | 调用原生方法开启（如扫码） |
| Native → JS（事件推送） | `EventEmitter`（新架构）发出事件，JS `addListener` 订阅（推送、传感器、蓝牙状态） |
| Native → JS（主动更新 UI） | 事件 + state 更新，或直接封装成原生 UI 组件 |

- 原生 UI 组件（Fabric Component）：JS 声明式用 `<MyMapView />`，属性经 Codegen 映射，`Commands` 调用原生命令，事件回传 JS——地图、播放器等必须原生 View 的场景。
- 注意：**事件在原生线程产生，要切到 JS 线程分发**；高频事件（如 GPS）节流后再发，防桥拥塞。

## Q18: 怎么把 RN 集成进已有原生 App？（混合开发）

- 官方路径：原生工程引入 RN 依赖（iOS CocoaPods `use_react_native!`；Android gradle 依赖 + Codegen 配置）→ 创建 **ReactHost/ReactInstanceManager**（持有 JS 引擎与模块注册表）→ `ReactRootView`/`ReactSurface` 作为页面容器 → 启动指定 component（bundle 里的注册名）。
- 两种宿主模式：
  - **RN 为主**：整个 App 是 RN 工程（`npx react-native init`），原生只写模块——大多数业务 App；
  - **原生为主**：已有 App 嵌 RN 页面，按页面粒度加载 bundle——大厂常见（壳工程 + 多业务 bundle）。
- 多 bundle/按页加载要点：Metro 分包、公共依赖拆 base bundle、bundle 预下载/预执行、路由注册表（URL → bundle + component）。
- 双端差异处理：条件编译文件后缀、`Platform.select`、原生模块双端接口对齐（spec 强约束）。

## Q19: 热更新（CodePush）的原理与风险？

- 原理：**JS bundle + 资源**走服务端下发（原生壳不变）——原生启动时根据本地元数据选择 bundle 版本加载；下载新包 → 校验哈希 → 切指针 → 重启/下次启动生效；支持灰度、回滚（crash 率监控自动回滚）。
- 限制：**只能改 JS/资源，不能改原生代码**（原生变更必须走应用市场）；iOS 审核对热更有限制（苹果允许"执行代码的脚本更新"但不能改变 App 主要用途，需规避违规）。
- 国内替代/自建：CodePush 已停止服务（微软并入 App Center 退役），可自建（code-push-server 类方案）或用 pushy 等国产方案；要考虑**分包增量更新、多 bundle 版本矩阵、安全签名**。
- 合规与灰度：全量前小流量 + 崩溃监控联动回滚，bundle 版本与原生版本兼容矩阵要显式管理。

### 关键理解（加分点）

- 热更新的本质是"**运行时解释层带来的动态性**"——RN/小程序都有，Flutter 原生不支持（AOT 编译）；这是选型时的动态化考量点。

## Q20: 调试与工程化工具链：Metro、Flipper、DevTools？

| 工具 | 用途 |
|------|------|
| **Metro** | RN 的打包器（类 webpack）：解析/转换（Babel/SWC）→ 序列化为 bundle，支持 dev server 热刷新（Fast Refresh）、HMR、依赖图、分包（自定义 serializer） |
| **Fast Refresh** | 保留组件状态的热更新（编辑器保存即生效） |
| React DevTools | 组件树/props/Hooks 检查、Profiler 火焰图找重渲染 |
| Flipper | Meta 官方调试平台（0.73 起移除默认集成）：网络、布局、日志、崩溃 + 插件（RN 侧 react-flipper） |
| Perf Monitor / Systrace / Instruments | UI/JS FPS 分线程看，原生级 trace 定位掉帧 |
| Chrome/Safari 远程调试 | 旧方案（代理到浏览器引擎调试，Hermes 需 `chrome://inspect` 支持/Hermes 调试器）；新版本用 React Native DevTools（0.76+，基于 Chrome DevTools 协议直连 Hermes） |

### 关键理解（加分点）

- 能区分"调试 JS 逻辑"（DevTools/日志）与"查掉帧"（Perf Monitor 分线程 FPS + 原生 trace）两条排查线，是工程成熟度信号。

## Q21: RN 常见性能问题排查清单（综合题）

| 症状 | 优先排查 |
|------|----------|
| 启动白屏久 | 是否 Hermes、bundle 大小/分包、首屏请求数、新架构开关 |
| 列表滑动掉帧/白屏 | renderItem 重渲染（memo）、图片尺寸/缓存（FastImage）、getItemLayout、FlashList、windowSize |
| 点击/输入延迟 | JS 线程是否被大计算占用（Performance 监控）、交互改 Reanimated/Gesture Handler UI 线程 |
| 动画卡顿 | 是否 useNativeDriver/Reanimated、布局属性动画改 transform、过度绘制（层级深/大图叠加） |
| 内存持续增长 | 大图未释放（分辨率远超显示尺寸）、闭包/订阅泄漏（useEffect 清理）、列表缓存（FlashList 配置）、原生模块持有 Context 泄漏 |
| 电池/发热 | 后台轮询未暂停（focus/blur）、GPS/传感器高频、动画常驻 |

- 手段分层：先**分线程定位**（UI or JS），再下钻（React Profiler / 原生 trace / 内存快照 diff），最后验证（滚动流畅度录像、FPS 曲线对比）。

## Q22: 一句话快问快答（高频送分/送命题）

| 问题 | 要点 |
|------|------|
| RN 默认 JS 引擎？ | Hermes（0.70+），字节码预编译、低内存、增量 GC |
| 新架构从哪个版本强制？ | 0.76（Bridgeless 默认）；0.68 引入、0.7x 渐进启用 |
| JS 线程和 UI 线程谁管渲染？ | JS 管描述与 diff；**UI 线程（原生）管真正绘制**；布局计算在新架构由 C++/Yoga 承担 |
| StyleSheet.create 好处？ | 校验 + 引用稳定 + 原生 ID 传输；样式不级联 |
| px 和 dp？ | RN 单位是 dp（密度无关）；`PixelRatio` 换算设计稿 |
| key 的作用？ | diff 时识别同元素复用/重排；用稳定业务 id，别用 index（插入删除错位） |
| useEffect 依赖数组传空/不传？ | 空=仅挂载后执行（含清理）；不传=每次渲染都执行 |
| FlatList 白屏？ | 离屏渲染追不上滚动 → getItemLayout/减小 item 成本/FlashList/windowSize 调大 |
| Pressable vs TouchableOpacity？ | Pressable 新 API（更灵活的 pressed/hover 状态），TouchableOpacity 简单透明反馈 |
| 远程图片为什么用 FastImage？ | 内置 Image 每次都过 RN 缓存层且无磁盘 LRU；FastImage 用原生 GLIDE/SDWebImage 强缓存 + 优先级 |
| AsyncStorage 为什么慢？ | 全部走桥 + 原生序列化 + 异步；本地大量小 KV 用 **MMKV**（C++ 同步、JSI 直调） |
| iOS/Android 差异常见坑？ | 阴影（shadowColor iOS 必填/elevation 安卓）、安全区、返回键、键盘 Avoiding、字体加载方式、日期格式化 |
| require 循环依赖？ | Metro 按 require 时序解析，循环会拿到未初始化的 module.exports → 拆公共模块/延迟 require |
| RN 支持多线程吗？ | JS 单线程；重计算用 worklet（Reanimated）或原生模块/TurboModule，或 Web Worker 类方案（社区） |
| 怎么做组件库/设计系统？ | 主题 Context/StyleSheet 工厂 + Platform 适配层 + Storybook（react-native-storybook）+ 双端截图测试 |
