<template>
  <div class="lottery-list-container">
    <div class="header-actions">
      <a-row justify="space-between" align="middle">
        <a-col>
          <h2>抽奖活动管理</h2>
        </a-col>
        <a-col>
          <a-button type="primary" @click="showCreateModal">
            <plus-outlined /> 创建抽奖活动
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索栏 -->
    <a-card class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="活动名称">
          <a-input v-model:value="searchForm.name" placeholder="活动名称" />
        </a-form-item>
        <a-form-item label="活动状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="选择状态"
            style="width: 150px"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="ended">已结束</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="fetchLotteryList(true)">
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
        :data-source="lotteryList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <!-- 活动名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <a-tooltip :title="record.name">
              <span>{{ record.name }}</span>
            </a-tooltip>
            <a-tag v-if="record.sponsor" color="blue" style="margin-left: 5px">
              {{ record.sponsor }}
            </a-tag>
          </template>

          <!-- 抽奖形式列 -->
          <template v-if="column.dataIndex === 'lotteryType'">
            <a-tag
              :color="record.lotteryType === 'wheel' ? 'purple' : 'orange'"
            >
              {{ record.lotteryType === "wheel" ? "大转盘" : "盲盒" }}
            </a-tag>
          </template>

          <!-- 时间列 -->
          <template v-if="column.dataIndex === 'time'">
            <div>开始：{{ formatDate(record.startTime) }}</div>
            <div v-if="record.endTime">
              结束：{{ formatDate(record.endTime) }}
            </div>
          </template>

          <!-- 状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record)">
              {{ getStatusText(record) }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'actions'">
            <a-space>
              <a-button size="small" type="primary" @click="viewDetail(record)"
                >详情</a-button
              >
              <a-button size="small" type="primary" @click="preview(record)"
                >预览</a-button
              >
              <a-button
                size="small"
                type="primary"
                @click="generatePoster(record)"
                >生成海报</a-button
              >
              <a-dropdown>
                <a-button size="small"> 更多 <down-outlined /> </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item
                      v-if="record.status === 'draft'"
                      key="publish"
                      @click="updateStatus(record.id, 'published')"
                    >
                      <check-circle-outlined /> 发布
                    </a-menu-item>
                    <a-menu-item
                      v-if="record.status === 'published'"
                      key="end"
                      @click="updateStatus(record.id, 'ended')"
                    >
                      <stop-outlined /> 结束
                    </a-menu-item>
                    <a-menu-item
                      v-if="record.status === 'draft'"
                      key="delete"
                      @click="confirmDelete(record)"
                    >
                      <delete-outlined /> 删除
                    </a-menu-item>
                    <a-menu-item key="winners" @click="viewWinners(record)">
                      <trophy-outlined /> 中奖记录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建抽奖活动模态框 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="创建抽奖活动"
      @ok="handleCreateSubmit"
      :confirmLoading="submitting"
      width="600px"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="createForm"
        :rules="createRules"
        ref="createFormRef"
        layout="vertical"
      >
        <a-form-item name="name" label="活动名称" required>
          <a-input
            v-model:value="createForm.name"
            placeholder="例如：新年大抽奖"
          />
        </a-form-item>
        <a-form-item name="sponsor" label="赞助方">
          <a-input
            v-model:value="createForm.sponsor"
            placeholder="例如：某赞助商"
          />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="icon" label="活动图标">
              <a-input
                v-model:value="createForm.icon"
                placeholder="图片URL地址"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="background" label="背景图片">
              <a-input
                v-model:value="createForm.background"
                placeholder="图片URL地址"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item name="description" label="活动描述">
          <a-textarea
            v-model:value="createForm.description"
            placeholder="活动描述信息"
            :auto-size="{ minRows: 2, maxRows: 6 }"
          />
        </a-form-item>
        <a-form-item name="lotteryType" label="抽奖形式" required>
          <a-radio-group v-model:value="createForm.lotteryType">
            <a-radio value="wheel">大转盘</a-radio>
            <a-radio value="box">盲盒</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="startTime" label="开始时间" required>
              <a-date-picker
                v-model:value="createForm.startTime"
                show-time
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="endTime" label="结束时间">
              <a-date-picker
                v-model:value="createForm.endTime"
                show-time
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item name="startNow" label="是否立即开始">
          <a-switch v-model:checked="createForm.startNow" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 生成海报模态框 -->
    <a-modal
      v-model:visible="posterModalVisible"
      title="生成海报"
      width="700px"
      :footer="null"
      @cancel="posterModalVisible = false"
    >
      <poster-generator
        :lottery-info="currentLotteryForPoster"
        :lottery-url="currentLotteryUrl"
        :visible="posterModalVisible"
        @close="posterModalVisible = false"
        @poster-generated="handlePosterGenerated"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from "vue";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import apiService from "@/services/apiService";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import PosterGenerator from "@/components/PosterGenerator.vue";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const lotteryList = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条记录`,
});

// 搜索表单
const searchForm = reactive({
  name: "",
  status: "",
});

// 表格列定义
const columns = [
  {
    title: "活动名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "抽奖形式",
    dataIndex: "lotteryType",
    key: "lotteryType",
    width: 100,
  },
  {
    title: "活动时间",
    dataIndex: "time",
    key: "time",
    width: 200,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
    sorter: true,
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 150,
    fixed: "right",
  },
];

// 创建抽奖活动相关
const createModalVisible = ref(false);
const submitting = ref(false);
const createFormRef = ref(null);

const createForm = reactive({
  name: "",
  sponsor: "",
  icon: "",
  background: "",
  description: "",
  lotteryType: "wheel",
  startTime: null,
  endTime: null,
  startNow: false,
});

const createRules = {
  name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
  lotteryType: [
    { required: true, message: "请选择抽奖形式", trigger: "change" },
  ],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
};

// 生成海报相关
const posterModalVisible = ref(false);
const currentLotteryForPoster = ref(null);
const currentLotteryUrl = ref("");

// 初始化
onMounted(() => {
  fetchLotteryList();
});

// 每次组件激活时重新加载数据，解决keep-alive缓存问题
onActivated(() => {
  fetchLotteryList();
});

// 获取抽奖活动列表
const fetchLotteryList = async (isSearch = false) => {
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
    console.log("authStore", authStore);

    if (authStore.adminInfo.roleCode === "partner") {
      params.adminUserId = authStore.adminId;
    }

    const response = await apiService.getLotteryList(params);
    lotteryList.value = response.records || [];
    pagination.total = response.total || 0;
  } catch (error) {
    message.error(`获取抽奖活动列表失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchLotteryList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.name = "";
  searchForm.status = "";
  fetchLotteryList(true);
};

// 显示创建模态框
const showCreateModal = () => {
  // 重置表单
  Object.keys(createForm).forEach((key) => {
    if (key === "lotteryType") {
      createForm[key] = "wheel";
    } else if (key === "startNow") {
      createForm[key] = false;
    } else {
      createForm[key] = "";
    }
  });
  createForm.startTime = null;
  createForm.endTime = null;

  createModalVisible.value = true;
};

// 提交创建表单
const handleCreateSubmit = async () => {
  try {
    await createFormRef.value.validate();

    submitting.value = true;
    const payload = { ...createForm };

    // 转换日期为ISO字符串
    if (payload.startTime) {
      payload.startTime = payload.startTime.format("YYYY-MM-DDTHH:mm:ss");
    }
    if (payload.endTime) {
      payload.endTime = payload.endTime.format("YYYY-MM-DDTHH:mm:ss");
    }

    const response = await apiService.createLottery(payload);
    message.success("创建抽奖活动成功");
    createModalVisible.value = false;

    // 转到详情页，提示用户设置规则和添加奖项
    if (response && response.lotteryId) {
      message.info("请先设置抽奖规则和添加奖项，才能发布活动");
      router.push(`/lottery/detail/${response.lotteryId}`);
    } else {
      fetchLotteryList(); // 刷新列表
    }
  } catch (error) {
    if (error.message) {
      message.error(`创建失败: ${error.message}`);
    }
  } finally {
    submitting.value = false;
  }
};

// 查看详情
const viewDetail = (record) => {
  router.push(`/lottery/detail/${record.id}`);
};

// 预览
const preview = (record) => {
  const H5_URL = import.meta.env.VITE_H5_URL;
  const url = `${H5_URL}lottery/${record.id}`;
  //弹窗
  Modal.confirm({
    title: "预览",
    content: `预览链接：\r\n ${url}`,
    onOk: () => {
      //在本页面弹出窗口预览
      window.open(url, "_blank");
    },
    onCancel: () => {
      //关闭弹窗
    },
    okText: "预览",
    cancelText: "取消",
  });
};

// 生成海报
const generatePoster = (record) => {
  const H5_URL = import.meta.env.VITE_H5_URL;
  currentLotteryForPoster.value = record;
  currentLotteryUrl.value = `${H5_URL}lottery/${record.id}`;
  posterModalVisible.value = true;
};

// 海报生成完成
const handlePosterGenerated = (posterUrl) => {
  // 可以在这里处理生成的海报URL
  console.log("海报已生成:", posterUrl);
};

// 查看中奖记录
const viewWinners = (record) => {
  router.push(`/lottery/winners?lotteryId=${record.id}`);
};

// 更新活动状态
const updateStatus = async (id, status) => {
  try {
    await apiService.updateLotteryStatus(id, status);
    message.success("更新活动状态成功");
    fetchLotteryList(); // 刷新列表
  } catch (error) {
    message.error(`更新状态失败: ${error.message}`);
  }
};

// 确认删除对话框
const confirmDelete = (record) => {
  Modal.confirm({
    title: "确认删除",
    content: `您确定要删除"${record.name}"活动吗？此操作不可恢复。`,
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        await apiService.deleteLottery(record.id);
        message.success("删除活动成功");
        fetchLotteryList(); // 刷新列表
      } catch (error) {
        message.error(`删除失败: ${error.message}`);
      }
    },
  });
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
const getStatusText = (record) => {
  let status = record.status;
  const statusMap = {
    draft: "草稿",
    published: "已发布",
    ended: "已结束",
    expired: "已过期",
  };
  //根据endTime判断是否已过期
  if (record.endTime) {
    const endTime = new Date(record.endTime);
    const now = new Date();
    if (endTime < now) {
      status = "expired";
    }
  }
  return statusMap[status] || status;
};

// 获取状态颜色
const getStatusColor = (record) => {
  const colorMap = {
    draft: "default",
    published: "green",
    ended: "red",
  };
  //根据endTime判断是否已过期
  if (record.endTime) {
    const endTime = new Date(record.endTime);
    const now = new Date();
    if (endTime < now) {
      return "red";
    }
  }
  return colorMap[record.status] || "default";
};
</script>

<style scoped>
.lottery-list-container {
  padding-bottom: 24px;
}

.header-actions {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}
</style>
