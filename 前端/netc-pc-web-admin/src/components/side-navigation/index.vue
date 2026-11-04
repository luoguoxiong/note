<template>
  <div
    :class="['side-navigation__container', { 'is-fold': isFold }]"
    v-drag
    @click="handleFold(false)"
    v-show="visible"
  >
    <div v-show="!isFold">
      <el-popover
        :show-arrow="true"
        popper-class="online-service--popper2"
        :width="40"
        placement="left"
        trigger="hover"
      >
        <div>联系商务</div>
        <template #reference>
          <div class="ac-icon" @click="onContactBusinessClick">
            <i class="iconfont icona-yemianfuchuangdaohang1" />
          </div>
        </template>
      </el-popover>

      <el-popover
        :show-arrow="true"
        :width="40"
        v-if="isShowIntroduce && visible"
        :visible="isShowIntroduce"
        :popper-class="'online-service--popper3'"
        placement="left"
      >
        <div class="toppic">
          客户服务上线啦！软件功能指引及常见问题一键查询~
          <img src="./close.png" alt="" @click="closeIntroduce" />
        </div>
        <template #reference>
          <div class="ac-icon" style="position: relative" @click="linkToWiki">
            <i class="iconfont icona-rongqi816" />
          </div>
        </template>
      </el-popover>

      <el-popover
        :show-arrow="true"
        :width="40"
        v-else
        :popper-class="'online-service--popper2'"
        placement="left"
        trigger="hover"
      >
        <div>客户服务</div>
        <template #reference>
          <div class="ac-icon" style="position: relative" @click="linkToWiki">
            <i class="iconfont icona-rongqi816" />
          </div>
        </template>
      </el-popover>

      <el-popover
        v-if="showWxFlag"
        :show-arrow="true"
        popper-class="online-service--popper2"
        :width="90"
        placement="left"
        trigger="hover"
      >
        <div>关注公众号</div>
        <template #reference>
          <div class="ac-icon" @click="openWechatDialog">
            <img src="./wechat.svg" alt="" />
          </div>
        </template>
      </el-popover>

      <img src="./left.png" class="cospan" @click.stop="handleFold(true)" alt="" />
    </div>
    <el-popover v-if="isFold" popper-class="online-service--popper" placement="left" trigger="hover">
      <div>拖拽调整位置，点击展开更多</div>
      <template #reference>
        <div class="icon--wrapper">
          <i class="iconfont iconbianzu" style="font-size: 13px" />
        </div>
      </template>
    </el-popover>
    <!-- 联系商务 -->
    <CommonContact v-if="showBusiness" :visible="showBusiness" :isExclusive="isExclusive" @close="handleClose" />
    <wechatDialog ref="wechatDialogRef" />
  </div>
</template>
<script setup>
import CommonContact from './common-contact.vue'
import wechatDialog from '@/views/admin/components/header/wechat-dialog.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { locationRouteV2 } from '@/utils/appBridge'
import { getUserInfoByPhone } from '@/apis/user'
import { useHomeStore } from '@/hooks'
import { baseReportInstance } from '@/reportUmp'

const { isExclusive } = useHomeStore()
// 对齐老项目 side-navigation：悬浮导航仅在运单/理赔相关页面显示。
// 老项目为 waybill-v3/waybillDetail-v3/online-compensate-list/online-compensate-detail 四个路由；
// 本项目中运单详情在 waybill-v3 微应用内部、理赔列表/详情在 online-compensate 微应用内部，父路由不变
const route = useRoute()
const visible = computed(() => ['waybill-v3', 'online-compensate'].includes(route.name))
const isFold = ref(false)
const showBusiness = ref(false)

console.log('localStorage.getItem("isCloseIntroduce")', localStorage.getItem('isCloseIntroduce'))

const isShowIntroduce = ref()
const wechatDialogRef = ref()
const showWxFlag = ref(true)

onMounted(() => {
  setTimeout(() => {
    isShowIntroduce.value = localStorage.getItem('isCloseIntroduce') === null
  }, 0)
  getUserInfo()
})

const getUserInfo = async () => {
  const res = await getUserInfoByPhone()
  console.log('getUserInfoByPhone', res)
  if (res.code === 0 && res.data) {
    showWxFlag.value = !res.data.subscribe || !res.data.loginStatus
  }
}

const closeIntroduce = () => {
  isShowIntroduce.value = false
  localStorage.setItem('isCloseIntroduce', true)
}

const handleFold = (type) => {
  if (isFold.value === type) return
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_suspension_inlet_v1',
    },
    {
      region_code: 'suspension_inlet',
      button_name: type ? '收起' : '展开',
    }
  )
  isFold.value = type
}

const vDrag = {
  mounted: (el) => {
    el.onmousedown = (e) => {
      let disY = e.clientY - el.offsetTop
      setTimeout(() => {
        closeIntroduce()
      }, 100)
      document.onmousemove = (e) => {
        let top = e.clientY - disY
        if (top < 200) {
          top = 200
        }
        if (top + el.clientHeight > document.body.clientHeight - 60) {
          el.style.bottom = 60 + 'px'
          el.style.top = 'unset'
          return
        } else {
          el.style.top = top + 'px'
          el.style.bottom = 'unset'
        }
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
}

const handleClose = () => {
  showBusiness.value = false
}

// 联系商务，在线客服，公众号
const onContactBusinessClick = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_suspension_inlet_v1',
    },
    {
      region_code: 'suspension_inlet',
      button_name: '联系商务',
    }
  )
  showBusiness.value = true
}

const linkToWiki = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_suspension_inlet_v1',
    },
    {
      region_code: 'suspension_inlet',
      button_name: '客户服务',
    }
  )
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_page_homepage_service_entrance_v1',
    },
    {
      region_code: 'floating_bar',
    }
  )
  locationRouteV2.push({
    path: '/admin/wikipedia',
    query: {
      pre_click_id: baseReportInstance.get('click_id'),
    },
  })
}

const openWechatDialog = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_suspension_inlet_v1',
    },
    {
      region_code: 'suspension_inlet',
      button_name: '关注公众号',
    }
  )
  console.log(111)
  wechatDialogRef.value.showDialogVisible()
}
</script>
<style lang="scss">
.el-popover.online-service--popper {
  padding: 4px 8px;
  min-width: 206px;
  font-size: 14px;
  .el-popper__arrow {
    display: block !important;
  }
}
.el-popover.online-service--popper2 {
  padding: 5px 8px 4px;
  min-width: 80px;
  transform: translateX(-6px);
  font-size: 14px;
  z-index: -1;
  .el-popper__arrow {
    display: block !important;
  }
}
.el-popover.online-service--popper3 {
  width: 257px !important;
  height: 56px;
  padding: 8px 44px 8px 16px;
  box-sizing: border-box;
  transform: translate(-6px, 0);
  background: linear-gradient(90deg, #a27cff 0%, #8a61f2 100%);
  font-size: 13px;
  font-weight: normal;
  line-height: 20px;
  color: #ffffff;
  .el-popper__arrow {
    top: 22px !important;
    display: block !important;
    &::before {
      background: #8a61f2;
      border-color: #8a61f2;
    }
  }
}
</style>
<style lang="scss" scoped>
@import './index.scss';
</style>
