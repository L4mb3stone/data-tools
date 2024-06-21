<script setup>
import { reactive, onMounted, ref, toRefs, watch, computed } from 'vue';
import axios from 'axios'
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { userDatabaseSettingStore } from "@/stores/DatabaseSettingsStore";
import { Message } from "@arco-design/web-vue";
import * as XLSX from 'xlsx-js-style';

const router = useRouter();
const route = useRoute();
const userDatabaseSetting = userDatabaseSettingStore(); // 获取数据库配置信息
const databaseSettings = computed(() => userDatabaseSetting.getSettings()); // 使用计算属性保持响应性
const tableName = route.query.tableName;
const loading = ref(false);

// 页面初始化 查询所选表的相关信息
onMounted(() => {
  loading.value = true;
  // 从后端获取相关数据
  axios.get('http://localhost:8000/table_summary', {
    params:
    {
      ...databaseSettings.value,
      "table_name": tableName
    },
    timeout: 18000
  })
    .then(response => {
      summarydata[1].value = response.data.primary_key;
      summarydata[2].value = response.data.record_count;
      summarydata[3].value = response.data.distinct_count;
      ddlData.value = response.data.ddl_columns;
      timeData.value = response.data.time_columns;
      loading.value = false;
    })
    .catch(error => {
      if (error.message.startsWith("timeout")) {
        Message.error("请求数据超时！")
      }
      console.error("Error fetching data: ", error);
      Message.error("访问数据库失败，请检查数据库配置是否有误！")
      loading.value = false;
    })
});

const summarydata = [{
  label: '表名',
  value: tableName,
}, {
  label: '主键',
  value: '',
},
{
  label: '记录数',
  value: '',
},
{
  label: '去重记录数',
  value: '',
}
];

const ddlColumns = [
  {
    title: '字段名',
    dataIndex: 'column',
  },
  {
    title: '描述名',
    dataIndex: 'comment',
  },
  {
    title: '字段类型',
    dataIndex: 'type',
  },
  {
    title: '是否主键',
    dataIndex: 'isPrimary',
  },
  {
    title: '是否索引',
    dataIndex: 'isIndex',
  },
];

const timeColumns = [
  {
    title: '字段名',
    dataIndex: 'column',
  },
  {
    title: '字段类型',
    dataIndex: 'type',
  },
  {
    title: '最早记录时间',
    dataIndex: 'earliestRecordTime',
  },
  {
    title: '最新记录时间',
    dataIndex: 'lastRecordTime',
  },
];
const timeData = reactive([]);

const ddlData = reactive([]);

const handleBack = () => {
  // 返回总览页面
  router.push("/qualityInspection/overview");
}

// 自定义样式
const customStyle = {
  marginBottom: '18px',
  border: 'none',
  overflow: 'hidden',
}

const exportToExcel = () => {
  const combineData = [
    ['摘要'],
    ['指标名', '指标值'],
    ...summarydata.map(item => [item.label, item.value]),
    [],
    ['表结构'],
    ['字段名', '字段类型', '描述名', '是否主键', '是否索引'],
    ...ddlData.value.map(item => [item.column, item.type, item.comment, item.isPrimary, item.isIndex]),
    [],
    ['时间维度数据'],
    ['字段名', '字段类型', '最早记录时间', '最新记录时间'],
    ...timeData.value.map(item => [item.column, item.type, item.earliestRecordTime, item.lastRecordTime])
  ]

  const combineSheet = XLSX.utils.aoa_to_sheet(combineData);

  let columnsOffset = ddlData.value.length + 10;
  const i = ref(columnsOffset + 2)
  // 正则匹配表头
  let regexPattern = `^[\\D]+(?:${i.value}|[29])$`;
  const regex = new RegExp(regexPattern, 'g');
  // 开始设置单元格格式
  for (let i in combineSheet)
  {
    if(i.match(regex)) 
    {
      combineSheet[i].s = {
        font: {
          color: { rgb: "FFFFFF" },
          sz:"11"
        },
        fill:{
          fgColor:{ rgb: "000000" }
        }
      }
    }
    else if (i === 'A1' || i === 'A8' || i === ('A' + (columnsOffset+1)))
    {
      combineSheet[i].s = {
        font: {
          color: { rgb: "FFFFFF" },
          bold: true,
          sz:"14"
        },
        fill:{
          fgColor:{ rgb: "808080" }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true
        }
      }
    }
    else if (i.indexOf('!') === -1)
    {
      combineSheet[i].s ={
        // 单元格边框
        border: {
            top: {
              style: 'thin'
            },
            bottom: {
              style: 'thin'
            },
            left: {
              style: 'thin'
            },
            right: {
              style: 'thin'
            }
        }
      }
    }
  }
  // 合并单元头
  combineSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 4 } },
    { s: { r: columnsOffset, c: 0 }, e: { r: columnsOffset, c: 3 } },
  ]
  // 设置单元格宽度
  combineSheet['!cols'] = [
    {wpx: 150}, 
    {wpx: 150}, 
    {wpx: 150}, 
    {wpx: 150},
    {wpx: 150}
  ]
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, combineSheet, '总体结果');

  // 导出 Excel 文件
  XLSX.writeFile(workbook, tableName + '-总体结果.xlsx');
}
</script>

<template>
  <a-page-header title="总体结果" class="page-header" subtitle="Overall Results" @back="handleBack">
    <template #extra>
      <a-space style="padding-right:32px">
        <a-button @click="exportToExcel">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 48 48" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M9 36a1 1 0 011 1v3h28v-3a1 1 0 011-1h2a1 1 0 011 1v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a1 1 0 011-1h2zM23 5h2a1 1 0 01.993.883L26 6v22.071l6.02-6.02a1 1 0 011.32-.084l.095.084 1.414 1.414a1 1 0 01.084 1.32l-.084.094-9.9 9.9a1 1 0 01-1.32.083l-.093-.084-9.9-9.9a1 1 0 01-.083-1.32l.083-.093 1.414-1.415a1 1 0 011.32-.083l.095.084 5.534 5.535L22 6a1 1 0 01.883-.993L23 5h2-2z"
                fill="currentColor" />
            </svg>
          </template>
          生成报告
        </a-button>
      </a-space>
    </template>
    <a-spin :loading="loading" style="height: 100%;width: 100%;" tip="This may take a while...">
      <div class="summary">
        <a-collapse class="collapse" :bordered="false" expand-icon-position="right" :default-active-key="['1', '2', '3']">
          <a-collapse-item header="摘要" :style="customStyle" key="1">
            <template #extra>
              <svg class="collapse-icon" width="14px" height="14px" viewBox="0 0 48 48" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M41 29a1 1 0 011 1v13.929a2 2 0 01-2.809 1.829L35 43.905l-4.191 1.853A2 2 0 0128 43.928V30a1 1 0 011-1h12zM39 4a2 2 0 011.995 1.85L41 6l-.001 18.999h-4L37 8H9v33h15v4H7a2 2 0 01-1.995-1.85L5 43V6a2 2 0 011.85-1.995L7 4h32zm-1 29h-6v7.858l3-1.327 3 1.327V33zM26 23a1 1 0 011 1v1.5a1 1 0 01-1 1H13a1 1 0 01-1-1V24a1 1 0 011-1h13zm7-9a1 1 0 011 1v1.5a1 1 0 01-1 1H13a1 1 0 01-1-1V15a1 1 0 011-1h20z"
                  fill="currentColor" />
              </svg>
            </template>
            <a-descriptions style="margin-top: 10px;" :data="summarydata" size="medium" :column="1" />
          </a-collapse-item>
          <a-collapse-item header="表结构" :style="customStyle" key="2">
            <template #extra>
              <svg class="collapse-icon" width="14px" height="14px" viewBox="0 0 48 48" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M41.667 5C42.955 5 44 5.895 44 7v34c0 1.105-1.045 2-2.333 2H6.333C5.045 43 4 42.105 4 41V7c0-1.105 1.045-2 2.333-2h35.334zM14 32H8v7h6v-7zm26 0H18v7h22v-7zM14 20H8v8h6v-8zm26 0H18v8h22v-8zM14 9H8v7h6V9zm26 0H18v7h22V9z"
                  fill="currentColor" />
              </svg>
            </template>
            <a-table :pagination="false" :columns="ddlColumns" :data="ddlData.value" />
          </a-collapse-item>
          <a-collapse-item header="时间维度数据" :style="customStyle" key="3">
            <template #extra>
              <svg class="collapse-icon" width="14px" height="14px" viewBox="0 0 48 48" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M39.794 8.5l-6.928-4a1 1 0 00-1.366.366l-1 1.732a1 1 0 00.366 1.366l6.928 4a1 1 0 001.366-.366l1-1.732a1 1 0 00-.366-1.366zm-25-3a1 1 0 011.366.366l1 1.732a1 1 0 01-.366 1.366l-6.928 4a1 1 0 01-1.366-.366l-1-1.732A1 1 0 017.866 9.5l6.928-4zm9.536 4.732c9.389 0 17 7.611 17 17s-7.611 17-17 17-17-7.611-17-17 7.611-17 17-17zm0 4c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13-5.82-13-13-13zm1.993 4.883a1 1 0 00-.993-.883h-2l-.116.007a1 1 0 00-.884.993v8.845l5.515 6.704.086.092a1 1 0 001.322.045l1.544-1.271.092-.086a1 1 0 00.045-1.322l-4.604-5.596v-7.411l-.007-.117z"
                  fill="currentColor" />
              </svg>
            </template>
            <a-table :pagination="false" :columns="timeColumns" :data="timeData.value" />
          </a-collapse-item>
        </a-collapse>
        <!-- <a-button class="start-btn" type="primary" size="large">生成文件</a-button> -->
      </div>
    </a-spin>
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

.summary {
  height: 100%;
  width: 100%;
}

.collapse {
  margin-bottom: 10px;
}

.collapse-icon {
  position: absolute;
  top: 50%;
  left: 13px;
  text-align: center;
  transform: translateY(-50%);
}

/* 改变collapse-item组件样式 */
:deep(.collapse .arco-collapse-item-content) {
  background-color: var(--color-bg-2);
}

/* 去掉表格组件的边框、背景颜色以及左padding，并把表头加粗 */
.collapse :deep(.arco-table .arco-table-cell) {
  padding: 9px 16px 9px 0px;
}

.collapse :deep(.arco-table-th) {
  border: none;
  background-color: var(--color-bg-2);
  font-weight: bold;
}

.collapse :deep(.arco-table-tr) {
  border: none;
}

.collapse :deep(.arco-table-td) {
  border: none;
}

.collapse :deep(.arco-table-container) {
  border: none;
}

.collapse :deep(.arco-collapse-item-header-right) {
  padding-left: 38px;
}
</style>
