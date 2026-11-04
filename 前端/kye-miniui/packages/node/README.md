## 说明
原生组件动态引入taro插件

## 参数说明
| 参数         | 说明     | 类型       | 可选值                              | 默认值   |
|------------|--------|----------|----------------------------------|-------|
| components | 导入组件列表 | string[] | 'custom-input','custom-textarea' | []
| dest | 原生组件构建目录 | string | ''| 'dist/weapp/native-components'

## 使用
### 项目-原生组件引用

引入指定组件custom-input、custom-textarea
```html
// config/index.ts
plugins: [
 [
  '@kye-netc/kye-miniui-native-plugin',
  {
    components: ['custom-input', 'custom-textarea'],
  },
 ],
]
```
引入导出目录
```html
// config/index.ts
plugins: [
 [
  '@kye-netc/kye-miniui-native-plugin',
  {
    components: ['custom-input', 'custom-textarea'],
  },
  dest: 'dist/weapp/native'
 ],
]
```

