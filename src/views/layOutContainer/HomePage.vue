<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from "vue-router";
import { userDatabaseSettingStore } from "@/stores/DatabaseSettingsStore";

const userDatabaseSetting = userDatabaseSettingStore(); // 获取数据库配置信息
const databaseSettings = computed(() => userDatabaseSetting.getSettings()); // 使用计算属性保持响应性

const router = useRouter();

const visible = ref(false);

const handleClick = () => {
  if (databaseSettings.value.username == '' || databaseSettings.value.password === ''
    || databaseSettings.value.host === '' || databaseSettings.value.port === '') {
    visible.value = true;
  } else {
    toQualityInspection();
  }
};
const handleOk = () => {
  visible.value = false;
  toDatabaseSettings();
};
const handleCancel = () => {
  visible.value = false;
}

const toQualityInspection = () => {
  router.push({
    path: "/qualityInspection",
  });
}
const toDatabaseSettings = () => {
  router.push({
    path: "/databaseSettings",
  });
}
</script>

<template>
  <a-typography class="home-page">
    <a-typography-title class="title">
      Hi，欢迎使用工行数据分析小工具!
    </a-typography-title>
    <a-space direction="vertical" size="large" align="center" fill>
      <a-typography-paragraph>
        有效进行binning、top、filter等数据分析操作，帮助您更好地管理工作事项。
      </a-typography-paragraph>
      <!-- <a-button class="start-btn" type="primary" size="large" @click="handleClick">快速开始</a-button> -->
      <a-row :gutter="40" :style="{ marginTop: '40px'}">
        <a-col :span="12">
          <a-card title="1. 数据库配置" :bordered="false" :style="{ width: '300px' }" hoverable>
            <template #extra>
              <router-link to="/databaseSettings">前往</router-link>
            </template>
            需要先配置Mysql数据库信息，才能进行数据探查和数据分析
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="2. 数据探查" :bordered="false" :style="{ width: '300px' }" hoverable>
            <template #extra>
              <router-link to="/qualityInspection">前往</router-link>
            </template>
            对Mysql表数据进行总体结果、字段探查和稳定探查
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="20">
      </a-row>
      <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
        <template #title>
          数据库尚未配置
        </template>
        <div>请先配置数据库信息，才能使用数据分析功能，点击确定按钮进行配置。</div>
      </a-modal>
    </a-space>
  </a-typography>
</template>

<style scoped>
:deep(.arco-card) {
    background: #f0f3f6;
    border-radius: var(--border-radius-large);
}

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


/**打字机动画 */
@keyframes typing {
  from {
    width: 0
  }

  to {
    width: 630.6px
  }
}

/**光标动画 */
@keyframes blink-caret {

  from,
  to {
    border-color: transparent
  }

  50% {
    border-color: black;
  }
}

/* 打字机动画 */
.title {
  overflow: hidden;
  /* 使用右边框作为打印的指针光标 */
  border-right: .15em solid black;
  /* 要设置不允许换行，且溢出隐藏 */
  white-space: nowrap;
  margin-right: auto;
  margin-left: auto;
  letter-spacing: .15em;
  /* 加上两个动画，一个是打字动画，使用steps让字一个一个的出现，
  注意step和字数保持一致，然后多一步用来丢弃，光标动画也是同理，*/
  animation: typing 3s steps(15, end), blink-caret 1s step-end infinite;
  /* animation: typing 2s steps(30) forwards, blink 1s 3; */
}

body {
  margin: auto;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: auto;
  background: linear-gradient(315deg, rgba(101, 0, 94, 1) 3%, rgba(60, 132, 206, 1) 38%, rgba(48, 238, 226, 1) 68%, rgba(255, 25, 25, 1) 98%);
  animation: gradient 15s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
}

@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }

  50% {
    background-position: 100% 100%;
  }

  100% {
    background-position: 0% 0%;
  }
}

.wave {
  background: rgb(255 255 255 / 25%);
  border-radius: 1000% 1000% 0 0;
  position: fixed;
  width: 200%;
  height: 12em;
  animation: wave 10s -3s linear infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.8;
  bottom: 0;
  left: 0;
  z-index: -1;
}

.wave:nth-of-type(2) {
  bottom: -1.25em;
  animation: wave 18s linear reverse infinite;
  opacity: 0.8;
}

.wave:nth-of-type(3) {
  bottom: -2.5em;
  animation: wave 20s -1s reverse infinite;
  opacity: 0.9;
}

@keyframes wave {
  2% {
    transform: translateX(1);
  }

  25% {
    transform: translateX(-25%);
  }

  50% {
    transform: translateX(-50%);
  }

  75% {
    transform: translateX(-25%);
  }

  100% {
    transform: translateX(1);
  }
}
</style>
