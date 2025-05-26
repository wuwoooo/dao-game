<template>
  <div>
    <a-page-header
      title="个人中心"
      sub-title="查看和修改您的个人信息"
      @back="() => router.back()"
    />
    <div style="padding: 24px; max-width: 600px; margin: auto">
      <a-descriptions bordered :column="1" v-if="authStore.adminInfo">
        <a-descriptions-item label="用户名 (登录账号)">{{
          authStore.adminInfo?.username
        }}</a-descriptions-item>
        <a-descriptions-item label="当前姓名">{{
          authStore.adminInfo?.realName || "未设置"
        }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{
          currentRoleName
        }}</a-descriptions-item>
        <a-descriptions-item label="最后登录时间">{{
          formatDateTime(authStore.adminInfo.lastLoginTime)
        }}</a-descriptions-item>
        <a-descriptions-item label="账户创建时间">{{
          formatDateTime(authStore.adminInfo.createdAt)
        }}</a-descriptions-item>
      </a-descriptions>
      <a-skeleton :paragraph="{ rows: 4 }" active v-else />

      <a-divider>修改信息</a-divider>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="新真实姓名" name="realName">
          <a-input
            v-model:value="formState.realName"
            placeholder="输入新的真实姓名 (可选)"
          />
        </a-form-item>

        <a-form-item label="新密码" name="newPassword">
          <a-input-password
            v-model:value="formState.newPassword"
            placeholder="输入新密码 (可选, 6-20字符)"
          />
        </a-form-item>

        <a-form-item
          label="确认新密码"
          name="confirmPassword"
          :dependencies="['newPassword']"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="再次输入新密码"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading"
            >保存更改</a-button
          >
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onActivated } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useAuthStore } from "@/stores/authStore";
import apiService from "@/services/apiService";
import dayjs from "dayjs";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const formRef = ref();
const allRoles = ref([]);

const formState = reactive({
  realName: "",
  newPassword: "",
  confirmPassword: "",
});

const currentRoleName = computed(() => {
  if (
    authStore.adminInfo &&
    authStore.adminInfo.roleId &&
    allRoles.value.length > 0
  ) {
    const role = allRoles.value.find(
      (r) => r.id === authStore.adminInfo.roleId
    );
    return role ? role.name : `角色ID: ${authStore.adminInfo.roleId}`;
  }
  return authStore.adminInfo?.roleId
    ? `角色ID: ${authStore.adminInfo.roleId}`
    : "未知";
});

const fetchAllRoles = async () => {
  try {
    const rolesData = await apiService.getAllRoles();
    if (rolesData) {
      allRoles.value = rolesData;
    }
  } catch (error) {
    message.error("加载角色列表失败，角色名可能无法正确显示。");
    console.error("Failed to fetch roles:", error);
  }
};

const formatDateTime = (dateTimeString) => {
  return dateTimeString
    ? dayjs(dateTimeString).format("YYYY-MM-DD HH:mm:ss")
    : "-";
};

const populateForm = () => {
  if (authStore.adminInfo) {
    formState.realName = authStore.adminInfo.realName || "";
  }
  formState.newPassword = "";
  formState.confirmPassword = "";
  formRef.value?.clearValidate(["newPassword", "confirmPassword"]);
};

onMounted(async () => {
  await fetchAllRoles();
  populateForm();
});

onActivated(async () => {
  console.log(
    "UserProfileView activated, re-fetching roles and populating form..."
  );
  await fetchAllRoles();
  populateForm();
});

const rules = {
  realName: [
    { max: 50, message: "姓名长度不能超过50个字符", trigger: "change" },
  ],
  newPassword: [
    {
      validator: (_, value) => {
        if (value && (value.length < 6 || value.length > 20)) {
          return Promise.reject("新密码长度需为 6 到 20 个字符");
        }
        if (value && formRef.value) {
          formRef.value.validateFields(["confirmPassword"]);
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
  confirmPassword: [
    {
      validator: (_, value) => {
        if (formState.newPassword && !value) {
          return Promise.reject("请再次输入新密码");
        }
        if (value && formState.newPassword && value !== formState.newPassword) {
          return Promise.reject("两次输入的密码不一致！");
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;
    const payload = {};
    const originalRealName = authStore.adminInfo?.realName || "";
    if (formState.realName.trim() !== originalRealName) {
      payload.realName = formState.realName.trim();
    }
    if (formState.newPassword) {
      payload.password = formState.newPassword;
    }

    if (Object.keys(payload).length === 0) {
      message.info("未检测到任何更改。");
      loading.value = false;
      return;
    }

    await apiService.updateMyProfile(payload);
    message.success("个人信息更新成功！");

    if (payload.realName !== undefined) {
      const updatedAdminInfo = {
        ...(authStore.adminInfo || {}),
        realName: payload.realName,
      };
      authStore.adminInfo = updatedAdminInfo;
      localStorage.setItem("adminInfo", JSON.stringify(updatedAdminInfo));
    }

    formState.newPassword = "";
    formState.confirmPassword = "";
    formRef.value.clearValidate(["newPassword", "confirmPassword"]);
  } catch (errorInfo) {
    if (
      errorInfo &&
      errorInfo.message &&
      typeof errorInfo.message === "string"
    ) {
      message.error(`更新失败: ${errorInfo.message}`);
    } else if (
      errorInfo &&
      errorInfo.errorFields &&
      Array.isArray(errorInfo.errorFields)
    ) {
      message.error("请检查表单输入！");
      console.log("Profile form validation failed:", errorInfo.errorFields);
    } else {
      message.error("更新操作遇到未知错误。");
      console.error(
        "Profile update failed with unknown error structure:",
        errorInfo
      );
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add specific styles if needed */
</style>
