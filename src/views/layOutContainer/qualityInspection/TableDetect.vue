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
const SQL = route.query.SQL;
const tableName = route.query.tableName;
const loading = ref(false);

// 页面初始化 查询所选表的相关信息
onMounted(() => {
  loading.value = true;
  // 从后端获取相关数据
  axios.get('http://localhost:8000/table_detect', {
    params:
    {
      ...databaseSettings.value,
      "SQL": SQL
    }
  })
    .then(response => {
      detectData.value = response.data;
      loading.value = false;
    })
    .catch(error => {
      console.error("Error fetching data: ", error);
      Message.error("访问数据库失败，请检查数据库配置是否有误！")
      loading.value = false;
    })
});

const scrollPercent = reactive({
  x: '300%',
  y: '100%'
});

const detectColumns = [
  {
    title: '字段名',
    dataIndex: 'key',
    fixed: 'left',
    width: 150,
  },
  {
    title: '类型',
    dataIndex: 'type',
  },
  {
    title: '计数',
    dataIndex: 'size',
  },
  {
    title: '缺失率',
    dataIndex: 'missing',
  },
  {
    title: '唯一值计数',
    dataIndex: 'unique',
  },
  {
    title: '均值或top1',
    dataIndex: 'mean_or_top1',
  },
  {
    title: '标准差或top2',
    dataIndex: 'std_or_top2',
  },
  {
    title: '最小值或top3',
    dataIndex: 'min_or_top3',
  },
  {
    title: '1%_or_top4',
    dataIndex: '1%_or_top4',
  },
  {
    title: '10%_or_top5',
    dataIndex: '10%_or_top5',
  },
  {
    title: '50%_or_bottom5',
    dataIndex: '50%_or_bottom5',
  },
  {
    title: '75%_or_bottom4',
    dataIndex: '75%_or_bottom4',
  },
  {
    title: '90%_or_bottom3',
    dataIndex: '90%_or_bottom3',
  },
  {
    title: '99%_or_bottom2',
    dataIndex: '99%_or_bottom2',
  },
  {
    title: '最大值或bottom1',
    dataIndex: 'max_or_bottom1',
  },
];


const detectData = reactive([]);

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
  // 探查结果
  const detectwithHeader = [
    ['探查结果'],
    [...detectColumns.map(column => column.title)],
    ...detectData.value.map(item => Object.values(item))
  ];

  console.log(detectwithHeader)
  const detectSheet = XLSX.utils.aoa_to_sheet(detectwithHeader);

  // 匹配第一行
  let firstRowPattern = `^[\\D]+(?:1)$`;
  // 匹配第二行
  let secondRowPattern = `^[\\D]+(?:2)$`;
  const regexFirstRow = new RegExp(firstRowPattern, 'g');
  const regexSecondRow = new RegExp(secondRowPattern, 'g');
  // 开始设置单元格格式
  for (let i in detectSheet)
  {
    if(i.match(regexFirstRow)) 
    {
      detectSheet[i].s = {
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
    else if (i.match(regexSecondRow))
    {
      detectSheet[i].s = {
        font: {
          color: { rgb: "FFFFFF" },
          sz:"11"
        },
        fill:{
          fgColor:{ rgb: "000000" }
        }
      }
    }
    else if (i.indexOf('!') === -1)
    {
      detectSheet[i].s ={
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
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
          wrapText: true
        }
      }
    }
  }
  
  // 合并单元头
  detectSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
  ]

  let i = 15; // 定义列数
  let cols = [];

  for(let j = 0; j < i; j++) {
      cols.push({wpx: 150});
  }
  // 合并单元格
  detectSheet['!cols'] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, detectSheet, '字段探查');

  // 导出 Excel 文件
  XLSX.writeFile(workbook, tableName + '-字段探查.xlsx');
}
</script>

<template>
  <a-page-header title="字段探查" class="page-header" subtitle="Field Exploration" @back="handleBack">
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
        <a-collapse class="collapse" :bordered="false" expand-icon-position="right" :default-active-key="['1']">
          <a-collapse-item header="探查结果" :style="customStyle" key="1">
            <template #extra>
              <svg class="collapse-icon" width="14px" height="14px" viewBox="0 0 48 48" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M41.667 5C42.955 5 44 5.895 44 7v34c0 1.105-1.045 2-2.333 2H6.333C5.045 43 4 42.105 4 41V7c0-1.105 1.045-2 2.333-2h35.334zM14 32H8v7h6v-7zm26 0H18v7h22v-7zM14 20H8v8h6v-8zm26 0H18v8h22v-8zM14 9H8v7h6V9zm26 0H18v7h22V9z"
                  fill="currentColor" />
              </svg>
            </template>
            <a-table :pagination="false" :columns="detectColumns" :data="detectData.value" :scroll="scrollPercent"
              :scrollbar="true" />
          </a-collapse-item>
        </a-collapse>
      </div>
    </a-spin>
  </a-page-header>

</template>

<style scoped>
.page-header{
  width: 100%;
}
/* 页面详情固定高度可滚动 */
.page-header :deep(.arco-page-header-content) {
  height: calc(100% - 80px);
  width:100%;
  box-sizing: border-box;
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
