# Form

## 基本使用

```html
<template>
  <view class="demo-page">
    <!-- 基本用法 -->
    <view class="demo-section">
      <view class="demo-title">基础表单</view>
      <view class="demo-desc">支持必填、规则校验、异步校验</view>

      <ky-form ref="formRef" :model-value="formData">
        <ky-field
          label="手机号"
          prop="tels"
          v-model="formData.tels"
          placeholder="请输入手机号"
          :required="true"
          :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]"
        />

        <ky-field
          label="地址"
          prop="address"
          v-model="formData.address"
          placeholder="请输入地址"
          :required="true"
          :rules="[
            { required: true, message: '请输入地址' },
            { regex: /^(\d{1,2}|1\d{2}|200)$/, message: '0-200区间' },
          ]"
        />

        <ky-field
          label="姓名"
          prop="name"
          v-model="formData.name"
          placeholder="请输入姓名"
          :required="true"
          @blur="customBlurValidate('name')"
          :rules="[{ required: true, message: '请输入姓名' }, { validator: asyncValidator }]"
        />

        <ky-field
          labelPosition="left"
          :required="true"
          prop="sex"
          label="性别"
          :rules="[{ required: true, message: '请选择性别' }]"
          v-model="formData.sex"
          :labelWidth="100"
        >
          <template #input="{ isError }">
            <ky-radio-group
              v-model="formData.sex"
              :isError="isError"
              @change="customBlurValidate('sex')"
              direction="horizontal"
            >
              <ky-radio name="1">男</ky-radio>
              <ky-radio name="2">女</ky-radio>
            </ky-radio-group>
          </template>
        </ky-field>

        <ky-field
          labelPosition="left"
          :required="true"
          prop="hoppy"
          :rules="[{ validator: validHoppy }]"
          label="爱好(多选)"
          v-model="formData.hoppy"
          :labelWidth="100"
        >
          <template #input="{ isError }">
            <ky-checkbox-group
              :isError="isError"
              v-model="formData.hoppy"
              @change="customBlurValidate('hoppy')"
              direction="horizontal"
            >
              <ky-checkbox name="1" type="button">篮球</ky-checkbox>
              <ky-checkbox name="2" type="button">足球</ky-checkbox>
            </ky-checkbox-group>
          </template>
        </ky-field>

        <ky-field
          labelPosition="left"
          :required="true"
          prop="desc"
          :rules="[{ required: true, message: '请填写申请理由' }]"
          label="申请理由"
          v-model="formData.desc"
          :labelWidth="100"
        >
          <template #input="{ isError }">
            <ky-textarea
              :isError="isError"
              placeholder="请输入文本"
              v-model="formData.desc"
              @blur="customBlurValidate('desc')"
              :maxlength="150"
            >
            </ky-textarea>
          </template>
        </ky-field>

        <view class="form-actions">
          <ky-button type="primary" size="mini" @click="submit">提交</ky-button>
          <ky-button size="mini" @click="reset">重置</ky-button>
        </view>
      </ky-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  const formRef = ref(null)

  const formData = ref({
    name: '',
    tels: '',
    address: '',
    age: '',
    sex: '',
    hoppy: [],
    desc: '',
  })

  // 失去焦点校验,单独校验
  const customBlurValidate = (prop) => {
    formRef.value?.validate(prop).then(({ valid, errors }) => {
      if (valid) {
        console.log('success:', formData.value)
      } else {
        console.warn('error:', errors)
      }
    })
  }

  // 异步校验
  const asyncValidator = (val: string) => {
    return new Promise((resolve, reject) => {
      console.log('模拟异步验证中...')
      setTimeout(() => {
        if (val?.indexOf('毛泽东') > -1) {
          reject('存在敏感信息，请重填')
        } else {
          resolve('')
        }
      }, 100)
    })
  }

  const validHoppy = (val) => {
    return new Promise((resolve, reject) => {
      if (val.length === 0) {
        reject('请选择最少一个爱好')
      } else {
        resolve('')
      }
    })
  }
  const submit = () => {
    formRef.value?.validate().then(({ valid, errors }) => {
      if (valid) {
        console.log('success:', formData.value)
      } else {
        console.warn('error:', errors)
      }
    })
  }

  const reset = () => {
    formData.value = {
      name: '',
      tels: '',
      address: '',
      age: '',
      sex: '',
      hoppy: [],
      desc: '',
    }
    formRef.value?.reset()
  }
</script>

<style lang="scss">
  .demo-page {
    padding: 16px;
  }

  .demo-section {
    margin-bottom: 32px;
  }

  .demo-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .demo-desc {
    font-size: 24px;
    color: #999;
    margin-bottom: 12px;
  }

  .form-actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
  }
</style>
```

#### 单字段自定义校验触发

```ts
const customBlurValidate = (prop: string) => {
  formRef.value?.validate(prop).then(({ valid, errors }) => {
    if (valid) {
      console.log('success:', formData.value)
    } else {
      console.warn('error:', errors)
    }
  })
}
```

```html
<ky-field prop="name" @blur="customBlurValidate('name')" />
```

#### 重置与指定字段清理

```ts
// 重置整个表单
formRef.value?.reset()
// 重置指定字段错误
formRef.value?.reset('name')
```

## 组件 API

### Attributes 属性

| 参数       | 说明         | 类型    | 可选值 | 默认值 |
| ---------- | ------------ | ------- | ------ | ------ |
| modelValue | 表单数据对象 | object  | -      | {}     |
| rules      | 表单验证规则 | object  | -      | {}     |
| disabled   | 是否禁用表单 | boolean | -      | false  |

### Methods 方法

| 方法名   | 说明                             | 参数          | 返回值                                                    |
| -------- | -------------------------------- | ------------- | --------------------------------------------------------- |
| validate | 对表单进行校验（支持指定字段）   | prop?: string | `Promise<{ valid: boolean, errors: FormErrorMessage[] }>` |
| reset    | 重置表单（支持指定字段错误清理） | prop?: string | -                                                         |

### Events 事件

| 事件名   | 说明           | 参数                                 |
| -------- | -------------- | ------------------------------------ |
| validate | 表单校验时触发 | (errorMsg: FormErrorMessage) => void |

### Slots 插槽

| 插槽名  | 说明     |
| ------- | -------- |
| default | 表单内容 |

### 类型定义

```typescript
type FormErrorMessage = {
  prop: string
  message: string
}

type FormRule = {
  prop: string
  rules: FormItemRule[]
}

type FormRules = {
  [key: string]: FormItemRule[]
}
```
