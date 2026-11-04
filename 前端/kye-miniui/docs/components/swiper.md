# Swiper

轮播组件，支持横向和纵向滚动，可自定义分页指示器。

## 基本使用

```html
<ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

```javascript
import { ref } from 'vue'
const list = ref([
  'https://ic-img.ky-express.com/netc/20250116_60672831183_!!1737016408556_1372_544.png',
  'https://ic-img.ky-express.com/netc/20250116_1777283114_!!1737016408555_1738_868.png',
  'https://ic-img.ky-express.com/netc/20250116_72772831110_!!1737016326567_1500_660.png',
])
```

## 滚动方向

支持横向和纵向两种滚动方向。

```html
<!-- 横向滚动（默认） -->
<ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>

<!-- 纵向滚动 -->
<ky-swiper :init-page="0" :auto-play="3000" direction="vertical" pagination-visible style="height: 200px">
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 自定义分页指示器

通过 `pagination-color` 和 `pagination-unselected-color` 自定义分页指示器颜色，通过 `pagination-offset` 调整偏移量。

```html
<ky-swiper
  :init-page="0"
  :auto-play="3000"
  pagination-visible
  pagination-color="#ff5500"
  pagination-unselected-color="#cccccc"
  :pagination-offset="24"
>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 自动播放

通过 `auto-play` 属性设置自动播放间隔，单位为毫秒。

```html
<!-- 开启自动播放（3秒间隔） -->
<ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>

<!-- 关闭自动播放 -->
<ky-swiper :init-page="0" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 动画时长

通过 `duration` 属性设置切换动画时长。

```html
<ky-swiper :init-page="0" :auto-play="3000" :duration="2000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 循环播放

通过 `loop` 属性控制是否循环播放。

```html
<!-- 开启循环播放（默认） -->
<ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>

<!-- 关闭循环播放 -->
<ky-swiper :init-page="0" :auto-play="3000" :loop="false" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 触摸交互

通过 `touchable` 属性控制是否支持触摸滑动。

```html
<!-- 禁用触摸滑动 -->
<ky-swiper :init-page="0" :auto-play="3000" :touchable="false" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 初始页码

通过 `init-page` 属性设置初始显示的页码。

```html
<!-- 从第二页开始 -->
<ky-swiper :init-page="1" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 方法调用

通过 ref 调用组件方法。

```html
<ky-swiper ref="swiperRef" :init-page="0" :auto-play="0" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>

<ky-button type="primary" size="mini" @click="handlePrev">上一页</ky-button>
<ky-button type="default" size="mini" @click="handleTo(0)">跳转到1</ky-button>
<ky-button type="danger" size="mini" @click="handleNext">下一页</ky-button>
```

```javascript
const swiperRef = ref()

// 上一页
swiperRef.value?.prev()

// 下一页
swiperRef.value?.next()

// 跳转到指定页码
swiperRef.value?.to(0)
```

## 自定义内容

轮播项支持自定义内容，不限于图片。

```html
<ky-swiper :init-page="0" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in cardList" :key="index">
    <view class="swiper-card" :style="{ backgroundColor: item.color }">
      <view class="card-text">{{ item.title }}</view>
      <view class="card-desc">{{ item.desc }}</view>
    </view>
  </ky-swiper-item>
</ky-swiper>
```

```javascript
const cardList = ref([
  { title: '卡片一', desc: '这是第一张轮播卡片', color: '#667eea' },
  { title: '卡片二', desc: '这是第二张轮播卡片', color: '#764ba2' },
  { title: '卡片三', desc: '这是第三张轮播卡片', color: '#f093fb' },
])
```

```css
.swiper-card {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.card-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
}

.card-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}
```

## 组件 API

### Attributes

| 参数                        | 说明                 | 类型            | 可选值                | 默认值                   |
| --------------------------- | -------------------- | --------------- | --------------------- | ------------------------ |
| width                       | 宽度                 | number / string | -                     | -                        |
| height                      | 高度                 | number / string | -                     | -                        |
| direction                   | 滚动方向             | string          | horizontal / vertical | horizontal               |
| pagination-visible          | 是否显示分页指示器   | boolean         | -                     | false                    |
| pagination-color            | 分页指示器选中颜色   | string          | -                     | rgba(255, 255, 255, 1)   |
| pagination-unselected-color | 分页指示器未选中颜色 | string          | -                     | rgba(255, 255, 255, 0.5) |
| pagination-offset           | 分页指示器偏移量     | number          | -                     | 12                       |
| loop                        | 是否循环播放         | boolean         | -                     | true                     |
| duration                    | 动画时长（ms）       | number / string | -                     | 500                      |
| auto-play                   | 自动播放间隔（ms）   | number / string | -                     | 0                        |
| init-page                   | 初始页码             | number / string | -                     | 0                        |
| touchable                   | 是否支持触摸滑动     | boolean         | -                     | true                     |
| is-prevent-default          | 是否阻止默认事件     | boolean         | -                     | true                     |
| is-stop-propagation         | 是否阻止事件冒泡     | boolean         | -                     | true                     |
| images                      | 图片列表（内部使用） | Array           | -                     | []                       |
| scale                       | 缩放比例（内部使用） | number          | -                     | 1                        |

### Methods

| 方法名 | 说明         | 参数                    | 返回值 |
| ------ | ------------ | ----------------------- | ------ |
| prev   | 上一页       | -                       | void   |
| next   | 下一页       | -                       | void   |
| to     | 跳转到指定页 | (index: number) => void | void   |

### Events

| 事件名 | 说明           | 回调参数                |
| ------ | -------------- | ----------------------- |
| change | 页码变化时触发 | (index: number) => void |

### Slots

| 插槽名  | 说明             |
| ------- | ---------------- |
| default | 轮播项内容       |
| page    | 自定义分页指示器 |

## 常见问题

### Q1: 轮播组件高度不生效？

**解决方案：**

轮播组件默认根据父容器高度自适应。如果需要固定高度，可以直接设置样式：

```html
<ky-swiper style="height: 300px" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 100%" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

或者通过 `height` 属性设置：

```html
<ky-swiper :height="300" :auto-play="3000" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 100%" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

### Q2: 纵向滚动时分页指示器位置不对？

**解决方案：**

纵向滚动时，分页指示器默认显示在左侧。如果需要调整位置，可以通过 `pagination-offset` 属性设置偏移量：

```html
<ky-swiper
  :init-page="0"
  :auto-play="3000"
  direction="vertical"
  pagination-visible
  :pagination-offset="24"
  style="height: 300px"
>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 300px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

### Q3: 如何监听轮播切换事件？

**解决方案：**

通过 `change` 事件监听轮播切换：

```html
<ky-swiper :auto-play="3000" pagination-visible @change="handleChange">
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

```javascript
const handleChange = (index: number) => {
  console.log('当前页码:', index)
}
```

### Q4: 如何手动控制轮播？

**解决方案：**

通过 `ref` 调用组件方法实现手动控制：

```html
<ky-swiper ref="swiperRef" :auto-play="0" pagination-visible>
  <ky-swiper-item v-for="(item, index) in list" :key="index">
    <img :src="item" style="width: 100%; height: 200px" draggable="false" />
  </ky-swiper-item>
</ky-swiper>

<view class="action-buttons">
  <ky-button type="primary" size="mini" @click="handlePrev">上一页</ky-button>
  <ky-button type="default" size="mini" @click="handleTo(0)">跳转到1</ky-button>
  <ky-button type="danger" size="mini" @click="handleNext">下一页</ky-button>
</view>
```

```javascript
const swiperRef = ref()

const handlePrev = () => {
  swiperRef.value?.prev()
}

const handleNext = () => {
  swiperRef.value?.next()
}

const handleTo = (index: number) => {
  swiperRef.value?.to(index)
}
```

### Q5: 自动播放在页面隐藏后继续播放？

**解决方案：**

组件内部已处理页面生命周期，在页面隐藏时会自动停止播放，页面显示时自动恢复。无需额外处理。
