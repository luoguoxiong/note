# Navbar

<code-preview path="demos/navbar/navbar-1.vue" title="基本使用" description="自定义导航栏组件，支持多端适配"></code-preview>

## 基本使用

最基础的导航栏用法。

```html
<ky-navbar title="标题内容" />
```

## 自定义标题

通过 `title` 属性设置导航栏标题。

```html
<ky-navbar title="首页" />
<ky-navbar title="订单详情" />
<ky-navbar title="个人中心" />
```

## 左侧按钮配置

控制左侧返回按钮的显示和内容。

```html
<!-- 显示返回箭头（默认） -->
<ky-navbar title="标题" left-arrow />

<!-- 隐藏返回箭头 -->
<ky-navbar title="标题" :left-arrow="false" />

<!-- 自定义左侧文本 -->
<ky-navbar title="标题" left-text="返回" />

<!-- 自定义返回箭头图标 -->
<ky-navbar title="标题" left-arrow-icon="https://example.com/back.png" />
```

## 右侧按钮配置

通过 `rightText` 属性设置右侧按钮文本。

```html
<!-- 右侧按钮 -->
<ky-navbar title="标题" right-text="更多" />

<!-- 右侧按钮带点击事件 -->
<ky-navbar title="标题" right-text="保存" @click-right="handleSave" />
```

## 占位与边框

控制导航栏的占位和边框样式。

```html
<!-- 显示占位元素（默认） -->
<ky-navbar title="标题" placeholder />

<!-- 隐藏占位元素 -->
<ky-navbar title="标题" :placeholder="false" />

<!-- 显示底部边框 -->
<ky-navbar title="标题" border />

<!-- 自定义层级 -->
<ky-navbar title="标题" :z-index="1000" />
```

## 返回拦截

通过 `beforeBack` 属性在返回前执行拦截逻辑。

> 支持端：微信、H5  
> 不支持端：支付宝

```html
<ky-navbar title="标题" :before-back="beforeBack" back-path="/pages/index/index" />
```

```javascript
const beforeBack = async () => {
  const canBack = await showConfirmDialog('确定要返回吗？')
  return canBack
}
```

## 平台控制

通过 `showPlatList` 属性控制导航栏在哪些平台显示。

```html
<!-- 仅在微信显示（默认） -->
<ky-navbar title="标题" :show-plat-list="['wx']" />

<!-- 在微信和 H5 显示 -->
<ky-navbar title="标题" :show-plat-list="['wx', 'h5']" />

<!-- 在所有平台显示 -->
<ky-navbar title="标题" :show-plat-list="['wx', 'alipay', 'h5']" />
```

## 插槽使用

支持 left、title、right 三个插槽，实现完全自定义。

```html
<!-- 自定义左侧 -->
<ky-navbar title="标题">
  <template #left>
    <text class="custom-left">← 返回</text>
  </template>
</ky-navbar>

<!-- 自定义标题 -->
<ky-navbar>
  <template #title>
    <view class="custom-title">
      <text>自定义标题</text>
    </view>
  </template>
</ky-navbar>

<!-- 自定义右侧 -->
<ky-navbar title="标题">
  <template #right>
    <view class="custom-right">
      <text>设置</text>
    </view>
  </template>
</ky-navbar>

<!-- 完全自定义 -->
<ky-navbar>
  <template #left>
    <text>← 返回</text>
  </template>
  <template #title>
    <text>完整自定义</text>
  </template>
  <template #right>
    <text>更多</text>
  </template>
</ky-navbar>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| title | 导航栏标题 | string | - | 'title' |
| height | 自定义导航高度（暂未使用） | string | - | - |
| leftText | 左侧按钮文本 | string | - | '' |
| rightText | 右侧按钮文本 | string | - | '' |
| border | 是否显示底部边框 | boolean | - | false |
| zIndex | 导航栏层级 | number | - | 999 |
| placeholder | 是否显示占位元素 | boolean | - | true |
| showPlatList | 支持的平台列表 | ('wx' \| 'alipay' \| 'h5')[] | - | ['wx'] |
| backPath | 返回路径（无上一页时跳转） | string | - | '' |
| beforeBack | 返回前拦截（boolean 或 Promise\<boolean\>） | Interceptor | - | - |
| leftArrow | 是否显示左侧返回按钮 | boolean | - | true |
| leftArrowIcon | 左侧返回箭头图标（支付宝不支持） | string | - | - |

### Events 事件

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| click-title | 点击标题时触发 | event: Event |
| click-left | 点击左侧按钮时触发 | event: Event |
| click-right | 点击右侧按钮时触发 | event: Event |

### Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| left | 左侧按钮内容 |
| title | 标题内容 |
| right | 右侧按钮内容 |

## 常见问题

### Q1: 导航栏不显示？

**检查项：**

- 确保设置了 `showPlatList` 属性包含当前平台
- 默认只在微信小程序显示，如需在其他平台显示，需配置 `showPlatList`

```html
<ky-navbar title="标题" :show-plat-list="['wx', 'alipay', 'h5']" />
```

### Q2: 返回按钮在支付宝不显示？

**说明：**

支付宝小程序使用原生导航栏，自定义返回箭头不生效。左侧按钮仅在微信和 H5 端有效。

### Q3: 页面内容被导航栏遮挡？

**解决方案：**

确保 `placeholder` 属性设置为 `true`（默认值），导航栏会自动生成占位元素。

```html
<ky-navbar title="标题" placeholder />
```
