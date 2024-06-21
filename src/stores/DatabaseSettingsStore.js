import { defineStore } from "pinia";
import { ref,reactive } from "vue";

// 定义数据库配置
export const userDatabaseSettingStore = defineStore(
  "userDatabaseSetting",
  () => {
    const userDatabaseSettings = reactive({
      username: '',
      password: '',
      host: '',
      database: '',
    }); // 数据库配置信息

    // 获取数据库配置信息
    const getSettings = () => {
      return userDatabaseSettings;
    };
    // 设置数据库配置信息
    const setSettings = (username, password, host, database) => {
      userDatabaseSettings.username = username;
      userDatabaseSettings.password = password;
      userDatabaseSettings.host = host;
      userDatabaseSettings.database = database;
    };

    return { userDatabaseSettings, getSettings, setSettings};
  },
  { persist: true } // 持久化
);
