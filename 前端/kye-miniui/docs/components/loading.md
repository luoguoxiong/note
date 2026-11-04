# Loading

<code-preview path="demos/loading/loading-1.vue" title="基本使用" description="用于页面和区块的加载状态"></code-preview>

## 基本使用

默认显示加载图标，支持通过默认插槽添加加载文案。

```html
<ky-loading></ky-loading>
<ky-loading>加载中...</ky-loading>
```

## 加载尺寸

通过 `size` 属性设置加载图标的尺寸。

```html
<ky-loading size="large">large</ky-loading>
<ky-loading size="normal">normal</ky-loading>
<ky-loading size="small">small</ky-loading>
```

## 加载类型

通过 `type` 属性设置加载图标的类型。

```html
<ky-loading type="default">default</ky-loading>
<ky-loading type="circle">circle</ky-loading>
<ky-loading type="dots">dots</ky-loading>
```

## 文本颜色

通过 `text-color` 属性设置文案颜色。

```html
<ky-loading text-color="#8365F6">主题色文案</ky-loading>
<ky-loading text-color="#FF706D">红色文案</ky-loading>
<ky-loading text-color="#00C58C">绿色文案</ky-loading>
<ky-loading text-color="#57A8F9">蓝色文案</ky-loading>
```

## 文本尺寸

通过 `text-size` 属性设置文案尺寸，尺寸从 1 到 5 逐渐增大。

```html
<ky-loading text-size="1" size="large">textSize: 1</ky-loading>
<ky-loading text-size="2" size="medium">textSize: 2</ky-loading>
<ky-loading text-size="3" size="normal">textSize: 3</ky-loading>
<ky-loading text-size="4" size="small">textSize: 4</ky-loading>
<ky-loading text-size="5" size="mini">textSize: 5</ky-loading>
```

## 垂直排列

通过 `vertical` 属性设置图标和文案垂直排列。

```html
<ky-loading vertical>垂直排列加载中...</ky-loading>
<ky-loading vertical type="circle" size="large">circle 垂直</ky-loading>
```

## 自定义图标

通过 `icon` 插槽自定义加载图标。

```html
<ky-loading>
  <template #icon>
    <view class="custom-icon">🔄</view>
  </template>
  自定义图标加载中...
</ky-loading>
```

```css
.custom-icon {
  font-size: 32rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| size | 尺寸 | string | 'small' / 'normal' / 'large' | 'normal' |
| textSize | 文本尺寸 | string | '1' / '2' / '3' / '4' / '5' | '3' |
| vertical | 是否垂直排列 | boolean | - | false |
| textColor | 文本颜色 | string | - | '#8C8F99' |
| type | 加载图标类型 | string | 'default' / 'circle' / 'dots' | 'default' |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| icon | 自定义加载图标 |
| default | 加载文案 |