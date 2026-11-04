<template>
  <div class="all-setting-empty">
    <img :src="'./img/empty.png'" />
    <span>暂未设置常用功能，快去设置吧</span>
  </div>
</template>
<style scoped lang="scss">
.all-setting-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  img {
    width: 80px;
    height: 80px;
  }
  span {
    margin-left: 8px;
    font-size: 13px;
    color: #686b75;
    line-height: 20px;
  }
}
</style>
