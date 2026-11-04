# SwipeGroup

<code-preview path="demos/swipe-group/swipe-group-1.vue" title="基本使用" description="滑动单元格和分组容器用法示例"></code-preview>

## 基本使用

`ky-swipe-group` 是滑动单元格的分组容器，用于管理多个 `ky-swipe-cell` 的互斥和自动关闭行为。

```html
<ky-swipe-group>
  <ky-swipe-cell name="row-1">
    <ky-cell title="左滑显示操作"></ky-cell>
    <template #right>
      <ky-button type="primary">操作</ky-button>
    </template>
  </ky-swipe-cell>
</ky-swipe-group>
```

## 互斥模式

通过 `lock` 属性启用互斥模式，同一时间仅一个 `SwipeCell` 处于打开状态。

```html
<ky-swipe-group lock>
  <ky-swipe-cell name="a">
    <ky-cell title="行 A"></ky-cell>
    <template #right>
      <ky-button type="primary">操作 A</ky-button>
    </template>
  </ky-swipe-cell>
  <ky-swipe-cell name="b">
    <ky-cell title="行 B"></ky-cell>
    <template #right>
      <ky-button type="primary">操作 B</ky-button>
    </template>
  </ky-swipe-cell>
</ky-swipe-group>
```

说明：在互斥模式下，打开新的 `SwipeCell` 会自动关闭其他已打开的。

## 自动关闭

通过 `move-end-close` 属性启用滑动结束后自动关闭功能。

```html
<ky-swipe-group :move-end-close="true">
  <ky-swipe-cell name="row-1">
    <ky-cell title="左滑显示操作"></ky-cell>
    <template #right>
      <ky-button type="primary">操作</ky-button>
    </template>
  </ky-swipe-cell>
</ky-swipe-group>
```

说明：在滑动结束且未继续交互时，自动清空当前激活项并关闭。

## SwipeCell 基础用法

`ky-swipe-cell` 是滑动单元格组件，支持左右两侧滑动显示操作按钮。

### 右侧滑动

```html
<ky-swipe-cell>
  <ky-cell title="右滑显示操作"></ky-cell>
  <template #right>
    <ky-button type="primary">操作</ky-button>
  </template>
</ky-swipe-cell>
```

### 左侧滑动

```html
<ky-swipe-cell>
  <ky-cell title="左滑显示操作"></ky-cell>
  <template #left>
    <ky-button type="danger">删除</ky-button>
  </template>
</ky-swipe-cell>
```

### 双向滑动

```html
<ky-swipe-cell>
  <ky-cell title="左右滑动">
    <view style="display: flex">
      <view>swipe right </view>
      <view>内容区域</view>
      <view>swipe left </view>
    </view>
  </ky-cell>
  <template #left>
    <ky-button type="primary">收藏</ky-button>
  </template>
  <template #right>
    <ky-button type="danger">删除</ky-button>
  </template>
</ky-swipe-cell>
```

## 禁用状态

通过 `disabled` 属性禁用滑动功能。

```html
<ky-swipe-cell disabled>
  <ky-cell title="禁止滑动"></ky-cell>
  <template #right>
    <ky-button type="primary">操作</ky-button>
  </template>
</ky-swipe-cell>
```

## 手动控制

通过 `ref` 调用组件方法手动控制打开和关闭。

```html
<ky-swipe-cell ref="swipeRef">
  <ky-cell title="手动控制"></ky-cell>
  <template #right>
    <ky-button type="primary">操作</ky-button>
  </template>
</ky-swipe-cell>
```

```javascript
const swipeRef = ref(null)

// 打开左侧
swipeRef.value?.open('left')

// 打开右侧
swipeRef.value?.open('right')

// 关闭
swipeRef.value?.close()
```

## 关闭前拦截

通过 `before-close` 属性在关闭前进行拦截，支持异步操作。

```html
<ky-swipe-cell :before-close="onBeforeClose">
  <ky-cell title="关闭前确认"></ky-cell>
  <template #right>
    <ky-button type="danger">删除</ky-button>
  </template>
</ky-swipe-cell>
```

```javascript
const onBeforeClose = ({ position }) => {
  return new Promise((resolve) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (res) {
        if (res.confirm) {
          resolve(true)
        } else if (res.cancel) {
          resolve(false)
        }
      },
    })
  })
}
```

## 双向绑定

通过 `v-model:show` 实现双向绑定控制显示状态。

```html
<ky-swipe-cell v-model:show="show">
  <ky-cell title="双向绑定"></ky-cell>
  <template #right>
    <ky-button type="primary">操作</ky-button>
  </template>
</ky-swipe-cell>
```

```javascript
const show = ref(true)
```

## 组件 API

### SwipeGroup Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| lock | 是否启用互斥模式（同一时间仅一个子 SwipeCell 处于打开状态） | boolean | - | false |
| moveEndClose | 滑动结束后是否自动关闭当前激活项 | boolean | - | false |

### SwipeCell Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| name | 单元格名称，用于互斥模式下的标识 | string | - | - |
| show | 是否显示左侧/右侧内容 | boolean | - | false |
| disabled | 是否禁用滑动 | boolean | - | false |
| beforeClose | 关闭前的拦截函数，返回 Promise 以阻止或继续关闭 | (args: { position: string }) => Promise\<boolean\> | - | - |

### SwipeCell Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ------ | ---- | ---- | ------ |
| open | 打开滑动单元格 | (position: 'left' \| 'right') | void |
| close | 关闭滑动单元格 | - | void |

### SwipeCell Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| open | 打开时触发 | { name: string, position: string } |
| close | 关闭时触发 | { name: string, position: string } |
| click | 点击时触发 | position: string |
| update:show | 显示状态变更时触发 | (value: boolean) |

### Slots

| 插槽名 | 说明 |
| ------ | ---- |
| default | 列表内容区域 |
| left | 左侧滑动内容区域 |
| right | 右侧滑动内容区域 |

## 常见问题

### Q1: 如何实现列表项互斥打开？

**使用 `lock` 属性：**

```html
<ky-swipe-group lock>
  <ky-swipe-cell name="item-1">
    <ky-cell title="列表项 1"></ky-cell>
    <template #right>
      <ky-button type="primary">操作</ky-button>
    </template>
  </ky-swipe-cell>
  <ky-swipe-cell name="item-2">
    <ky-cell title="列表项 2"></ky-cell>
    <template #right>
      <ky-button type="primary">操作</ky-button>
    </template>
  </ky-swipe-cell>
</ky-swipe-group>
```

### Q2: 如何在关闭前弹出确认框？

**使用 `before-close` 属性：**

```html
<ky-swipe-cell :before-close="handleBeforeClose">
  <ky-cell title="删除前确认"></ky-cell>
  <template #right>
    <ky-button type="danger">删除</ky-button>
  </template>
</ky-swipe-cell>
```

```javascript
const handleBeforeClose = ({ position }) => {
  return new Promise((resolve) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        resolve(res.confirm)
      },
    })
  })
}
```

### Q3: 如何手动控制滑动单元格的打开和关闭？

**通过 `ref` 调用方法：**

```html
<ky-swipe-cell ref="swipeRef">
  <ky-cell title="手动控制"></ky-cell>
  <template #right>
    <ky-button type="primary">操作</ky-button>
  </template>
</ky-swipe-cell>
```

```javascript
const swipeRef = ref(null)

swipeRef.value?.open('left')
swipeRef.value?.open('right')
swipeRef.value?.close()
```

### Q4: 如何禁用特定单元格的滑动功能？

**使用 `disabled` 属性：**

```html
<ky-swipe-cell disabled>
  <ky-cell title="禁用滑动"></ky-cell>
  <template #right>
    <ky-button type="primary">操作</ky-button>
  </template>
</ky-swipe-cell>
```

### Q5: 点击外部区域如何自动关闭？

**使用 `move-end-close` 属性：**

```html
<ky-swipe-group :move-end-close="true">
  <ky-swipe-cell name="item-1">
    <ky-cell title="点击外部自动关闭"></ky-cell>
    <template #right>
      <ky-button type="primary">操作</ky-button>
    </template>
  </ky-swipe-cell>
</ky-swipe-group>
```