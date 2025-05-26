<template>
  <div class="lottery-detail-container">
    <a-page-header
      :title="`活动详情: ${lotteryDetail.name || ''}`"
      :sub-title="getStatusText(lotteryDetail.status)"
      @back="goBack"
    >
      <template #extra>
        <a-space>
          <a-button @click="goToWinnersList">
            <trophy-outlined /> 中奖记录
          </a-button>
          <a-button
            v-if="lotteryDetail.status === 'draft'"
            type="primary"
            @click="handlePublish"
          >
            <check-circle-outlined /> 发布
          </a-button>
          <a-button
            v-if="lotteryDetail.status === 'published'"
            type="danger"
            @click="handleEnd"
          >
            <stop-outlined /> 结束
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin tip="加载中..."></a-spin>
    </div>

    <div v-else>
      <!-- 活动准备状态提示 -->
      <a-alert
        v-if="lotteryDetail.status === 'draft'"
        :message="checkStatusMessage"
        :type="checkStatusType"
        show-icon
        style="margin-bottom: 16px"
        action=""
      >
        <template #action>
          <a-space>
            <a-button
              v-if="!lotteryRule"
              type="primary"
              size="small"
              @click="showRuleModal"
            >
              设置规则
            </a-button>
            <a-button
              v-if="prizeList.length === 0"
              type="primary"
              size="small"
              @click="showAddPrizeModal"
            >
              添加奖项
            </a-button>
          </a-space>
        </template>
      </a-alert>

      <!-- 活动信息区 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="16">
          <a-card title="基本信息">
            <a-descriptions bordered :column="2">
              <a-descriptions-item label="活动名称" :span="2">
                {{ lotteryDetail.name }}
              </a-descriptions-item>
              <a-descriptions-item label="赞助方" v-if="lotteryDetail.sponsor">
                {{ lotteryDetail.sponsor }}
              </a-descriptions-item>
              <a-descriptions-item label="抽奖形式">
                {{ lotteryDetail.lotteryType === "wheel" ? "大转盘" : "盲盒" }}
              </a-descriptions-item>
              <a-descriptions-item label="开始时间">
                {{ formatDate(lotteryDetail.startTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="结束时间">
                {{
                  lotteryDetail.endTime
                    ? formatDate(lotteryDetail.endTime)
                    : "无限期"
                }}
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ formatDate(lotteryDetail.createdAt) }}
              </a-descriptions-item>
              <a-descriptions-item label="活动状态">
                <a-tag :color="getStatusColor(lotteryDetail.status)">
                  {{ getStatusText(lotteryDetail.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="活动描述" :span="2">
                {{ lotteryDetail.description || "暂无描述" }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="抽奖规则">
            <div v-if="lotteryRule">
              <p>
                <strong>每人总抽奖次数:</strong>
                {{ lotteryRule.drawLimit || "无限制" }}
              </p>
              <p>
                <strong>每日抽奖次数:</strong>
                {{ lotteryRule.dailyLimit || "无限制" }}
              </p>
              <p v-if="lotteryRule.additionalInfo">
                <strong>附加说明:</strong> {{ lotteryRule.additionalInfo }}
              </p>
              <a-button
                type="primary"
                @click="showRuleModal"
                :disabled="lotteryDetail.status === 'ended'"
              >
                <edit-outlined /> 修改规则
              </a-button>
            </div>
            <a-empty v-else description="暂无规则设置">
              <template #description>
                <span>暂无规则设置</span>
              </template>
              <a-button type="primary" @click="showRuleModal">
                设置规则
              </a-button>
            </a-empty>
          </a-card>
        </a-col>
      </a-row>

      <!-- 奖项管理区 -->
      <a-card title="奖项管理">
        <template #extra>
          <a-button
            v-if="lotteryDetail.status !== 'ended'"
            type="primary"
            @click="showAddPrizeModal"
          >
            <plus-outlined /> 添加奖项
          </a-button>
        </template>

        <a-empty v-if="prizeList.length === 0" description="暂无奖项">
          <template #description>
            <span>暂无奖项设置，请添加奖项</span>
          </template>
        </a-empty>

        <a-table
          v-else
          :columns="prizeColumns"
          :data-source="prizeList"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <!-- 奖项图片列 -->
            <template v-if="column.dataIndex === 'image'">
              <a-image
                v-if="record.image"
                :src="record.image"
                :width="50"
                :preview="false"
              />
              <span v-else>无图片</span>
            </template>

            <!-- 中奖概率列 -->
            <template v-if="column.dataIndex === 'probability'">
              {{ record.probability }}%
            </template>

            <!-- 奖品数量列 -->
            <template v-if="column.dataIndex === 'quantity'">
              <div v-if="record.totalQuantity">
                {{ record.remainQuantity || 0 }} / {{ record.totalQuantity }}
              </div>
              <span v-else>不限</span>
            </template>

            <!-- 操作列 -->
            <template v-if="column.dataIndex === 'actions'">
              <a-space>
                <a-button
                  type="primary"
                  size="small"
                  @click="showEditPrizeModal(record)"
                  :disabled="lotteryDetail.status === 'ended'"
                >
                  <edit-outlined /> 编辑
                </a-button>
                <a-button
                  type="danger"
                  size="small"
                  @click="confirmDeletePrize(record)"
                  :disabled="lotteryDetail.status === 'ended'"
                >
                  <delete-outlined /> 删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 添加奖项模态框 -->
    <a-modal
      v-model:visible="addPrizeVisible"
      title="添加奖项"
      @ok="handleAddPrize"
      :confirm-loading="submitting"
      @cancel="addPrizeVisible = false"
    >
      <a-form
        :model="prizeForm"
        :rules="prizeRules"
        ref="prizeFormRef"
        layout="vertical"
      >
        <a-form-item name="level" label="奖项等级" required>
          <a-input
            v-model:value="prizeForm.level"
            placeholder="例如: 特等奖、一等奖"
          />
        </a-form-item>
        <a-form-item name="name" label="奖品名称" required>
          <a-input
            v-model:value="prizeForm.name"
            placeholder="例如: iPhone 15"
          />
        </a-form-item>
        <a-form-item name="image" label="奖品图片">
          <a-input v-model:value="prizeForm.image" placeholder="图片URL地址" />
        </a-form-item>
        <a-form-item name="probability" label="中奖概率 (%)" required>
          <a-input-number
            v-model:value="prizeForm.probability"
            :min="0.01"
            :max="100"
            :step="0.01"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item name="totalQuantity" label="奖品数量 (留空表示不限)">
          <a-input-number
            v-model:value="prizeForm.totalQuantity"
            :min="1"
            :step="1"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑奖项模态框 -->
    <a-modal
      v-model:visible="editPrizeVisible"
      title="编辑奖项"
      @ok="handleEditPrize"
      :confirm-loading="submitting"
      @cancel="editPrizeVisible = false"
    >
      <a-form
        :model="editPrizeForm"
        :rules="prizeRules"
        ref="editPrizeFormRef"
        layout="vertical"
      >
        <a-form-item name="level" label="奖项等级" required>
          <a-input
            v-model:value="editPrizeForm.level"
            placeholder="例如: 特等奖、一等奖"
          />
        </a-form-item>
        <a-form-item name="name" label="奖品名称" required>
          <a-input
            v-model:value="editPrizeForm.name"
            placeholder="例如: iPhone 15"
          />
        </a-form-item>
        <a-form-item name="image" label="奖品图片">
          <a-input
            v-model:value="editPrizeForm.image"
            placeholder="图片URL地址"
          />
        </a-form-item>
        <a-form-item name="probability" label="中奖概率 (%)" required>
          <a-input-number
            v-model:value="editPrizeForm.probability"
            :min="0.01"
            :max="100"
            :step="0.01"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item name="totalQuantity" label="奖品数量 (留空表示不限)">
          <a-input-number
            v-model:value="editPrizeForm.totalQuantity"
            :min="1"
            :step="1"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改规则模态框 -->
    <a-modal
      v-model:visible="ruleModalVisible"
      title="设置抽奖规则"
      @ok="handleUpdateRule"
      :confirm-loading="submitting"
      @cancel="ruleModalVisible = false"
      width="600px"
    >
      <a-alert
        type="info"
        message="抽奖规则说明"
        description="抽奖规则决定了用户参与活动的限制条件，设置合理的规则有助于提高用户参与度"
        style="margin-bottom: 16px"
        show-icon
      />

      <a-form
        :model="ruleForm"
        :rules="ruleRules"
        ref="ruleFormRef"
        layout="vertical"
      >
        <a-form-item name="drawLimit" label="每人总抽奖次数" required>
          <a-input-number
            v-model:value="ruleForm.drawLimit"
            :min="1"
            :step="1"
            style="width: 100%"
            placeholder="请输入每人总抽奖次数"
          />
          <div class="form-tip">
            必填，至少1次，必须设置合理值避免活动遇到风险
          </div>
        </a-form-item>
        <a-form-item name="dailyLimit" label="每日抽奖次数上限">
          <a-input-number
            v-model:value="ruleForm.dailyLimit"
            :min="1"
            :step="1"
            style="width: 100%"
            placeholder="请输入每日抽奖次数上限"
          />
          <div class="form-tip">
            可选，留空表示不限制，建议设置每日限制以避免用户在同一天内过度参与
          </div>
        </a-form-item>
        <a-form-item name="additionalInfo" label="参与须知和附加说明">
          <a-textarea
            v-model:value="ruleForm.additionalInfo"
            placeholder="例如：每人总共3次机会，每天限1次，请注意保留对奖品的请求权利..."
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
          <div class="form-tip">这里的内容将在用户参与抽奖时显示</div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  TrophyOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import apiService from "@/services/apiService";
import { useAuthStore } from "@/stores/authStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const submitting = ref(false);
const lotteryId = ref(parseInt(route.params.id, 10));
const lotteryDetail = ref({});
const lotteryRule = ref(null);
const prizeList = ref([]);

// 控制模态框显示
const addPrizeVisible = ref(false);
const ruleModalVisible = ref(false);
const editPrizeVisible = ref(false);

// 奖项表单相关
const prizeFormRef = ref(null);
const editPrizeFormRef = ref(null);
const prizeForm = reactive({
  lotteryId: lotteryId.value,
  level: "",
  name: "",
  image: "",
  probability: 1,
  totalQuantity: null,
});

const editPrizeForm = reactive({
  id: null,
  lotteryId: lotteryId.value,
  level: "",
  name: "",
  image: "",
  probability: 1,
  totalQuantity: null,
});

const prizeRules = {
  level: [{ required: true, message: "请输入奖项等级", trigger: "blur" }],
  name: [{ required: true, message: "请输入奖品名称", trigger: "blur" }],
  probability: [
    { required: true, message: "请输入中奖概率", trigger: "change" },
  ],
};

// 规则表单相关
const ruleFormRef = ref(null);
const ruleForm = reactive({
  lotteryId: lotteryId.value,
  drawLimit: 3,
  dailyLimit: null,
  additionalInfo: "",
});

const ruleRules = {
  drawLimit: [
    { required: true, message: "请设置总抽奖次数限制", trigger: "change" },
    {
      type: "number",
      min: 1,
      message: "总抽奖次数至少为1次",
      trigger: "change",
    },
  ],
  dailyLimit: [
    {
      type: "number",
      min: 1,
      message: "每日抽奖次数至少为1次",
      trigger: "change",
    },
  ],
};

// 奖项表格列定义
const prizeColumns = [
  {
    title: "奖项等级",
    dataIndex: "level",
    key: "level",
    width: 150,
  },
  {
    title: "奖品名称",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "奖品图片",
    dataIndex: "image",
    key: "image",
    width: 120,
  },
  {
    title: "中奖概率",
    dataIndex: "probability",
    key: "probability",
    width: 120,
  },
  {
    title: "奖品数量 (剩余/总数)",
    dataIndex: "quantity",
    key: "quantity",
    width: 200,
  },
  {
    title: "操作",
    dataIndex: "actions",
    key: "actions",
    width: 120,
  },
];

// 计算活动准备状态提示信息
const checkStatusMessage = computed(() => {
  if (!lotteryRule.value && prizeList.value.length === 0) {
    return "请设置抽奖规则并添加奖项，然后再发布活动";
  } else if (!lotteryRule.value) {
    return "请设置抽奖规则，然后再发布活动";
  } else if (prizeList.value.length === 0) {
    return "请添加奖项，然后再发布活动";
  }
  return "活动准备完成，可以发布活动了";
});

const checkStatusType = computed(() => {
  if (!lotteryRule.value || prizeList.value.length === 0) {
    return "warning";
  }
  return "success";
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      lotteryId.value = parseInt(newId, 10);
      loadLotteryDetail();
    }
  }
);

// 初始化
onMounted(async () => {
  await loadLotteryDetail();
});

// 每次组件激活时重新加载数据，解决keep-alive缓存问题
onActivated(async () => {
  await loadLotteryDetail();
});

// 获取抽奖活动详情
const loadLotteryDetail = async () => {
  loading.value = true;
  // 清空旧数据避免页面显示旧内容
  lotteryDetail.value = {};
  prizeList.value = [];
  lotteryRule.value = null;

  try {
    // 获取活动基本信息
    lotteryDetail.value = await apiService.getLotteryDetail(lotteryId.value);

    // 获取奖项列表
    await loadPrizeList();

    // 获取规则信息
    await loadRuleInfo();
  } catch (error) {
    message.error(`获取活动详情失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 获取奖项列表
const loadPrizeList = async () => {
  try {
    prizeList.value = await apiService.getLotteryPrizes(lotteryId.value);
  } catch (error) {
    message.error(`获取奖项列表失败: ${error.message}`);
  }
};

// 获取规则信息
const loadRuleInfo = async () => {
  try {
    lotteryRule.value = await apiService.getLotteryRule(lotteryId.value);

    // 如果有规则信息，更新表单
    if (lotteryRule.value) {
      ruleForm.drawLimit = lotteryRule.value.drawLimit;
      ruleForm.dailyLimit = lotteryRule.value.dailyLimit;
      ruleForm.additionalInfo = lotteryRule.value.additionalInfo;
    }
  } catch (error) {
    console.error(`获取规则失败: ${error.message}`);
    // 不显示错误消息，因为可能是尚未设置规则
  }
};

// 返回列表页
const goBack = () => {
  router.push("/lottery/list");
};

// 发布活动
const handlePublish = async () => {
  // 检查是否设置了抽奖规则
  if (!lotteryRule.value) {
    message.error("请先设置抽奖规则再发布活动");
    showRuleModal();
    return;
  }

  // 检查是否添加了奖项
  if (prizeList.value.length === 0) {
    message.error("请先添加奖项再发布活动");
    showAddPrizeModal();
    return;
  }

  try {
    await apiService.updateLotteryStatus(lotteryId.value, "published");
    message.success("活动发布成功！");
    lotteryDetail.value.status = "published";
  } catch (error) {
    message.error(`发布失败: ${error.message}`);
  }
};

// 结束活动
const handleEnd = async () => {
  Modal.confirm({
    title: "确认结束活动",
    content: "结束活动后将不能再修改或重新启动，确定要结束吗？",
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        await apiService.updateLotteryStatus(lotteryId.value, "ended");
        message.success("活动已结束！");
        lotteryDetail.value.status = "ended";
      } catch (error) {
        message.error(`结束活动失败: ${error.message}`);
      }
    },
  });
};

// 添加奖项相关
const showAddPrizeModal = () => {
  // 重置表单
  prizeForm.level = "";
  prizeForm.name = "";
  prizeForm.image = "";
  prizeForm.probability = 1;
  prizeForm.totalQuantity = null;
  prizeForm.lotteryId = lotteryId.value;

  addPrizeVisible.value = true;
};

const handleAddPrize = async () => {
  try {
    await prizeFormRef.value.validate();

    submitting.value = true;
    await apiService.addLotteryPrize(prizeForm);
    message.success("添加奖项成功");
    addPrizeVisible.value = false;

    // 重新加载奖项列表
    await loadPrizeList();
  } catch (error) {
    message.error(`添加奖项失败: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};

// 删除奖项
const confirmDeletePrize = (record) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除"${record.level} - ${record.name}"奖项吗？`,
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        await apiService.deleteLotteryPrize(record.id);
        message.success("删除奖项成功");
        await loadPrizeList();
      } catch (error) {
        message.error(`删除失败: ${error.message}`);
      }
    },
  });
};

// 规则设置相关
const showRuleModal = () => {
  if (lotteryRule.value) {
    // 已有规则，填充表单
    ruleForm.drawLimit = lotteryRule.value.drawLimit;
    ruleForm.dailyLimit = lotteryRule.value.dailyLimit;
    ruleForm.additionalInfo = lotteryRule.value.additionalInfo;
  } else {
    // 没有规则，使用默认值
    ruleForm.drawLimit = 3;
    ruleForm.dailyLimit = null;
    ruleForm.additionalInfo = "";
  }

  ruleModalVisible.value = true;
};

const handleUpdateRule = async () => {
  try {
    await ruleFormRef.value.validate();

    submitting.value = true;
    await apiService.updateLotteryRule({
      ...ruleForm,
      lotteryId: lotteryId.value,
    });
    message.success("规则设置成功");
    ruleModalVisible.value = false;

    // 重新加载规则信息
    await loadRuleInfo();
  } catch (error) {
    message.error(`规则设置失败: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};

// 查看中奖记录
const goToWinnersList = () => {
  router.push(`/lottery/winners?lotteryId=${lotteryId.value}`);
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
    draft: "草稿",
    published: "已发布",
    ended: "已结束",
  };
  return statusMap[status] || status;
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    draft: "default",
    published: "green",
    ended: "red",
  };
  return colorMap[status] || "default";
};

// 编辑奖项相关
const showEditPrizeModal = (record) => {
  editPrizeForm.id = record.id;
  editPrizeForm.level = record.level;
  editPrizeForm.name = record.name;
  editPrizeForm.image = record.image;
  editPrizeForm.probability = record.probability;
  editPrizeForm.totalQuantity = record.totalQuantity;
  editPrizeForm.lotteryId = lotteryId.value;
  editPrizeVisible.value = true;
};

const handleEditPrize = async () => {
  try {
    await editPrizeFormRef.value.validate();

    submitting.value = true;
    await apiService.updateLotteryPrize(editPrizeForm);
    message.success("编辑奖项成功");
    editPrizeVisible.value = false;

    // 重新加载奖项列表
    await loadPrizeList();
  } catch (error) {
    message.error(`编辑奖项失败: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.lottery-detail-container {
  padding-bottom: 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.form-tip {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  margin-top: 4px;
}
</style>
