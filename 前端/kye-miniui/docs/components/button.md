# Button

<code-preview path="demos/button/button-1.vue" title="基本使用" description="各种按钮用法示例"></code-preview>

## 基本使用

## 按钮类型

支持四种按钮类型，满足不同场景需求。

```html
<!-- 主要按钮 -->
<ky-button type="primary">primary</ky-button>

<!-- 默认按钮 -->
<ky-button type="default">default</ky-button>

<!-- 警告按钮 -->
<ky-button type="warning">warning</ky-button>

<!-- 危险按钮 -->
<ky-button type="danger">danger</ky-button>
```

## 按钮尺寸

支持五种按钮尺寸，默认为 normal。

```html
<!-- 大尺寸 -->
<ky-button type="primary" size="large">large</ky-button>

<!-- 默认尺寸 -->
<ky-button type="primary">normal</ky-button>

<!-- 小尺寸 -->
<ky-button type="primary" size="small">small</ky-button>

<!-- 迷你尺寸 -->
<ky-button type="primary" size="mini">mini</ky-button>
```

## 朴素按钮

通过 plain 属性将按钮设置为朴素按钮，朴素按钮的文字为按钮颜色，背景为白色。

```html
<ky-button type="primary" plain>朴素primary</ky-button>
<ky-button type="default" plain>朴素default</ky-button>
<ky-button type="warning" plain>朴素warning</ky-button>
<ky-button type="danger" plain>朴素danger</ky-button>
```

## 禁用状态

通过 disabled 属性来禁用按钮，禁用状态下按钮不可点击。

```html
<!-- 禁用状态 -->
<ky-button type="primary" disabled>disabled</ky-button>

<!-- 朴素禁用 -->
<ky-button type="primary" plain disabled>朴素disabled</ky-button>
```

## 加载状态

通过 loading 属性设置按钮为加载状态，loading 状态下默认会显示加载图标，可以通过 loading-text 设置加载状态文案。

```html
<!-- 默认加载状态 -->
<ky-button type="primary" loading>loading</ky-button>

<!-- 自定义加载文案 -->
<ky-button type="primary" loading loading-text="加载中">加载中</ky-button>

<!-- 朴素加载状态 -->
<ky-button type="primary" loading plain>朴素loading</ky-button>
```

## 自定义图标

通过 icon 插槽可以自定义按钮图标，loading 状态下不显示。

```html
<ky-button type="primary">
  <template #icon>
    <img src="https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png" />
  </template>
  <text>带图标按钮</text>
</ky-button>
```

## 自定义颜色

通过 color 属性可以自定义按钮颜色，支持传入普通颜色值和渐变色。

```html
<!-- 纯色按钮 -->
<ky-button color="#7232dd">纯色按钮</ky-button>

<!-- 朴素纯色按钮 -->
<ky-button color="#7232dd" plain>朴素纯色</ky-button>

<!-- 渐变色按钮 -->
<ky-button color="linear-gradient(to right, #ff6034, #ee0a24)">渐变色</ky-button>
```

## 块级按钮

通过 block 属性设置按钮为块级元素，占据父容器宽度。

```html
<ky-button type="primary" block>块级按钮</ky-button>
```

## 原生属性

支持小程序原生 button 组件的各种属性，如 open-type 等。

```html
<ky-button
  size="mini"
  open-type="getPhoneNumber"
  scope="phoneNumber"
  @getphonenumber="onGetPhoneNumber"
  @error="onError"
>获取手机号</ky-button>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| type | 按钮类型 | string | primary / warning / danger / default | default |
| formType | 按钮表单类型 | string | button / submit / reset | button |
| size | 按钮尺寸 | string | large / medium / normal / small / mini | normal |
| shape | 按钮形状 | string | round / square | round |
| text | 按钮文本，支持不使用 slot-default | string | - | '' |
| color | 按钮自定义颜色 | string | - | - |
| plain | 是否朴素按钮 | boolean | - | false |
| block | 是否块级按钮 | boolean | - | false |
| loading | 是否加载状态 | boolean | - | false |
| loadingText | 加载状态文案 | string | - | '' |
| loadingSize | 加载图标大小 | string / number | - | '20px' |
| disabled | 是否禁用按钮 | boolean | - | false |

### Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | ------ |
| click | 点击按钮时触发 | (event: Event) => void |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 按钮内容 |
| icon | 自定义图标 |

#### 常见问题

#### Q1: 如何设置按钮为加载状态？

**使用 `loading` 属性：**

```html
<ky-button type="primary" loading>加载中</ky-button>
```

**自定义加载文案：**

```html
<ky-button type="primary" loading loading-text="提交中">提交</ky-button>
```

#### Q2: 如何自定义按钮颜色？

**支持纯色和渐变色：**

```html
<!-- 纯色 -->
<ky-button color="#7232dd">自定义颜色</ky-button>

<!-- 渐变色 -->
<ky-button color="linear-gradient(to right, #ff6034, #ee0a24)">渐变色</ky-button>

<!-- 朴素模式下的自定义颜色 -->
<ky-button color="#7232dd" plain>朴素自定义</ky-button>
```

#### Q3: 如何处理小程序原生事件？

**使用原生属性和事件：**

```html
<ky-button
  open-type="getPhoneNumber"
  @getphonenumber="handleGetPhoneNumber"
  @error="handleError"
>获取手机号</ky-button>
```

```javascript
const handleGetPhoneNumber = (e) => {
  console.log('获取手机号', e)
}

const handleError = (e) => {
  console.log('错误', e)
}
```

#### Q4: 按钮点击不生效？

**检查项：**

| 检查项 | 说明 |
| ------ | ---- |
| disabled | 如果设置了 `disabled="true"`，按钮将无法点击 |
| loading | 如果设置了 `loading="true"`，按钮将无法点击 |
| z-index | 检查是否有其他元素遮挡了按钮 |