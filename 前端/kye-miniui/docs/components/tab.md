# Tab

Tab 标签页组件，用于在不同内容区域之间进行切换。支持多种主题、徽标提示、下划线动画等功能。

## 基本使用

<video-preview path="demos/tab/tab-1.vue" title="Tab 组件演示" description="展示 Tab 组件的各种用法，包括等比排列、左对齐、徽标提示、胶囊主题、深色主题、动态标签等"></video-preview>

## 排列方式

支持等比排列和左对齐两种排列方式。

```html
<!-- 等比排列（默认） -->
<ky-tab :tabs="[{ label: '全部' }, { label: '待处理' }, { label: '已完成' }]" v-model="active" />

<!-- 左对齐 -->
<ky-tab
  :tabs="[{ label: '选项卡一' }, { label: '选项卡二' }, { label: '选项卡三' }]"
  v-model="active"
  :distribute-evenly="false"
/>
```

## 胶囊主题

胶囊风格展示，适合筛选场景。

```html
<ky-tab
  :tabs="[{ label: '选项卡一' }, { label: '选项卡二', badgeCount: 8 }, { label: '选项卡三' }]"
  v-model="active"
  theme="capsule"
  :distribute-evenly="false"
/>
```

## 徽标提示

支持数量徽标和红点提示，用于通知消息等场景。

```html
<!-- 数量徽标 -->
<ky-tab
  :tabs="[
    { label: '消息', badgeCount: 5 },
    { label: '通知', badgeCount: 12 },
    { label: '动态' }
  ]"
  v-model="active"
/>

<!-- 红点提示 -->
<ky-tab
  :tabs="[
    { label: '收件箱', showBadgeDot: true },
    { label: '已发送', showBadgeDot: true },
    { label: '草稿箱' }
  ]"
  v-model="active"
/>

<!-- 自定义最大展示数 -->
<ky-tab
  :tabs="[
    { label: '订单', badgeCount: 1234 },
    { label: '物流', badgeCount: 567 }
  ]"
  v-model="active"
  :max-badge-count="999"
/>
```

## 下划线动画

控制下划线动画效果，提升交互体验。

```html
<!-- 开启动画（默认） -->
<ky-tab :tabs="[{ label: '一' }, { label: '二' }, { label: '三' }]" v-model="active" />

<!-- 首次开启动画 -->
<ky-tab :tabs="[{ label: '一' }, { label: '二' }, { label: '三' }]" v-model="active" underline-first-animation />

<!-- 关闭动画 -->
<ky-tab :tabs="[{ label: '一' }, { label: '二' }, { label: '三' }]" v-model="active" :no-animation="true" />

<!-- 隐藏下划线 -->
<ky-tab :tabs="[{ label: '一' }, { label: '二' }, { label: '三' }]" v-model="active" :underline="false" />
```

## 深色主题

深色背景下的标签样式。

```html
<ky-tab :tabs="[{ label: '首页' }, { label: '发现' }, { label: '我的' }]" v-model="active" theme="dark" />
```

## 动态标签

当标签内容需要动态变化时，启用 `dynamic-tab` 属性避免动画抖动。

```html
<ky-tab
  :tabs="tabs"
  v-model="active"
  dynamic-tab
  :distribute-evenly="false"
/>
```

```javascript
const tabs = ref([
  { label: '标签一' },
  { label: '标签二' },
])

const addTab = () => {
  tabs.value.push({ label: `新标签${tabs.value.length + 1}` })
}
```

## 禁用点击

通过 `disable-tab-click` 属性禁用标签点击事件。

```html
<ky-tab
  :tabs="[{ label: '选项卡一' }, { label: '选项卡二' }]"
  v-model="active"
  disable-tab-click
/>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue | 当前激活的标签索引 | string \| number | - | -1 |
| tabs | 标签数据 | TabOptions[] | - | - |
| distributeEvenly | 标签等分显示 | boolean | - | true |
| underline | 是否展示下划线 | boolean | - | true |
| underlineFirstAnimation | 首次展示下划线是否开启动画 | boolean | - | false |
| maxBadgeCount | 徽标最大展示数 | number | - | 99 |
| theme | 主题风格 | 'default' \| 'capsule' \| 'dark' | default/capsule/dark | 'default' |
| noAnimation | 关闭下划线动画 | boolean | - | false |
| dynamicTab | 动态标签模式（禁用动画以避免抖动） | boolean | - | false |
| offsetLeft | 下划线左偏移（px） | number | - | 0 |
| sticky | 是否吸顶 | boolean | - | false |
| offsetTop | 吸顶偏移（px） | number | - | 0 |
| showScrollbar | 是否显示滚动条 | boolean | - | true |
| disableTabClick | 禁用标签点击 | boolean | - | false |

### TabOptions 类型

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| label | 标签文本内容 | string | - |
| badgeCount | 徽标数量 | number | - |
| showBadgeDot | 是否显示红点 | boolean | false |

### Methods 方法

| 方法名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| updateUnderline | 手动更新下划线位置 | `(activeIndex: string \| number)` | void |

### Events 事件

| 事件名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| update:modelValue | 选中项变更时触发 | `(value: string \| number)` | - |

### Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| label | 自定义标签文本 | `{ label: string }` |
| badge | 自定义徽标内容 | `{ label: number \| undefined }` |

## 常见问题

### Q1: 如何实现标签切换时的内容联动？

通过 `v-model` 绑定当前激活索引，配合条件渲染实现内容联动。

```html
<ky-tab :tabs="tabs" v-model="active" />

<view v-if="active === 0">内容一</view>
<view v-else-if="active === 1">内容二</view>
<view v-else>内容三</view>
```

### Q2: 动态修改标签数据时出现抖动？

启用 `dynamic-tab` 属性，并配合 `no-animation` 使用。

```html
<ky-tab
  :tabs="tabs"
  v-model="active"
  dynamic-tab
  :no-animation="true"
/>
```

### Q3: 如何自定义下划线样式？

通过 `offsetLeft` 属性调整下划线位置，下划线宽度固定为 20px。

```html
<ky-tab :tabs="tabs" v-model="active" :offset-left="10" />
```

### Q4: 胶囊主题下如何添加徽标？

胶囊主题同样支持 `badgeCount` 属性。

```html
<ky-tab
  :tabs="[
    { label: '全部' },
    { label: '待处理', badgeCount: 5 }
  ]"
  v-model="active"
  theme="capsule"
/>
```
