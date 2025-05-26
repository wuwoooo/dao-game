<template>
  <div>
    <a-page-header
      title="后台用户管理"
      sub-title="管理可以登录后台的管理员账户"
    >
      <template #extra>
        <a-button type="primary" @click="showAddModal">添加用户</a-button>
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
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? "启用" : "禁用" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'roleId'">
            <span>{{ getRoleName(record.roleId) }}</span>
          </template>
          <template v-else-if="column.key === 'lastLoginTime'">
            <span>{{ formatDateTime(record.lastLoginTime) }}</span>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            <span>{{ formatDateTime(record.createdAt) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="middle">
              <a-button type="link" @click="showEditModal(record)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确定要删除这个用户吗?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
                :disabled="record.username === 'admin'"
              >
                <a-button
                  type="link"
                  danger
                  :disabled="record.username === 'admin'"
                  >删除</a-button
                >
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalMode === 'add' ? '添加用户' : '编辑用户'"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="modalFormRef"
        :model="modalFormState"
        :rules="modalRules"
        layout="vertical"
        name="userForm"
      >
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="modalFormState.username"
            :disabled="modalMode === 'edit'"
            placeholder="请输入用户名 (登录账号)"
          />
        </a-form-item>
        <a-form-item
          label="密码"
          :name="modalMode === 'add' ? 'password' : 'passwordOptional'"
        >
          <a-input-password
            v-model:value="modalFormState.password"
            :placeholder="
              modalMode === 'add' ? '请输入密码' : '留空则不修改密码'
            "
          />
        </a-form-item>
        <a-form-item label="姓名" name="realName">
          <a-input
            v-model:value="modalFormState.realName"
            placeholder="请输入真实姓名"
          />
        </a-form-item>
        <a-form-item label="角色" name="roleId">
          <a-select
            v-model:value="modalFormState.roleId"
            placeholder="请选择角色"
            :options="roleOptions"
            :loading="rolesLoading"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="modalFormState.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import apiService from "@/services/apiService";
import dayjs from "dayjs";

const loading = ref(false);
const rolesLoading = ref(false);
const dataSource = ref([]);
const roleOptions = ref([]); // { value: roleId, label: roleName }

// --- Modal State and Form ---
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalMode = ref("add"); // 'add' or 'edit'
const editingUserId = ref(null);
const modalFormRef = ref();
const modalFormState = reactive({
  username: "",
  password: "",
  realName: "",
  roleId: null,
  status: 1, // Default to enabled
});

// --- Pagination ---
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: (total) => `共 ${total} 条`,
});

// --- Table Columns ---
const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 80 },
  { title: "用户名", dataIndex: "username", key: "username", sorter: true },
  { title: "姓名", dataIndex: "realName", key: "realName" },
  { title: "角色", dataIndex: "roleId", key: "roleId" }, // Display role name via getRoleName
  { title: "状态", dataIndex: "status", key: "status", width: 100 },
  {
    title: "最后登录时间",
    dataIndex: "lastLoginTime",
    key: "lastLoginTime",
    sorter: true,
  },
  { title: "创建时间", dataIndex: "createdAt", key: "createdAt", sorter: true },
  { title: "操作", key: "action", width: 150, fixed: "right" },
];

// --- Modal Form Rules ---
const modalRules = {
  username: [
    { required: true, message: "请输入用户名" },
    { min: 3, max: 20, message: "用户名长度为 3 到 20 个字符" },
    // Add pattern validation if needed
  ],
  password: [
    { required: true, message: "请输入密码" },
    { min: 6, max: 20, message: "密码长度为 6 到 20 个字符" },
  ],
  passwordOptional: [
    // Only validate if password is not empty during edit
    {
      validator: (_, value) => {
        if (value && (value.length < 6 || value.length > 20)) {
          return Promise.reject("密码长度需为 6 到 20 个字符");
        }
        return Promise.resolve();
      },
    },
  ],
  roleId: [{ required: true, message: "请选择角色" }],
  status: [{ required: true, message: "请选择状态" }],
};

// --- Utility Functions ---
const formatDateTime = (dateTimeString) => {
  return dateTimeString
    ? dayjs(dateTimeString).format("YYYY-MM-DD HH:mm:ss")
    : "-";
};

const getRoleName = (roleId) => {
  const role = roleOptions.value.find((r) => r.value === roleId);
  return role ? role.label : `ID: ${roleId}`;
};

// --- API Calls ---
const fetchRoles = async () => {
  rolesLoading.value = true;
  try {
    const roles = await apiService.getAllRoles();
    roleOptions.value = roles.map((role) => ({
      value: role.id,
      label: role.name,
    }));
  } catch (error) {
    message.error("加载角色列表失败: " + error.message);
  } finally {
    rolesLoading.value = false;
  }
};

const fetchAdminUsers = async (params = {}) => {
  loading.value = true;
  const queryParams = {
    current: pagination.current,
    size: pagination.pageSize,
    ...params,
  };
  try {
    const responseData = await apiService.getAdminUsers(queryParams);
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
    message.error(`获取用户列表失败: ${error.message}`);
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// --- Modal Handling ---
const showAddModal = () => {
  modalMode.value = "add";
  editingUserId.value = null;
  // Reset form fields
  Object.assign(modalFormState, {
    username: "",
    password: "",
    realName: "",
    roleId: null,
    status: 1,
  });
  modalVisible.value = true;
  modalFormRef.value?.clearValidate(); // Clear validation states if opened before
};

const showEditModal = (record) => {
  modalMode.value = "edit";
  editingUserId.value = record.id;
  Object.assign(modalFormState, {
    username: record.username,
    password: "", // Password is not pre-filled for editing
    realName: record.realName,
    roleId: record.roleId,
    status: record.status,
  });
  modalVisible.value = true;
  modalFormRef.value?.clearValidate();
};

const handleModalOk = async () => {
  try {
    await modalFormRef.value.validate();
    modalLoading.value = true;

    const payload = { ...modalFormState };
    // Do not send empty password field when editing unless it means clearing it (API dependent)
    if (modalMode.value === "edit" && !payload.password) {
      delete payload.password; // Don't update password if field is empty
    }

    if (modalMode.value === "add") {
      await apiService.addAdminUser(payload);
      message.success("用户添加成功！");
    } else {
      // edit mode
      await apiService.updateAdminUser(editingUserId.value, {
        id: editingUserId.value,
        ...payload,
      });
      message.success("用户信息更新成功！");
    }
    modalVisible.value = false;
    fetchAdminUsers(); // Refresh table data
  } catch (errorInfo) {
    if (errorInfo.message) {
      // API error
      message.error(`操作失败: ${errorInfo.message}`);
    } else {
      // Form validation error
      message.error("请检查表单输入！");
      console.log("Modal form validation failed:", errorInfo);
    }
  } finally {
    modalLoading.value = false;
  }
};

const handleModalCancel = () => {
  modalVisible.value = false;
};

// --- Table Actions ---
const handleDelete = async (userId) => {
  try {
    await apiService.deleteAdminUser(userId);
    message.success("用户删除成功！");
    fetchAdminUsers(); // Refresh table data
  } catch (error) {
    message.error(`删除失败: ${error.message}`);
  }
};

// Handle table changes (pagination, sorting)
const handleTableChange = (pag, filters, sorter) => {
  const params = {
    current: pag.current,
    size: pag.pageSize,
  };
  if (sorter && sorter.field) {
    const sortField =
      sorter.field === "createdAt"
        ? "created_at"
        : sorter.field === "lastLoginTime"
        ? "last_login_time"
        : sorter.field;
    params.sort = `${sortField},${sorter.order === "ascend" ? "asc" : "desc"}`;
  }
  fetchAdminUsers(params);
};

// --- Initial Data Loading ---
onMounted(() => {
  fetchAdminUsers();
  fetchRoles(); // Fetch roles for the modal dropdown
});
</script>

<style scoped>
/* Add specific styles if needed */
</style>
