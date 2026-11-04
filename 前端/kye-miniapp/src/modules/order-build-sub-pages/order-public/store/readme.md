# 下单配置 store (Pinia 实现)

[详细在线文档](https://doc.ky-tech.com.cn/docs/ff749f108ace4affbb0b9918f85fe73a)

暂划分为四个 module，分别是 schema、order、globalData、S_EXTEND。后续根据实际的使用情况再去查漏补缺。

```js
import { useOrderPublicStore } from './pinia'

const store = useOrderPublicStore()
```

## 规范

### actions

驼峰命名：`getUserInfo`

### getters

驼峰命名：`getUserInfo`

## schema

存储接口下发的 JSON schema

### state

```js
// pinia.ts
export const useOrderPublicStore = defineStore('orderPublic', {
  state: () => ({
    config: {
      schema: {
        layout: [], // 布局
        module: {}, // 组件配置
        config: {}, // 全局预配置
        data: {}, //后端数据
      },
  },
}
```

### getters

```js
const getters = {
  // schema
  config: (state) => state.config.schema,
  // module配置项
  moduleConfig: (state) => state.config.schema.module,
  // 预配置，包括业务配置、功能配置、活动入口配置、退出入口配置
  presetConfig: (state) => state.config.schema.config,
  // 后端写入的数据
  backendData: (state) => state.config.schema.data,
}

export default getters
```

### mutations

```js
export default {
  // 更新下单配置数据
  UPDATE_CONFIG(state, obj) {
    state.config = Object.assign({}, state.config, obj)
  },
}
```

## order

专门用于表单提交，具体数据结构和后端确认后同步给对应组件前端。后续开发可在此新增其他表单，目前为空。

### state

### getters

### mutations

## globalData

存储后端返回的各种数据

### state

### getters

### mutations

## S_EXTEND

用于拓展，例如其他状态的存储，xxxVisible,xxxLoading 与业务无关的 state

### state

```js

//state.js
{
  ui:{
    componentALoading:false,
    componentBVisible:false,
  }
}
```
