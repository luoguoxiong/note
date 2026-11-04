# Tag

## 基本使用

<code-preview path="demos/tag/tag-1.vue" title="基本使用" description=" "></code-preview>

## 不同尺寸

Tag 组件提供了 5 种不同的尺寸，通过 `size` 属性设置，尺寸从 1 到 5 逐渐增大。

```html
<ky-tag size="5" bgColor="#8365F6" borderColor="#8365F6" textColor="#ffff">跨越速运</ky-tag>
<ky-tag size="4" bgColor="#8365F6" borderColor="#8365F6" textColor="#fff">跨越速运</ky-tag>
<ky-tag size="3" bgColor="#8365F6" borderColor="#8365F6" textColor="#fff">跨越速运</ky-tag>
<ky-tag size="2" bgColor="#8365F6" borderColor="#8365F6" textColor="#fff">跨越速运</ky-tag>```
<ky-tag size="1" bgColor="#8365F6" borderColor="#8365F6" textColor="#fff">跨越速运</ky-tag>
```

## 预设颜色

Tag 组件提供了多种预设颜色，通过 `bgColor` 和 `textColor` 属性设置。

```html
<ky-tag size="3" bgColor="#8365F6" textColor="#fff">主色</ky-tag>
<ky-tag size="3" bgColor="#FF9300" textColor="#fff">橙色</ky-tag>
<ky-tag size="3" bgColor="#FF706D" textColor="#fff">红色</ky-tag>
<ky-tag size="3" bgColor="#00C58C" textColor="#fff">绿色</ky-tag>
<ky-tag size="3" bgColor="#57A8F9" textColor="#fff">蓝色</ky-tag>
<ky-tag size="3" bgColor="#ADB0B8" textColor="#fff">灰色</ky-tag>
```

## 朴素标签

设置 `plain` 属性可以创建朴素标签，朴素标签仅有边框，无背景色。

```html
<ky-tag size="5" plain textColor="#8365F6">跨越速运</ky-tag>
<ky-tag size="4" plain textColor="#8365F6">跨越速运</ky-tag>
<ky-tag size="3" plain textColor="#8365F6">跨越速运</ky-tag>
<ky-tag size="2" plain textColor="#8365F6">跨越速运</ky-tag>
<ky-tag size="1" plain textColor="#8365F6">跨越速运</ky-tag>
```

## 自定义样式

通过 `bgColor`、`textColor` 和 `borderColor` 属性可以自定义标签的样式。

```html
<ky-tag size="3" bgColor="#8365F6" borderColor="#8365F6" textColor="#fff">自定义边框</ky-tag>
<ky-tag size="3" bgColor="#FFF0F0" borderColor="#FF706D" textColor="#FF706D">浅红背景</ky-tag>
<ky-tag size="3" bgColor="#F0FFF4" borderColor="#00C58C" textColor="#00C58C">浅绿背景</ky-tag>
<ky-tag size="3" bgColor="#FFF9E6" borderColor="#FF9300" textColor="#FF9300">浅橙背景</ky-tag>
```

## 显示控制

通过 `show` 属性可以控制标签的显示和隐藏。

```html
<ky-tag :show="true">显示</ky-tag>
<ky-tag :show="false">隐藏</ky-tag>
```

## 点击事件

Tag 组件支持点击事件，通过 `@click` 绑定点击处理函数。

```html
<ky-tag size="3" bgColor="#8365F6" textColor="#fff" @click="handleClick">可点击标签</ky-tag>
<ky-tag size="3" plain textColor="#8365F6" @click="handleClick">朴素点击标签</ky-tag>
```

## 标签列表

Tag 组件常用于标签列表场景，如状态标签、优先级标签等。

```html
<ky-tag size="3" bgColor="#00C58C" textColor="#fff">已完成</ky-tag>
<ky-tag size="3" bgColor="#FF9300" textColor="#fff">进行中</ky-tag>
<ky-tag size="3" bgColor="#FF706D" textColor="#fff">已取消</ky-tag>

<ky-tag size="3" plain textColor="#FF706D">紧急</ky-tag>
<ky-tag size="3" plain textColor="#FF9300">高</ky-tag>
<ky-tag size="3" plain textColor="#57A8F9">中</ky-tag>
<ky-tag size="3" plain textColor="#ADB0B8">低</ky-tag>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| show | 是否显示标签 | boolean | - | true |
| size | 标签大小 | string | 1 / 2 / 3 / 4 / 5 | - |
| plain | 是否为朴素模式（仅边框，无背景色） | boolean | - | false |
| bgColor | 标签背景颜色 | string | - | #8365F6 |
| textColor | 标签文本颜色 | string | - | #fff |
| borderColor | 标签边框颜色（默认为背景色） | string | - | #8365F6 |

### Events 事件

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| click | 点击标签时触发 | event: Event |

### Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 标签内容 | - |
