## Input Props

| 参数          | 说明             | 类型    | 默认值                 |
| ------------- | ---------------- | ------- | ---------------------- |
| title         |                  | String  | ''                     |
| noPadding     | 是否需要内边距   | boolean  | false                    |
| required      | 是否必填         | boolean | false                  |
| showBorder    | 是否显示边框     | boolean | false                  |
| clearable     | 是否展示清除     | boolean | false                  |
| labelAlign    | 文本位置         | String  | 'top' 'center' 'right' |
| placeholder   | 提示文案         | String  | ''                     |
| showWordLimit | 是否显示统计计数 | boolean | false                  |

以上是自定义配置参数，其他参数可参考 vant 文档，会透传下去

## slot

支持 vant 的所有插槽

## example

### input 使用

```javascript

  <KyInput :showBorder="true" v-model="value" clearable placeholder="请填写名称" />
  <KyInput label="手机号1" placeholder="请填写" v-model="value2" clearable show-word-limit maxlength="50" />
  <KyInput label="手机号2" label-align="top" placeholder="请填写" v-model="value2" clearable :maxlength="50">
    <template #button>
      <span>111右侧内容</span>
    </template>
  </KyInput>

```

### 文本域使用

```javascript

 <KyInput.TextArea
    v-model="message"
    :show-word-limit="true"
    placeholder="请输入备注内容"
    rows="5"
    :maxlength="150"
    clearable
  />

```

cell不要点击反馈
input 要边框
