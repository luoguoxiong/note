
# FloatPagination

<code-preview path="demos/float-pagination/float-pagination-1.vue" title="基本使用" description="浮动翻页器用法示例"></code-preview>

浮动翻页器，固定在视口左侧或右侧中部，常用于列表/票据场景的快速翻页，支持展开/收起。

## 基本使用

通过 `v-model` 绑定当前页码，`max` 指定最大页数：

```html
<ky-float-pagination v-model="current" :max="5" />
```

```javascript
import { ref } from 'vue'

const current = ref(1)
```

## 左右靠边

通过 `placement` 属性控制组件靠左还是靠右显示，默认 `left`：

```html
<!-- 左靠边（默认） -->
<ky-float-pagination v-model="current" :max="10" placement="left" />

<!-- 右靠边 -->
<ky-float-pagination v-model="current" :max="10" placement="right" />
```

## 边界值与禁用状态

- 当 `modelValue <= min` 时，上一页按钮不可点击
- 当 `modelValue >= max` 时，下一页按钮不可点击
- `disabled` 可整体禁用翻页

```html
<ky-float-pagination v-model="current" :min="1" :max="10" />

<!-- 整体禁用 -->
<ky-float-pagination v-model="current" :min="1" :max="10" :disabled="true" />
```

## 自定义文案

通过 `prevText` / `nextText` 自定义按钮文案：

```html
<ky-float-pagination v-model="current" prevText="上一页" nextText="下一页" />
```

## 翻页事件

`prev` / `next` 在点击上/下一页时触发，回调参数为切换后的页码；`change` 在页码变化时触发：

```html
<ky-float-pagination
  v-model="current"
  :max="10"
  @prev="onPrev"
  @next="onNext"
  @change="onChange"
/>
```

```javascript
const onPrev = (value) => console.log('点击上一页，新页码：', value)
const onNext = (value) => console.log('点击下一页，新页码：', value)
const onChange = (value) => console.log('页码变化：', value)
```

## 展开 / 收起事件

点击组件会切换展开/收起状态，并触发 `open` 或 `close` 事件：

```html
<ky-float-pagination v-model="current" :max="10" @open="onOpen" @close="onClose" />
```

```javascript
const onOpen = () => console.log('展开')
const onClose = () => console.log('收起')
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue | 当前页码，支持 `v-model` | number | - | 1 |
| min | 最小页码，等于该值时上一页不可点击 | number | - | 1 |
| max | 最大页码，等于该值时下一页不可点击 | number | - | 1 |
| prevText | 上一页按钮文案 | string | - | '上一票' |
| nextText | 下一页按钮文案 | string | - | '下一票' |
| disabled | 是否禁用翻页 | boolean | - | false |
| placement | 靠边位置 | string | 'left', 'right' | 'left' |

### Methods

当前组件无公开方法。

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 页码变化时触发（`v-model`） | value: number |
| change | 页码变化时触发 | value: number |
| prev | 点击上一页时触发（边界禁用时不触发） | value: number |
| next | 点击下一页时触发（边界禁用时不触发） | value: number |
| open | 组件展开时触发 | - |
| close | 组件收起时触发 | - |

### Slots

当前组件不提供插槽。

#### 常见问题

#### Q1: 右靠边时图形/文字方向不对？

`placement="right"` 时组件会自动水平镜像背景图形，同时把内部内容翻转回来，保证文字与图标方向正常。若自定义了内部结构，需要自行处理镜像后的样式。

```html
<ky-float-pagination v-model="current" :max="10" placement="right" />
```

#### Q2: 翻页按钮不可点击？

**检查项：**

- 当前页码是否已到达边界：`modelValue <= min` 时上一页不可点击，`modelValue >= max` 时下一页不可点击
- 是否设置了 `disabled` 整体禁用

```html
<ky-float-pagination v-model="current" :min="1" :max="10" />
```

#### Q3: 如何获取当前页码？

**方式一：使用 v-model 双向绑定**

```html
<ky-float-pagination v-model="current" :max="10" />
```

```javascript
const current = ref(1)
// current.value 会实时同步当前页码
```

**方式二：监听事件**

```html
<ky-float-pagination v-model="current" :max="10" @change="handleChange" />
```

```javascript
const handleChange = (value) => {
  console.log('当前页码：', value)
}
```

#### Q4: 如何在左右两侧之间切换？

通过 `placement` 属性动态切换即可：

```html
<ky-float-pagination v-model="current" :max="10" :placement="placement" />
```

```javascript
import { ref } from 'vue'

const placement = ref('left')
// 切换到右靠边
placement.value = 'right'
```
