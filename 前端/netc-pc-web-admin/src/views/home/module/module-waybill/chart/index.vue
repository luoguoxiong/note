<template>
  <div id="business-chart">
    <div class="tab-wrap">
      <div class="tab-title">
        <span>{{ isPieces ? '件数' : '票数' }}趋势</span>
        <span>({{ isPieces ? '件数' : '票数' }})</span>
      </div>
      <div class="tab-content">
        <div
          @click="changeType(false)"
          :class="{
            active: !isPieces,
            'tab-item': true,
          }"
        >
          票数
        </div>
        <div
          class="tab-item"
          @click="changeType(true)"
          :class="{
            active: isPieces,
            'tab-item': true,
          }"
        >
          件数
        </div>
      </div>
    </div>
    <div class="chart-content" ref="refElement" v-show="!isEmpty"></div>
    <div class="chart-empty" v-show="isEmpty">
      <img src="https://ic-img.ky-express.com/netc/20240521_12570395119_!!1716255801831_180_180.png" alt="" />
      <div>暂无数据</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useEchart } from '@/hooks'
import { Any } from '@/types'
import { ref, watch } from 'vue'
import { useHomeStore } from '@/hooks/useHomeStore'
import { DataVO } from '@/apis/home/types'
import { thousandSeparatorReplacer } from '@/utils/regexp'
import dayjs from 'dayjs'
const { refElement, checkEchartStatus } = useEchart()

const isPieces = ref(false) // 是否是件数

const isEmpty = ref(false)

const isReport = ref(false)

const { businessOverview, homeStatus } = useHomeStore()

const changeType = (type: boolean) => {
  isPieces.value = type
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_business_overview_chart_switch_v1',
    },
    {
      region_code: 'business_overview',
    }
  )
}

const hanldeScroll = () => {
  if (!isReport.value) {
    isReport.value = true
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'other_homepage_business_overview_chartdrag_v1',
      },
      {
        region_code: 'business_overview',
      }
    )
  }
}

const renderChart = async (data: DataVO[]) => {
  const chartInstance = await checkEchartStatus()
  if (data) {
    const nums = data.map((item) => item.count)
    const labels = data.map((item) => dayjs(`${item.dataTime}`).format('MM/DD'))
    const maxValue = Math.ceil(Math.max(...nums))
    console.log('maxValue', maxValue)
    chartInstance?.setOption({
      grid: {
        top: 10,
        left: 56,
        right: 4,
        bottom: 20,
      },
      yAxis: {
        type: 'value',
        max: maxValue,
        interval: Math.ceil(maxValue / 4),
        splitLine: {
          // 设置y轴刻度线为虚线
          lineStyle: {
            type: 'dashed', // 虚线
          },
        },
        axisLabel: {
          color: '#8C8F99',
          fontSize: 12,
          formatter: (value: number) => {
            if (Number(value) > 100000000) {
              return (value / 100000000).toFixed(2) + '亿'
            }
            if (Number(value) > 10000) {
              return (value / 10000).toFixed(2) + '万'
            }
            return Number(value).toFixed(0) + ''
          },
        },
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLabel: {
          rotate: 15,
          color: '#8C8F99',
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e6e8ed', // 图标x轴的颜色
          },
        },
        axisTick: {
          show: false, // 隐藏x轴刻度
        },
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          // 坐标轴指示器配置项
          type: 'line', // 指示器类型为线
        },
        formatter: function ([{ data: count, dataIndex }]: Any) {
          return `<div class="buisness-chart-tooltip">${dayjs(`${data[dataIndex]?.dataTime}`).format(
            'YYYY/MM/DD'
          )}</div>
          <div class="buisness-chart-tooltip-value">${isPieces.value ? '件数' : '票数'}：${thousandSeparatorReplacer(
            `${count}${isPieces.value ? ' 件' : ' 票'}`,
            ','
          )}</div>`
        },
      },
      // dataZoom: [
      //   {
      //     type: 'slider',
      //     show: true,
      //     realtime: true,
      //     start: 75,
      //     end: 100,
      //     right: 2,
      //     bottom: 0,
      //     xAxisIndex: [0],
      //     showDetail: false,
      //     borderColor: 'transparent',
      //     borderCap: 'round',
      //     fillerColor: '#dde1e7',
      //     dataBackground: {
      //       lineStyle: {
      //         width: 0,
      //       },
      //       areaStyle: {
      //         color: 'white',
      //       },
      //     },
      //     backgroundColor: 'white',
      //     height: 6,
      //     handleSize: 0,
      //     brushSelect: false,
      //     handleStyle: {
      //       borderCap: 'round',
      //     },
      //     moveHandleStyle: {
      //       borderCap: 'round',
      //     },
      //   },
      //   // {
      //   //   type: 'inside',
      //   //   realtime: true,
      //   //   start: 0,
      //   //   end: 100,
      //   //   xAxisIndex: [0],
      //   // },
      // ],
      series: [
        {
          data: nums,
          type: 'line',
          symbol: 'none', // 隐藏坐标点
          // smooth: true,
          itemStyle: {
            color: '#8076F5',
          },
          lineStyle: {
            width: 1.5,
          },
          areaStyle: {
            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(128, 118, 245, 0.2)', // 开始颜色
              },
              {
                offset: 0.7,
                color: 'rgba(128, 118, 245, 0)', // 结束颜色
              },
            ]),
          },
        },
      ],
    })
    chartInstance?.on('dataZoom', hanldeScroll)
  }
}
watch([isReport], async () => {
  if (isReport.value) {
    const chartInstance = await checkEchartStatus()
    chartInstance?.off('dataZoom', hanldeScroll)
  }
})

watch(
  [businessOverview, isPieces, homeStatus],
  async () => {
    const data = businessOverview.value || []
    if (data.length > 0) {
      const buisnessData = data.find((item) => item.type === homeStatus.value.activeTab)
      const chartData = (isPieces.value ? buisnessData?.detailPieces : buisnessData?.detailVotes) || []
      isEmpty.value = chartData.length === 0 ? true : false
      if (chartData.length > 0) {
        renderChart(chartData)
      } else {
        const chartInstance = await checkEchartStatus()
        chartInstance?.clear()
      }
    } else {
      isEmpty.value = true
    }
  },
  {
    deep: true,
    immediate: true,
  }
)
</script>
<style lang="scss">
.buisness-chart-tooltip {
  height: 28px;
  line-height: 18px;
  width: 132px;
  position: relative;
  font-size: 13px;
  font-weight: 600;
  padding: 0 6px;
  color: #24262b;
  &::after {
    content: '';
    display: block;
    width: 164px;
    height: 1px;
    position: absolute;
    left: -10px;
    bottom: 0px;
    background-color: #e6e8ed;
  }
}
.buisness-chart-tooltip-value {
  height: 28px;
  line-height: 38px;
  width: 132px;
  font-size: 13px;
  color: #24262b;
  padding: 0 6px;
}
canvas {
  cursor: pointer;
}
</style>
<style lang="scss" scoped>
#business-chart {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.tab-wrap {
  height: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  .tab-title {
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 16px;
    box-sizing: border-box;
    & > span:nth-child(1) {
      font-size: 12px;
      color: #3d3d3d;
    }
    & > span:nth-child(2) {
      font-size: 12px;
      color: #8c8f99;
      margin-left: 4px;
    }
  }
  .tab-content {
    width: 92px;
    height: 24px;
    border-radius: 4px;
    background: #f2f3f7;
    padding: 2px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }
  .tab-item.active {
    background: #ffffff;
    color: #7143f0;
  }
  .tab-item {
    width: 42px;
    height: 20px;
    font-size: 13px;
    border-radius: 2px;
    color: #686b75;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.chart-content {
  padding-top: 8px;
  height: 143px;
  width: 100% !important;
}
.chart-empty {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  img {
    width: 120px;
    height: 120px;
  }
  div {
    line-height: 20px;
    margin-top: 8px;
    font-size: 14px;
    color: #666666;
  }
}
</style>
