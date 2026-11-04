## 1. 代码修改

- [x] 1.1 读取取消运单页面（`src/modules/kye-miniapp-waybill/src/pages/waybill-cancel/index.vue`）的当前实现
- [x] 1.2 读取查件列表的跳转逻辑参考（`src/public/components/business/waybill-card/index.vue` 的 `openEdit` 函数）
- [x] 1.3 修改取消运单页面的 `toEdit` 函数，使其与查件列表的跳转逻辑一致（仅 type_40 场景）
- [x] 1.4 确保带上正确的参数：`openGoodsTime=1` 和 `onlyModule=goodsTime,serviceMode`

## 2. 验证测试

- [x] 2.1 检查修改后的代码语法正确性
- [x] 2.2 确认所有必要参数都能从取消运单页面的数据中获取
- [ ] 2.3 在开发环境中测试跳转功能是否正常工作
- [ ] 2.4 验证跳转后修改运单页面是否正确接收并处理参数
