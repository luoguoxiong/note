# ImagePreview

<code-preview path="demos/image-preview/image-preview-1.vue" title="基本使用" description="图片预览组件的各种用法示例"></code-preview>

## 基本使用

图片预览组件支持组件式和函数式两种调用方式，提供图片缩放、旋转、下载等功能。

## 组件式调用

通过组件方式调用，支持双向绑定控制显隐状态。

```html
<ky-image-preview
  v-model:show="show"
  :images="images"
  :activeIndex="0"
  @change="handleChange"
  @close="handleClose"
/>
```

```javascript
const show = ref(false)
const images = ref([
  { src: 'https://example.com/image1.jpg' },
  { src: 'https://example.com/image2.jpg' },
  { src: 'https://example.com/image3.jpg' },
])

const handleChange = (index) => {
  console.log('当前图片索引:', index)
}

const handleClose = () => {
  show.value = false
}
```

## 函数式调用

通过 `showImagePreview` 方法快捷调用，无需手动管理组件状态。

```html
<ky-button type="primary" @click="openImagePreview">预览图片</ky-button>
```

```javascript
import { showImagePreview } from '@ky-miniui-lib/ky-miniui-lib'

const openImagePreview = () => {
  showImagePreview({
    parentClassName: 'app',
    images: [
      { src: 'https://example.com/image1.jpg' },
      { src: 'https://example.com/image2.jpg' },
    ],
    activeIndex: 0,
    showMenuByLongpress: true,
  })
}
```

## 显示控制

通过 `show` 属性控制预览组件的显示与隐藏。

```html
<!-- 默认隐藏 -->
<ky-image-preview v-model:show="show" :images="images" />

<!-- 初始显示 -->
<ky-image-preview v-model:show="show" :images="images" :show="true" />
```

## 初始索引

通过 `activeIndex` 属性设置初始显示的图片索引。

```html
<ky-image-preview
  v-model:show="show"
  :images="images"
  :activeIndex="2"
/>
```

## 索引显示

通过 `showIndex` 属性控制是否显示图片索引。

```html
<!-- 显示索引（默认） -->
<ky-image-preview v-model:show="show" :images="images" showIndex />

<!-- 隐藏索引 -->
<ky-image-preview v-model:show="show" :images="images" :showIndex="false" />
```

## 分页导航

通过 `showPagination` 属性控制是否显示分页按钮。

```html
<!-- 显示分页（默认） -->
<ky-image-preview v-model:show="show" :images="images" showPagination />

<!-- 隐藏分页 -->
<ky-image-preview v-model:show="show" :images="images" :showPagination="false" />
```

## 关闭按钮

通过 `closeable` 属性控制是否显示关闭按钮。

```html
<!-- 显示关闭按钮（默认） -->
<ky-image-preview v-model:show="show" :images="images" closeable />

<!-- 隐藏关闭按钮 -->
<ky-image-preview v-model:show="show" :images="images" :closeable="false" />
```

## 点击关闭

通过 `closeOnClickOverlay` 和 `contentClose` 属性控制点击行为。

```html
<!-- 点击遮罩层关闭（默认） -->
<ky-image-preview v-model:show="show" :images="images" closeOnClickOverlay />

<!-- 点击内容区域关闭（默认） -->
<ky-image-preview v-model:show="show" :images="images" contentClose />

<!-- 禁止点击关闭 -->
<ky-image-preview
  v-model:show="show"
  :images="images"
  :closeOnClickOverlay="false"
  :contentClose="false"
/>
```

## 长按菜单

通过 `showMenuByLongpress` 属性控制长按图片是否显示菜单（仅在 App 环境生效）。

```html
<!-- 开启长按菜单 -->
<ky-image-preview v-model:show="show" :images="images" showMenuByLongpress />

<!-- 关闭长按菜单（默认） -->
<ky-image-preview v-model:show="show" :images="images" :showMenuByLongpress="false" />
```

## 自定义底部操作

通过 `cover` 插槽自定义底部操作区域。

```html
<ky-image-preview v-model:show="show" :images="images">
  <template #cover>
    <div class="custom-btn" @click="handleShare">分享</div>
    <div class="custom-btn" @click="handleDownload">下载</div>
  </template>
</ky-image-preview>
```

## 组件 API

### Attributes

| 参数                  | 说明                           | 类型                      | 可选值 | 默认值 |
| --------------------- | ------------------------------ | ------------------------- | ------ | ------ |
| show                  | 是否显示预览                   | boolean                   | -      | false  |
| images                | 图片列表                       | Array<{ src: string }>    | -      | []     |
| activeIndex           | 当前显示的图片索引             | number                    | -      | 0      |
| autoplay              | 自动播放间隔（毫秒）           | string \| number          | -      | 3000   |
| isLoop                | 是否循环播放                   | boolean                   | -      | true   |
| showIndex             | 是否显示图片索引               | boolean                   | -      | true   |
| closeable             | 是否显示关闭按钮               | boolean                   | -      | true   |
| contentClose          | 是否可点击内容区域关闭         | boolean                   | -      | true   |
| closeOnClickOverlay   | 是否可点击遮罩层关闭           | boolean                   | -      | true   |
| showPagination        | 是否显示分页按钮               | boolean                   | -      | true   |
| showMenuByLongpress   | 是否显示长按菜单（仅 App 环境） | boolean                   | -      | false  |

### Methods

| 方法名            | 说明                 | 参数                                                                 | 返回值 |
| ----------------- | -------------------- | -------------------------------------------------------------------- | ------ |
| showImagePreview  | 函数式调用预览       | `(options: { images: Array<{ src: string }>, activeIndex?: number, showMenuByLongpress?: boolean, parentClassName?: string })` | Promise |

### Events

| 事件名               | 说明                         | 回调参数                                |
| -------------------- | ---------------------------- | --------------------------------------- |
| update:show          | 显隐状态变更（用于 v-model） | (value: boolean)                        |
| update:activeIndex   | 当前索引变更                 | (index: number)                         |
| close                | 关闭预览时触发               | -                                       |
| change               | 切换图片时触发               | (index: number)                         |
| longPress            | 长按图片时触发               | (image: { src: string })                |
| download             | 下载图片时触发               | (image: { src: string }, index: number) |

### Slots

| 插槽名 | 说明             |
| ------ | ---------------- |
| cover  | 自定义底部操作区 |

#### 常见问题

#### Q1: 如何获取当前显示的图片索引？

**通过事件监听：**

```html
<ky-image-preview
  v-model:show="show"
  :images="images"
  @change="(index) => currentIndex = index"
/>
```

**通过属性绑定：**

```html
<ky-image-preview
  v-model:show="show"
  :images="images"
  v-model:activeIndex="currentIndex"
/>
```

#### Q2: 函数式调用时如何指定挂载容器？

**使用 parentClassName 参数：**

```javascript
showImagePreview({
  parentClassName: 'app-container',
  images: imagesList,
})
```

该参数指定了组件挂载到哪个类名下的 DOM 节点中，默认为 `document.body`。

#### Q3: 长按菜单不显示？

**检查项：**

- 确保设置了 `showMenuByLongpress="true"`
- 长按菜单仅在 App 环境（iOS/Android/鸿蒙）生效
- 小程序环境下长按菜单由系统处理

#### Q4: 如何自定义底部操作按钮？

**使用 cover 插槽：**

```html
<ky-image-preview v-model:show="show" :images="images">
  <template #cover>
    <div class="custom-action">
      <view class="action-btn" @click="handleFavorite">收藏</view>
      <view class="action-btn" @click="handleShare">分享</view>
    </div>
  </template>
</ky-image-preview>
```