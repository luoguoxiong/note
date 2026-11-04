# FloatingBubble

<code-preview path="demos/floating-bubble/floating-bubble-1.vue" title="基本使用" description="浮动气泡用法示例"></code-preview>

## 基本使用

通过 `v-model:offset` 绑定气泡位置，`axis` 控制拖拽方向。

```html
<ky-floating-bubble
  v-model:offset="offset"
  axis="xy"
  text="浮动气泡"
  @click="handleClick"
  @offsetChange="handleOffsetChange"
/>
```

```javascript
import { ref } from 'vue'

const offset = ref({ x: 100, y: 200 })

const handleClick = (e) => {
  console.log('气泡被点击', e)
}

const handleOffsetChange = (pos) => {
  console.log('位置变化', pos)
}
```

## 拖拽方向

通过 `axis` 属性控制气泡的拖拽方向。

```html
<!-- 仅X轴拖拽 -->
<ky-floating-bubble axis="x" text="仅X轴" />

<!-- 仅Y轴拖拽（默认） -->
<ky-floating-bubble axis="y" text="仅Y轴" />

<!-- 自由拖拽 -->
<ky-floating-bubble axis="xy" text="自由拖拽" />

<!-- 锁定位置，禁止拖拽 -->
<ky-floating-bubble axis="lock" text="锁定" />
```

## 磁吸效果

通过 `magnetic` 属性启用自动磁吸功能，气泡会在拖拽结束后自动吸附到最近的边缘。

```html
<!-- X方向磁吸 -->
<ky-floating-bubble axis="xy" magnetic="x" text="X方向磁吸" />

<!-- Y方向磁吸 -->
<ky-floating-bubble axis="xy" magnetic="y" text="Y方向磁吸" />
```

## 边距设置

通过 `gap` 属性设置气泡与窗口边缘的最小间距。

```html
<!-- 无间距 -->
<ky-floating-bubble axis="xy" :gap="0" text="gap 0" />

<!-- 10px间距 -->
<ky-floating-bubble axis="xy" :gap="10" text="gap 10" />

<!-- 20px间距 -->
<ky-floating-bubble axis="xy" :gap="20" text="gap 20" />
```

## 双向绑定

通过 `v-model:offset` 实现气泡位置的双向绑定。

```html
<ky-floating-bubble
  v-model:offset="offset"
  axis="xy"
  text="双向绑定"
/>
```

```javascript
import { ref } from 'vue'

const offset = ref({ x: 100, y: 200 })
```

## 安全区适配

通过 `safeAreaInsetBottom` 属性控制是否启用底部安全区适配。

```html
<!-- 启用安全区（默认） -->
<ky-floating-bubble text="启用安全区" />

<!-- 禁用安全区 -->
<ky-floating-bubble :safe-area-inset-bottom="false" text="禁用安全区" />
```

## 图标与文本

通过 `icon` 和 `text` 属性设置气泡的图标和文本内容。

```html
<!-- 带图标 -->
<ky-floating-bubble
  icon="https://example.com/icon.png"
  text="带图标"
/>

<!-- 纯文本 -->
<ky-floating-bubble text="纯文本" />
```

## 自定义内容

通过默认插槽自定义气泡内容。

```html
<ky-floating-bubble axis="xy">
  <view class="custom-bubble">
    <view class="bubble-icon">🎯</view>
    <view class="bubble-text">自定义内容</view>
  </view>
</ky-floating-bubble>
```

```css
.custom-bubble {
  width: 100px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.bubble-icon {
  font-size: 20px;
}

.bubble-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| offset | 气泡初始位置（支持 v-model:offset） | `{x: number, y: number}` | - | null |
| axis | 拖拽方向 | string | 'x', 'y', 'xy', 'lock' | 'y' |
| gap | 气泡与窗口的最小间距（px） | number | - | 0 |
| magnetic | 自动磁吸方向 | string | 'x', 'y', null | null |
| safeAreaInsetBottom | 是否启用底部安全区 | boolean | - | true |
| icon | 图片链接 | string | - | '' |
| text | 默认文本 | string | - | '浮动气泡' |

### Methods

当前组件无公开方法。

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:offset | 双向数据绑定返回值 | `{x: number, y: number}` |
| click | 点击组件时触发 | TouchEvent |
| offsetChange | 由用户拖拽导致位置改变时触发 | `{x: number, y: number}` |
| offsetChangeEnd | 由用户拖拽导致位置改变结束触发 | `{x: number, y: number}` |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义气泡内容 |

#### 常见问题

#### Q1: 气泡不显示？

**检查项：**

- 确保组件已正确引入和注册
- 检查 `offset` 属性是否设置了有效的坐标值
- 检查组件是否被其他元素遮挡

```html
<ky-floating-bubble
  v-model:offset="offset"
  axis="xy"
  text="浮动气泡"
/>
```

#### Q2: 拖拽不生效？

**检查项：**

- 确保 `axis` 属性不是 `'lock'`
- 检查是否有其他元素阻止了 touch 事件冒泡
- 确认组件已正确绑定 touch 事件

```html
<ky-floating-bubble axis="xy" text="自由拖拽" />
```

#### Q3: 如何获取气泡当前位置？

**方式一：使用 v-model 双向绑定**

```html
<ky-floating-bubble v-model:offset="offset" axis="xy" />
```

```javascript
const offset = ref({ x: 100, y: 200 })
// offset.value 会实时更新气泡位置
```

**方式二：监听事件**

```html
<ky-floating-bubble
  axis="xy"
  @offsetChange="handleChange"
  @offsetChangeEnd="handleEnd"
/>
```

```javascript
const handleChange = (pos) => {
  console.log('拖拽中:', pos)
}

const handleEnd = (pos) => {
  console.log('拖拽结束:', pos)
}
```

#### Q4: 如何禁用磁吸效果？

**设置 `magnetic` 为 `null`（默认值）：**

```html
<ky-floating-bubble axis="xy" :magnetic="null" text="无磁吸" />
```

#### Q5: 如何设置气泡初始位置？

**使用 `offset` 属性：**

```html
<ky-floating-bubble
  :offset="{ x: 100, y: 200 }"
  axis="xy"
  text="初始位置"
/>
```

**或使用双向绑定：**

```html
<ky-floating-bubble
  v-model:offset="offset"
  axis="xy"
  text="双向绑定"
/>
```

```javascript
const offset = ref({ x: 100,