<template>
  <div class="product-info-page">
    <KyCell placeholder="请选择" :border="false" :value="cellValue" data-validate="productInfo.productInfo">
      <template #title>
        <div class="font-level3 flex items-center">
          货物信息<img
            class="product-spec-required"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAolBMVEUAAAD/h3H/h3D/h3D/h3L/hXL/h3L/hnT/h3L/iHL94OD/4uL/h3L/iHL/h3L/gGD/h3L/iHL/h3L/h3H/hnD94N/94eD/h3L94uD94eH94uD/h3L94OD/hnP/5OT/gGr/hnH/h3L/h3L/hnH/h3H/hXD/h3L/h3L/h3H/h3L/gHD+4eD+4eD/iHL/hnH/h3L/hnP/hnL/hXH/h3H94uH/h3Ktn1/aAAAANHRSTlMAvyBAn4BfFvnPMgjojsYIb++1Zx369dvZmZWVjCgmDFjz31NGMNethzkQ4MWmfHdQTCzjXNbewAAAArFJREFUWMPtl9l2qjAUhjcKkigzKI51HlunHv73f7WDDDZLoGW1ueS7IQH8zN47KyTU0NDQ0PBFdzTsR3+kPxx1M11vHEli3Et8H9Fg2u3RH+l1p4Po46EZR+9vJIW392gc5y8axD5JxkHUpVE0JWlMoxENY6k0utGQ+lFPnrAX9SmKSB6xrUzo61RBp6OLPVWtJTRh3CuEQFvoncFrCR0GTOy8Z5/XVUILk3ohf3KAf2YdDei8CpUUhjBrmd8LyZ4Ay1QTMFiFEeIV5UVYpLNEGo8KHAvCVoIPo5Wh/yikzzD58RFQq4qiCY9+FpKuXIjmIVw9vxGPBFi0WgHRRokxsBIyWC1sCVWYCG0VGas4IxBRKoX2i/AOnKlUKEi0b4TrpScKdQPhnKgQcn3hAVwQzi2w7UnbBa9FqR+ygokg3AMOBS68MuFKy1GqhXOGxZfQTGeMA9xehLVDvgH6U+gjG9oOK7soNNQcXi1UwZ9VdgArLcgGcIpCV8lZVQrtJS65MPbt9GdmXftXIfvALBOago/agFMQ8naOWinksCgV7gBLF9c94zfTZgGsMyGwT/InPHkK9euh5ggdl+dFgEk5J4oxsM+FnCGsm0N7RjFXBhzoiaHFsZv8nixpJmLCiapa4rR5tP2q1WZrAeKafwJu2TB9jhjvTm0UUcuFpwMDFFE4+1qwL4A7SaaB9sD0kounJpdbaciOAfxbt0ThBsjLHXB/LoQSskeij0t2rVqxO7GOHeakA76QcYNKsDUG9ngr2AN8Wy6cLbFPysLAN62UhYszFVmHgDVL2/Er7FJe5Xb2Tx4E2LGg23DAdZ7dwAK8glAk8BhyjA4VmBnM1EnAxPWnD734vS2yfb3dFkKWvp2TvuGUviWWvmmXfqyQffCRfjSTfXiUfbxtaGhoaHjyH3pRu/OA05k8AAAAAElFTkSuQmCC"
          />
        </div>
      </template>
    </KyCell>
  </div>
</template>
<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { cellValue } from '../utils/index'
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../page/index.scss';
</style>
