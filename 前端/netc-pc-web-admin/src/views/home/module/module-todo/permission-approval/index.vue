<template>
  <div id="permission-approval">
    <div class="title">
      <img class="icon" src="https://ic-img.ky-express.com/netc/20240514_19470395186_!!1715685515721_32_32.png" />
      申请{{ data.applyAuth }}
    </div>
    <div class="apply-content">
      <div class="apply-info-item">
        <span class="label">申请人</span>
        {{ data.memberName }}{{ data.memberName ? '/' : '' }}{{ data.applyPhone }}
      </div>
      <div class="apply-info-item">
        <span class="label">申请原因</span>
        <span class="value">{{ data.applyReason }}</span>
      </div>
      <div class="apply-info-item">
        <span class="label">申请日期</span>
        {{ data.applyTime }}
      </div>
    </div>
    <div class="apply-btn">
      <KButton
        type="default"
        id="home-btn"
        @click.stop="
          linkToAppproval({
            pageTab: '103',
            activeTab: '10',
            id: `${props.data.id}`,
            operateType: '2',
            url: props.data.rejectUrl,
          })
        "
        style="width: 76px"
        ><span class="fix-btn">拒绝</span></KButton
      >
      <KButton
        type="primary"
        id="home-btn"
        @click.stop="
          linkToAppproval({
            pageTab: '103',
            activeTab: '10',
            id: `${props.data.id}`,
            operateType: '1',
            url: props.data.agreeUrl,
          })
        "
        style="width: 76px"
        ><span class="fix-btn">同意</span></KButton
      >
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AuthApprovalListVO } from '@/apis/home/types'
import { KButton } from '@netc-design-pc/ui'
import { useLinkTo } from '@/hooks'
interface PermissionApproval {
  data: AuthApprovalListVO
}

const { linkToAppproval } = useLinkTo()
const props = defineProps<PermissionApproval>()
</script>
<style lang="scss" scoped>
#permission-approval {
  padding: 16px;
  height: 254px;
  position: relative;
  box-sizing: border-box;
}
.title {
  font-size: 15px;
  font-weight: 600;
  line-height: 14px;
  color: #24262b;
  height: 14px;
  display: flex;
  align-items: center;
  img {
    width: 16px;
    margin-right: 4px;
  }
}
.apply-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  position: absolute;
  top: 60px;
  left: 40px;
  right: 40px;
  height: 108px;
}
.apply-info-item {
  font-size: 13px;
  font-weight: normal;
  color: #24262b;
  display: flex;
  line-height: 20px;
  .label {
    color: #8c8f99;
    width: 68px;
  }
  .value {
    color: #24262b;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}
.apply-btn {
  position: absolute;
  right: 40px;
  bottom: 26px;
  width: 200px;
  height: 32px;
  display: flex;
  justify-content: flex-end;
}
.fix-btn {
  display: inline-block;
  width: 52px;
  text-align: center;
}
</style>
