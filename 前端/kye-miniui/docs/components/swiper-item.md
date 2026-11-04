# SwiperItem

轮播项组件，用于包裹轮播内容，支持动态调整大小和位置。

## 基本使用

```html
<ky-swiper :init-page="0" :auto-play="1000" pagination-visible>
  <ky-swiper-item style="height: 150px">
    <img src="https://example.com/image1.jpg" style="width: 100%; height: 100%" draggable="false" />
  </ky-swiper-item>
  <ky-swiper-item style="height: 150px">
    <img src="https://example.com/image2.jpg" style="width: 100%; height: 100%" draggable="false" />
  </ky-swiper-item>
</ky-swiper>
```

## 动态调整大小

通过 `style` 属性可以动态调整轮播项的大小。

```html
<ky-swiper-item style="height: 200px; width: 100px">
  <img src="https://example.com/image1.jpg" style="width: 100%; height: 100%" draggable="false" />
</ky-swiper-item>
```

## 组件 API

### Attributes
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| style | 自定义样式 | object | - | - |

### Methods
| 方法名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| setOffset | 设置偏移量 | (offset: number) => void | - |

### Slots
| 名称 | 说明 |
| ---- | ---- |
| default | 轮播项内容 |
