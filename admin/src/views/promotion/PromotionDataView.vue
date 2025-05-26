<template>
  <div>
    <a-page-header title="推广数据" sub-title="查看应用推广的效果数据和报表">
      <template #extra>
        <a-range-picker v-model:value="dateRange" @change="handleDateChange" />
      </template>
    </a-page-header>
    <div style="padding: 24px">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <a-card hoverable>
            <a-statistic
              title="总曝光量 (Impressions)"
              :value="summaryData.impressions"
              :precision="0"
              suffix="次"
              :value-style="{ color: '#3f8600' }"
            >
              <template #prefix><eye-outlined /></template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <a-card hoverable>
            <a-statistic
              title="总点击量 (Clicks)"
              :value="summaryData.clicks"
              :precision="0"
              suffix="次"
              :value-style="{ color: '#cf1322' }"
            >
              <template #prefix><interaction-outlined /></template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <a-card hoverable>
            <a-statistic
              title="总消耗 (SKY)"
              :value="summaryData.cost"
              :precision="2"
              prefix="SKY"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix><account-book-outlined /></template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="12" :lg="6">
          <a-card hoverable>
            <a-statistic
              title="平均点击率 (CTR)"
              :value="summaryData.ctr"
              :precision="2"
              suffix="%"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix><aim-outlined /></template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <a-divider />

      <a-card title="活跃推广活动摘要 (模拟)" style="margin-top: 16px">
        <a-descriptions
          bordered
          :column="{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }"
        >
          <a-descriptions-item label="推广活动名称"
            >欢乐斗地主H5 - 五一特惠</a-descriptions-item
          >
          <a-descriptions-item label="当前状态"
            ><a-tag color="green">进行中</a-tag></a-descriptions-item
          >
          <a-descriptions-item label="每日预算">SKY 200</a-descriptions-item>
          <a-descriptions-item label="总预算">SKY 2000</a-descriptions-item>
          <a-descriptions-item label="推广周期"
            >2024-05-01 至 2024-05-07</a-descriptions-item
          >
          <a-descriptions-item label="已消耗">SKY 850.75</a-descriptions-item>
          <a-descriptions-item label="投放位置" :span="2"
            >首页推荐位, 游戏详情页推荐</a-descriptions-item
          >
        </a-descriptions>
      </a-card>

      <!-- TODO: Add detailed data table or charts later -->
      <a-alert
        message="详细数据图表和表格正在建设中..."
        type="info"
        show-icon
        style="margin-top: 20px"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  EyeOutlined,
  InteractionOutlined,
  AccountBookOutlined,
  AimOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";

const dateRange = ref([]);
const summaryData = reactive({
  impressions: 125600,
  clicks: 8750,
  cost: 1530.5,
  ctr: 0,
});

const calculateCTR = () => {
  if (summaryData.impressions > 0) {
    summaryData.ctr = (summaryData.clicks / summaryData.impressions) * 100;
  } else {
    summaryData.ctr = 0;
  }
};

const fetchData = async () => {
  // Simulate API call based on dateRange (if needed in future)
  console.log("Fetching data for range:", dateRange.value);
  // For now, just use static mock data and calculate CTR
  calculateCTR();
  message.success("推广数据已更新 (模拟)！");
};

onMounted(() => {
  // Set a default date range for example
  dateRange.value = [dayjs().subtract(7, "day"), dayjs()];
  fetchData();
});

const handleDateChange = (dates, dateStrings) => {
  console.log("Selected Date Range (moment objects):", dates);
  console.log("Selected Date Range (strings):", dateStrings);
  // Here you would typically call fetchData() again with the new date range
  fetchData(); // Simulate fetching new data
};
</script>

<style scoped>
/* Styles for Promotion Data page */
.ant-statistic-content {
  font-size: 20px;
}
</style>
