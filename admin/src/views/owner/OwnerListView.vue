<template>
  <div>
    <a-page-header title="所有者列表" sub-title="管理所有游戏/应用的所有者账户">
      <template #extra>
        <a-input-search
          v-model:value="searchParams.keyword"
          placeholder="按名称或邮箱搜索"
          style="width: 240px"
          @search="onSearch"
          allow-clear
        />
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
          <template v-if="column.key === 'balance'">
            <span>SKY {{ record.balance.toFixed(2) }}</span>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            <span>{{ formatDateTime(record.createdAt) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="middle">
              <a-button type="link" @click="viewOwnerDetails(record)"
                >查看详情</a-button
              >
              <a-button type="link" @click="manageBalance(record)"
                >调整余额</a-button
              >
              <!-- More actions can be added here -->
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import apiService from "@/services/apiService";
import dayjs from "dayjs";
// import { useRouter } from 'vue-router'; // if needed for navigation

// const router = useRouter(); // if needed
const loading = ref(false);
const dataSource = ref([]);

// Search parameters
const searchParams = reactive({
  keyword: undefined, // For name or email search
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
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    sorter: true,
    width: 80,
  },
  {
    title: "所有者名称",
    dataIndex: "name",
    key: "name",
    sorter: true,
  },
  {
    title: "注册邮箱 (登录账号)",
    dataIndex: "email",
    key: "email",
    sorter: true,
  },
  {
    title: "SKY代币余额",
    dataIndex: "balance",
    key: "balance",
    sorter: true,
    align: "right",
  },
  {
    title: "注册时间",
    dataIndex: "createdAt",
    key: "createdAt",
    sorter: true,
  },
  { title: "操作", key: "action", width: 180, fixed: "right" },
];

const formatDateTime = (dateTimeString) => {
  return dateTimeString
    ? dayjs(dateTimeString).format("YYYY-MM-DD HH:mm")
    : "N/A";
};

const fetchOwners = async (params = {}) => {
  loading.value = true;
  const queryParams = {
    current: pagination.current,
    size: pagination.pageSize,
    ...searchParams, // Include search keyword
    ...params, // Include sorting from table change
  };

  try {
    // Assuming getOwners API supports pagination and maybe keyword search
    const responseData = await apiService.getOwners(queryParams);
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
    message.error(`获取所有者列表失败: ${error.message}`);
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
    // Adjust field name if API expects different (e.g., created_at vs createdAt)
    const sortField =
      sorter.field === "createdAt" ? "created_at" : sorter.field;
    params.sort = `${sortField},${sorter.order === "ascend" ? "asc" : "desc"}`;
  }
  fetchOwners(params);
};

// Handle top search
const onSearch = () => {
  pagination.current = 1; // Reset to first page
  fetchOwners();
};

onMounted(() => {
  fetchOwners();
});

const viewOwnerDetails = (record) => {
  message.info(`查看所有者 #${record.id} (${record.name}) 详情 (待实现)`);
  // Example: router.push(`/owner/details/${record.id}`);
};

const manageBalance = (record) => {
  message.info(`调整所有者 #${record.id} (${record.name}) 的余额 (待实现)`);
  // This could open a modal for balance adjustment
};
</script>

<style scoped>
/* Styles for Owner List page */
</style>
