// import Block from './container.vue'
import Banner from '@order-public-sub-public/components/business/banner/index.vue'
import Sender from '@order-public-sub-public/components/business/sender/index.vue'
import Receive from '@order-public-sub-public/components/business/receive/index.vue'
import ServiceMode from '@order-public-sub-public/components/business/service-model/index.vue'
import ArrivalTime from '@order-public-sub-public/components/business/service-model/components/arrival-time/index.vue'
import DispatchInformation from '@order-public-sub-public/components/business/dispatch-information/index.vue'
import PickupInformation from '@order-public-sub-public/components/business/pickup-information/index.vue'
import ProductInfo from '@order-public-sub-public/components/business/product-info/index.vue'
import PayMode from '@order-public-sub-public/components/business/pay-mode/index.vue'
import WaybillRemark from '@order-public-sub-public/components/business/waybill-remark/index.vue'
import MessageToDriver from '@order-public-sub-public/components/business/message-to-driver/index.vue'
import OverAreaDelivery from '@order-public-sub-public/components/business/over-area-delivery/index.vue'
import BranchSelfPickUp from '@order-public-sub-public/components/business/branch-self-pickup/index.vue'
import OrderCustomer from '@order-public-sub-public/components/business/order-customer/index.vue'
import PickupMode from '@order-public-sub-public/components/business/pickup-mode/index.vue'
import GoodsTime from '@order-public-sub-public/components/business/goods-time/index.vue'
import KaCustomerMap from '@order-public-sub-public/components/business/ka-customer-map/index.vue'
import NoticeBar from '@order-public-sub-public/components/business/notice-bar/index.vue'
import WaybillNumber from '@order-public-sub-public/components/business/waybill-number/index.vue'
import SelfSign from '@order-public-sub-public/components/business/self-sign/index.vue'
import Coupon from '@order-public-sub-public/components/business/coupon/index.vue'
import AddedService from '@order-public-sub-public/components/business/added-service/index.vue'
import ProtectPrice from '@order-public-sub-public/components/business/protect-price/index.vue'
// import BatchOrderCustomer from '@order-public-sub-public/components/business/batch/batch-order-customer/index.vue'
// import BatchSection from '@order-public-sub-public/components/business/batch/batch-section/index.vue'
// import SendInfoStand from '@order-public-sub-public/components/business/batch/send-info-stand/index.vue'
// import BatchWaybillList from '@order-public-sub-public/components/business/batch/batch-waybill-list/index.vue'
// import BatchAddReceive from '@order-public-sub-public/components/business/batch/batch-add-receive/index.vue'
// import BatchWaybillReceive from '@order-public-sub-public/components/business/batch/batch-waybill-receive/index.vue'
import ReturnWaybill from '@order-public-sub-public/components/business/return-waybill/index.vue'
import ReturnWaybillAddress from '@order-public-sub-public/components/business/return-waybill-address/index.vue'
import AutoSync from '@order-public-sub-public/components/business/auto-sync/index.vue'
import WaybillSpecialEncrypt from '@order-public-sub-public/components/business/waybill-special-encrypt/index.vue'
import TemplateList from '@order-public-sub-public/components/business/template-list/index.vue'
import MoreModule from '@order-public-sub-public/components/business/more-module/index.vue'

// import Banner from './blockTpl.vue'
// import Sender from './blockTpl.vue'
// import Receive from './blockTpl.vue'
// import ServiceMode from './blockTpl.vue'
// import ArrivalTime from './blockTpl.vue'
// import DispatchInformation from './blockTpl.vue'
// import PickupInformation from './blockTpl.vue'
// import ProductInfo from './blockTpl.vue'
// import PayMode from './blockTpl.vue'
// import WaybillRemark from './blockTpl.vue'
// import MessageToDriver from './blockTpl.vue'
// import OverAreaDelivery from './blockTpl.vue'
// import BranchSelfPickUp from './blockTpl.vue'
// import OrderCustomer from './blockTpl.vue'
// import PickupMode from './blockTpl.vue'
// import GoodsTime from './blockTpl.vue'
// import KaCustomerMap from './blockTpl.vue'
// import NoticeBar from './blockTpl.vue'
// import WaybillNumber from './blockTpl.vue'
// import SelfSign from './blockTpl.vue'
// import Coupon from './blockTpl.vue'
// import AddedService from './blockTpl.vue'
// import ProtectPrice from './blockTpl.vue'
import BatchOrderCustomer from './blockTpl.vue'
import BatchSection from './blockTpl.vue'
import SendInfoStand from './blockTpl.vue'
import BatchWaybillList from './blockTpl.vue'
import BatchAddReceive from './blockTpl.vue'
import BatchWaybillReceive from './blockTpl.vue'
// import ReturnWaybill from './blockTpl.vue' // 先不做
// import ReturnWaybillAddress from './blockTpl.vue'
// import AutoSync from './blockTpl.vue'
// import WaybillSpecialEncrypt from './blockTpl.vue'
// import TemplateList from './blockTpl.vue'
// import MoreModule from './blockTpl.vue'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants/global'
import { Module, SchemaLayout } from '@order-public-sub-public/types'
import { markRaw } from 'vue'
import { DefinedComponent } from '@vue/test-utils/dist/types'
import { findModule, getLayoutChildren, getLayoutVisible, getModuleVisible, renderModule } from '../utils'
import { EXCLUDE_MODULES } from '@order-public-sub-public/configs/modules'
import { useSchemaContext } from '../hooks/useContext'
import { comRenderList } from '@order-public-sub-public/hooks/useDoms'
import { expandFlag } from '@order-public-sub-public/components/business/more-module/hooks/useState'

// 组件映射关系表，key需要跟Schema定义的type一致
export const componentsMap: any = markRaw({
  Block: 'Block',
  Row: 'Block',
  Banner,
  Sender,
  Receive,
  ProductInfo,
  WaybillRemark,
  MessageToDriver,
  OrderCustomer,
  NoticeBar,
  WaybillNumber,
  SelfSign,
  PayMode,
  PickupMode,
  GoodsTime,
  KaCustomerMap,
  OverAreaDelivery,
  ServiceMode,
  Coupon,
  AddedService,
  BranchSelfPickUp,
  ProtectPrice,
  DispatchInformation,
  PickupInformation,
  ArrivalTime,
  BatchOrderCustomer,
  BatchSection,
  SendInfoStand,
  BatchWaybillList,
  BatchAddReceive,
  BatchWaybillReceive,
  ReturnWaybill,
  ReturnWaybillAddress,
  AutoSync,
  WaybillSpecialEncrypt,
  TemplateList,
  MoreModule,
})

export const getComponentByKey = (key: ModuleType) => {
  if (key in componentsMap) {
    return componentsMap[key]
  } else {
    console.warn(`${key} not found`)
    return null
  }
}

/**
 * 渲染业务组件
 * @param Component
 * @param layout
 * @param moduleId
 */
export const renderBusinessComponent = (params: {
  Component: DefinedComponent
  layout: SchemaLayout
  targtModule: Module | null
  type: string
  index: number
}) => {
  const { Component, layout, targtModule, type } = params

  const visible = getModuleVisible(targtModule as Module)
  if (type && targtModule && !targtModule?.type) {
    targtModule.type = type
  }
  // 如果找不到module则不渲染
  if (!targtModule || !targtModule?.type) {
    return null
  }

  if (!targtModule) {
    return null
  }

  // 如果不在例外module里面且module visible为false则不渲染
  if (!EXCLUDE_MODULES.includes(type) && !visible) {
    return null
  }
  comRenderList.value.push(type)
  return renderModule(Component, layout, targtModule, params.index)
}

// const className = {
//   [ModuleType.Block]: 'block',
//   [ModuleType.Row]: 'row',
// }

export const renderBlock = (props: {
  type: ModuleType.Block | ModuleType.Row
  layout: SchemaLayout[]
  orderPageType: OrderPageType
}) => {
  const { layout, orderPageType } = props

  // #452038 该区域被overflow限制住了，显示不了上圆角
  let blockClassList = 'block'
  // 是否第一个填单区域
  const isFirstBlock = layout.find((item) =>
    [ModuleType.服务方式, ModuleType.货物信息, ModuleType.货好时间, ModuleType.付款方式].includes(
      item.moduleId as ModuleType,
    ),
  )
  if (isFirstBlock && orderPageType === OrderPageType.批量寄单票) {
    blockClassList += ' order-batch-waybill'
  }
  // 追加自定义class
  const firstLayoutItem = Array.isArray(layout) ? layout?.[0] : {}
  if (firstLayoutItem?.wrapClass) {
    blockClassList += ` ${firstLayoutItem.wrapClass}`
  }

  return (
    <div
      class={[
        blockClassList,
        expandFlag.value && blockClassList.includes('template-nused') ? 'template-nused-expand' : null,
      ]}
    >
      <div class="row">
        {layout.map((item, index) => {
          return renderComponent(item, orderPageType, index)
        })}
      </div>
    </div>
  )
}

/**
 * 渲染器主入口
 * @param layout SchemaLayout
 */
export const renderComponent = (layout: SchemaLayout, orderPageType: OrderPageType, index) => {
  const { moduleId } = layout
  let type = layout.type
  const layoutVisible = getLayoutVisible(layout)
  const children = getLayoutChildren(layout)
  let targtModule
  if (!moduleId && !layoutVisible) return null
  const { schema } = useSchemaContext()
  const { module: allModule } = schema.value
  if (moduleId) {
    targtModule = findModule(allModule, moduleId)
  }
  if (!type && moduleId) {
    // targtModule?.type && (type = moduleId)
    type = moduleId
  }
  const Component = getComponentByKey(type as ModuleType)
  if (Component) {
    if (moduleId) {
      // 业务组件渲染
      return renderBusinessComponent({ Component, layout, targtModule: targtModule as Module, type: moduleId, index })
      // return (
      //   <div class="moduleId">
      //     {moduleId}2222
      //   </div>
      // )
    } else if (children?.length) {
      // 容器组件渲染
      return (
        type === ModuleType.Block && (
          <> {renderBlock({ type: type as ModuleType.Block | ModuleType.Row, layout: children, orderPageType })}</>
        )
      )
    }
  }
}

export default componentsMap
