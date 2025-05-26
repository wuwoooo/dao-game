<template>
  <div>
    <a-page-header
      title="推广设置"
      sub-title="为应用配置推广参数、预算和投放位置"
    />
    <div style="padding: 24px">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="选择应用/游戏" name="gameappId">
              <a-select
                v-model:value="formState.gameappId"
                placeholder="请选择要推广的应用/游戏"
                show-search
                :filter-option="filterOption"
                :options="approvedAppsOptions"
                :loading="appsLoading"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :xs="24" :sm="12">
            <a-form-item label="每日预算 (SKY代币)" name="dailyBudget">
              <a-input-number
                v-model:value="formState.dailyBudget"
                style="width: 100%"
                :min="0"
                placeholder="例如: 100"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="总预算 (SKY代币)" name="totalBudget">
              <a-input-number
                v-model:value="formState.totalBudget"
                style="width: 100%"
                :min="0"
                placeholder="例如: 1000"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="推广周期" name="promotionDates">
          <a-range-picker
            v-model:value="formState.promotionDates"
            style="width: 100%"
            valueFormat="YYYY-MM-DD"
            :disabled-date="disabledDate"
          />
        </a-form-item>

        <a-form-item label="投放位置" name="placements">
          <a-checkbox-group
            v-model:value="formState.placements"
            :options="placementOptions"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="submitLoading"
            >保存推广设置</a-button
          >
          <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import apiService from "@/services/apiService";
import dayjs from "dayjs"; // For date handling if needed

const formRef = ref();
const appsLoading = ref(false);
const submitLoading = ref(false);
const approvedAppsOptions = ref([]); // To be populated with { value: id, label: name }
const placementOptions = [
  { label: "首页推荐位", value: "home_featured" },
  { label: "分类页广告位", value: "category_banner" },
  { label: "游戏详情页推荐", value: "game_detail_promo" },
  { label: "H5内嵌广告", value: "h5_embed_ad" },
];

const formState = reactive({
  gameappId: null,
  dailyBudget: undefined,
  totalBudget: undefined,
  promotionDates: [],
  placements: [],
});

const rules = {
  gameappId: [{ required: true, message: "请选择要推广的应用/游戏" }],
  dailyBudget: [
    { type: "number", min: 0, message: "每日预算不能为负数", required: true },
  ],
  totalBudget: [
    { type: "number", min: 0, message: "总预算不能为负数", required: true },
  ],
  promotionDates: [
    {
      type: "array",
      required: true,
      message: "请选择推广周期",
      validator: validateDates,
    },
  ],
  placements: [
    { type: "array", required: true, message: "请至少选择一个投放位置" },
  ],
};

// Custom validator for dates
async function validateDates(_, value) {
  if (!value || value.length < 2) {
    return Promise.reject("请选择推广周期");
  }
  const [startDate, endDate] = value;
  if (dayjs(endDate).isBefore(dayjs(startDate))) {
    return Promise.reject("结束日期不能早于开始日期");
  }
  // Optional: Prevent selecting past dates for start date
  // if (dayjs(startDate).isBefore(dayjs().startOf('day'))) {
  //   return Promise.reject('开始日期不能早于今天');
  // }
  return Promise.resolve();
}

// Disable past dates
const disabledDate = (current) => {
  return current && current < dayjs().startOf("day");
};

const fetchApprovedApps = async () => {
  appsLoading.value = true;
  try {
    // Fetch approved apps only
    const responseData = await apiService.getAdminApps({
      current: 1,
      size: 1000,
      status: "Approved",
    });
    if (responseData && responseData.records) {
      approvedAppsOptions.value = responseData.records.map((app) => ({
        value: app.id,
        label: `${app.name} (ID:${app.id})`,
      }));
    }
  } catch (error) {
    message.error("加载已批准应用列表失败: " + error.message);
  } finally {
    appsLoading.value = false;
  }
};

onMounted(() => {
  fetchApprovedApps();
});

const filterOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitLoading.value = true;

    // Prepare payload for the API
    const payload = {
      gameappId: formState.gameappId,
      dailyBudget: formState.dailyBudget,
      totalBudget: formState.totalBudget,
      // Convert placements array to comma-separated string based on API doc example
      placements: formState.placements.join(","),
      // Extract start and end dates
      startDate: formState.promotionDates[0]
        ? dayjs(formState.promotionDates[0]).format("YYYY-MM-DD")
        : null,
      endDate: formState.promotionDates[1]
        ? dayjs(formState.promotionDates[1]).format("YYYY-MM-DD")
        : null,
    };

    console.log("Submitting promotion budget:", payload);

    // Call the API to create the budget
    await apiService.createAdminPromotionBudget(payload);

    message.success("推广预算已成功创建！");
    resetForm(); // Reset form after successful submission
  } catch (errorInfo) {
    // Validation errors are caught here by validate()
    // API call errors (including business errors from interceptor) are also caught
    if (errorInfo.message) {
      // API error
      message.error(`保存失败: ${errorInfo.message}`);
    } else {
      // Form validation error
      message.error("请检查表单输入！");
      console.log("Form validation failed:", errorInfo);
    }
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  formRef.value.resetFields();
};
</script>

<style scoped>
/* Styles for Promotion Settings page */
.ant-input-number,
.ant-select,
.ant-picker {
  width: 100%;
}
</style>
