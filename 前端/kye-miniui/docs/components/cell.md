# Cell

<code-preview path="demos/cell/cell-1.vue" title="基本使用" description="各种单元格用法示例"></code-preview>

## 基本使用

单元格组件用于展示列表数据，支持多种尺寸、类型和状态。

```html
<ky-cell title="标题" placeholder="描述" label="副标题描述" @click="onClick"></ky-cell>
<ky-cell title="标题" value="右侧内容" label="副标题描述"></ky-cell>
```

## 单元格尺寸

单元格支持 large 和 normal 两种尺寸，默认为 normal。

```html
<ky-cell title="标题" value="内容" label="副标题描述" size="large"></ky-cell>
<ky-cell title="标题" value="内容" label="副标题描述" size="normal"></ky-cell>
```

## 箭头链接

通过 is-link 属性显示右侧箭头，表示可点击跳转。

```html
<ky-cell title="点击跳转" value="查看详情" is-link></ky-cell>
<ky-cell title="必填项" value="请选择" is-link required></ky-cell>
```

## 必填标记

通过 required 属性显示必填标记，支持调整标记位置。

```html
<!-- 必填标记在右侧（默认） -->
<ky-cell title="标题" value="内容" required></ky-cell>

<!-- 必填标记在左侧 -->
<ky-cell title="标题" value="内容" required required-direction="left"></ky-cell>
```

## 错误状态

通过 is-error 属性标记错误状态。

```html
<ky-cell title="标题" value="错误内容" is-error></ky-cell>
<ky-cell title="标题" label="副标题描述" is-link required is-error>
  <template #value>
    <view style="color: #adb0b8; font-weight: normal">请选择</view>
  </template>
</ky-cell>
```

## 禁用状态

通过 disabled 属性禁用单元格。

```html
<ky-cell title="标题" value="内容" disabled></ky-cell>
<ky-cell title="标题" value="内容" disabled is-link></ky-cell>
```

## 内容对齐

通过 center 属性控制内容垂直居中，通过 desc-text-align 控制右侧内容对齐。

```html
<ky-cell title="标题" value="右侧内容" label="副标题描述"></ky-cell>
<ky-cell title="标题" value="左侧对齐" desc-text-align="left"></ky-cell>
```

## CellGroup 组合使用

CellGroup 用于将多个单元格组合在一起，支持统一的标题和圆角样式。

```html
<ky-cell-group title="group 标题" inset>
  <ky-cell title="Title" label="副标题描述" size="large" is-link required>
    <template #value>
      <view style="color: #adb0b8; font-weight: normal">请选择</view>
    </template>
  </ky-cell>
  <ky-cell
    title="Title"
    value="已输入内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容"
    label="副标题描述"
    size="large"
    is-link
    required
  ></ky-cell>
</ky-cell-group>
```

## 插槽使用

支持多个插槽自定义内容。

```html
<!-- 默认插槽 -->
<ky-cell>
  <view class="custom-content">自定义内容区域</view>
</ky-cell>

<!-- 自定义图标和标题 -->
<ky-cell is-link required>
  <template #icon>
    <img src="https://example.com/icon.png" style="width: 20px; height: 20px" />
  </template>
  <template #title>
    <view class="custom-title">
      <view>自定义title</view>
    </view>
  </template>
  <template #right-icon>
    <img src="https://example.com/right-icon.png" style="width: 20px; height: 20px" />
  </template>
</ky-cell>

<!-- 底部额外内容 -->
<ky-cell title="标题" value="内容">
  <template #extra><view>您的xxxxx告警提示，xxxxx提示内容.... </view></template>
</ky-cell>
```

## 圆角样式

通过 inset 属性开启圆角样式。

```html
<ky-cell title="标题" value="内容" inset></ky-cell>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| title | 单元格标题 | string | - | - |
| label | 副标题描述 | string | - | - |
| value | 右侧内容 | string | - | - |
| placeholder | 右侧占位文本 | string | - | - |
| icon | 左侧图标链接 | string | - | - |
| size | 单元格尺寸 | string | large / normal | normal |
| is-link | 是否显示右侧箭头 | boolean | - | false |
| required | 是否显示必填标记 | boolean | - | false |
| required-direction | 必填标记位置 | string | left / right | right |
| is-error | 是否显示错误状态 | boolean | - | false |
| inset | 是否开启圆角 | boolean | - | false |
| center | 是否垂直居中 | boolean | - | true |
| clickable | 是否时刻可点击 | boolean | - | false |
| disabled | 是否禁用 | boolean | - | false |
| desc-text-align | 右侧内容对齐方式 | string | left / right | right |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| click | 点击单元格时触发 | (event: Event) => void |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义单元格内容 |
| title | 自定义标题 |
| label | 自定义副标题 |
| icon | 自定义左侧图标 |
| value | 自定义右侧内容 |
| right-icon | 自定义右侧图标 |
| extra | 自定义底部额外内容 |