# ActionSheet

<code-preview path="demos/action-sheet/action-sheet-1.vue" title="基本使用" description="底部弹出的动作菜单面板"></code-preview>

## 基本使用

通过 `v-model:show` 控制显示状态，`menu-items` 设置选项列表。

```html
<ky-action-sheet
  v-model:show="show"
  :menu-items="menuItems"
  @choose="onChoose"
  @cancel="onCancel"
></ky-action-sheet>
<ky-button type="primary" @click="show = true">显示面板</ky-button>
```

```javascript
const show = ref(false)
const menuItems = [
  { name: '操作一' },
  { name: '操作二' },
  { name: '操作三' },
]

const onChoose = (item) => {
  console.log('选择:', item.name)
}

const onCancel = () => {
  console.log('取消')
}
```

## 选项状态

支持设置选项的禁用和高亮状态。

```html
<ky-action-sheet v-model:show="show" :menu-items="menuItems" @choose="onChoose"></ky-action-sheet>
```

```javascript
const menuItems = [
  { name: '正常选项' },
  { name: '禁用选项', disable: true },
  { name: '高亮选项', color: '#FF706D' },
]
```

## 自定义信息

通过设置标题、描述信息和取消按钮文字，可以自定义 ActionSheet 的展示内容。

```html
<ky-action-sheet
  v-model:show="show"
  title="操作提示"
  description="请选择您要执行的操作"
  cancel-txt="取消操作"
  :menu-items="menuItems"
  @choose="onChoose"
></ky-action-sheet>
```

## 自定义内容

通过默认插槽可以自定义整个 ActionSheet 的内容。

```html
<ky-action-sheet
  v-model:show="show"
  title="自定义内容"
  @cancel="show = false"
>
  <view class="custom-content">
    <view class="custom-item">自定义列表项一</view>
    <view class="custom-item">自定义列表项二</view>
    <view class="custom-item">自定义列表项三</view>
  </view>
</ky-action-sheet>
```

## 自定义选项

通过 item 插槽可以自定义每个选项的内容。

```html
<ky-action-sheet
  v-model:show="show"
  :menu-items="menuItems"
  @choose="onChoose"
>
  <template #item="{ item, index }">
    <view class="custom-item">
      <text>{{ index + 1 }}.</text>
      <text>{{ item.name }}</text>
    </view>
  </template>
</ky-action-sheet>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| show | 是否显示动作面板 | boolean | - | false |
| zIndex | 面板层级 | number | - | - |
| closeOnClickOverlay | 点击遮罩是否关闭面板 | boolean | - | true |
| safeAreaInsetBottom | 是否开启底部安全区适配 | boolean | - | false |
| menuItems | 面板选项列表 | MenuItems[] | - | [] |
| title | 面板标题 | string | - | - |
| description | 面板描述信息 | string | - | - |
| cancelTxt | 取消按钮文字 | string | - | '取消' |
| optionTag | 设置列表项标题展示使用参数 | string | - | 'name' |
| optionSubTag | 设置列表项二级标题展示使用参数 | string | - | 'subName' |
| round | 是否显示圆角 | boolean | - | true |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| open | 面板打开时触发 | value: boolean |
| cancel | 点击取消按钮时触发 | - |
| choose | 选中选项时触发 | item: MenuItems, index: number |
| close | 面板关闭时触发 | event: Event |
| update:show | 更新面板显示状态 | value: boolean |

### Slots

| 名称 | 说明 |
| ---- | ---- |
| default | 自定义面板内容 |
| item | 自定义选项内容，参数为 `{ item, index }` |