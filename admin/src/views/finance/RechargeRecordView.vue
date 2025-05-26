<template>
  <div>
    <a-page-header title="充值记录" sub-title="查看所有者的 SKY 代币充值历史">
      <template #extra>
        <a-select
          v-model:value="searchParams.ownerId"
          placeholder="按所有者筛选"
          style="width: 240px; margin-left: 8px"
          @change="onSearch"
          allow-clear
          show-search
          :filter-option="filterOwnerOption"
          :options="ownerOptions"
          :loading="ownersLoading"
        />
        <!-- Add Date Range Picker if needed later -->
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
          <template v-else-if="column.key === 'status'">
            <a-tag
              :color="
                record.status === 1
                  ? 'green'
                  : record.status === 2
                  ? 'red'
                  : 'orange'
              "
            >
              {{
                record.status === 1
                  ? "成功"
                  : record.status === 2
                  ? "失败"
                  : "处理中"
              }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'timestamp'">
            <span>{{ formatDateTime(record.timestamp) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="viewOwner(record.ownerId)"
              >查看所有者</a-button
            >
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
const dataSource = ref([]);
const ownerOptions = ref([]);

// Search parameters
const searchParams = reactive({
  ownerId: undefined,
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
  {
    title: "所有者ID",
    dataIndex: "ownerId",
    key: "ownerId",
    sorter: true,
    width: 120,
  }, // Corrected dataIndex
  { title: "交易ID", dataIndex: "transactionId", key: "transactionId" }, // Added transactionId
  {
    title: "充值金额 (SKY)",
    dataIndex: "amount",
    key: "amount",
    sorter: true,
    align: "right",
  },
  { title: "状态", dataIndex: "status", key: "status", width: 100 }, // Added Status
  { title: "充值时间", dataIndex: "timestamp", key: "timestamp", sorter: true },
  { title: "操作", key: "action", width: 150, fixed: "right" },
];

const formatDateTime = (dateTimeString) => {
  return dateTimeString
    ? dayjs(dateTimeString).format("YYYY-MM-DD HH:mm:ss")
    : "N/A";
};

// Fetch owners for the filter dropdown
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

const filterOwnerOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const fetchRechargeRecords = async (params = {}) => {
  loading.value = true;
  const queryParams = {
    current: pagination.current,
    size: pagination.pageSize,
    ...searchParams, // Include ownerId filter
    ...params, // Include sorting from table change
  };

  try {
    const responseData = await apiService.getRechargeRecords(queryParams);
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
    message.error(`获取充值记录失败: ${error.message}`);
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
    const sortField = sorter.field === "ownerId" ? "owner_id" : sorter.field;
    params.sort = `${sortField},${sorter.order === "ascend" ? "asc" : "desc"}`;
  }
  fetchRechargeRecords(params);
};

// Handle filter change
const onSearch = () => {
  pagination.current = 1;
  fetchRechargeRecords();
};

onMounted(() => {
  fetchRechargeRecords();
  fetchOwnersForFilter();
});

const viewOwner = (ownerId) => {
  message.info(`跳转到所有者 #${ownerId} 的详情页面 (待实现)`);
  // router.push({ name: 'OwnerDetail', params: { id: ownerId } });
  // Or navigate to the list and somehow highlight/filter it
  router.push({ name: "owner-list" });
};
</script>

<style scoped>
/* Styles for Recharge Record page */
</style>
