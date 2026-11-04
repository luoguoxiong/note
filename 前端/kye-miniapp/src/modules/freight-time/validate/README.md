# 运费时效气泡 基于下单的简易版气泡

## 组件使用

### 显示气泡

```javascript
updateValidateKey({
  key: 'productInfo.goodsType',
  content: '请输入商品名称',
  bubbleConfig: {
    offset: [0, 2],
    placement: 'top-start',
    theme: 'dark',
  },
  showType: 1,
  passed: false,
})
```

### 关闭气泡

```javascript
removeValidateKey('productInfo.goodsType')
```
