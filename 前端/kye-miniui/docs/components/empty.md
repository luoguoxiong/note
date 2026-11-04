# Empty

<code-preview path="demos/empty/empty-1.vue" title="基本使用" description="空状态组件，用于展示各种空状态场景"></code-preview>

## 基本使用

最基础的空状态用法。

```html
<ky-empty description="暂无数据" />
```

## 预设类型

Empty 组件提供了多种预设类型，通过 `type` 属性设置。

```html
<!-- 错误状态 -->
<ky-empty type="error" description="出错了，请稍后重试" />

<!-- 网络错误 -->
<ky-empty type="network" description="网络连接失败，请检查网络" />

<!-- 搜索无结果 -->
<ky-empty type="search" description="暂无搜索结果" />

<!-- 列表为空 -->
<ky-empty type="list" description="暂无数据" />

<!-- 地址为空 -->
<ky-empty type="address" description="暂无地址信息" />

<!-- 优惠券为空 -->
<ky-empty type="coupon" description="暂无优惠券" />
```

## 自定义图片尺寸

通过 `imageSize` 属性设置图片尺寸。

```html
<!-- 默认尺寸 -->
<ky-empty type="search" description="暂无搜索结果" />

<!-- 自定义尺寸 -->
<ky-empty type="search" image-size="80" description="暂无搜索结果" />

<ky-empty type="search" image-size="120" description="暂无搜索结果" />
```

## 自定义图片

直接传入图片 URL 作为 `type` 属性值，即可使用自定义图片。

```html
<ky-empty
  type="https://ic-img.ky-express.com/netc/20241101_37921882348_!!1730428324141_112_112.png"
  image-size="50"
  description="运单签收时间已超过6个月暂不支持查询"
></ky-empty>
```

## 插槽使用

支持 image、description 和 default 三个插槽，实现完全自定义。

```html
<!-- 自定义图片 -->
<ky-empty description="暂无数据">
  <template #image>
    <view class="custom-image">📷</view>
  </template>
</ky-empty>

<!-- 自定义描述 -->
<ky-empty type="search">
  <template #description>
    <view class="custom-desc">没有找到相关结果</view>
  </template>
</ky-empty>

<!-- 自定义底部内容 -->
<ky-empty type="search" description="暂无数据">
  <view style="margin-top: 20px">
    <ky-button type="primary" plain>刷新重试</ky-button>
  </view>
</ky-empty>

<!-- 完全自定义 -->
<ky-empty>
  <template #image>
    <view class="custom-icon">🎯</view>
  </template>
  <template #description>
    <text>自定义空状态</text>
  </template>
  <view style="margin-top: 20px">
    <ky-button type="primary">立即添加</ky-button>
  </view>
</ky-empty>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| type | 空状态类型，支持传入图片 URL | string | error / network / search / list / address / coupon / URL | 'error' |
| imageSize | 图片尺寸（单位：px） | number \| string | - | '' |
| description | 描述文字 | string | - | '' |

### Events 事件

当前组件不提供公共事件。

### Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| image | 自定义图片区域 |
| description | 自定义描述文字 |
| default | 自定义底部内容 |

## 常见问题

### Q1: 如何使用自定义图片？

**直接传入图片 URL 作为 type 值：**

```html
<ky-empty type="https://example.com/empty.png" description="暂无数据" />
```

### Q2: 图片尺寸如何设置？

**使用 imageSize 属性：**

```html
<ky-empty type="search" :image-size="80" description="暂无数据" />
```

### Q3: 如何添加操作按钮？

**使用默认插槽：**

```html
<ky-empty type="search" description="暂无数据">
  <view style="margin-top: 20px">
    <ky-button type="primary">去添加</ky-button>
  </view>
</ky-empty>
```
