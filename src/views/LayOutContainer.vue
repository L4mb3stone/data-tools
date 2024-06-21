<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isMax = false;
const currentPath = window.electron.getAppPath();

// 实现高亮并适配二级高亮导航栏
const currentRouteKey = computed(() => {
  return '/' + route.path.split('/')[1];
});

const collapsed = ref(true);
const onCollapse = (val, type) => {
  collapsed.value = val;
};

// 移除窗口，向主进程发一个请求
const removeWindow = () => {
  window.electron.removeWindow();
};
// 最小化窗口，向主进程发一个请求
const minimizeWindow = () => {
  window.electron.minimizeWindow();
};
// 最大化窗口，向主进程发一个请求
const maximizeWindow = () => {
  window.electron.maximizeWindow();
};


</script>
<template>
  <div class="common-layout">
    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider class="common-sider" breakpoint="xl" showCollapseButton collapsible :collapsed="collapsed"
        @collapse="onCollapse">
        <a-layout-header class="header" v-if="collapsed">
          <svg class="svg-icon"
            style="flex:none;padding-left:7px;padding-right:10px;width: 2em; height: 2em;vertical-align: middle;fill: currentColor;overflow: hidden;"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M317.259446 484.916877h110.911839v56.745592h-110.911839v167.65743h180.554156v-56.745592h-123.808564v-54.166247h110.911839v-170.236775h-110.911839v-56.745592h123.808564v-56.745592h-180.554156z"
              fill="#C6000B" />
            <path
              d="M510.710327 147.02267c-201.188917 0-363.687657 162.498741-363.687657 363.687657s165.078086 363.687657 363.687657 366.267003c201.188917 0 366.267003-165.078086 366.267003-366.267003 0-201.188917-162.498741-363.687657-366.267003-363.687657z m2.579346 673.209068c-170.236776 0-309.521411-139.284635-309.521411-309.521411s139.284635-309.521411 309.521411-309.52141 309.521411 139.284635 309.52141 309.52141-139.284635 309.521411-309.52141 309.521411z"
              fill="#C6000B" />
            <path
              d="M526.186398 371.425693h126.387909v56.745592H541.662469v170.236775h110.911838v56.745592h-126.387909v54.166247h183.133501v-170.236776h-110.911839v-56.745592h110.911839v-167.65743h-183.133501z"
              fill="#C6000B" />
          </svg>
        </a-layout-header>
        <a-layout-header class="header" v-else>
          <svg class="svg-icon"
            style="flex:none;padding-left:9px;padding-right:10px;width: 2em; height: 2em;vertical-align: middle;fill: currentColor;overflow: hidden;"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M317.259446 484.916877h110.911839v56.745592h-110.911839v167.65743h180.554156v-56.745592h-123.808564v-54.166247h110.911839v-170.236775h-110.911839v-56.745592h123.808564v-56.745592h-180.554156z"
              fill="#C6000B" />
            <path
              d="M510.710327 147.02267c-201.188917 0-363.687657 162.498741-363.687657 363.687657s165.078086 363.687657 363.687657 366.267003c201.188917 0 366.267003-165.078086 366.267003-366.267003 0-201.188917-162.498741-363.687657-366.267003-363.687657z m2.579346 673.209068c-170.236776 0-309.521411-139.284635-309.521411-309.521411s139.284635-309.521411 309.521411-309.52141 309.521411 139.284635 309.52141 309.52141-139.284635 309.521411-309.52141 309.521411z"
              fill="#C6000B" />
            <path
              d="M526.186398 371.425693h126.387909v56.745592H541.662469v170.236775h110.911838v56.745592h-126.387909v54.166247h183.133501v-170.236776h-110.911839v-56.745592h110.911839v-167.65743h-183.133501z"
              fill="#C6000B" />
          </svg>
          <a>数据加工小工具</a>
        </a-layout-header>
        <a-layout-content>
          <a-menu :selectedKeys="[currentRouteKey]">
            <router-link to="/homePage">
              <a-menu-item key="/homePage" :class="{ highlight: currentRouteKey === '/homePage' }">
                <template #icon><svg width="1em" height="1em" viewBox="0 0 48 48" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M20 26a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V28a2 2 0 012-2h14zm21.882 0c1.17 0 2.118.948 2.118 2.118v13.764c0 1.17-.948 2.118-2.118 2.118H28.118A2.118 2.118 0 0126 41.882V28.118c0-1.17.948-2.118 2.118-2.118h13.764zM40 30H30v10h10V30zM20 4a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h14zm22 0a2 2 0 012 2v14a2 2 0 01-2 2H28a2 2 0 01-2-2V6a2 2 0 012-2h14z"
                      fill="currentColor" />
                  </svg></template>
                首页
              </a-menu-item>
            </router-link>
            <router-link to="/qualityInspection">
              <a-menu-item key="/qualityInspection" :class="{ highlight: currentRouteKey === '/qualityInspection' }">
                <template #icon><svg width="1em" height="1em" viewBox="0 0 48 48" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M41.778 4C43.005 4 44 4.995 44 6.222v35.556A2.222 2.222 0 0141.778 44H6.222A2.222 2.222 0 014 41.778V6.222C4 4.995 4.995 4 6.222 4h35.556zM15 20a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V21a1 1 0 011-1h2zm10-6a1 1 0 011 1v20a1 1 0 01-1 1h-2a1 1 0 01-1-1V15a1 1 0 011-1h2zm10 12a1 1 0 011 1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1v-8a1 1 0 011-1h2z"
                      fill="currentColor" />
                  </svg>
                </template>
                数据探查
              </a-menu-item>
            </router-link>
            <router-link to="/comingSoon">
              <a-menu-item key="/comingSoon" :class="{ highlight: currentRouteKey === '/comingSoon' }">
                <template #icon>
                  <svg width="1em" height="1em" viewBox="0 0 48 48" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M18 6a2 2 0 012-2h8a2 2 0 012 2v34h2V18a2 2 0 012-2h7a2 2 0 012 2v22h1a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a1 1 0 011-1h1V23a2 2 0 012-2h7a2 2 0 012 2v17h2V6z"
                      fill="currentColor" />
                  </svg>
                </template>
                数据分析
              </a-menu-item>
            </router-link>
            <router-link to="/databaseSettings">
              <a-menu-item key="/databaseSettings" :class="{ highlight: currentRouteKey === '/databaseSettings' }">
                <template #icon><svg width="1em" height="1em" viewBox="0 0 48 48" fill="#787f8d">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M24 2c1.659 0 3.274.184 4.828.532l2.388 5.42a3 3 0 003.07 1.772l5.88-.64A21.98 21.98 0 0145 17.447l-3.499 4.781a3 3 0 000 3.544L45 30.552a21.98 21.98 0 01-4.834 8.364l-5.88-.64a3 3 0 00-3.07 1.773l-2.388 5.42c-1.554.347-3.17.531-4.828.531-1.659 0-3.275-.184-4.829-.532l-2.387-5.42a3 3 0 00-3.07-1.772l-5.88.64A21.98 21.98 0 013 30.553l3.499-4.781a3 3 0 000-3.544L3 17.448a21.98 21.98 0 014.834-8.364l5.88.64a3 3 0 003.07-1.773l2.387-5.419A22.06 22.06 0 0124 2zm0 14a8 8 0 100 16 8 8 0 000-16z"
                      fill="#787f8d" />
                  </svg></template>
                数据库配置
              </a-menu-item>
            </router-link>
          </a-menu>
        </a-layout-content>
      </a-layout-sider>
      <!-- 内容部分 -->
      <a-layout-content class="content">
        <!-- 自定义菜单栏 -->
        <a-layout-header class="content-header">
          <div class="icon-group">
            <div class="icon-group-item" @click="minimizeWindow" title="最小化">
              <icon-minus />
            </div>
            <div class="icon-group-item" @click="maximizeWindow" :title="isMax ? '缩小' : '全屏'">
              <svg width="12" height="12" viewBox="0 0 48 48" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M44 6H4a2 2 0 00-2 2v32a2 2 0 002 2h40a2 2 0 002-2V8a2 2 0 00-2-2zM6 38V10h36v28H6z"
                  fill="currentColor" />
              </svg>
            </div>
            <div class="icon-group-item" @click="removeWindow" title="退出">
              <icon-close />
            </div>
          </div>
        </a-layout-header>
        <!-- 主要路由内容 -->
        <router-view v-slot="{ Component }">
          <Transition name="fade">
            <component :is="Component" />
          </Transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<style scoped>
/* 定义主样式 */
.common-layout {
  height: 100vh;
  /* background-color: #f7f9fc */
  /* background-image: url(./../assets/home-background-light.jpg);
  background-size: 150rem;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 2.5rem;
  --tw-bg-opacity: 0.5; 
  background-color: rgba(248,250,252,var(--tw-bg-opacity));
  backdrop-filter: blur(20px);
  background-position: bottom;
  background-repeat: no-repeat */
}

/* 定义头部字体样式 */
.header {
  display: flex;
  align-items: center;
  height: 50px;
  color: var(--color-neutral-10);
  font-weight: bold;
  font-size: 1.2em;
  font-family: "STHeiti", "SimSun", "STKaiti", "KaiTi", "STSong", sans-serif;
  /* font-family: Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"!important;
  font-family: "Inter", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-variation-settings:
    "slnt" 0; */
  -webkit-app-region: drag;
  transition: width 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  white-space: nowrap;
  overflow: hidden;
}

.content-header {
  padding-left: 1.5em;
  padding-right: 1.5em;
  padding-top: 1em;
  height: 50px;
  -webkit-app-region: drag;
}

.content-header .icon-group {
  justify-content: flex-end;
  /* 右对齐 */
  display: flex;
}

.content-header .icon-group-item {
  font-size: 1.1em;
  margin-left: 1em;
  -webkit-app-region: no-drag;
  /*去除菜单栏功能按钮的拖拽属性*/
}

/* 自定义图标高亮 */
.highlight svg path {
  fill: rgb(57, 134, 253);
}

/* 隐藏溢出的东西 */
.common-layout :deep(.arco-layout-sider-children) {
  overflow: hidden;
}

.common-layout :deep(.arco-layout) {
  height: 100%;
}

.common-sider {
  background-color: #eaeef4;
  backdrop-filter: blur(20px);
}

/* 自定义arco左侧菜单栏样式 */
:deep(.common-sider .arco-menu-light) {
  background-color: inherit;
}

:deep(.common-sider .arco-menu-light .arco-menu-item.arco-menu-selected) {
  background-color: var(--color-fill-3);
}

:deep(.common-sider .arco-menu-light .arco-menu-item) {
  background-color: inherit;
  border-radius: var(--border-radius-large);
}

:deep(.common-sider .arco-layout-sider-trigger-light) {
  background-color: inherit;
  border-top: 1px solid var(--color-bg-7);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
