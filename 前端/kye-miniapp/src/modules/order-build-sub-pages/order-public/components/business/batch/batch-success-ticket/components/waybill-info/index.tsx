import { defineComponent } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// import { OrderInfo } from '@order-public-sub-public/types'

import './index.scss'
export default defineComponent({
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <>
        <div class="batch-success-ticket__cardItem">
          <div class="cardItem__header">
            <div class="cardItem__header__from">
              <span>{props.data.waybillPickup.city}</span>
              <span>{props.data.waybillPickup.person}</span>
              <span class="text-ellipsis">{props.data.waybillPickup.companyName}</span>
            </div>
            <SvgIcon name="waybill-audit" class="icon cardItem__header__icon" />
            <div class="cardItem__header__to">
              <span>{props.data.waybillDelivery.city}</span>
              <span>{props.data.waybillDelivery.person}</span>
              <span class="text-ellipsis">{props.data.waybillDelivery.companyName}</span>
            </div>
          </div>
          <div class="cardItem__footer">
            <span class="footer_left">托寄物：</span>
            <span class="footer_right">
              <span class="text-ellipsis">{props.data.goodsType}</span>
              <span>/{props.data.actualWeight}</span>
              <span>/{props.data.count}</span>
            </span>
          </div>
        </div>
      </>
    )
  },
})
