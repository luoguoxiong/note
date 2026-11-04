<template>
  <div class="express-nodata">
    <section class="material-nodata-image">
      <img :src="pic" />
    </section>
    <div class="nodata-text">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    pic: {
      type: String,
      default: 'https://ic-img.ky-express.com/netc/20221227_61763213452_!!1672135002686_80_80.png',
    },
    text: {
      type: String,
      default: ' ',
    },
  },
}
</script>
<style lang="scss" scoped>
.express-nodata {
  font-size: 14px;
  color: #666666;
  user-select: none;
  text-align: center;
  text-align: center;
  .nodata-text {
    font-size: 13px;
    color: #8f8fa8;
    margin-top: 10px;
  }

  img {
    display: block;
    width: 80px;
    height: 80px;
    margin: 0 auto;
  }
}
</style>
