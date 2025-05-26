<template>
  <div class="lottery-winners-container">
    <div class="header-actions">
      <a-row justify="space-between" align="middle">
        <a-col>
          <h2>中奖记录管理</h2>
        </a-col>
        <a-col v-if="selectedLottery">
          <a-tag color="blue">当前活动: {{ selectedLottery }}</a-tag>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索栏 -->
    <a-card class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="活动ID">
          <a-input-number
            v-model:value="searchForm.lotteryId"
            placeholder="活动ID"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input v-model:value="searchForm.uid" placeholder="用户ID" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchWinnersList(true)">
            <search-outlined /> 搜索
          </a-button>
          <a-button style="margin-left: 8px" @click="resetSearch">
            <reload-outlined /> 重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 列表区域 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="winnersList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <!-- 自定义列渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 奖项列 -->
          <template v-if="column.dataIndex === 'prize'">
            <div>
              <div>
                <strong>{{ record.prizeLevel }}</strong>
              </div>
              <div>{{ record.prizeName }}</div>
            </div>
          </template>

          <!-- 时间列 -->
          <template v-if="column.dataIndex === 'winTime'">
            {{ formatDate(record.winTime) }}
          </template>

          <!-- 领取时间列 -->
          <template v-if="column.dataIndex === 'claimTime'">
            {{ record.claimTime ? formatDate(record.claimTime) : "-" }}
          </template>

          <!-- 联系信息列 -->
          <template v-if="column.dataIndex === 'contactInfo'">
            <a-tooltip v-if="record.contactInfo" :title="record.contactInfo">
              <span>{{ truncateText(record.contactInfo, 15) }}</span>
            </a-tooltip>
            <span v-else>-</span>
          </template>

          <!-- 状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'actions'">
            <a-dropdown v-if="record.status !== 'sent'">
              <a-button size="small"> 更新状态 <down-outlined /> </a-button>
              <template #overlay>
                <a-menu @click="(e) => handleStatusChange(record, e.key)">
                  <a-menu-item
                    v-if="record.status === 'unclaimed'"
                    key="claimed"
                  >
                    已认领
                  </a-menu-item>
                  <a-menu-item v-if="record.status !== 'sent'" key="sent">
                    已发放
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <a-button v-else size="small" type="dashed" disabled>
              已完成
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 修改状态模态框 -->
    <a-modal
      v-model:visible="updateStatusVisible"
      :title="`更新为${getStatusText(targetStatus)}`"
      @ok="confirmUpdateStatus"
      :confirmLoading="submitting"
      @cancel="updateStatusVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="联系信息" v-if="targetStatus === 'claimed'">
          <a-textarea
            v-model:value="contactInfo"
            placeholder="收件人信息、地址、电话等"
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
        <p>
          确认将状态从
          <strong>{{ getStatusText(currentRecord?.status) }}</strong> 更新为
          <strong>{{ getStatusText(targetStatus) }}</strong
          >?
        </p>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  SearchOutlined,
  ReloadOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import apiService from "@/services/apiService";
import { useAuthStore } from "@/stores/authStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const submitting = ref(false);
const winnersList = ref([]);
const selectedLottery = ref("");

// 控制更新状态模态框
const updateStatusVisible = ref(false);
const currentRecord = ref(null);
const targetStatus = ref("");
const contactInfo = ref("");

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条记录`,
});

// 搜索表单
const searchForm = reactive({
  lotteryId: null,
  uid: "",
});

// 表格列定义
const columns = [
  {
    title: "记录ID",
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: "活动名称",
    dataIndex: "lotteryName",
    key: "lotteryName",
    width: 200,
    ellipsis: true,
  },
  {
    title: "用户ID",
    dataIndex: "uid",
    key: "uid",
    width: 150,
  },
  {
    title: "奖品",
    dataIndex: "prize",
    key: "prize",
    width: 200,
  },
  {
    title: "中奖时间",
    dataIndex: "winTime",
    key: "winTime",
    width: 180,
  },
  {
    title: "领取时间",
    dataIndex: "claimTime",
    key: "claimTime",
    width: 180,
  },
  {
    title: "联系信息",
    dataIndex: "contactInfo",
    key: "contactInfo",
    width: 200,
    ellipsis: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 120,
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 120,
    fixed: "right",
  },
];

// 初始化
onMounted(() => {
  // 检查URL参数是否有lotteryId
  const urlLotteryId = route.query.lotteryId;
  if (urlLotteryId) {
    searchForm.lotteryId = parseInt(urlLotteryId, 10);
    // 可以考虑根据活动ID获取活动名称
    loadLotteryName(searchForm.lotteryId);
  }

  fetchWinnersList();
});

// 每次组件激活时重新加载数据，解决keep-alive缓存问题
onActivated(() => {
  fetchWinnersList();
});

// 获取活动名称
const loadLotteryName = async (id) => {
  try {
    const lottery = await apiService.getLotteryDetail(id);
    selectedLottery.value = lottery.name;
  } catch (error) {
    console.error("获取活动名称失败:", error);
  }
};

// 获取中奖记录列表
const fetchWinnersList = async (isSearch = false) => {
  if (isSearch) {
    pagination.current = 1;
  }

  loading.value = true;
  try {
    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...searchForm,
    };

    // 如果是合作伙伴角色，则只查询该管理员创建的抽奖活动的中奖记录
    if (authStore.adminInfo.roleCode === "partner") {
      params.adminUserId = authStore.adminId;
    }

    const response = await apiService.getLotteryWinners(params);
    winnersList.value = response.records || [];
    pagination.total = response.total || 0;
  } catch (error) {
    message.error(`获取中奖记录失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchWinnersList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.lotteryId = null;
  searchForm.uid = "";
  selectedLottery.value = "";
  fetchWinnersList(true);
};

// 处理状态变更
const handleStatusChange = (record, status) => {
  currentRecord.value = record;
  targetStatus.value = status;
  contactInfo.value = "";
  updateStatusVisible.value = true;
};

// 确认更新状态
const confirmUpdateStatus = async () => {
  if (!currentRecord.value || !targetStatus.value) return;

  submitting.value = true;
  try {
    const contactInfoValue =
      targetStatus.value === "claimed" ? contactInfo.value : undefined;
    await apiService.updateWinnerStatus(
      currentRecord.value.id,
      targetStatus.value,
      contactInfoValue
    );
    message.success("状态更新成功");
    updateStatusVisible.value = false;

    // 更新本地数据
    const index = winnersList.value.findIndex(
      (item) => item.id === currentRecord.value.id
    );
    if (index > -1) {
      winnersList.value[index].status = targetStatus.value;
      if (targetStatus.value === "claimed") {
        winnersList.value[index].claimTime = new Date().toISOString();
      }
    }
  } catch (error) {
    message.error(`更新状态失败: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};

// 工具函数 - 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    unclaimed: "未领取",
    claimed: "已认领",
    sent: "已发放",
  };
  return statusMap[status] || status;
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    unclaimed: "orange",
    claimed: "blue",
    sent: "green",
  };
  return colorMap[status] || "default";
};

// 截断文本
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};
</script>

<style scoped>
.lottery-winners-container {
  padding-bottom: 24px;
}

.header-actions {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}
</style>
