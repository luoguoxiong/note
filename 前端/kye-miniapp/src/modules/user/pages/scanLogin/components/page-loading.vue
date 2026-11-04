<template>
  <view class="page-loading">
    <image class="page-loading-img" src="https://ic-img.ky-express.com/netc/20250714_5390_!!1752464109831_120_60.gif" />
    <view class="page-loading-text">努力加载中…</view>
  </view>
</template>

<style lang="scss">
.page-loading {
  width: 306px;
  height: 306px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
  &-img {
    width: 180px;
    height: 90px;
  }
  &-text {
    margin-top: 30px;
    font-size: 26px;
    color: #6e6d72;
  }
}
</style>
