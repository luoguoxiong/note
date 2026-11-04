# Circle

<code-preview path="demos/circle/circle-1.vue" title="基本使用" description="用于展示圆形进度"></code-preview>

## 基本使用

通过 `progress` 属性设置进度值。

```html
<ky-circle :size="120" :progress="progress" :duration="2000" />
```

```javascript
const progress = ref(30)

const increaseProgress = () => {
  if (progress.value < 100) {
    progress.value += 10
  }
}
```

## 不同尺寸

通过 `size` 属性设置圆环尺寸。

```html
<ky-circle :size="60" :progress="50" />
<ky-circle :size="100" :progress="50" />
<ky-circle :size="140" :progress="50" />
```

## 自定义颜色

通过 `color` 属性自定义圆环颜色。

```html
<ky-circle :size="100" color="#8365F6" :progress="70" />
<ky-circle :size="100" color="#FF706D" :progress="70" />
<ky-circle :size="100" color="#00C58C" :progress="70" />
<ky-circle :size="100" color="#57A8F9" :progress="70" />
```

## 轨道颜色

通过 `track-color` 属性设置轨道颜色。

```html
<ky-circle :size="100" :progress="60" track-color="#eee" />
<ky-circle :size="100" :progress="60" track-color="#ddd" />
<ky-circle :size="100" :progress="60" color="#8365F6" track-color="#F0EEFC" />
```

## 圆环宽度

通过 `stroke-width` 属性设置圆环宽度。

```html
<ky-circle :size="100" :stroke-width="4" :progress="70" />
<ky-circle :size="100" :stroke-width="8" :progress="70" />
<ky-circle :size="100" :stroke-width="12" :progress="70" />
```

## 动画时长

通过 `duration` 属性设置动画时长。

```html
<ky-circle :size="100" :progress="80" :duration="500" />
<ky-circle :size="100" :progress="80" :duration="2000" />
```

## 隐藏文本

通过 `show-text` 属性控制是否显示百分比文本。

```html
<ky-circle :size="100" :progress="66" :show-text="false" />
```

## 自定义内容

通过默认插槽自定义圆环内部内容。

```html
<ky-circle :size="120" :progress="progress" color="#00C58C">
  <template #default="{ currentProgress }">
    <view class="custom-content">
      <text class="custom-number">{{ currentProgress }}</text>
      <text class="custom-unit">分</text>
    </view>
  </template>
</ky-circle>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| size | 圆环尺寸 | number | - | 100 |
| strokeWidth | 圆环宽度 | number | - | 8 |
| color | 圆环颜色 | string | - | '#1989fa' |
| trackColor | 轨道颜色 | string | - | '#e5e5e5' |
| progress | 进度值 | number | - | 0 |
| duration | 动画时长 | number | - | 200 |
| showText | 是否显示文字 | boolean | - | true |

### Slots

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 自定义文字内容 | { currentProgress: number } |