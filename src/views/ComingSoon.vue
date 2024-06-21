<script setup>
</script>

<template>
  <a-typography class="home-page">
    <a-typography-title class="title">
      Coming Soon
    </a-typography-title>
    <a-space direction="vertical" size="large" align="center" fill>
      <a-typography-paragraph>
        尚未建设完成
      </a-typography-paragraph>
      <router-link to="/homePage">
        <a-button class="start-btn" type="primary" size="large">返回首页</a-button>
      </router-link>
    </a-space>
  </a-typography>
</template>

<style scoped>
/* 美化列表和列表项 */
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6rem;
  height: calc(100vh - 50px);
  box-sizing: border-box;

  /* background: url(./../../assets/noise.png); */
}

.home-page h1.arco-typography {
  font-family: Inter var, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol, "Noto Color Emoji" !important;
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-variation-settings: "slnt" 0;
  font-weight: 800;
}

</style>
