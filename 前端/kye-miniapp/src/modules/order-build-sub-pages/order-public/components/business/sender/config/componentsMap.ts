import { DefineComponent } from 'vue'
import Page from '@order-public-sub-public/components/business/sender/page/index.vue'
import Unfold from '@order-public-sub-public/components/business/sender/unfold/index.vue'

const componentsMap: Record<string, DefineComponent> = {
  page: Page as unknown as DefineComponent, // 跳转
  unfold: Unfold as unknown as DefineComponent, // 平铺
}

export default componentsMap
