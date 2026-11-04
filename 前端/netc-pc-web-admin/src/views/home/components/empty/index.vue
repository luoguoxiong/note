<template>
  <div class="empty_box">
    <img src="https://ic-img.ky-express.com/netc/20240805_1367128378_!!1722822803082_320_342.png" alt="" />
    <div class="txt">近30天内暂无消息</div>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.empty_box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  img {
    width: 80px;
    height: 80px;
    margin-right: 8px;
  }
  .txt {
    font-size: 13px;
    color: #8c8f99;
  }
}
</style>
