<template>
  <div>
    <a-page-header title="应用列表" sub-title="管理所有已上架和待审核的应用">
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchParams.name"
            placeholder="按应用名称搜索"
            style="width: 180px"
            @search="onSearch"
            allow-clear
          />
          <a-select
            v-model:value="searchParams.status"
            placeholder="按状态筛选"
            style="width: 120px"
            @change="onSearch"
            allow-clear
            :options="statusOptions"
          />
          <a-select
            v-model:value="searchParams.ownerId"
            placeholder="按所有者筛选"
            style="width: 180px"
            @change="onSearch"
            allow-clear
            show-search
            :filter-option="filterOwnerOption"
            :options="ownerOptions"
            :loading="ownersLoading"
          />
          <a-select
            v-model:value="searchParams.isRecommend"
            placeholder="是否推荐"
            style="width: 120px"
            @change="onSearch"
            allow-clear
            :options="recommendOptions"
          />
          <a-select
            v-model:value="searchParams.visible"
            placeholder="是否显示"
            style="width: 120px"
            @change="onSearch"
            allow-clear
            :options="visibleOptions"
          />
          <a-button type="primary" @click="showAddAppModal">新增应用</a-button>
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
          <template v-if="column.key === 'name'">
            <a-tooltip :title="record.description">
              <strong>{{ record.name }}</strong>
              <div v-if="record.tags" style="font-size: 0.8em; color: #888">
                <small>标签: {{ record.tags }}</small>
              </div>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'isRecommend'">
            <a-switch
              :checked="record.isRecommend === 1"
              @change="(checked) => handleToggleRecommend(record, checked)"
              checked-children="是"
              un-checked-children="否"
              :loading="record.recommendLoading"
            />
          </template>
          <template v-else-if="column.key === 'visible'">
            <a-switch
              :checked="record.visible === 1"
              @change="(checked) => handleToggleVisibility(record, checked)"
              checked-children="显示"
              un-checked-children="隐藏"
              :loading="record.visibilityLoading"
            />
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            <span>{{ formatDateTime(record.createdAt) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="small">
              <a-button
                type="link"
                size="small"
                @click="showPreviewModal(record)"
                v-if="record.url"
                >预览</a-button
              >
              <a-button
                type="link"
                size="small"
                @click="showEditAppModal(record)"
                >编辑</a-button
              >
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Edit App Modal -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑应用信息"
      :confirm-loading="editModalLoading"
      width="600px"
      @ok="handleEditModalOk"
      @cancel="handleEditModalCancel"
    >
      <a-form
        ref="editFormRef"
        :model="editFormState"
        :rules="editFormRules"
        layout="vertical"
        name="editAppForm"
      >
        <a-form-item label="应用名称" name="name">
          <a-input v-model:value="editFormState.name" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="类型" name="type">
              <a-select
                v-model:value="editFormState.type"
                :options="appTypeOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select
                v-model:value="editFormState.status"
                :options="statusOptions"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item
          label="页面地址 (URL，前往第三方的介绍或下载地址)"
          name="url"
        >
          <a-input v-model:value="editFormState.url" />
        </a-form-item>
        <a-form-item label="图标地址 (Icon URL)" name="icon">
          <a-input v-model:value="editFormState.icon" />
        </a-form-item>
        <a-form-item
          label="游戏内嵌URL (Embed URL，游戏类必填)"
          name="embedUrl"
        >
          <a-input
            v-model:value="editFormState.embedUrl"
            placeholder="请输入嵌入页面的URL"
          />
        </a-form-item>
        <a-form-item label="封面图片 (Cover Image)" name="coverImage">
          <a-input
            v-model:value="editFormState.coverImage"
            placeholder="请输入封面图片的URL"
          />
        </a-form-item>
        <a-form-item label="应用描述" name="description">
          <a-textarea v-model:value="editFormState.description" :rows="3" />
        </a-form-item>
        <a-form-item label="标签 (逗号分隔)" name="tags">
          <a-input v-model:value="editFormState.tags" />
        </a-form-item>
        <a-form-item label="可见性" name="visible">
          <a-switch
            v-model:checked="editFormState.visible"
            checked-children="可见"
            un-checked-children="不可见"
            :checkedValue="1"
            :unCheckedValue="0"
          />
        </a-form-item>
        <a-form-item label="审核备注" name="reviewRemark">
          <a-textarea v-model:value="editFormState.reviewRemark" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Add App Modal -->
    <a-modal
      v-model:open="appModalVisible"
      :title="appModalMode === 'add' ? '新增应用 (管理员)' : '编辑应用信息'"
      :confirm-loading="appModalLoading"
      width="600px"
      @ok="handleAppModalOk"
      @cancel="handleAppModalCancel"
      destroyOnClose
    >
      <a-form
        ref="appFormRef"
        :model="appFormState"
        :rules="appFormRules"
        layout="vertical"
        name="appForm"
      >
        <a-form-item label="应用名称" name="name">
          <a-input
            v-model:value="appFormState.name"
            placeholder="请输入应用名称"
          />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="类型" name="type">
              <a-select
                v-model:value="appFormState.type"
                :options="appTypeOptions"
                placeholder="请选择类型"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select
                v-model:value="appFormState.status"
                :options="statusOptions"
                placeholder="请选择状态"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="页面地址 (URL)" name="url">
          <a-input
            v-model:value="appFormState.url"
            placeholder="请输入 https://..."
          />
        </a-form-item>
        <a-form-item label="图标地址 (Icon URL)" name="icon">
          <a-input
            v-model:value="appFormState.icon"
            placeholder="请输入图标的URL"
          />
        </a-form-item>
        <a-form-item label="嵌入URL (Embed URL)" name="embedUrl">
          <a-input
            v-model:value="appFormState.embedUrl"
            placeholder="请输入嵌入页面的URL"
          />
        </a-form-item>
        <a-form-item label="封面图片 (Cover Image)" name="coverImage">
          <a-input
            v-model:value="appFormState.coverImage"
            placeholder="请输入封面图片的URL"
          />
        </a-form-item>
        <a-form-item label="应用描述" name="description">
          <a-textarea
            v-model:value="appFormState.description"
            :rows="3"
            placeholder="请输入应用描述"
          />
        </a-form-item>
        <a-form-item label="标签 (逗号分隔)" name="tags">
          <a-input
            v-model:value="appFormState.tags"
            placeholder="例如: 休闲,益智,动作"
          />
        </a-form-item>
        <a-form-item label="是否推荐" name="isRecommend">
          <a-switch
            v-model:checked="appFormState.isRecommend"
            checked-children="是"
            un-checked-children="否"
            :checkedValue="1"
            :unCheckedValue="0"
          />
        </a-form-item>
        <a-form-item label="可见性" name="visible">
          <a-switch
            v-model:checked="appFormState.visible"
            checked-children="可见"
            un-checked-children="不可见"
            :checkedValue="1"
            :unCheckedValue="0"
          />
        </a-form-item>
        <a-form-item label="审核备注 (可选)" name="reviewRemark">
          <a-textarea
            v-model:value="appFormState.reviewRemark"
            :rows="2"
            placeholder="例如: 由管理员直接添加并审核通过"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Preview Modal -->
    <a-modal
      v-model:open="previewModalVisible"
      title="应用预览"
      :footer="null"
      width="80%"
      height="80vh"
      centered
      @cancel="previewUrl = null"
    >
      <iframe
        :src="previewUrl"
        style="width: 100%; height: calc(80vh - 55px - 53px); border: none"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import apiService from "@/services/apiService";
import dayjs from "dayjs";

const router = useRouter();
const loading = ref(false);
const ownersLoading = ref(false);
const dataSource = ref([]);
const ownerOptions = ref([]); // For owner filter dropdown

// Search and Filter parameters
const searchParams = reactive({
  name: undefined,
  status: undefined,
  ownerId: undefined,
  isRecommend: undefined,
  visible: undefined,
});

// Pagination state, controlled by API response
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
  { title: "ID", dataIndex: "id", key: "id", sorter: true, width: 70 },
  {
    title: "应用名称",
    dataIndex: "name",
    key: "name",
    sorter: true,
    ellipsis: true,
    width: 200,
  },
  {
    title: "所有者名称",
    dataIndex: "ownerName",
    key: "ownerName",
    sorter: true,
    width: 120,
  },
  {
    title: "类型",
    dataIndex: "type",
    key: "type",
    width: 70,
  },
  {
    title: "是否推荐",
    dataIndex: "isRecommend",
    key: "isRecommend",
    width: 90,
    align: "center",
  },
  {
    title: "点击次数",
    dataIndex: "clickCount",
    key: "clickCount",
    width: 80,
    sorter: true,
    align: "center",
  },
  {
    title: "是否显示",
    dataIndex: "visible",
    key: "visible",
    width: 90,
    align: "center",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 90,
    align: "center",
  },
  {
    title: "提交时间",
    dataIndex: "createdAt",
    key: "createdAt",
    sorter: true,
    width: 150,
  },
  { title: "操作", key: "action", width: 120, fixed: "right", align: "center" },
];

const statusOptions = [
  { value: "Pending", label: "待审核" },
  { value: "Approved", label: "已批准" },
  { value: "Rejected", label: "已驳回" },
];

const appTypeOptions = [
  { value: "Game", label: "游戏" },
  { value: "App", label: "应用" },
];

// --- Edit Modal State & Logic ---
const editModalVisible = ref(false);
const editModalLoading = ref(false);
const editFormRef = ref();
const currentEditingAppId = ref(null);
const editFormState = reactive({
  id: null,
  name: "",
  type: "Game",
  url: "",
  icon: "",
  embedUrl: "",
  coverImage: "",
  description: "",
  tags: "",
  status: "Pending",
  visible: 0, // Assuming 0 for false, 1 for true as per schema
  reviewRemark: "",
});

const editFormRules = {
  name: [{ required: true, message: "请输入应用名称" }],
  type: [{ required: true, message: "请选择应用类型" }],
  url: [
    { required: true, message: "请输入页面地址" },
    { type: "url", message: "请输入有效的URL" },
  ],
  embedUrl: [{ type: "url", message: "请输入有效的嵌入URL" }],
  coverImage: [{ type: "url", message: "请输入有效的封面图片URL" }],
  status: [{ required: true, message: "请选择状态" }],
  // visible is a switch, usually doesn't need explicit rule unless complex logic
};

const showEditAppModal = async (record) => {
  appModalMode.value = "edit";
  currentEditingAppId.value = record.id;
  try {
    const appDetails = await apiService.getAppDetail(record.id);
    if (appDetails) {
      Object.assign(editFormState, {
        ...appDetails,
        id: appDetails.id,
        visible: appDetails.visible === 1 ? 1 : 0,
        isRecommend: appDetails.isRecommend === 1 ? 1 : 0,
      });
    } else {
      Object.assign(editFormState, {
        ...record,
        id: record.id,
        visible: record.visible === 1 ? 1 : 0,
        isRecommend: record.isRecommend === 1 ? 1 : 0,
      });
      message.warn("获取应用完整详情失败。");
    }
  } catch (error) {
    message.error("加载应用详情失败: " + error.message);
    Object.assign(editFormState, {
      ...record,
      id: record.id,
      visible: record.visible === 1 ? 1 : 0,
      isRecommend: record.isRecommend === 1 ? 1 : 0,
    });
  }
  editModalVisible.value = true;
  editFormRef.value?.clearValidate();
};

const handleEditModalOk = async () => {
  try {
    await editFormRef.value.validate();
    editModalLoading.value = true;

    const payload = { ...editFormState };
    // editFormState.visible should already be 0 or 1
    // No specific conversion like payload.visible = payload.visible ? 1 : 0; is needed here.

    console.log("Submitting update with payload:", payload); // Log payload before sending

    await apiService.updateAdminApp(currentEditingAppId.value, payload);
    message.success("应用信息更新成功！");
    editModalVisible.value = false;
    fetchApps({ current: pagination.current, size: pagination.pageSize }); // Refresh list
  } catch (errorInfo) {
    if (errorInfo.message) {
      message.error(`更新失败: ${errorInfo.message}`);
    } else {
      message.error("请检查表单输入！");
    }
    console.error("Update app failed:", errorInfo); // Log full error for debugging
  } finally {
    editModalLoading.value = false;
  }
};

const handleEditModalCancel = () => {
  editModalVisible.value = false;
};
// --- End Edit Modal Logic ---

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "orange";
    case "Approved":
      return "green";
    case "Rejected":
      return "red";
    default:
      return "default";
  }
};

const getStatusText = (status) => {
  const found = statusOptions.find((s) => s.value === status);
  return found ? found.label : status;
};

const formatDateTime = (dateTimeString) => {
  return dateTimeString
    ? dayjs(dateTimeString).format("YYYY-MM-DD HH:mm")
    : "N/A"; // Shorter format for table
};

const fetchOwnersForFilter = async () => {
  ownersLoading.value = true;
  try {
    // Fetch all owners for the filter dropdown - assuming no pagination needed here, or fetch first N
    const responseData = await apiService.getOwners({ current: 1, size: 1000 }); // Fetch a large number
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

const recommendOptions = [
  { value: 1, label: "是" },
  { value: 0, label: "否" },
];

const visibleOptions = [
  { value: 1, label: "显示" },
  { value: 0, label: "隐藏" },
];

const fetchApps = async (params = {}) => {
  loading.value = true;
  const queryParams = {
    current: pagination.current,
    size: pagination.pageSize,
    name: searchParams.name,
    status: searchParams.status,
    ownerId: searchParams.ownerId,
    isRecommend: searchParams.isRecommend,
    visible: searchParams.visible,
    ...params, // For sorting from handleTableChange
  };

  try {
    const responseData = await apiService.getAdminApps(queryParams);
    if (responseData && responseData.records) {
      dataSource.value = responseData.records.map((r) => ({
        ...r,
        recommendLoading: false,
        visibilityLoading: false,
      }));
      pagination.total = responseData.total;
      pagination.current = responseData.current;
      pagination.pageSize = responseData.size;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    message.error(`获取应用列表失败: ${error.message}`);
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// Handle table changes (pagination, sorting, filtering)
const handleTableChange = (pag, filters, sorter) => {
  const params = {
    current: pag.current,
    size: pag.pageSize,
  };
  if (sorter && sorter.field) {
    // Ensure field names match backend expectations (e.g., ownerId vs owner_id)
    // The API doc for GET /v1/admin/apps lists sortField: id, name, createdAt, status
    // So we should use these exact names if possible, or ensure backend handles frontend names.
    let sortField = sorter.field;
    // Example mapping if frontend dataIndex is different from backend sortField
    // if (sorter.field === 'ownerName') sortField = 'owner.name'; // If backend supports nested sort
    // For now, assume direct mapping for existing fields
    params.sortField = sortField;
    params.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
  }

  // Handle column-based filters if they are used and API supports them
  // Example: if (filters.status && filters.status.length) { params.status = filters.status.join(','); }

  fetchApps(params);
};

// Handle top search/filter changes
const onSearch = () => {
  pagination.current = 1;
  fetchApps();
};

onMounted(() => {
  fetchApps();
  fetchOwnersForFilter(); // Load owner options for filter dropdown
});

const viewDetails = (record) => {
  message.info(`查看应用 #${record.id} (${record.name}) 详情 (待实现)`);
  // Example: router.push(`/app/details/${record.id}`);
  // Or use the admin detail view if it exists
  // Example: router.push({ name: 'AppDetailAdmin', params: { id: record.id } });
};

const reviewApp = (record) => {
  router.push({ name: "app-review", query: { appId: record.id } });
};

const toggleVisibility = async (record, checked) => {
  const targetVisibleValue = checked ? 1 : 0;
  record.visibilityLoading = true; // Add a loading state to the specific record
  try {
    // API expects a boolean for visible param in toggleAppVisibility
    await apiService.toggleAppVisibility(record.id, checked);
    message.success(
      `应用 "${record.name}" 已成功${checked ? "上架(显示)" : "下架(隐藏)"}。`
    );
    const index = dataSource.value.findIndex((item) => item.id === record.id);
    if (index !== -1) {
      dataSource.value[index] = {
        ...dataSource.value[index],
        visible: targetVisibleValue,
        visibilityLoading: false,
      };
    } else {
      fetchApps();
    }
  } catch (error) {
    message.error(`操作失败: ${error.message}`);
    record.visibilityLoading = false;
  }
};

const initialAppFormState = () => ({
  id: null,
  name: "",
  type: "Game",
  url: "",
  icon: "",
  embedUrl: "",
  coverImage: "",
  description: "",
  tags: "",
  status: "Approved",
  visible: 1,
  reviewRemark: "由管理员直接添加并审核通过",
  isRecommend: 0,
});

const appFormState = reactive({ ...initialAppFormState() });

const appFormRules = {
  name: [{ required: true, message: "请输入应用名称" }],
  type: [{ required: true, message: "请选择应用类型" }],
  url: [
    { required: true, message: "请输入页面地址" },
    { type: "url", message: "请输入有效的URL" },
  ],
  embedUrl: [{ type: "url", message: "请输入有效的嵌入URL" }],
  coverImage: [{ type: "url", message: "请输入有效的封面图片URL" }],
  status: [{ required: true, message: "请选择状态" }],
  // isRecommend is a switch, usually doesn't need rule unless complex logic
};

const appModalMode = ref("add");
const appModalVisible = ref(false);
const appModalLoading = ref(false);
const appFormRef = ref();

const showAddAppModal = () => {
  appModalMode.value = "add";
  currentEditingAppId.value = null;
  Object.assign(appFormState, initialAppFormState());
  // Set default remark for admin adding an app
  appFormState.reviewRemark = "由管理员直接添加并审核通过";
  appModalVisible.value = true;
  nextTick(() => {
    appFormRef.value?.clearValidate();
  });
};

const handleAppModalOk = async () => {
  try {
    await appFormRef.value.validate();
    appModalLoading.value = true;
    let payload;

    if (appModalMode.value === "add") {
      payload = {
        ownerId: 1,
        name: appFormState.name,
        type: appFormState.type,
        url: appFormState.url,
        icon: appFormState.icon || null,
        embedUrl: appFormState.embedUrl || null,
        coverImage: appFormState.coverImage || null,
        description: appFormState.description || null,
        tags: appFormState.tags || null,
        status: appFormState.status,
        visible: appFormState.visible,
        reviewRemark: appFormState.reviewRemark || null,
        isRecommend: appFormState.isRecommend,
      };
      await apiService.createAdminApp(payload);
      message.success("应用新增成功！");
    } else {
      payload = { ...appFormState };
      payload.id = currentEditingAppId.value;
      await apiService.updateAdminApp(currentEditingAppId.value, payload);
      message.success("应用信息更新成功！");
    }
    appModalVisible.value = false;
    fetchApps({ current: pagination.current, size: pagination.pageSize });
  } catch (errorInfo) {
    if (errorInfo && errorInfo.message) {
      message.error(
        `${appModalMode.value === "add" ? "新增" : "更新"}失败: ${
          errorInfo.message
        }`
      );
    } else if (errorInfo && errorInfo.errorFields) {
      message.error("请检查表单输入！");
      console.log("App form validation failed:", errorInfo);
    } else {
      message.error(
        `${appModalMode.value === "add" ? "新增" : "更新"}失败，请稍后重试。`
      );
      console.error(
        "App modal operation failed (unknown structure):",
        errorInfo
      );
    }
  } finally {
    appModalLoading.value = false;
  }
};

const handleAppModalCancel = () => {
  appModalVisible.value = false;
};

// --- Preview Modal State ---
const previewModalVisible = ref(false);
const previewUrl = ref(null);

const showPreviewModal = (record) => {
  if (record.url) {
    // Basic URL validation (optional, can be more robust)
    if (record.url.startsWith("http://") || record.url.startsWith("https://")) {
      previewUrl.value = record.url;
      previewModalVisible.value = true;
    } else {
      message.error("无效的应用预览地址。");
    }
  } else {
    message.warn("此应用没有提供预览地址。");
  }
};

// --- Toggle Recommend Logic ---
const handleToggleRecommend = async (record, checked) => {
  const newIsRecommendValue = checked ? 1 : 0;
  record.recommendLoading = true;
  try {
    // Construct payload including the app ID, as required by the PUT endpoint's body
    const payload = {
      id: record.id,
      isRecommend: newIsRecommendValue,
    };
    await apiService.updateAdminApp(record.id, payload);
    message.success(
      `应用 "${record.name}" 已${
        newIsRecommendValue === 1 ? "设为" : "取消"
      }推荐`
    );

    // Update local data to reflect the change immediately
    const index = dataSource.value.findIndex((item) => item.id === record.id);
    if (index !== -1) {
      // Create a new object for reactivity
      const updatedRecord = {
        ...dataSource.value[index],
        isRecommend: newIsRecommendValue,
        recommendLoading: false,
      };
      dataSource.value.splice(index, 1, updatedRecord);
    } else {
      fetchApps(); // Fallback if record not found in current dataSource (should not happen)
    }
  } catch (error) {
    message.error(`操作失败: ${error.message}`);
    // Revert switch state on error (optional, or refresh from server)
    // record.isRecommend = record.isRecommend === 1 ? 0 : 1;
  } finally {
    // Ensure loading state is always reset, even if not found in splice above
    const r = dataSource.value.find((item) => item.id === record.id);
    if (r) r.recommendLoading = false;
    else record.recommendLoading = false; // If somehow record was a detached copy
  }
};

// --- Toggle Visibility Logic (Modified from existing) ---
const handleToggleVisibility = async (record, checked) => {
  const targetVisibleValue = checked ? 1 : 0;
  record.visibilityLoading = true; // Add a loading state to the specific record
  try {
    // API expects a boolean for visible param in toggleAppVisibility
    await apiService.toggleAppVisibility(record.id, checked);
    message.success(
      `应用 "${record.name}" 已成功${checked ? "上架(显示)" : "下架(隐藏)"}。`
    );
    const index = dataSource.value.findIndex((item) => item.id === record.id);
    if (index !== -1) {
      dataSource.value[index] = {
        ...dataSource.value[index],
        visible: targetVisibleValue,
        visibilityLoading: false,
      };
    } else {
      fetchApps();
    }
  } catch (error) {
    message.error(`操作失败: ${error.message}`);
    record.visibilityLoading = false;
  }
};
</script>

<style scoped>
/* Styles for App List page */
.ant-table-cell-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Adjust styles if needed */
.ant-table-cell .ant-tag {
  cursor: pointer; /* if using tags for toggle, not switches */
}

iframe {
  background-color: #f0f2f5; /* Light background for iframe while loading */
}
</style>
