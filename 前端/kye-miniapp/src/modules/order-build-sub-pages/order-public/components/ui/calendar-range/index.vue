<!-- eslint-disable vue/no-deprecated-dollar-listeners-api -->
<template>
  <van-popup
    class="netc-calendar-range"
    v-bind="$attrs"
    v-on="$listeners"
    safe-area-inset-bottom
    position="bottom"
    :style="{ height: '75%' }"
    @open="onOpen"
  >
    <div class="calendar">
      <div class="filter-three">
        <div class="header">
          <div class="filter-three__header">
            <van-field v-model="startDate" readonly placeholder="开始日期" />
            <div class="tip">-</div>
            <van-field v-model="endDate" readonly placeholder="结束日期" />
          </div>
          <div v-if="showDateRangeBtns" class="filter-three__range">
            <div
              v-for="(item, index) in dateRangeBtns"
              :key="item.value"
              :class="[
                'filter-three__range-item',
                {
                  cur: curDateRangeBtnIndex === index,
                },
              ]"
              @click="
                (e) => {
                  onRangeBtnClick(e, index)
                }
              "
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="filter-three__body">
          <van-calendar
            v-bind="$attrs"
            v-on="$listeners"
            type="range"
            row-height="14.28571vw"
            color="#8365F6"
            allow-same-day
            :lazy-render="false"
            ref="calendarRef"
            :poppable="false"
            :show-title="false"
            :show-subtitle="false"
            :formatter="formatter"
            @select="onSelect"
          >
            <template v-slot:footer>
              <slot name="footer"></slot>
              <van-button block type="primary" class="confirm-btn" @click="onConfirm" :disabled="submitDisabled"
                >确定</van-button
              >
            </template>
          </van-calendar>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import dayjs from 'dayjs'

const DATE_FORMAT = 'YYYY/MM/DD'

export default {
  name: 'netc-calendar-range',
  props: {
    defaultDate: {
      type: Array,
      default: () => null,
    },
    recentDays: {
      type: Number,
      default: 0,
    },
    showDateRangeBtns: {
      type: Boolean,
      default: false,
    },
    dateRangeBtns: {
      type: Array,
      default: () => [
        {
          label: '近7天',
          value: 7,
          unit: 'day',
        },
        {
          label: '近30天',
          value: 30,
          unit: 'day',
        },
        {
          label: '近60天',
          value: 60,
          unit: 'day',
        },
      ],
    },
  },
  data() {
    return {
      startDate: '', // 开始日期
      endDate: '', // 结束日期
      curDateRangeBtnIndex: -1,
    }
  },
  watch: {
    // 初始化选中哪个日期区间，7/30/60
    recentDays: {
      handler(newVal) {
        const index = this.dateRangeBtns.findIndex((item) => item.value === newVal)
        if (index !== -1) {
          this.curDateRangeBtnIndex = index
        }
      },
      immediate: true,
    },
  },
  computed: {
    submitDisabled() {
      return !this.startDate || !this.endDate
    },
  },
  methods: {
    onConfirm() {
      this.$refs.calendarRef.onConfirm()
    },
    onSelect(date) {
      const [startDate, endDate] = date
      if (startDate) {
        this.startDate = dayjs(startDate).format(DATE_FORMAT)
        this.endDate = ''
      }
      if (endDate) {
        this.endDate = dayjs(endDate).format(DATE_FORMAT)
      }
      this.curDateRangeBtnIndex = -1
    },
    /** 重置日期 */
    onOpen() {
      this.$nextTick(() => {
        this.$refs.calendarRef.reset(this.defaultDate)
        if (this.defaultDate) {
          const [startDate, endDate] = this.defaultDate
          this.startDate = dayjs(startDate).format(DATE_FORMAT)
          this.endDate = dayjs(endDate).format(DATE_FORMAT)
        } else {
          this.startDate = ''
          this.endDate = ''
          this.$refs.calendarRef.scrollToDate(dayjs().toDate())
        }
        this.setCurDateRangeBtnIndex()
      })
    },
    setCurDateRangeBtnIndex() {
      const count = dayjs(this.endDate).diff(dayjs(this.startDate), 'day')
      if (count === 59) {
        this.curDateRangeBtnIndex = 2
      } else if (count === 29) {
        this.curDateRangeBtnIndex = 1
      } else if (count === 6) {
        this.curDateRangeBtnIndex = 0
      } else {
        this.curDateRangeBtnIndex = -1
      }
    },
    /** 格式化日期文案 */
    formatter(day) {
      const year = day.date.getFullYear()
      const month = day.date.getMonth() + 1
      const date = day.date.getDate()
      if (year === dayjs().year() && month === dayjs().month() + 1) {
        if (!['start', 'end', 'start-end'].includes(day.type) && date === dayjs().date()) {
          day.topInfo = '今天'
        }
      }
      return day
    },
    onRangeBtnClick(e, index) {
      this.curDateRangeBtnIndex = index
      const config = this.dateRangeBtns[index]
      const num = config.unit === 'day' ? config.value - 1 : config.value
      const startDate = dayjs().add(-num, config.unit || 'day')
      const endDate = dayjs()
      this.startDate = startDate.format(DATE_FORMAT)
      this.endDate = endDate.format(DATE_FORMAT)
      this.$refs.calendarRef.reset([startDate.toDate(), endDate.toDate()])
      this.$refs.calendarRef.scrollToDate(startDate.toDate())
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
.netc-calendar-range {
  border-radius: 24px 24px 0px 0px;
  .calendar {
    height: 100%;
    .filter-three {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      .header {
        margin: 0 0 32px;
        .tip {
          color: #333;
        }
      }
      &__header {
        height: 96px;
        display: flex;
        align-items: center;
        font-size: 32px;
        line-height: 32px;
        font-size: 32px;

        ::v-deep .van-cell {
          width: 230px;
          padding: 0;
          &::after {
            border-bottom-width: 0;
          }
        }
        ::v-deep .van-field__control {
          font-size: 32px;
          color: #333;
          text-align: center;
          font-weight: 600;
          &::-webkit-input-placeholder {
            color: #888ea6;
            font-weight: normal;
          }
        }
      }
      &__range {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        padding: 20px 32px;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
        &-item {
          flex: 1;
          //width: 214px;
          height: 60px;
          margin-right: 20px;
          line-height: 60px;
          background: #f7f8fa;
          border-radius: 10px;
          color: #03050d;
          font-size: 24px;
          text-align: center;
          overflow: hidden;
          background-clip: border-box;
          &:last-child {
            margin-right: 0;
          }
          &.cur {
            background-color: #f5f3ff;
            position: relative;
            color: #8365f6;
            &::after {
              content: '';
              background: url('https://ic-img.ky-express.com/netc/20250710_27596_!!1752150472186_28_20.png');
              width: 28px;
              height: 20px;
              background-size: contain;
              position: absolute;
              right: 0;
              top: 0;
            }
          }
        }
      }
      ::v-deep .van-calendar__header {
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.05);
      }
      ::v-deep .van-calendar__day--start,
      ::v-deep .van-calendar__day--end {
        position: relative;
        border-radius: 50%;
        &::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 52px;
          height: 100%;
          mask: url('https://ic-img.ky-express.com/netc/20230329_32863213444_!!1680085456650_103_214.png') 0 0 no-repeat;
          background-color: #8365f6;
          mask-size: 100% 100%;
          opacity: 0.15;
        }
      }
      ::v-deep .van-calendar__day--end {
        &::after {
          right: auto;
          left: 0;
          transform: scaleX(-1); // 镜像
        }
      }
      // ::v-deep .van-calendar__day--start:hover {
      //   position: relative;
      //   &::before {
      //     content: '';
      //     position: absolute;
      //     top: -35%;
      //     border-width: 5px;
      //     border-top: 10px solid transparent;
      //     border-left: 10px solid transparent;
      //     border-bottom: 8px solid rgba(0, 0, 0, 0.7);
      //     border-right: 8px solid rgba(0, 0, 0, 0.7);
      //     transform: rotate(45deg);
      //   }
      //   &::after {
      //     content: '请选择结束日期';
      //     position: absolute;
      //     top: -100%;
      //     left: -60%;
      //     width: 240px;
      //     height: 81px;
      //     line-height: 81px;
      //     background: rgba(0, 0, 0, 0.8);
      //     border-radius: 12px;
      //     color: #fff;
      //     font-size: 28px;
      //     letter-spacing: 1px;
      //   }
      // }
      ::v-deep .van-calendar__day--end {
        border-radius: 50%;
      }
      &__body {
        flex: 1;
        overflow: hidden;
      }
      ::v-deep .van-button--round {
        border-radius: 16px;
      }
      ::v-deep .van-button {
        height: 88px;
        margin: 20px 0;
        background: linear-gradient(98deg, #ac97ff 7%, #8365f6 95%) !important;
        border: none;
      }
      ::v-deep .van-calendar__month-title {
        font-size: 36px;
        font-weight: 500;
        color: #03050d;
      }
      ::v-deep {
        .van-calendar__day--disabled {
          color: #ccc;
        }
        .van-calendar__day--middle {
          color: #333 !important;
          &::after {
            opacity: 0.15;
            background-color: #8365f6;
          }
        }
      }
    }
  }
}
</style>
