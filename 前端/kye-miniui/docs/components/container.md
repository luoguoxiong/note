# Container

<code-preview path="demos/container/container-1.vue" title="基本使用" description="页面容器组件用法示例"></code-preview>

## 基本使用

容器组件是页面的基础布局组件，提供导航栏、滚动容器、分享配置等功能。

```html
<ky-container :nav-bar-options="{ title: '页面标题' }">
  <view>页面内容</view>
</ky-container>
```

## 导航配置

通过 `navBarOptions` 配置导航栏属性，透传给 `ky-navbar` 组件。

```html
<ky-container
  :nav-bar-options="{
    title: '自定义标题',
    leftText: '返回',
    showPlatList: ['wx', 'h5', 'alipay']
  }"
>
  <view>页面内容</view>
</ky-container>
```

## 滚动容器

通过 `scrollOptions` 配置滚动容器，按端开启 `scroll-view`。

```html
<ky-container
  :scroll-options="{ scrollViewPlatList: ['wx', 'h5'] }"
  :nav-bar-options="{ title: '滚动容器' }"
>
  <view style="height: 2000px">长内容</view>
</ky-container>
```

## 分享配置

通过 `toolOptions` 控制小程序分享菜单和分享信息。

```html
<ky-container
  :tool-options="{
    isHideShareMenu: false,
    title: '分享标题',
    path: '/pages/index/index'
  }"
>
  <view>页面内容</view>
</ky-container>
```

## 插槽使用

支持多个插槽自定义导航和内容区域。

```html
<!-- 自定义左侧内容 -->
<ky-container :nav-bar-options="{ title: '左侧插槽' }">
  <template #left>
    <text>🏠</text>
  </template>
  <view>页面内容</view>
</ky-container>

<!-- 自定义右侧内容 -->
<ky-container :nav-bar-options="{ title: '右侧插槽' }">
  <template #right>
    <ky-button type="primary" size="mini">操作</ky-button>
  </template>
  <view>页面内容</view>
</ky-container>

<!-- 完全自定义导航栏 -->
<ky-container>
  <template #navbar>
    <view style="height: 48px; display: flex; align-items: center; padding: 0 12px;">自定义 Navbar</view>
  </template>
  <view>页面内容</view>
</ky-container>
```

## 事件监听

支持导航点击和滚动等事件监听。

```html
<ky-container
  :nav-bar-options="{ title: '事件监听' }"
  @click-left="handleClickLeft"
  @click-right="handleClickRight"
  @click-title="handleClickTitle"
  @container-init="onContainerInit"
  @scroll="onScroll"
>
  <view>页面内容</view>
</ky-container>
```

```javascript
const handleClickLeft = () => {
  console.log('点击左侧按钮')
}

const handleClickRight = () => {
  console.log('点击右侧按钮')
}

const onContainerInit = (data) => {
  console.log('容器初始化', data.navAppHeaderHeight, data.networkType)
}
```

## 弱网状态监听

通过 `errorCheck` 配置弱网状态监听回调。

```html
<ky-container
  :error-check="{ onNetworkWeakChange: (e) => console.log(e) }"
>
  <view>页面内容</view>
</ky-container>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| navBarOptions | 顶部导航配置（透传至 ky-navbar） | KyNavBarProps | - | `{ showPlatList: ['wx'], leftText: '', title: '' }` |
| scrollOptions | 滚动容器配置 | `{ scrollViewPlatList: string[] }` | 平台枚举（如 'wx','h5'） | `{ scrollViewPlatList: ['wx', 'h5'] }` |
| toolOptions | 分享相关配置（小程序） | `{ isHideShareMenu?: boolean; title?: string; path?: string }` | - | `{ isHideShareMenu: true }` |
| reportOptions | 埋点配置 | `{ pageCode?: string; errorCaptured?: () => void }` | - | - |
| errorCheck | 错误检测 | `{ onNetworkWeakChange?: (e) => void }` | - | - |

### Methods

当前组件无公开方法。

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click-left | 导航左侧点击 | `(event: Event)` |
| click-right | 导航右侧点击 | `(event: Event)` |
| click-title | 导航标题点击 | `(event: Event)` |
| containerInit | 容器初始化完成（包含导航高度与网络类型） | `{ navAppHeaderHeight: number; networkType: string }` |
| scroll | 容器滚动（启用 scroll-view 时生效） | `(event: Event)` |
| scrolltolower | 容器滚动到底部 | `(event: Event)` |
| scrolltoupper | 容器滚动到顶部 | `(event: Event)` |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 内容区域 |
| navbar | 自定义整条导航（将覆盖内置导航） |
| left | 导航左侧内容（透传至 ky-navbar） |
| right | 导航右侧内容（透传至 ky-navbar） |
| title | 导航标题内容（透传至 ky-navbar） |