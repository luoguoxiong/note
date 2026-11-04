# FloatingPanel

<code-preview path="demos/floating-panel/floating-panel-1.vue" title="基本使用" description="浮动面板用法示例"></code-preview>

## 基本使用

通过 `v-model:height` 绑定面板高度，`anchors` 控制吸附点位置。

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[100, 300, 500]"
  @heightChange="handleHeightChange"
  @heightChangeEnd="handleHeightChangeEnd"
>
  <view class="panel-content">
    <text>面板内容区域</text>
  </view>
</ky-floating-panel>
```

```javascript
import { ref } from 'vue'

const height = ref(300)

const handleHeightChange = (h) => {
  console.log('高度变化中:', h)
}

const handleHeightChangeEnd = (h) => {
  console.log('高度变化结束:', h)
}
```

## 自定义吸附点

通过 `anchors` 属性设置多个吸附点，面板会在拖拽结束后自动吸附到最近的锚点。

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[120, 240, 480]"
/>
```

```javascript
const anchors = [120, 240, 480]
const height = ref(anchors[1])
```

## 内容滚动与拖拽

通过 `contentDraggable` 属性控制内容区域是否可拖动，当内容区域需要滚动时，设置为 `false`。

```html
<!-- 允许内容滚动，禁用内容区域拖拽 -->
<ky-floating-panel
  v-model:height="height"
  :anchors="[200, 600]"
  :contentDraggable="false"
>
  <view style="height: 1200px; overflow: auto">
    <view v-for="i in 50" :key="i" class="list-item">
      列表项 {{ i }}
    </view>
  </view>
</ky-floating-panel>
```

## 背景色与安全区

通过 `backgroundColor` 设置面板背景色，`safeAreaInsetBottom` 控制是否启用底部安全区适配。

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[150, 500]"
  background-color="#fff"
  :safe-area-inset-bottom="true"
>
  <view class="panel-content">
    <text>带背景色的面板</text>
  </view>
</ky-floating-panel>
```

## 自定义拖拽条

通过 `bar` 插槽自定义顶部拖拽条样式。

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[200, 500]"
>
  <template #bar>
    <view class="custom-bar">
      <view class="bar-dot"></view>
      <view class="bar-dot"></view>
      <view class="bar-dot"></view>
    </view>
  </template>
  <view class="panel-content">
    <text>自定义拖拽条</text>
  </view>
</ky-floating-panel>
```

```css
.custom-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16rpx 0;
}

.bar-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
}
```

## 自定义头部

通过 `header` 插槽在拖拽条下方添加自定义头部内容。

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[200, 500]"
>
  <template #header>
    <view class="custom-header">
      <text class="header-title">面板标题</text>
      <text class="header-subtitle">副标题内容</text>
    </view>
  </template>
  <view class="panel-content">
    <text>面板主体内容</text>
  </view>
</ky-floating-panel>
```

## 过渡动画

通过 `duration` 属性设置面板吸附时的过渡动画时长（单位：秒）。

```html
<!-- 0.5秒过渡动画 -->
<ky-floating-panel
  v-model:height="height"
  :anchors="[100, 500]"
  :duration="0.5"
/>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| height | 面板当前高度（支持 v-model:height） | number | - | 100 |
| duration | 过渡动画时长（秒） | number | - | 0.3 |
| backgroundColor | 背景色 | string | - | 'none' |
| contentDraggable | 内容区域是否可拖动（允许滚动时不影响面板拖拽） | boolean | - | true |
| anchors | 吸附点集合（至少含两个高度时生效，缺省时自动生成） | number[] | - | [] |
| safeAreaInsetBottom | 是否启用底部安全区 | boolean | - | true |

**说明**：当 `anchors` 数量不足 2 时，组件将根据窗口高度自动计算最小/最大吸附点；`height` 与 `anchors` 协同控制面板位置。

### Attributes（Wx 小程序端）

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| height | 面板当前高度（支持 v-model:height） | number | - | - |
| anchors | 吸附点集合 | number[] | - | [100, 屏高的 60%]（自动计算） |
| backgroundColor | 背景色 | string | - | - |

### Methods

当前组件无公开方法。

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:height | v-model 同步（拖拽过程中不定时更新） | `(height: number)` |
| heightChange | 高度变化时触发（拖拽中） | `(height: number)` |
| heightChangeEnd | 高度变化结束时触发（释放后吸附） | `(height: number)` |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| bar | 顶部拖拽条（默认提供一条样式条） |
| header | 自定义头部内容（位于拖拽条下） |
| default | 面板主体内容区 |

#### 常见问题

#### Q1: 面板拖拽不生效？

**检查项：**

- 确保设置了 `v-model:height` 绑定
- 确保 `anchors` 数组至少包含两个元素，或允许自动生成
- 检查是否有其他元素阻止了 touch 事件冒泡

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[100, 500]"
/>
```

#### Q2: 内容区域滚动与面板拖拽冲突？

**解决方案：**

设置 `contentDraggable` 为 `false`，禁用内容区域的拖拽能力，只允许在拖拽条区域进行拖拽。

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[200, 600]"
  :contentDraggable="false"
>
  <view style="height: 1200px; overflow: auto">
    长列表内容...
  </view>
</ky-floating-panel>
```

#### Q3: 如何设置面板初始高度？

**直接设置 `v-model:height` 的初始值：**

```javascript
const height = ref(300)
```

**或者设置为 `anchors` 中的某个值：**

```javascript
const anchors = [100, 300, 500]
const height = ref(anchors[1])
```

#### Q4: 如何自定义拖拽条样式？

**使用 `bar` 插槽：**

```html
<ky-floating-panel
  v-model:height="height"
  :anchors="[200, 500]"
>
  <template #bar>
    <view class="custom-bar">
      <!-- 自定义拖拽条内容 -->
    </view>
  </template>
</ky-floating-panel>
```

#### Q5: 面板高度超出预期？

**检查 `anchors` 设置：**

- `anchors` 数组第一个值为最小高度，最后一个值为最大高度
- 面板实际高度受 `height` 值和 `anchors` 范围共同限制

```html
<!-- 限制高度在 100-600px 之间 -->
<ky-floating-panel
  v-model:height="height"
  :anchors="[100, 300, 6