<template>
  <div class="weight-size">
    <div class="tips">根据航空公司规定，必须符合以下要求，才能走航空件</div>

    <div class="limit__weight">
      <div class="limit__weight-title">航空限重标准</div>
      <div class="limit__weight__table">
        <div class="limit__weight__table-column">
          <div>中型飞机</div>
          <div>单件限重：80kg</div>
        </div>
        <div class="limit__weight__table-column">
          <div>大型飞机</div>
          <div>单件限重：1000kg</div>
        </div>
      </div>
    </div>

    <div class="text__block">
      <span>80kg&lt;单件重量≦1000kg</span>
      <span
        >若货物单件重量80kg&lt;单件重量≦1000kg超过中型飞机重量标准，为保证时效下单时需要联系商务确定有无大型飞机；</span
      >
    </div>

    <div class="text__block">
      <span>单件重量>1000kg</span>
      <span>当前货物单件重量超过大型飞机重量标准，无法选择航空件，建议选择陆运件。</span>
    </div>

    <div class="limit__size">
      <div class="limit__size-title">航空尺寸标准</div>
      <div class="limit__size__table">
        <div class="limit__size__table-column">
          <div></div>
          <div>长(cm)</div>
          <div>宽(cm)</div>
          <div>高(cm)</div>
        </div>
        <div class="limit__size__table-column">
          <div>中型飞机</div>
          <div>250</div>
          <div>80</div>
          <div>90</div>
        </div>
        <div class="limit__size__table-column">
          <div>大型飞机</div>
          <div>300</div>
          <div>150</div>
          <div>150</div>
        </div>
      </div>
    </div>

    <div class="text__block">
      <span>小型飞机尺寸&lt;单件尺寸≦大型飞机尺寸</span>
      <span>当货物单件尺寸超过中型飞机尺寸标准，为保证时效下单时需要联系商务确定有无大型飞机；</span>
    </div>

    <div class="text__block">
      <span>单件尺寸>大型飞机的尺寸</span>
      <span>当货物单件尺寸超过大型飞机尺寸标准，无法选择航空件，建议选择陆运件</span>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
