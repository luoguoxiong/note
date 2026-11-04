# 运单号

- 引入运单号组件

  ```vue
  import WaybillNumber from '@order-public-sub-public/components/base/ky-waybill-number/index.vue'
  ```

- 将组件放自己组件 同级 或 包裹在外层容器内
  - 如果放容器内部，外层类 “order-customer” 不要加 position relative 属性，只需要加 margin-top: 58px

        ```vue
        <template>
          <div class="order-customer" @click="onClickHandel">
            <WaybillNumber />
            ...
          </div>
        </template>

        <style lang="scss" scoped>

    @import '@order-global-package-order-sub/styles/index.scss';
    .order-customer {
    margin-top: 58px;
    }
    </style>
    ```

  - 如果放平级只需要加 margin-top: 58px

        ```vue
        <template>
          <WaybillNumber />
          ...
        </template>

        <style lang="scss" scoped>

    @import '@order-global-package-order-sub/styles/index.scss';
    .order-customer {
    margin-top: 58px;
    }
    </style>
    ```

  - 显示类型
    - 在下单公司中显示条件:
