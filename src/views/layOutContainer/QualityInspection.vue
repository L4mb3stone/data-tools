<script setup>
import { watch, ref, computed, reactive } from "vue";
import MyMask from "@/components/Mask.vue";
import { useRouter } from "vue-router";
import { Modal } from '@arco-design/web-vue';
import axios from 'axios'
import { userDatabaseSettingStore } from "@/stores/DatabaseSettingsStore";
import { Message } from "@arco-design/web-vue";

const router = useRouter();
const userDatabaseSetting = userDatabaseSettingStore(); // 获取数据库配置信息
const databaseSettings = computed(() => userDatabaseSetting.getSettings()); // 使用计算属性保持响应性

// 转跳到数据库配置页面
const routerToSetting = () => {
  router.push("/databaseSettings");
};

//获取遮罩的实例
let maskRef = ref(null);
//打开弹窗
let openDialog = () => {
  maskRef.value.showMask();
};

//关闭弹窗
let closeDialog = () => {
  maskRef.value.closeMask();
};

let selectedKeys = ref([]);
watch(selectedKeys, (newMessage, oldMessage) => {
  if (newMessage[0] === originTreeData[0].key || newMessage[0] === originTreeData[1].key || newMessage[0].startsWith('./')
  ) {
    selectedKeys.value = ['']
  } else {
    selectedKeys.value = newMessage;
  }
});

// 后续使用文件上传的时候可能需要用到树的title字段
let selectedNode = ref([]);
const onSelect = (newSelectedKeys, event) => {
  selectedNode.value = event.selectedNodes;
};


const originTreeData = reactive([
  {
    title: '数据库表',
    key: 'dbTable',
    children: [
    ],
  },
  {
    title: '本地文件表',
    key: 'fileTable',
    children: [
    ],
  }
]);

const searchKey = ref('');
const treeData = computed(() => {
  if (!searchKey.value) return originTreeData;
  return searchData(searchKey.value);
});

const searchData = (keyword) => {
  const loop = (data) => {
    const result = [];
    data.forEach(item => {
      if (item.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
        result.push({ ...item });
      } else if (item.children) {
        const filterData = loop(item.children);
        if (filterData.length) {
          result.push({
            ...item,
            children: filterData
          })
        }
      }
    })
    return result;
  }

  return loop(originTreeData);
};

const getMatchIndex = (title) => {
  if (!searchKey.value) return -1;
  return title.toLowerCase().indexOf(searchKey.value.toLowerCase());
};

// 点击节点时，异步调用接口查询数据库表数据
const loadMore = (nodeData) => {
  if (nodeData.key == 'dbTable') {
    if (checkIsSetDatabase()) {
      return getTables()
        .then(response => {
          nodeData.children = response.data;
          for (const node of nodeData.children) {
            node.isLeaf = true;
          }
        });
    } else {
      return new Promise((resolve) => { resolve(); });
    }
  }
  else {
    return new Promise((resolve) => {
      setTimeout(() => {
        nodeData.children = [
          { title: `暂不支持`, key: `./${nodeData.key}-1`, isLeaf: true },
        ];
        resolve();
      }, 1000);
    });
  }
};
// 刷新数据库连接
const refleshConnection = () => {
  if (checkIsSetDatabase()) {
    getTables()
      .then(response => {
        originTreeData[0].children = response.data;
        for (const node of originTreeData[0].children) {
          node.isLeaf = true;
        }
      });
  }
  closeDialog();
}
// 上传文件校验
const beforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: '上传文件',
      content: `确认上传 ${file.name}`,
      onOk: () => resolve(true),
      onCancel: () => reject('cancel'),
    });
  });
};

// 检查数据库配置是否填写
const checkIsSetDatabase = () => {
  let settings = databaseSettings.value
  if (settings.username == '' || settings.password == '' || settings.host == '' || settings.database == '') {
    Message.error("数据库配置尚未填写或存在空值！")
    return false;
  }
  return true;
}

// 获取连接数据库的表
const getTables = () => {
  return axios.get('http://localhost:8000/tables', { params: databaseSettings.value })
    .catch(error => {
      console.error("Error fetching data: ", error);
      Message.error("访问数据库失败，请检查数据库配置是否有误！")
    })
}
</script>

<template>
  <a-layout style="height: calc(100vh - 50px);">
    <div class="inspection-sider">
      <my-mask ref="maskRef" :close-on-click-modal="true">
        <div class="dialog">
          <a-space direction="vertical" fill>
            <a-button-group>
              <a-button type="primary" @click="refleshConnection">刷新连接</a-button>
              <a-tooltip content="转跳到数据库配置" position="top" mini>
                <a-button type="primary" @click="routerToSetting">
                  <template #icon>
                    <svg width="16px" height="16px" viewBox="0 0 48 48" fill="#000000">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M28.767 2.71A21.685 21.685 0 0024 2.182c-1.618 0-3.215.178-4.768.528l-.897.202-2.795 6.373-6.883-.752-.622.677a21.82 21.82 0 00-4.772 8.295l-.27.872L7.089 24 3.53 28.886l-.537.737.27.872a21.82 21.82 0 004.772 8.295l.622.677 6.883-.752 2.426 5.531.369.842.896.202c1.554.35 3.15.528 4.769.528 1.618 0 3.214-.178 4.767-.528l.897-.201 2.796-6.374 6.883.752.622-.677a21.82 21.82 0 004.771-8.294l.27-.871L40.912 24l3.559-4.887.537-.738-.27-.87a21.82 21.82 0 00-4.772-8.295l-.622-.677-6.883.752-2.796-6.373-.897-.202zM20.916 6.08A18.109 18.109 0 0124 5.818c1.043 0 2.073.089 3.084.263l2.24 5.109a2.976 2.976 0 003.05 1.763l5.507-.603a18.182 18.182 0 013.096 5.382l-3.289 4.516a2.976 2.976 0 000 3.504l3.289 4.516a18.182 18.182 0 01-3.096 5.382l-5.508-.603a2.976 2.976 0 00-3.049 1.763l-2.24 5.109c-1.011.174-2.041.263-3.084.263-1.043 0-2.073-.089-3.084-.263l-2.24-5.108a2.976 2.976 0 00-3.05-1.764l-5.508.603a18.185 18.185 0 01-3.095-5.383l3.289-4.515c.76-1.044.76-2.46 0-3.504l-3.29-4.515a18.186 18.186 0 013.096-5.383l5.509.603a2.976 2.976 0 003.049-1.763l2.24-5.109zM24 14.91c5.004 0 9.056 4.072 9.056 9.091 0 5.019-4.052 9.09-9.056 9.09S14.944 29.02 14.944 24s4.052-9.09 9.056-9.09zM18.58 24c0-3.014 2.429-5.454 5.42-5.454s5.42 2.44 5.42 5.454-2.429 5.455-5.42 5.455-5.42-2.44-5.42-5.455z"
                        fill="#FFFFFF" />
                    </svg>
                  </template>
                </a-button>
              </a-tooltip>
            </a-button-group>
            <a-upload action="/" @before-upload="beforeUpload">
              <template #upload-button>
                <a-button type="primary" disabled long> 上传文件
                </a-button>
              </template>
            </a-upload>
          </a-space>
        </div>
      </my-mask>
      <a-layout-sider class="table-list">
        <a-input-search style="margin-bottom: 8px; max-width: 240px" v-model="searchKey" />
        <a-tree ref="treeRef" :data="treeData" :show-line="false" v-model:selected-keys="selectedKeys" @select="onSelect"
          :load-more="loadMore">
          <template #title="nodeData">
            <template v-if="index = getMatchIndex(nodeData?.title), index < 0">{{ nodeData?.title }}</template>
            <span v-else>
              {{ nodeData?.title?.substr(0, index) }}
              <span style="color: var(--color-primary-light-4);">
                {{ nodeData?.title?.substr(index, searchKey.length) }}
              </span>{{ nodeData?.title?.substr(index + searchKey.length) }}
            </span>
          </template>
        </a-tree>
      </a-layout-sider>
      <a-layout-footer class="inspection-footer">
        <a-button type="text" @click="openDialog" style="color:black;" long>
          操作
          <template #icon>
            <svg width="16px" height="16px" viewBox="0 0 48 48" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M12 18v4H8v20h32V22h-4v-4h6a2 2 0 012 2v24a2 2 0 01-2 2H6a2 2 0 01-2-2V20a2 2 0 012-2h6zm21 16a1 1 0 011 1v2a1 1 0 01-1 1H15a1 1 0 01-1-1v-2a1 1 0 011-1h18zm0-8a1 1 0 011 1v2a1 1 0 01-1 1H15a1 1 0 01-1-1v-2a1 1 0 011-1h18zM23.009 2.358l1.894.006a1 1 0 01.99.878l.007.116.071 12.218 4.242-4.242a1 1 0 011.32-.083l.094.083 1.415 1.414a1 1 0 01.083 1.32l-.083.095-7.779 7.778a2 2 0 01-2.7.117l-.128-.117-7.778-7.778a1 1 0 01-.083-1.32l.083-.095 1.414-1.414a1 1 0 011.32-.083l.094.083 4.593 4.595-.072-12.565a1.002 1.002 0 011.003-1.006z"
                fill="currentColor" />
            </svg>
          </template>
        </a-button>
      </a-layout-footer>
    </div>
    <router-view :selectedKeys="selectedKeys" v-slot="{ Component }">
      <Transition name="slide-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </a-layout>
</template>

<style scoped>
/* 美化列表和列表项 */
.home-page {
  display: flex;
}

.inspection-sider {
  box-sizing: border-box;
  padding-bottom: 64px;
  position: relative;
}

.inspection-footer {
  max-width: 240px;
  padding-left: 1em;
  padding-right: 2em;
  padding-top: 8px;
  padding-bottom: 8px;
}

.table-list {
  padding-left: 1em;
  padding-right: 1em;
  padding-top: 16px;
  height: 100%;
  box-shadow: none;
  background: none;
}

.page-header {
  width: 100%;
}

/* 去掉上分隔线 */
:deep(.page-header .arco-page-header-content) {
  border-top: none;
}

.summary {
  width: 100%;
  padding-right: 1em;
}

.collapse-icon {
  height: 40.5px;
  display: flex;
  text-align: center;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid var(--color-neutral-3);
}

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* 设置上传组件宽度，再利用button的long属性 保持和其他button一致 */
.dialog :deep(.arco-upload) {
  width: 100%
}
</style>
