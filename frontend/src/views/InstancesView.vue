<template>
  <v-container class="pa-4" fluid>
    <!-- 頂部標題區 -->
    <div class="d-flex align-center mb-6">
      <v-icon
        icon="mdi-server-network"
        size="32"
        color="primary"
        class="me-3"
      ></v-icon>
      <h1 class="text-h4 font-weight-medium mb-0">Node-RED 實例管理</h1>
    </div>

    <!-- 實例列表卡片 -->
    <v-card elevation="1">
      <!-- 列表工具列 -->
      <v-card-title class="py-4 px-6 d-flex">
        <span class="text-h6">實例列表</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog"
          density="comfortable"
          class="px-4"
        >
          新增實例
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- 實例表格 -->
      <v-data-table
        :headers="headers"
        :items="instances"
        :loading="loading"
        hover
        class="instance-table"
      >
        <template v-slot:item.name="{ item }">
          <div class="font-weight-medium">{{ item.name }}</div>
        </template>

        <template v-slot:item.description="{ item }">
          <div class="text-body-2 font-weight-medium">{{ item.description }}</div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            class="text-capitalize"
            density="comfortable"
            variant="flat"
          >
            <v-icon
              start
              size="small"
              :icon="getStatusIcon(item.status)"
              class="me-1"
            ></v-icon>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.port="{ item }">
          <div class="text-body-2 font-weight-medium">{{ item.port }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              icon="mdi-play"
              color="success"
              :disabled="item.status === 'running'"
              @click="startInstance(item)"
              :title="'啟動'"
              size="32"
              variant="text"
              density="comfortable"
              class="mr-1"
            ></v-btn>
            <v-btn
              icon="mdi-stop"
              color="error"
              :disabled="item.status === 'stopped'"
              @click="stopInstance(item)"
              :title="'停止'"
              size="32"
              variant="text"
              density="comfortable"
              class="mr-1"
            ></v-btn>
            <v-btn
              icon="mdi-text-box-outline"
              color="info"
              @click="showLogs(item)"
              :title="'日誌'"
              size="32"
              variant="text"
              density="comfortable"
              class="mr-1"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              color="error"
              @click="confirmDelete(item)"
              :title="'刪除'"
              size="32"
              variant="text"
              density="comfortable"
              class="mr-1"
            ></v-btn>
            <v-btn
              icon="mdi-open-in-new"
              :href="getNodeRedUrl(item.port)"
              target="_blank"
              color="primary"
              :title="'開啟介面'"
              size="32"
              variant="text"
              density="comfortable"
            ></v-btn>
          </div>
        </template>

        <!-- 無數據顯示 -->
        <template v-slot:no-data>
          <div class="d-flex flex-column align-center py-8">
            <v-icon
              icon="mdi-server-off"
              size="48"
              color="grey-lighten-1"
              class="mb-2"
            ></v-icon>
            <span class="text-grey">尚無實例</span>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 新增實例對話框 -->
    <v-dialog v-model="createDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4 pb-2">
          <v-icon icon="mdi-plus-circle" start class="me-2"></v-icon>
          新增 Node-RED 實例
        </v-card-title>
        <v-card-text class="pa-4 pt-2">
          <v-form ref="form" @submit.prevent="createInstance">
            <v-text-field
              v-model="newInstance.name"
              label="實例名稱"
              :rules="[
                v => !!v || '請輸入實例名稱',
                v => v.length <= 50 || '名稱不能超過 50 個字元'
              ]"
              required
              class="mb-3"
              density="comfortable"
              variant="outlined"
            ></v-text-field>
            
            <!-- 新增描述欄位 -->
            <v-text-field
              v-model="newInstance.description"
              label="描述"
              :rules="[
                v => v.length <= 200 || '描述不能超過 200 個字元'
              ]"
              class="mb-3"
              density="comfortable"
              variant="outlined"
              placeholder="請輸入實例描述（選填）"
            ></v-text-field>

            <v-text-field
              v-model="newInstance.port"
              label="埠號"
              type="number"
              :rules="[
                v => !!v || '請輸入埠號',
                v => (v && v >= 1024 && v <= 65535) || '埠號必須在 1024-65535 之間',
                v => !instances.some(i => i.port === parseInt(v)) || '此埠號已被使用'
              ]"
              required
              density="comfortable"
              variant="outlined"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="createDialog = false"
            class="me-2"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="createInstance"
            :loading="loading"
          >
            建立
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 日誌對話框 -->
    <v-dialog v-model="logsDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-text-box-outline" start class="me-2"></v-icon>
          <span class="text-h6">實例日誌</span>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="logsDialog = false"
            size="small"
          ></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <div class="logs-container">
            <template v-if="logs.length">
              <div v-for="(log, index) in logs" :key="index" class="log-line">
                {{ log }}
              </div>
            </template>
            <div v-else class="text-center py-4 text-grey">
              <v-icon icon="mdi-text-box-remove" size="32" class="mb-2"></v-icon>
              <div>無日誌記錄</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 刪除確認對話框 -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon icon="mdi-alert" color="error" class="me-2"></v-icon>
          確認刪除
        </v-card-title>
        <v-card-text class="pa-4">
          確定要刪除此 Node-RED 實例嗎？此操作無法復原。
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            class="me-2"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            @click="deleteInstance"
            :loading="loading"
          >
            刪除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useInstanceStore } from '../stores/instance';

export default {
  name: 'InstancesView',
  
  setup() {
    const instanceStore = useInstanceStore();
    const createDialog = ref(false);
    const logsDialog = ref(false);
    const loading = ref(false);
    const instances = ref([]);
    const logs = ref([]);
    const form = ref(null);
    const deleteDialog = ref(false);
    const instanceToDelete = ref(null);
    
    const headers = [
      { title: '名稱', key: 'name', sortable: true },
      { title: '描述', key: 'description', sortable: true },
      { title: '狀態', key: 'status', sortable: true, width: '120px' },
      { title: '埠號', key: 'port', sortable: true, width: '100px' },
      { title: '操作', key: 'actions', sortable: false, align: 'end', width: '150px' }
    ];
    
    const newInstance = ref({
      name: '',
      description: '',
      port: null
    });

    const getStatusColor = (status) => {
      const colors = {
        'running': 'success',
        'stopped': 'error',
        'created': 'warning',
        'paused': 'info'
      };
      return colors[status] || 'grey';
    };
    
    const loadInstances = async () => {
      loading.value = true;
      instances.value = await instanceStore.fetchInstances();
      loading.value = false;
    };

    const startInstance = async (instance) => {
      try {
        await instanceStore.startInstance(instance.id);
        await loadInstances();
      } catch (error) {
        console.error('Error starting instance:', error);
      }
    };

    const stopInstance = async (instance) => {
      try {
        await instanceStore.stopInstance(instance.id);
        await loadInstances();
      } catch (error) {
        console.error('Error stopping instance:', error);
      }
    };

    const showLogs = async (instance) => {
      try {
        logs.value = await instanceStore.getInstanceLogs(instance.id);
        logsDialog.value = true;
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    const getNodeRedUrl = (port) => {
      if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:${port}`;
      }
      return '#';
    };
    
    const getStatusIcon = (status) => {
      const icons = {
        'running': 'mdi-play-circle',
        'stopped': 'mdi-stop-circle',
        'created': 'mdi-clock-outline',
        'paused': 'mdi-pause-circle'
      };
      return icons[status] || 'mdi-help-circle';
    };
    
    const createInstance = async () => {
      if (!form.value.validate()) return;
      
      try {
        loading.value = true;
        const containerName = `nodered-${newInstance.value.name}`;  // 使用名稱作為容器名稱
        await instanceStore.createInstance({
          ...newInstance.value,
          containerId: containerName
        });
        createDialog.value = false;
        await loadInstances();
        
        // 重置表單
        newInstance.value = {
          name: '',
          description: '',
          port: null
        };
        form.value.reset();
      } catch (error) {
        console.error('Error creating instance:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const confirmDelete = (instance) => {
      instanceToDelete.value = instance;
      deleteDialog.value = true;
    };

    const deleteInstance = async () => {
      if (!instanceToDelete.value) return;
      
      try {
        loading.value = true;
        await instanceStore.deleteInstance(instanceToDelete.value.id);
        deleteDialog.value = false;
        instanceToDelete.value = null;
        await loadInstances();
      } catch (error) {
        console.error('Error deleting instance:', error);
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      loadInstances();
    });
    
    return {
      createDialog,
      logsDialog,
      loading,
      instances,
      headers,
      newInstance,
      logs,
      form,
      getStatusColor,
      getStatusIcon,
      showCreateDialog() {
        createDialog.value = true;
      },
      createInstance,
      startInstance,
      stopInstance,
      showLogs,
      getNodeRedUrl,
      deleteDialog,
      confirmDelete,
      deleteInstance,
    };
  }
}
</script>

<style scoped>
.instance-table {
  border: none;
}

:deep(.v-data-table) {
  border-radius: 0;
}

:deep(.v-data-table__tr) {
  height: 60px !important;
}

:deep(.v-data-table-header) {
  background-color: #fafafa;
}

:deep(.v-data-table-header th) {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: rgba(0, 0, 0, 0.6) !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  border-bottom: thin solid rgba(0, 0, 0, 0.12) !important;
}

:deep(.v-data-table__tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper)) {
  background: #f5f5f5 !important;
}

:deep(.v-data-table__td) {
  padding: 0 16px !important;
}

.logs-container {
  max-height: 60vh;
  overflow-y: auto;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
}

.log-line {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 2px 0;
}

:deep(.v-card-title) {
  background-color: white;
}
</style> 