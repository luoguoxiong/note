<template>
  <div class="waybill-approval-box">
    <div
      id="waybill-approval"
      @click="
        linkToAppproval({
          pageTab: '104',
          activeTab: '20',
          id: `${data.id}`,
          operateType: '3',
          url: data.detailsUrl,
        })
      "
    >
      <div class="title">
        <span class="title-text">
          <span>运单号：</span>
          <span class="color-gray" @click.stop="copyText(data.waybillNumber)">{{ data.waybillNumber }}</span>
          <img
            @click.stop="copyText(data.waybillNumber)"
            class="copy-img"
            src="https://ic-img.ky-express.com/netc/20240515_80270395142_!!1715763805847_27_27.png"
            alt=""
          />
        </span>

        <span class="over-time" v-show="data.goodTime && isCanShow"
          >{{ formateTime }}
          <span class="small-over-time">后自动拒绝</span>
        </span>
      </div>
      <!-- 路线区和底部操作区共用一个布局容器，避免分别绝对定位后跨过背景图虚线。 -->
      <div class="approval-content">
        <div class="route-summary">
          <div class="content-side">
            <div class="city">{{ data.sendCity }}</div>
            <div class="username">{{ data.sendName }}</div>
            <div class="company">{{ data.sendCustomer }}</div>
          </div>
          <div class="content-center">
            <img src="https://ic-img.ky-express.com/netc/20240430_14170395116_!!1714449505293_140_7.png" alt="" />
            <div class="waybill-type">{{ data.serviceMode }}</div>
          </div>
          <div class="content-side text-right">
            <div class="city">{{ data.receiveCity }}</div>
            <div class="username">{{ data.receiveName }}</div>
            <div class="company">{{ data.receiveCustomer }}</div>
          </div>
        </div>

        <div class="approval-footer">
          <div class="waybill-info">
            <div class="waybill-info-item">
              <div class="label">货好时间</div>
              <div class="desc">
                {{ (data.goodTime && dayjs(Number(data.goodTime)).format('YYYY/MM/DD HH:mm')) || '--' }}
              </div>
            </div>
            <div class="waybill-info-item" v-show="data.disPlayForecastCost">
              <div class="label">预估费用</div>
              <div class="desc">
                <LoadPay v-if="data.disPlayForecastCost" :bacho="data.waybillNumber"></LoadPay>
              </div>
            </div>
            <div class="waybill-info-item">
              <div class="label">下单人</div>
              <div class="desc">
                {{ data.placeOrderName }} {{ data.placeOrderName && data.placeOrderPhone && '/' }}
                {{ data.placeOrderPhone }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="apply-btn">
      <KButton
        type="default"
        id="home-btn"
        style="width: 76px"
        @click.stop="
          linkToAppproval({
            pageTab: '104',
            activeTab: '20',
            id: `${data.id}`,
            operateType: '2',
            url: data.rejectUrl,
          })
        "
        >拒绝</KButton
      >
      <KButton
        type="primary"
        id="home-btn"
        :style="{
          width: '76px',
        }"
        @click.stop="
          linkToAppproval({
            pageTab: '104',
            activeTab: '20',
            id: `${data.id}`,
            operateType: '1',
            url: data.agreeUrl,
          })
        "
        >同意</KButton
      >
    </div>
  </div>
</template>
<script lang="ts" setup>
import { KButton } from '@netc-design-pc/ui'
import { WayBillApprovalListVO } from '@/apis/home/types'
import { useCopyText, useLinkTo, useCountDownEndIsNow } from '@/hooks'
import LoadPay from '../load-pay/index.vue'
import { watch } from 'vue'
import dayjs from 'dayjs'
interface WaybillApprovalProps {
  data: WayBillApprovalListVO
}

const props = defineProps<WaybillApprovalProps>()

const { copyText } = useCopyText()

const { linkToAppproval } = useLinkTo()
const { startCountDown, formateTime, isCanShow } = useCountDownEndIsNow()

watch(
  [props.data.goodTime],
  () => {
    if (props.data.goodTime) {
      startCountDown(Number(props.data.goodTime))
    }
  },
  {
    immediate: true,
  }
)
</script>
<style lang="scss" scoped>
.waybill-approval-box {
  position: relative;
  height: 254px;
}
#waybill-approval {
  position: relative;
  width: 100%;
  height: 254px;
  padding: 16px;
  cursor: pointer;
  box-sizing: border-box;
}
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  font-size: 13px;
  color: #686b75;
  .title-text {
    display: flex;
    align-items: center;
    height: 20px;
  }
  img {
    width: 18px;
    height: 18px;
  }
}
.color-gray {
  margin: 0 8px 0 0;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: #24262b;
  cursor: pointer;
}
.copy-img {
  cursor: pointer;
}
.over-time {
  font-weight: 600;
  font-size: 12px;
  color: #f73f31;
}
.small-over-time {
  font-weight: 400;
  font-size: 12px;
}
.approval-content {
  position: absolute;
  // top: 63px;
  right: 40px;
  bottom: 28px;
  left: 40px;
  display: flex;
  flex-direction: column;
}
.route-summary {
  display: grid;
  // align-items: center;
  justify-content: space-between;
  height: 70px;
  grid-template-columns: minmax(0, 1fr) 140px minmax(0, 1fr);
  flex: 0 0 70px;
}
.city {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: #24262b;
}
.username {
  margin: 4px 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: #8c8f99;
}
.company {
  overflow: hidden;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(---CG-Grey-07, rgba(140, 143, 153, 1));
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text-right {
  text-align: right;
}
.content-side {
  min-width: 0;
}
.content-center {
  img {
    width: 140px;
    margin-top: 7px;
  }
  .waybill-type {
    margin-top: 8px;
    font-size: 13px;
    line-height: 20px;
    text-align: center;
    color: #24262b;
  }
}
.approval-footer {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding-top: 30px;
  gap: 12px;
  box-sizing: border-box;
  flex: 1;
}
.waybill-info {
  width: 322px;
}
.waybill-info-item {
  display: grid;
  height: 18px;
  margin-bottom: 4px;
  gap: 8px;
  grid-template-columns: 62px minmax(0, 1fr);
  .label {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #8c8f99;
  }
  .desc {
    display: flex;
    align-items: center;
    overflow: hidden;
    min-width: 0;
    height: 18px;
    font-size: 12px;
    white-space: nowrap;
  }
}
.waybill-info-item:last-child {
  margin-bottom: 0;
}
.apply-btn {
  position: absolute;
  right: 40px;
  bottom: 26px;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  width: 164px;
  height: 32px;
}
</style>
