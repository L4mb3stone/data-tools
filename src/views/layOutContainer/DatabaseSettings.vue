<script setup>
import { reactive, computed } from 'vue';
import { userDatabaseSettingStore } from "@/stores/DatabaseSettingsStore";
import { Message } from "@arco-design/web-vue";

const userDatabaseSetting = userDatabaseSettingStore(); // 获取store
const settings = computed(() => userDatabaseSetting.getSettings()); // 使用计算属性保持响应性
const form = reactive({ ...settings.value });  // 创建一份响应性副本,不直接使用settings作为form的原因是不能页面上的任何修改都能同步到store中,需要点击保存.

// 暂时去掉表单校验
/* const rules = {
    username: [
    {
        required: true,
        message:'username is required',
    },
    ],
    password: [
    {
        required: true,
        message:'password is required',
    },
    ],
    host: [
    {
        type: 'ip',
        required: true,
    }
    ],
    database: [
    {
        required: true,
        message:'database is required',
    }
    ],
} */

const handleSubmit = () => {
    userDatabaseSetting.setSettings(form.username, form.password, form.host, form.database);
    Message.success({
      content: "保存成功"
    });
}
const handleReset = () => {
    form.host = '';
    form.database = '';
    form.username = '';
    form.password = '';
}
</script>

<template>
    <a-page-header title="数据库配置" class="page-header" subtitle="Database Settings" :show-back="false">
        <a-form ref="formRef" :rules="rules" :model="form" :style="{ width: '600px' }" @submit-success="handleSubmit">
            <a-form-item label="服务器地址" field="host" tooltip="输入Mysql服务器IP地址,例如:192.168.1.100">
                <a-input v-model="form.host" placeholder="请输入Mysql服务器IP地址,例如:192.168.1.100" />
            </a-form-item>
            <a-form-item label="数据库" field="database" validate-trigger="blur" tooltip="输入数据库名,例如:test">
                <a-input v-model="form.database" placeholder="请输入数据库名,例如:test" />
            </a-form-item>
            <a-form-item label="用户名" field="username" validate-trigger="blur" tooltip="输入具有对应数据表权限的用户名,例如:root">
                <a-input v-model="form.username" placeholder="请输入具有对应数据表权限的用户名,例如:root" />
            </a-form-item>
            <a-form-item label="密码" field="password" validate-trEigger="blur">
                <a-input-password v-model="form.password" placeholder="请输入密码" />
            </a-form-item>
            <a-form-item>
                <a-space>
                    <a-button type="primary" html-type="submit">保存</a-button>
                    <a-button @click="handleReset">重置</a-button>
                </a-space>
            </a-form-item>
            </a-form>
    </a-page-header>
</template>

<style scoped>
.page-header
{
    box-sizing: border-box;
    height: calc(100% - 50px);
}
/* 页面详情固定高度可滚动 */
.page-header :deep(.arco-page-header-content) {
    border-top: none;
    overflow-y: scroll;
}
</style>