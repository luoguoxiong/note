# Text

<code-preview path="demos/text/text-1.vue" title="基本使用" description="各种文本用法示例"></code-preview>

## 基本使用

Text 组件用于样式化文本显示，支持多种尺寸、类型和溢出处理方式。

```html
<!-- 默认文本 -->
<ky-text>这是默认样式的文本内容</ky-text>

<!-- 可选中文本 -->
<ky-text selectable>这段文本可以被选中复制</ky-text>
```

## 标题类型

通过 `type="title"` 设置标题样式，配合 `size` 属性设置不同大小。

```html
<ky-text type="title" size="1">标题尺寸1 - 最大</ky-text>
<ky-text type="title" size="2">标题尺寸2 - 较大</ky-text>
<ky-text type="title" size="3">标题尺寸3 - 中等</ky-text>
<ky-text type="title" size="4">标题尺寸4 - 较小</ky-text>
<ky-text type="title" size="5">标题尺寸5 - 最小</ky-text>
```

## 正文类型

通过 `type="main"` 设置正文样式，配合 `size` 属性设置不同大小。

```html
<ky-text type="main" size="1">正文尺寸1 - 较大</ky-text>
<ky-text type="main" size="2">正文尺寸2 - 中等</ky-text>
<ky-text type="main" size="3">正文尺寸3 - 默认</ky-text>
<ky-text type="main" size="4">正文尺寸4 - 较小</ky-text>
<ky-text type="main" size="5">正文尺寸5 - 最小</ky-text>
```

## 溢出处理

支持四种溢出处理方式：修剪、淡出、省略号和不截断。

```html
<!-- 修剪：直接截断 -->
<ky-text overflow="clip" :max-lines="1">
  修剪文本：修剪文本修剪文本修剪文本修剪文本修剪文本
</ky-text>

<!-- 淡出：渐变消失 -->
<ky-text overflow="fade" :max-lines="1">
  淡出文本：淡出淡出淡出淡出淡出淡出淡出淡出淡出淡出
</ky-text>

<!-- 省略号：单行 -->
<ky-text overflow="ellipsis" :max-lines="1">
  省略号文本：显示省略号显示省略号显示省略号显示省略号
</ky-text>

<!-- 省略号：多行 -->
<ky-text overflow="ellipsis" :max-lines="2">
  多行省略号：显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号显示省略号
</ky-text>

<!-- 不截断：完整显示 -->
<ky-text overflow="visible" :max-lines="1">
  不截断文本：文本不截断文本不截断文本不截断
</ky-text>
```

## 可选中文本

通过 `selectable` 属性控制文本是否可被用户选中。

```html
<!-- 通用可选中 -->
<ky-text :selectable="true">这段文本可以被选中和复制</ky-text>

<!-- 微信端可选中 -->
<ky-text :userSelect="true">微信端可选中文本</ky-text>
```

## WebView 特性

支持 WebView 特有属性。

```html
<!-- 显示连续空格 -->
<ky-text space="ensp">显示    多    个    空格</ky-text>

<!-- HTML 解码 -->
<ky-text :decode="true">&lt;span&gt;将被解码为标签文本&lt;/span&gt;</ky-text>
```

## 组合使用

可以组合多个属性实现复杂效果。

```html
<!-- 标题 + 溢出处理 -->
<ky-text type="title" size="2" overflow="ellipsis" :max-lines="1">
  这是一个较长的标题文本，当超过一行时会显示省略号
</ky-text>

<!-- 正文 + 可选中 + 多行省略 -->
<ky-text type="main" size="4" selectable overflow="ellipsis" :max-lines="3">
  这是一段使用小正文样式的文本，设置了多行省略效果。当文本内容超过三行时，超出部分会被省略号代替，保持页面布局整洁。
</ky-text>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| size | 文本尺寸 | string | '1' / '2' / '3' / '4' / '5' | '3' |
| type | 文本类型 | string | 'title' / 'main' | 'main' |
| maxLines | 最大行数 | number | - | 1 |
| overflow | 溢出处理方式 | string | 'clip' / 'fade' / 'ellipsis' / 'visible' | - |
| selectable | 是否可选 | boolean | - | false |
| userSelect | 是否允许用户选择（微信端） | boolean | - | false |
| space | WebView 特有属性 - 显示连续空格 | keyof TSpace | 'ensp' / 'emsp' / 'nbsp' | - |
| decode | WebView 特有属性 - 是否解码 | boolean | - | false |
| numberOfLines | 行数（兼容属性） | number | - | - |

### Methods

当前组件不提供公共方法。

### Events

当前组件不触发自定义事件。

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 文本