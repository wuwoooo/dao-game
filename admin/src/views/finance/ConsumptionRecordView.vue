<template>
  <div>
    <a-page-header title="消耗记录" sub-title="查看所有者的 SKY 代币消耗历史">
      <template #extra>
        <a-space>
          <a-select
            v-model:value="searchParams.ownerId"
            placeholder="按所有者筛选"
            style="width: 200px"
            @change="onSearch"
            allow-clear
            show-search
            :filter-option="filterOwnerOption"
            :options="ownerOptions"
            :loading="ownersLoading"
          />
          <a-select
            v-model:value="searchParams.gameappId"
            placeholder="按应用筛选"
            style="width: 200px"
            @change="onSearch"
            allow-clear
            show-search
            :filter-option="filterAppOption"
            :options="appOptions"
            :loading="appsLoading"
          />
          <a-select
            v-model:value="searchParams.costType"
            placeholder="按消费类型筛选"
            style="width: 150px"
            @change="onSearch"
            allow-clear
            :options="costTypeOptions"
          />
          <a-range-picker
            v-model:value="searchParams.dateRange"
            @change="onSearch"
          />
        </a-space>
      </template>
    </a-page-header>
    <div style="padding: 24px">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <span>SKY {{ record.amount.toFixed(2) }}</span>
          </template>
          <template v-else-if="column.key === 'costType'">
            <a-tag :color="record.costType === 'CPA' ? 'blue' : 'purple'">
              {{ record.costType }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'date'">
            <span>{{ record.date }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="middle">
              <a-button type="link" @click="viewOwner(record.ownerId)"
                >所有者</a-button
              >
              <a-button type="link" @click="viewGameApp(record.gameappId)"
                >应用</a-button
              >
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import apiService from "@/services/apiService";
import dayjs from "dayjs";

const router = useRouter();
const loading = ref(false);
const ownersLoading = ref(false);
const appsLoading = ref(false);
const dataSource = ref([]);
const ownerOptions = ref([]);
const appOptions = ref([]);

// Search parameters
const searchParams = reactive({
  ownerId: undefined,
  gameappId: undefined,
  costType: undefined,
  dateRange: [], // [startDate, endDate]
});

// Pagination state
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: (total) => `共 ${total} 条`,
});

const columns = [
  { title: "记录ID", dataIndex: "id", key: "id", sorter: true, width: 100 },
  { title: "所有者ID", dataIndex: "ownerId", key: "ownerId", width: 100 }, // Corrected dataIndex
  { title: "应用ID", dataIndex: "gameappId", key: "gameappId", width: 100 }, // Corrected dataIndex
  {
    title: "消费类型",
    dataIndex: "costType",
    key: "costType", // Corrected dataIndex
    width: 100,
    filters: [
      { text: "CPA", value: "CPA" },
      { text: "CPM", value: "CPM" },
    ],
  },
  {
    title: "消耗金额 (SKY)",
    dataIndex: "amount",
    key: "amount",
    sorter: true,
    align: "right",
  },
  { title: "计费次数", dataIndex: "count", key: "count", align: "right" },
  { title: "消耗日期", dataIndex: "date", key: "date", sorter: true },
  { title: "操作", key: "action", width: 180, fixed: "right" },
];

const costTypeOptions = [
  { value: "CPA", label: "CPA" },
  { value: "CPM", label: "CPM" },
];

// Fetch owners for filter
const fetchOwnersForFilter = async () => {
  ownersLoading.value = true;
  try {
    const responseData = await apiService.getOwners({ current: 1, size: 1000 });
    if (responseData && responseData.records) {
      ownerOptions.value = responseData.records.map((owner) => ({
        value: owner.id,
        label: `${owner.name} (ID:${owner.id})`,
      }));
    }
  } catch (error) {
    message.error("加载所有者列表失败: " + error.message);
  } finally {
    ownersLoading.value = false;
  }
};

// Fetch apps for filter
const fetchAppsForFilter = async () => {
  appsLoading.value = true;
  try {
    // Fetch all apps (maybe just approved ones?) for the filter
    const responseData = await apiService.getAdminApps({
      current: 1,
      size: 1000,
      status: "Approved",
    });
    if (responseData && responseData.records) {
      appOptions.value = responseData.records.map((app) => ({
        value: app.id,
        label: `${app.name} (ID:${app.id})`,
      }));
    }
  } catch (error) {
    message.error("加载应用列表失败: " + error.message);
  } finally {
    appsLoading.value = false;
  }
};

const filterOwnerOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};
const filterAppOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const fetchConsumptionRecords = async (params = {}) => {
  loading.value = true;
  const queryParams = {
    current: pagination.current,
    size: pagination.pageSize,
    ownerId: searchParams.ownerId,
    gameappId: searchParams.gameappId,
    costType: searchParams.costType,
    startDate: searchParams.dateRange[0]
      ? dayjs(searchParams.dateRange[0]).format("YYYY-MM-DD")
      : undefined,
    endDate: searchParams.dateRange[1]
      ? dayjs(searchParams.dateRange[1]).format("YYYY-MM-DD")
      : undefined,
    ...params, // Include sorting from table change
  };

  try {
    const responseData = await apiService.getConsumptionRecords(queryParams);
    if (responseData && responseData.records) {
      dataSource.value = responseData.records;
      pagination.total = responseData.total;
      pagination.current = responseData.current;
      pagination.pageSize = responseData.size;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    message.error(`获取消耗记录失败: ${error.message}`);
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// Handle table changes (pagination, sorting)
const handleTableChange = (pag, filters, sorter) => {
  const params = {
    current: pag.current,
    size: pag.pageSize,
  };
  if (sorter && sorter.field) {
    // Adjust field mapping if needed
    const sortField = sorter.field === "costType" ? "cost_type" : sorter.field;
    params.sort = `${sortField},${sorter.order === "ascend" ? "asc" : "desc"}`;
  }
  // Handle column filters if necessary (e.g., costType)
  if (filters && filters.costType) {
    params.costType = filters.costType.join(",");
  }
  fetchConsumptionRecords(params);
};

// Handle filter changes
const onSearch = () => {
  pagination.current = 1;
  fetchConsumptionRecords();
};

onMounted(() => {
  fetchConsumptionRecords();
  fetchOwnersForFilter();
  fetchAppsForFilter(); // Fetch apps for filter dropdown
});

const viewOwner = (ownerId) => {
  message.info(`查看所有者 #${ownerId} (待实现)`);
  router.push({ name: "owner-list" });
};

const viewGameApp = (gameAppId) => {
  message.info(`查看应用 #${gameAppId} (待实现)`);
  router.push({ name: "app-list" }); // Navigate to the app list page
};
</script>

<style scoped>
/* Styles for Consumption Record page */
</style>
