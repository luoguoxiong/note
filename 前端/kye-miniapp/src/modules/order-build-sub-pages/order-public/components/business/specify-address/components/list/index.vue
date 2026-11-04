<template>
  <div class="specify-address-list">
    <div class="item" :class="{ 'is-select': activeItem === item.addressId }">
      <div class="item__left__page">
        <!-- 全部 -->
        <template v-if="(item.userName && item.addrDetail) || item.mobile || item.telephone || item.companyName">
          <SvgIcon
            class="list__item__icon"
            v-if="batchSelect"
            :name="item.isSelectItem ? 'radio-checked' : 'radio-unchecked'"
          />
          <div class="info-content">
            <div v-if="item.userName" class="info">
              <div v-if="item.userName" class="info__person" v-html="highlightText(item.userName, keyword)"></div>
              <div v-if="item.mobile" class="info__mobile" v-html="highlightText(item.mobile || '', keyword)"></div>
              <div v-else class="info__telephone" v-html="highlightText(getPhone(item), keyword)"></div>
              <div v-if="isDefault" class="info__flag">默认</div>
            </div>
            <div
              v-if="item.mobile && item.telephone"
              class="title"
              v-html="highlightText(getPhone(item), keyword)"
            ></div>
            <div class="title flex" v-if="showAddressName">
              <div v-if="item.addrName" class="title" v-html="highlightText(item.addrName, keyword)"></div>
              <div v-if="item.addrCode" class="title addr-cdoe" v-html="highlightText(item.addrCode, keyword)"></div>
            </div>
            <div
              v-if="item.addrDetail && showAddressDetail"
              class="address"
              v-html="highlightText(item.addrDetail, keyword)"
            ></div>
            <div v-if="item.companyName" class="companyName" v-html="highlightText(item.companyName, keyword)"></div>
          </div>
        </template>

        <template v-else>
          <!-- 地址名称和详细地址 -->
          <SvgIcon
            class="list__item__icon"
            v-if="batchSelect"
            :name="item.isSelectItem ? 'radio-checked' : 'radio-unchecked'"
          />
          <div>
            <template v-if="item.addrName && item.addrDetail">
              <div class="info" v-if="showAddressName">
                <div class="info__person flex">
                  <div class="info__person" v-html="highlightText(item.addrName, keyword)"></div>
                  <div class="info__person" v-if="item.addrCode" v-html="highlightText(item.addrCode, keyword)"></div>
                </div>
                <div v-if="isDefault" class="info__flag">默认</div>
              </div>
              <div class="address" v-if="showAddressDetail" v-html="highlightText(item.addrDetail, keyword)"></div>
            </template>
            <!-- 地址名称 -->
            <template v-else-if="item.addrName && showAddressName">
              <div class="title flex">
                <div class="title" v-html="highlightText(item.addrName, keyword)"></div>
                <div class="title" v-if="item.addrCode" v-html="highlightText(item.addrCode, keyword)"></div>
              </div>
            </template>
            <!-- 详细地址 -->
            <template v-else>
              <div
                v-if="item.addrDetail && showAddressDetail"
                class="address"
                v-html="highlightText(item.addrDetail, keyword)"
              ></div>
            </template>
          </div>
        </template>
      </div>

      <div v-if="item.locationDistance && recommendByUserLocation" class="item__right" @click.stop="onLocationDistance">
        <div class="icon"></div>
        <div class="kilometer">{{ item.locationDistance }}km</div>
        <div v-if="item.distanceTag" class="flag">{{ item.distanceTag }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConfigAddress } from '@order-public-sub-public/apis/address/types'
import { DefaultType } from '@order-public-sub-public/constants'
import { computed } from 'vue'
import highlightText from '@order-public-sub-public/utils/highlightText'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

interface PropsType {
  keyword?: string
  addressVisibleType?: string
  activeItem?: number | string
  index?: number | string
  item: ConfigAddress
  defaultType?: string | unknown
  fieldsConfigType?: boolean | unknown
  recommendByUserLocation?: boolean | unknown
  batchSelect?: boolean
}

const props = withDefaults(defineProps<PropsType>(), {
  keyword: '',
})
const emit = defineEmits(['onLocationDistance'])

// 是否默认地址
const isDefault = computed(() => props.item.defaultType === DefaultType.YES)

// 唤起地图
const onLocationDistance = () => emit('onLocationDistance')

const showAddressName = computed(() => {
  return props.addressVisibleType === 'name' || props.addressVisibleType === 'all'
})

const showAddressDetail = computed(() => {
  return props.addressVisibleType === 'detail' || props.addressVisibleType === 'all'
})

const getPhone = (item: ConfigAddress) => {
  const { telephone = '', extension } = item
  return extension ? `${telephone}-${extension}` : telephone
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
