<template>
  <div class="role-management-container">
    <div class="header-actions">
      <a-row justify="space-between" align="middle">
        <a-col>
          <h2>角色权限管理</h2>
        </a-col>
      </a-row>
    </div>

    <a-row :gutter="16">
      <!-- 角色列表部分 -->
      <a-col :span="8">
        <a-card title="角色列表" :loading="loadingRoles">
          <a-list
            :data-source="roleList"
            :loading="loadingRoles"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="item.name"
                  :description="item.description || '无描述'"
                >
                  <template #avatar>
                    <team-outlined
                      :style="{
                        color: selectedRoleId === item.id ? '#1890ff' : '#aaa',
                      }"
                    />
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button
                    type="link"
                    :disabled="loadingPermissions"
                    @click="handleSelectRole(item)"
                    :class="{ 'selected-role': selectedRoleId === item.id }"
                  >
                    选择
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 权限设置部分 -->
      <a-col :span="16">
        <a-card
          :title="`权限分配: ${selectedRoleName}`"
          :loading="loadingPermissions"
          :extra="
            selectedRoleId
              ? '请选择该角色拥有的权限，然后点击保存'
              : '请先选择左侧的角色'
          "
        >
          <div v-if="!selectedRoleId" class="empty-permissions">
            <a-empty description="请先选择角色" />
          </div>

          <div v-else>
            <a-spin :spinning="loadingPermissions">
              <!-- 权限分组展示 -->
              <a-space direction="vertical" style="width: 100%">
                <a-checkbox
                  :indeterminate="isIndeterminate"
                  :checked="checkAll"
                  @change="onCheckAllChange"
                >
                  全选/取消全选
                </a-checkbox>
                <a-divider />

                <a-checkbox-group
                  v-model:value="selectedPermissions"
                  style="width: 100%"
                >
                  <div
                    v-for="perm in permissionList"
                    :key="perm.id"
                    class="permission-item"
                  >
                    <a-checkbox :value="perm.id">
                      {{ perm.name }}
                      <span class="permission-desc">{{
                        perm.description
                      }}</span>
                    </a-checkbox>
                  </div>
                </a-checkbox-group>
              </a-space>

              <div style="margin-top: 24px; text-align: right">
                <a-button
                  type="primary"
                  @click="savePermissions"
                  :loading="saving"
                  :disabled="!selectedRoleId"
                >
                  保存权限设置
                </a-button>
              </div>
            </a-spin>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { TeamOutlined } from "@ant-design/icons-vue";
import apiService from "@/services/apiService";

// 角色列表相关
const roleList = ref([]);
const loadingRoles = ref(false);
const selectedRoleId = ref(null);
const selectedRoleName = computed(() => {
  const role = roleList.value.find((r) => r.id === selectedRoleId.value);
  return role ? role.name : "未选择";
});

// 权限列表相关
const permissionList = ref([]);
const loadingPermissions = ref(false);
const selectedPermissions = ref([]);
const saving = ref(false);

// 计算全选状态
const isIndeterminate = computed(() => {
  return (
    selectedPermissions.value.length > 0 &&
    selectedPermissions.value.length < permissionList.value.length
  );
});

const checkAll = computed(() => {
  return (
    permissionList.value.length > 0 &&
    selectedPermissions.value.length === permissionList.value.length
  );
});

// 初始化
onMounted(async () => {
  await fetchRoleList();
  await fetchPermissionList();
});

// 获取角色列表
const fetchRoleList = async () => {
  loadingRoles.value = true;
  try {
    const response = await apiService.getAllRoles();
    roleList.value = response || [];
  } catch (error) {
    message.error(`获取角色列表失败: ${error.message}`);
  } finally {
    loadingRoles.value = false;
  }
};

// 获取权限列表
const fetchPermissionList = async () => {
  loadingPermissions.value = true;
  try {
    const response = await apiService.getAllPermissions();
    permissionList.value = response || [];
  } catch (error) {
    message.error(`获取权限列表失败: ${error.message}`);
  } finally {
    loadingPermissions.value = false;
  }
};

// 选择角色
const handleSelectRole = async (role) => {
  selectedRoleId.value = role.id;
  await fetchRolePermissions(role.id);
};

// 获取角色的权限
const fetchRolePermissions = async (roleId) => {
  loadingPermissions.value = true;
  try {
    // 直接获取角色权限ID列表
    const permissions = await apiService.getRolePermissions(roleId);
    selectedPermissions.value = permissions || [];
  } catch (error) {
    message.error(`获取角色权限失败: ${error.message}`);
    selectedPermissions.value = [];
  } finally {
    loadingPermissions.value = false;
  }
};

// 全选/取消全选
const onCheckAllChange = (e) => {
  if (e.target.checked) {
    selectedPermissions.value = permissionList.value.map((p) => p.id);
  } else {
    selectedPermissions.value = [];
  }
};

// 保存权限设置
const savePermissions = async () => {
  if (!selectedRoleId.value) {
    message.warning("请先选择角色");
    return;
  }

  saving.value = true;
  try {
    await apiService.updateRolePermissions(
      selectedRoleId.value,
      selectedPermissions.value
    );
    message.success("权限设置保存成功");
  } catch (error) {
    message.error(`保存权限设置失败: ${error.message}`);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.role-management-container {
  padding-bottom: 24px;
}

.header-actions {
  margin-bottom: 16px;
}

.permission-item {
  padding: 6px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.permission-desc {
  margin-left: 10px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.selected-role {
  font-weight: bold;
  color: #1890ff;
}

.empty-permissions {
  padding: 60px 0;
  text-align: center;
}
</style>
