<script setup>
import { reactive, ref, toRefs, watch, computed } from 'vue';
import axios from 'axios'
import { useRouter } from "vue-router";
import { userDatabaseSettingStore } from "@/stores/DatabaseSettingsStore";

const router = useRouter();

const userDatabaseSetting = userDatabaseSettingStore(); // 获取数据库配置信息
const databaseSettings = computed(() => userDatabaseSetting.getSettings()); // 使用计算属性保持响应性
// 接收父组件传过来的参数，选择的表名
const props = defineProps({ selectedKeys: { type: Array, default: () => [] } });
const { selectedKeys } = toRefs(props);
const SQL = ref('');
// 定义form组件变量：大小，默认值，表单验证状态，表单验证规则，表单提交函数
const size = ref('medium');
const formRef = ref(null);
const form = reactive({
    tableName: '',
    section: '',
    selectedFieldList: [],
    dateField: '',
    filterList: [{ field: '', condition: '', value: '' }]
});

let formValidateStatus = ref({
    tableName: '',
    section: '',
});

// 定义输入框的验证规则
const rules = {
    tableName: [
        {
            required: true,
            validator: (value, cb) => {
                if (!value) {
                    cb('必须选择一张表')
                    formValidateStatus.value.tableName = 'error'
                } else {
                    cb()
                    formValidateStatus.value.tableName = 'success'
                }
            }
        }
    ],
    section: [
        {
            required: true,
            validator: (value, cb) => {
                if (!value) {
                    cb('必须选择探查方式')
                    formValidateStatus.value.section = 'error'
                } else {
                    cb()
                    formValidateStatus.value.section = 'success'
                }
            }
        }
    ],
}

// 字段选择下拉框 选项列表
const fieldList = ref([]);
const loading = ref(false);

// 监听父组件传过来的参数，更新到表单的表名，并手动触发表单验证
watch(selectedKeys, (newMessage, oldMessage) => {
    form.tableName = newMessage[0];
    formRef.value.validateField('tableName');
    // 判断tableName不为空且不包含文件路径字符
    if (form && form.tableName && form.tableName != '' && !form.tableName.match(/\.\/|\.\\/)) {
        // 从后端获取字段列表
        loading.value = true;
        axios.get('http://localhost:8000/table_columns', {
            params:
            {
                ...databaseSettings.value,
                "table_name": form.tableName
            }
        })
            .then(response => {
                fieldList.value = response.data;
                loading.value = false;
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                Message.error("访问数据库失败，请检查数据库配置是否有误！")
                loading.value = false;
            })
    }
});


const handleSubmit = (data) => {
    switch (form.section) {
        case '1':
            // 转跳到总体结果页面
            router.push({
                path: "/qualityInspection/summary",
                query: {
                    tableName: form.tableName,
                }
            });
            break;
        case '2':
            SQL.value = generateSelectSQL(data.tableName, data.selectedFieldList, [], '');
            // 转跳到表探测页面
            router.push({
                path: "/qualityInspection/tableDetect",
                query: {
                    tableName: form.tableName,
                    SQL: SQL.value,
                }
            });
            break;
        case '3':
            SQL.value = generateSelectSQL(data.tableName, data.selectedFieldList, data.filterList, data.dateField);
            // 转跳到表探测页面
            router.push({
                path: "/qualityInspection/distributionDetect",
                query: {
                    tableName: form.tableName,
                    SQL: SQL.value,
                    dateField: data.dateField,
                }
            });
            break;
        default:
            console.log('Default Case');
    }
};

// 字段选择下拉的 全选 按钮状态
const fieldChecked = ref(false);
// 字段选择下拉状态
const popupVisible = ref(false);
// 处理字段选择下拉框 全选 逻辑
const handleSelectAll = () => {
    fieldChecked.value = !fieldChecked.value;
    if (fieldChecked.value) {
        form.selectedFieldList = fieldList.value;
    } else {
        form.selectedFieldList = [];
    }
}

// 筛选条件下选项列表
const filteringConditionList = ref([
    { label: "等于", value: "=" },
    { label: "不等于", value: "!=" },
    { label: "大于", value: ">" },
    { label: "小于", value: "<" },
    { label: "大于等于", value: ">=" },
    { label: "小于等于", value: "<=" },
    { label: "包含", value: "in" },
    { label: "不包含", value: "not in" },
]);

const handleFilterAdd = () => {
    form.filterList.push({
        field: '', condition: '', value: ''
    })
};

const handleFilterDelete = (index) => {
    form.filterList.splice(index, 1)
}
const reset = () => {
    if (formRef) {
        // 重置表单状态
        formValidateStatus.value.tableName = '';
        formValidateStatus.value.section = '';
        formRef.value.resetFields();
    }
}

// 处理form，转化为sql
const generateSelectSQL = (tableName, selectedFieldList, filterList, dateField) => {
    if (!selectedFieldList || selectedFieldList.length === 0) {
        selectedFieldList = ['*'];
    }
    if (!tableName) {
        throw new Error("tableName is required");
    }

    // Add dateField to selectedFieldList if it's not already included
    if (selectedFieldList[0] != '*' && dateField && !selectedFieldList.includes(dateField)) {
        selectedFieldList.push(dateField);
    }
    // Begin constructing the SQL query
    let sql = `SELECT ${selectedFieldList.join(', ')} FROM ${tableName}`;

    // Filter out invalid filterList entries
    const validFilters = filterList.filter(filter =>
        filter.field && filter.condition && filter.value
    );

    // Construct the WHERE clause based on the valid filters
    if (validFilters.length > 0) {
        const conditions = validFilters.map(filter => {
            const { field, condition, value } = filter;

            // Convert Chinese comma to English comma
            const formattedValue = typeof value === 'string' ? value.replace(/，/g, ',') : value;

            switch (condition) {
                case 'in':
                case 'not in':
                    const inValues = Array.isArray(formattedValue) ? formattedValue : formattedValue.split(',');
                    return `${field} ${condition.toUpperCase()} (${inValues.map(val => `'${val.trim()}'`).join(', ')})`;
                case '>':
                case '<':
                case '>=':
                case '<=':
                case '=':
                case '!=':
                    return `${field} ${condition} '${formattedValue}'`;
                default:
                    throw new Error(`Unsupported condition: ${condition}`);
            }
        });

        sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    return sql;
}
</script>

<template>
    <a-page-header title="数据探查" class="page-header" subtitle="Data Exploration" :show-back="false">
        <a-form ref="formRef" :model="form" :style="{ width: '600px', marginTop: '20px' }" :size="size" :rules="rules"
            :scrollToFirstError="true" @submit-success="handleSubmit">
            <a-form-item field="tableName" label="表名" :validate-status="formValidateStatus.tableName" feedback>
                <a-input v-model="form.tableName" placeholder="请在左侧选择需要检测的表..." disabled />
            </a-form-item>
            <a-form-item tooltip="总体结果: 探查表的概览信息，包括数据量、表字段和时间字段最早及最新日期；
                                  字段探查: 探查表中所选字段的字段探查: 探查表中所选字段的数据分布、缺失值、数据类型、唯一值、分布情况等；
                                  稳定探查: 探查表中字段按月/季/年的统计数据，以及环比同比变化。" field="section" label="探查方式"
                :validate-status="formValidateStatus.section" feedback>
                <a-select v-model="form.section" placeholder="请选择...">
                    <a-option value="1">总体结果</a-option>
                    <a-option value="2">字段探查</a-option>
                    <a-option value="3">稳定探查</a-option>
                </a-select>
            </a-form-item>
            <TransitionGroup name="list" tag="ul" style="padding-inline-start: 0px">
                <a-form-item v-if="form.section == 3" field="dateField" label="时间字段"
                    :rules="[{ required: true, message: '时间字段不能为空' }]">
                    <a-select v-model="form.dateField" placeholder="请选择探测时间维度基准的时间字段..."><a-option
                            v-for="field in fieldList" :value="field" :label="field"></a-option></a-select>
                </a-form-item>
                <a-form-item v-if="form.section == 2 || form.section == 3" field="selectedFieldList" label="字段选择"
                    tooltip="不选默认全部字段">
                    <a-select v-model:popup-visible="popupVisible" v-model="form.selectedFieldList" :loading="loading"
                        placeholder="请选择需要探查的字段..." multiple>
                        <a-option v-for="field in fieldList" :value="field" :label="field"></a-option>
                        <template #header>
                            <div style="padding: 6px 12px;">
                                <a-checkbox :model-value="fieldChecked" @change="handleSelectAll">全选</a-checkbox>
                            </div>
                        </template>
                    </a-select>
                </a-form-item>
                <a-form-item v-if="form.section == 3" field="filterList" label="筛选条件"
                    v-for="(filter, index) of form.filterList" :key="index">
                    <a-space>
                        <a-select v-model="filter.field" placeholder="筛选字段..."><a-option v-for="field in fieldList"
                                :value="field" :label="field"></a-option></a-select>
                        <a-select v-model="filter.condition" placeholder="筛选条件..."><a-option
                                v-for="field in filteringConditionList" :value="field.value"
                                :label="field.label"></a-option></a-select>
                        <a-input v-model="filter.value" placeholder="筛选值..." />
                        <a-button @click="handleFilterDelete(index)">
                            <svg width="16px" height="16px" viewBox="0 0 48 48" fill="currentColor">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M30 4a2 2 0 012 2l-.001 1.999L42.719 8c.445 0 .606.046.77.134.162.087.29.215.377.378.088.163.134.324.134.77v1.436c0 .446-.046.607-.134.77a.908.908 0 01-.378.378c-.163.088-.324.134-.77.134L40 11.999 40 42a2 2 0 01-2 2H10a2 2 0 01-2-2l-.001-30.001L5.282 12c-.446 0-.607-.046-.77-.134a.908.908 0 01-.378-.378c-.088-.162-.134-.324-.134-.77V9.282c0-.446.046-.607.134-.77a.909.909 0 01.378-.378c.163-.088.324-.134.77-.134l10.717-.001L16 6a2 2 0 012-2h12zm5.999 7.999h-24L12 40h24l-.001-28.001zM21 18a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V19a1 1 0 011-1h2zm8 0a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V19a1 1 0 011-1h2z"
                                    fill="currentColor" />
                            </svg>
                        </a-button>
                    </a-space>
                </a-form-item>
            </TransitionGroup>
            <a-form-item>
                <a-space>
                    <Transition>
                        <a-button type="primary" v-if="form.section == 3" @click="handleFilterAdd">新增筛选条件</a-button>
                    </Transition>
                    <a-button type="primary" html-type="submit">提交</a-button>
                    <!-- 筛选条件暂时没法重置，后续debug一下 -->
                    <a-button @click="reset">重置</a-button>
                </a-space>
            </a-form-item>
        </a-form>
    </a-page-header>
</template>

<style scoped>
/* 页面详情固定高度可滚动 */
.page-header :deep(.arco-page-header-content) {
    height: calc(100% - 80px);
    /* box-sizing: content-box; */
    overflow-y: scroll;
}

.page-header :deep(.arco-page-header-content)::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.page-header :deep(.arco-page-header-content)::-webkit-scrollbar-track {
    background-color: #f1f1f100;
}

.page-header :deep(.arco-page-header-content)::-webkit-scrollbar-thumb {
    background-color: #f1f1f100;
    border-radius: 5px;
}

.page-header :deep(.arco-page-header-content):hover::-webkit-scrollbar-thumb {
    background-color: var(--color-neutral-4);
    border-radius: 5px;
}

.list-move,
/* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>