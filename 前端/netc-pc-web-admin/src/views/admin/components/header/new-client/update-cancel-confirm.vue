<template>
  <div class="cancel-submit">
    <div class="title">
      <img src="https://ic-img.ky-express.com/netc/20221018_73463189598_!!1666080620627_36_36.png" alt="" />
      <p>下载提示</p>
    </div>
    <div class="submit-msg">请确认是否退出更新？</div>
    <div class="button-operation">
      <div class="button light-button flex" @click="emit('quit')">退出</div>
      <div class="button normal-button flex" @click="emit('continue')">继续下载</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 客户端更新 - 下载中断二次确认弹层
 * 自 update.vue 拆分(模板/样式随迁, 渲染与行为不变)
 * 按钮样式为原 .client-update .button-operation 基础规则与 .cancel-submit 覆盖规则的合并(计算值等价)
 */
const emit = defineEmits<{
  (e: 'quit'): void
  (e: 'continue'): void
}>()
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.cancel-submit {
  width: 360px;
  height: 174px;
  background: #ffffff;
  border-radius: 4px;
  padding: 30px 20px 20px;
  box-sizing: border-box;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  .title {
    display: flex;
    align-items: center;
    p {
      font-size: 16px;
      font-weight: 500;
      text-align: left;
      color: #03050d;
    }
    img {
      width: 18px;
      margin-right: 8px;
    }
  }
  .submit-msg {
    margin-top: 20px;
    font-size: 13px;
    color: #03050d;
    line-height: 20px;
  }
  .button-operation {
    margin-top: 36px;
    display: flex;
    justify-content: flex-end;
    .button {
      width: 72px;
      height: 32px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      color: #ffffff;
      line-height: 32px;
      font-family: PingFangSC, PingFangSC-Medium;
      cursor: pointer;
    }
    .normal-button {
      background: #8365f6;
    }
    .light-button {
      background: #ffffff;
      border: 1px solid #dfdfdf;
      font-weight: 500;
      color: #03050d;
      margin-right: 16px;
    }
  }
}
</style>
