<template>
  <div class="login-container">
    <a-card class="login-card" :bordered="false">
      <template #title>
        <div style="text-align: center; margin-bottom: 20px">
          <img
            src="/vite.svg"
            alt="logo"
            style="height: 48px; margin-bottom: 10px"
          />
          <h2>Aisky Admin 登录</h2>
        </div>
      </template>
      <a-form
        :model="formState"
        name="login"
        layout="vertical"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <a-input v-model:value="formState.username" placeholder="admin">
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="password"
          >
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="remember">
          <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block>
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import apiService from "@/services/apiService"; // Import the apiService
import { useAuthStore } from "@/stores/authStore";

// Functions to interact with localStorage for auth state
const setAuthToken = (token) => localStorage.setItem("authToken", token);
const setUsername = (username) => localStorage.setItem("username", username);
const setUserInfo = (adminInfo) =>
  localStorage.setItem("adminInfo", JSON.stringify(adminInfo)); // Store full admin info

const router = useRouter();
const authStore = useAuthStore();

const formState = reactive({
  username: "admin", // Default for convenience
  password: "admin123", // Default password from schema.sql for admin user
  remember: true,
});
const loading = ref(false);

const onFinish = async (values) => {
  console.log("LoginView: onFinish triggered.");
  loading.value = true;
  try {
    console.log("LoginView: Calling authStore.login with values:", values);
    const loginSuccess = await authStore.login({
      username: values.username,
      password: values.password,
    });
    console.log("LoginView: authStore.login returned:", loginSuccess);

    if (loginSuccess) {
      message.success("登录成功！");
      const redirectPath = router.currentRoute.value.query.redirect;
      if (typeof redirectPath === "string" && redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    }
  } catch (error) {
    console.error(
      "LoginView: Caught error after calling authStore.login:",
      error
    );
    message.error(error.message || "登录失败，请检查您的凭据或网络连接。");
  } finally {
    console.log("LoginView: onFinish finally block.");
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo) => {
  console.log("Form validation failed:", errorInfo);
  message.error("请完整填写表单！");
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5; /* Or a background image */
}

.login-card {
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Center the logo and title within the card title slot */
:deep(.ant-card-head-title) {
  text-align: center;
  padding: 0 !important; /* Override default padding if necessary */
}
</style>
