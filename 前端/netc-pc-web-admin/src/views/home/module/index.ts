import { ParentModuleCode } from '@/apis/home/types'
import { Component } from 'vue'
import BannerModule from './module-banner/index.vue' // Banner
import BindModule from './module-bind/index.vue' // 绑定编码
import SearchModule from './module-search/index.vue' // 运单查询
import WaybillModule from './module-waybill/index.vue' // 运单统计
import TodoModule from './module-todo/index.vue' // 待办事项
import AboutModule from './module-about/index.vue' // 关于跨越
import CounponModule from './module-coupon/index.vue' // 专属权益
import UsedModule from './module-used/index.vue' // 常用模块
import MessageModule from './module-message/index.vue' // 最新消息
import GreetingModule from './module-greeting/index.vue' // 问候卡片
import NewCustomerModule from './module-new-customer/index.vue' // 新客户卡片
import NewCustomerSearchModule from './module-new-customer-search/index.vue' // 新客户搜索
import HomeAboutModule from './module-home-about/index.vue' // 跨越品牌展示
import IndustryInfoModule from './module-industry-info/index.vue' // 行业解决方案
import NewCustomerCommonModule from './module-new-customer-common/index.vue' // 新客户推荐功能
import WhyChooseKyeModule from './module-why-choose-kye/index.vue' // 为什么选择跨越
import KyeOfficeModule from './module-kye-office/index.vue' // 跨越公众号
import PayForDesiptettimeModule from './module-pay-for-desiptettime/index.vue' // 预存运费
import RecommonCardModule from './module-recommon-card/index.vue' // 推荐配置
import MarketingCardModule from './module-marketing-card/index.vue' // 营销卡片

export interface ModuleInfo {
  component?: Component
}

export const modules: Record<ParentModuleCode, ModuleInfo> = {
  [ParentModuleCode.HOME_PAGE_BANNER]: {
    component: BannerModule,
  },
  [ParentModuleCode.HOME_PAGE_SEARCH_BAR]: {
    component: SearchModule,
  },
  [ParentModuleCode.HOME_PAGE_BIND_CODE]: {
    component: BindModule,
  },
  [ParentModuleCode.NEW_CUSTOMER_CARD]: {
    component: NewCustomerModule,
  },
  [ParentModuleCode.NEW_CUSTOMER_SEARCH]: {
    component: NewCustomerSearchModule,
  },
  [ParentModuleCode.HOME_PAGE_WAYBILL_STAT]: {
    component: WaybillModule,
  },
  [ParentModuleCode.HOME_PAGE_TODO_LIST]: {
    component: TodoModule,
  },
  [ParentModuleCode.HOME_PAGE_KYE_INFO]: {
    component: AboutModule,
  },
  [ParentModuleCode.HOME_PAGE_EXCLUSIVE_INTEREST]: {
    component: CounponModule,
  },
  [ParentModuleCode.PAY_FOR_DESIPTETTIME]: {
    component: PayForDesiptettimeModule,
  },
  [ParentModuleCode.RECOMMON_CARD]: {
    component: RecommonCardModule,
  },
  [ParentModuleCode.HOME_PAGE_ABOUT]: {
    component: HomeAboutModule,
  },
  [ParentModuleCode.INDUSTRY_INFO]: {
    component: IndustryInfoModule,
  },
  [ParentModuleCode.HOME_PAGE_COMMON_FUNCTION]: {
    component: UsedModule,
  },
  [ParentModuleCode.MARKETING_CARD]: {
    component: MarketingCardModule,
  },
  [ParentModuleCode.HOME_PAGE_LATEST_MESSAGE]: {
    component: MessageModule,
  },
  [ParentModuleCode.HOME_PAGE_GREETING]: {
    component: GreetingModule,
  },
  [ParentModuleCode.NEW_CUSTOMER_COMMON]: {
    component: NewCustomerCommonModule,
  },
  [ParentModuleCode.WHY_CHOOSE_KYE]: {
    component: WhyChooseKyeModule,
  },
  [ParentModuleCode.KYE_OFFICIAL_ACCOUNTS]: {
    component: KyeOfficeModule,
  },
}
