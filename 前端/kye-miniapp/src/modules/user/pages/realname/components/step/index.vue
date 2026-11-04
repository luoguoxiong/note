<template>
  <div class="page-enterprise">
    <div class="page-enterprise-head">
      <div class="steps">
        <div class="step" v-for="step in steps" :key="step.key" :class="{ 'step-finish': stepKey >= step.key }">
          <div class="step-dot"></div>
          <div class="step-title">{{ step.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义步骤接口
interface StepItem {
  key: number
  title: string
}

// 定义组件props
interface Props {
  stepKey?: number
}

defineOptions({ name: 'Step' })

// 使用defineProps定义props
const props = withDefaults(defineProps<Props>(), {
  stepKey: 1,
})

// 步骤数据
const steps: StepItem[] = [
  { key: 1, title: '企业证件' },
  { key: 2, title: '身份证件' },
  { key: 3, title: '完成' },
]
</script>

<style lang="scss">
.page-enterprise {
  height: 100%;
  background-color: #ffffff;
  .steps {
    display: flex;
    .step {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      &::before {
        position: absolute;
        top: 15px;
        left: 2px;
        content: '';
        width: calc(50% - 16px);
        border-top-width: 2px;
        // border-top-style: dotted;
        // border-top-color: rgba(255, 255, 255, 0.5);
        height: 2px;
        background: repeating-linear-gradient(
          to right,
          rgba(255, 255, 255, 0.5) 0,
          rgba(255, 255, 255, 0.5) 4px,
          transparent 4px,
          transparent 8px
        );
      }
      &::after {
        position: absolute;
        top: 15px;
        left: calc(50% + 14px);
        content: '';
        width: calc(50% - 16px);
        border-top-width: 2px;
        // border-top-style: dotted;
        // border-top-color: rgba(255, 255, 255, 0.5);
        height: 2px;
        background: repeating-linear-gradient(
          to right,
          rgba(255, 255, 255, 0.5) 0,
          rgba(255, 255, 255, 0.5) 4px,
          transparent 4px,
          transparent 8px
        );
      }
      &:first-child::before {
        width: 0;
      }
      &:last-child::after {
        width: 0;
      }

      .step-dot {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: url('https://ic-img.ky-express.com/netc/20260319_54684_!!1773904049214_64_64.png');
        background-size: 100% 100%;
      }
      .step-title {
        font-size: 24px;
        color: #cdbbff;
        margin-top: 10px;
        font-size: 28px;
        font-weight: 600;
        line-height: 40px;
      }
      &.step-finish {
        opacity: 1;
        .step-title {
          color: #fff;
        }
        &::before {
          border-top-style: solid;
          border-top-color: rgba(255, 255, 255, 1);
          background: unset;
        }
        &::after {
          left: calc(50% + 16px);
          content: '';
          width: calc(50% - 14px);
          border-top-style: solid;
          border-top-color: rgba(255, 255, 255, 1);
          background: unset;
        }
        .step-dot {
          background: url('https://ic-img.ky-express.com/netc/20260319_44776_!!1773904077048_64_64.png');
          background-size: 100% 100%;
        }
      }
    }
  }

  .page-enterprise-head {
    height: 176px;
    padding-top: 36px;
    box-sizing: border-box;
    background: linear-gradient(360deg, #c1a5ff, #8d6cff);
  }

  .page-enterprise-body {
    margin-top: -30px;
    padding: 30px 32px 160px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    background-color: #ffffff;
  }

  .tip-top {
    text-align: justify;
    margin-bottom: 24px;
    height: 52px;
    opacity: 1;
    font-size: 36px;
    font-weight: 600;
    line-height: 52px;
    color: #24262b;
    padding-left: 24px;
    position: relative;

    &::before {
      content: '';
      width: 8px;
      height: 24px;
      border-radius: 0px 4px 4px 0px;
      background: #8365f6;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .tip-bottom {
    line-height: 40px;
    font-size: 24px;
    color: #666666;
    text-align: center;
    opacity: 0.3;
    position: fixed;
    left: 0;
    bottom: 168px;
    width: 100%;
  }
  .tip-bottom-new {
    color: #666666;
    font-size: 24px;
    text-align: center;
    opacity: 0.3;
    position: absolute;
    left: 0;
    top: -68px;
    width: 100%;
  }
  .tip-form {
    line-height: 34px;
    font-size: 25px;
    color: #cccccc;
    text-align: center;
    margin-top: 20px;
  }

  .label {
    line-height: 42px;
    font-size: 30px;
    color: #666666;
    margin-top: 25px;
    margin-bottom: 25px;
  }

  .type-wrap {
    display: flex;
    justify-content: space-between;
    margin-bottom: 45px;
    font-size: 30px;
    font-weight: 500;
    color: #333333;
    .type {
      width: 210px;
      height: 72px;
      font-size: 28px;
      color: #999999;
      border-radius: 8px;
      border-color: #f2f0f4;
      padding: 0;
      &.active {
        color: #8d6cff;
        border-color: #ad95ff;
      }
    }
  }
}
</style>
