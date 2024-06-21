<script setup>
import { defineProps,ref } from 'vue';

const props = defineProps({
  // 默认false
  closeOnClickModal: Boolean
});

//控制遮罩的显示
const isShow = ref(false);

//打开遮罩，由外部进行调用
const showMask = () => {
    isShow.value = true;
};

//关闭遮罩
const closeMask = () => {
    isShow.value = false;
};

//通过点击遮罩关闭
const closeByMask = () => {
    // 直接在方法内部从props解构出closeOnClickModal
    const { closeOnClickModal } = props;
    if (closeOnClickModal) {
    isShow.value = false;
    }
};

// 使用 defineExpose 来暴露方法
defineExpose({
  showMask,
  closeMask
});
</script>

<template>
    <div class="mask">
      <!-- 外层的遮罩 -->
      <div class="mask-cover" v-if="isShow" @click="closeByMask"></div>
      <!-- 设置动画 -->
      <transition name="fade">
        <!-- 内容区 -->
        <div class="mask-content" v-if="isShow">
          <!-- 插槽，放置要插入到遮罩里的内容 -->
          <slot name="default"></slot>
        </div>
      </transition>
    </div>
</template>
  

<style scoped>
/* 最外层，设置position定位 */
.mask {
/* position: relative; */
color: #2e2c2d;
font-size: 16px;
}
/* 遮罩，设置背景层，z-index值要足够大确保能覆盖，高度 宽度设置满 做到全屏遮罩*/
.mask-cover {
background: #dce2eb5e;
border-radius: var(--border-radius-small);
/* position: fixed; */
position:absolute;
z-index: 999;
/*  设置top、left、宽高保证全屏遮罩*/
top: 0;
left: 0;
height: 100%;
width: 100%;
}

/* 内容层，z-index要大于遮罩层，确保内容在遮罩上显示*/
.mask-content {
position:absolute;
top: 40%;
left: 50%;
transform: translate(-50%, -50%);
z-index: 1000;
}

/* 动画*/
.fade-enter-active,
.fade-leave-active {
transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
opacity: 0;
}
</style>
  