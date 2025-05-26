<template>
  <div class="poster-generator">
    <div v-if="!posterUrl" class="poster-config">
      <div class="template-selection">
        <h3>选择海报模板</h3>
        <a-radio-group v-model:value="selectedTemplate" button-style="solid">
          <a-radio-button value="premium">高端商务</a-radio-button>
          <a-radio-button value="festive">节日喜庆</a-radio-button>
          <a-radio-button value="modern">现代简约</a-radio-button>
          <a-radio-button value="dynamic">动感科技</a-radio-button>
        </a-radio-group>
      </div>

      <div class="content-options">
        <h3>内容选项</h3>
        <a-checkbox-group v-model:value="contentOptions">
          <a-checkbox value="sponsor">显示赞助商</a-checkbox>
          <a-checkbox value="description">显示活动描述</a-checkbox>
          <a-checkbox value="time">显示活动时间</a-checkbox>
          <a-checkbox value="useBackground">使用活动背景图</a-checkbox>
          <a-checkbox value="useIcon">使用活动图标</a-checkbox>
          <a-checkbox value="brand">添加平台水印</a-checkbox>
        </a-checkbox-group>
      </div>

      <div class="preview-template">
        <h3>模板预览</h3>
        <div class="template-preview-container">
          <div class="template-preview" :class="selectedTemplate">
            <div
              class="preview-background"
              v-if="
                contentOptions.includes('useBackground') &&
                lotteryInfo.background
              "
            ></div>
            <div class="preview-content">
              <div class="preview-header">
                <div
                  v-if="contentOptions.includes('useIcon') && lotteryInfo.icon"
                  class="preview-icon"
                >
                  <img :src="lotteryInfo.icon" alt="活动图标" />
                </div>
                <div class="preview-title">
                  {{ lotteryInfo.name || "活动名称" }}
                </div>
                <div
                  v-if="
                    contentOptions.includes('sponsor') && lotteryInfo.sponsor
                  "
                  class="preview-sponsor"
                >
                  {{ lotteryInfo.sponsor }}
                </div>
              </div>
              <div
                v-if="
                  contentOptions.includes('description') &&
                  lotteryInfo.description
                "
                class="preview-description"
              >
                {{ lotteryInfo.description }}
              </div>
              <div class="preview-qrcode-placeholder">
                <div class="qrcode-label">扫码参与活动</div>
              </div>
              <div v-if="contentOptions.includes('time')" class="preview-time">
                {{
                  formatDateRange(lotteryInfo.startTime, lotteryInfo.endTime)
                }}
              </div>
              <div
                v-if="contentOptions.includes('brand')"
                class="preview-brand"
              >
                Powered by AIsky
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <a-button type="primary" @click="generatePoster" :loading="generating">
          生成海报
        </a-button>
      </div>
    </div>

    <div v-else class="poster-result">
      <div class="poster-preview">
        <img :src="posterUrl" alt="活动海报" />
      </div>
      <div class="poster-actions">
        <a-button type="primary" @click="downloadPoster">
          <download-outlined /> 下载海报
        </a-button>
        <a-button @click="resetPoster" style="margin-left: 8px">
          重新设计
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { message } from "ant-design-vue";
import { DownloadOutlined } from "@ant-design/icons-vue";
import QRCode from "qrcode";

const props = defineProps({
  lotteryInfo: {
    type: Object,
    required: true,
  },
  lotteryUrl: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "posterGenerated"]);

// 状态
const selectedTemplate = ref("premium");
const contentOptions = ref(["sponsor", "time", "brand"]);
const posterUrl = ref("");
const generating = ref(false);
const canvasRef = ref(null);

// 格式化日期范围
const formatDateRange = (start, end) => {
  if (!start) return "";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!end) {
    return `开始时间：${formatDate(start)}`;
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

// 生成海报
const generatePoster = async () => {
  try {
    generating.value = true;

    // 创建一个离屏canvas
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    // 绘制背景
    if (
      contentOptions.value.includes("useBackground") &&
      props.lotteryInfo.background
    ) {
      // 如果有背景图并选择使用，先加载背景图
      try {
        await new Promise((resolve, reject) => {
          const bgImage = new Image();
          bgImage.crossOrigin = "Anonymous"; // 处理跨域图片
          bgImage.onload = () => {
            // 绘制背景图并添加遮罩
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

            // 添加半透明遮罩以确保文字可见
            ctx.fillStyle = getTemplateOverlay();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            resolve();
          };
          bgImage.onerror = () => {
            // 加载失败时使用默认背景
            ctx.fillStyle = getTemplateBackground();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            resolve();
          };
          bgImage.src = props.lotteryInfo.background;
        });
      } catch (error) {
        console.error("背景图加载失败:", error);
        // 使用默认背景
        ctx.fillStyle = getTemplateBackground();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      // 使用默认背景
      ctx.fillStyle = getTemplateBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 添加标题部分的装饰元素
    if (selectedTemplate.value === "premium") {
      // 添加高端商务模板特有的元素
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(300, 0);
      ctx.lineTo(0, 300);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(canvas.width, canvas.height);
      ctx.lineTo(canvas.width - 300, canvas.height);
      ctx.lineTo(canvas.width, canvas.height - 300);
      ctx.closePath();
      ctx.fill();
    } else if (selectedTemplate.value === "festive") {
      // 添加节日喜庆模板特有的装饰
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`;
        const size = Math.random() * 30 + 10;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (selectedTemplate.value === "dynamic") {
      // 添加动感科技模板特有的装饰
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const y = 100 + i * 200;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y + 100);
        ctx.stroke();
      }
    }

    // 配置变量
    let yPosition = 150;

    // 如果有图标并选择使用，绘制图标
    if (contentOptions.value.includes("useIcon") && props.lotteryInfo.icon) {
      try {
        await new Promise((resolve, reject) => {
          const iconImg = new Image();
          iconImg.crossOrigin = "Anonymous"; // 处理跨域图片
          iconImg.onload = () => {
            // 计算等比例缩放后的尺寸
            const iconSize = 120;
            const scale = Math.min(
              iconSize / iconImg.width,
              iconSize / iconImg.height
            );
            const iconWidth = iconImg.width * scale;
            const iconHeight = iconImg.height * scale;

            // 绘制圆形区域作为图标背景
            const centerX = canvas.width / 2;
            const centerY = yPosition - 20;
            const radius = iconSize / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.closePath();

            // 绘制圆形边框和阴影
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 15;
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.fill();

            // 重置阴影效果防止影响裁剪
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;

            // 裁剪为圆形
            ctx.clip();

            // 绘制图标（填满圆形区域）
            ctx.drawImage(
              iconImg,
              centerX - iconWidth / 2,
              centerY - iconHeight / 2,
              iconWidth,
              iconHeight
            );

            ctx.restore();

            // 绘制外环装饰(为不同模板添加不同外环效果)
            ctx.save();
            if (selectedTemplate.value === "premium") {
              // 金色环
              const gradient = ctx.createLinearGradient(
                centerX - radius - 5,
                centerY - radius - 5,
                centerX + radius + 5,
                centerY + radius + 5
              );
              gradient.addColorStop(0, "#ffd700");
              gradient.addColorStop(1, "#ff9500");

              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
              ctx.lineWidth = 3;
              ctx.strokeStyle = gradient;
              ctx.stroke();
            } else if (selectedTemplate.value === "festive") {
              // 双圈虚线
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
              ctx.lineWidth = 2;
              ctx.strokeStyle = getTemplateAccentColor();
              ctx.setLineDash([3, 3]);
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
            } else if (selectedTemplate.value === "modern") {
              // 细边框
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
              ctx.lineWidth = 2;
              ctx.strokeStyle = getTemplateAccentColor();
              ctx.stroke();
            } else if (selectedTemplate.value === "dynamic") {
              // 发光效果
              const gradientSize = radius + 15;
              const glowGradient = ctx.createRadialGradient(
                centerX,
                centerY,
                radius,
                centerX,
                centerY,
                gradientSize
              );
              glowGradient.addColorStop(0, "rgba(85, 239, 196, 0.5)");
              glowGradient.addColorStop(1, "rgba(85, 239, 196, 0)");

              ctx.beginPath();
              ctx.arc(centerX, centerY, gradientSize, 0, Math.PI * 2);
              ctx.fillStyle = glowGradient;
              ctx.fill();
            }
            ctx.restore();

            yPosition += iconSize + 20;
            resolve();
          };
          iconImg.onerror = () => {
            resolve(); // 图标加载失败时继续
          };
          iconImg.src = props.lotteryInfo.icon;
        });
      } catch (error) {
        console.error("图标加载失败:", error);
      }
    }

    // 绘制二维码，添加装饰性边框
    try {
      // 构建二维码选项
      const qrOptions = {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // 高容错率，允许我们加入更多设计元素
      };

      // 根据模板调整二维码颜色
      if (selectedTemplate.value === "premium") {
        qrOptions.color.dark = "#2a5298";
      } else if (selectedTemplate.value === "festive") {
        qrOptions.color.dark = "#FF4757";
      } else if (selectedTemplate.value === "modern") {
        qrOptions.color.dark = "#5352ed";
      } else if (selectedTemplate.value === "dynamic") {
        qrOptions.color.dark = "#4568dc";
      }

      const qrCodeUrl = await QRCode.toDataURL(props.lotteryUrl, qrOptions);

      const qrImage = new Image();
      qrImage.src = qrCodeUrl;

      await new Promise((resolve) => {
        qrImage.onload = () => {
          // 在中央绘制二维码
          const qrSize = 280;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = yPosition;

          // 绘制二维码背景、阴影和边框
          const padding = 20;

          ctx.save();

          // 绘制阴影
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 5;

          // 根据不同模板绘制不同形状的二维码背景
          if (selectedTemplate.value === "premium") {
            // 方形背景带斜角
            const cornerCut = 30; // 斜角大小

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(qrX - padding + cornerCut, qrY - padding);
            ctx.lineTo(
              qrX - padding + qrSize + padding * 2 - cornerCut,
              qrY - padding
            );
            ctx.lineTo(
              qrX - padding + qrSize + padding * 2,
              qrY - padding + cornerCut
            );
            ctx.lineTo(
              qrX - padding + qrSize + padding * 2,
              qrY - padding + qrSize + padding * 2 - cornerCut
            );
            ctx.lineTo(
              qrX - padding + qrSize + padding * 2 - cornerCut,
              qrY - padding + qrSize + padding * 2
            );
            ctx.lineTo(
              qrX - padding + cornerCut,
              qrY - padding + qrSize + padding * 2
            );
            ctx.lineTo(
              qrX - padding,
              qrY - padding + qrSize + padding * 2 - cornerCut
            );
            ctx.lineTo(qrX - padding, qrY - padding + cornerCut);
            ctx.closePath();
            ctx.fill();

            // 重置阴影，绘制边框点缀
            ctx.shadowColor = "transparent";
            ctx.fillStyle = getTemplateAccentColor();

            // 画四个角的装饰点
            const dotSize = 10;
            ctx.beginPath();
            ctx.arc(
              qrX - padding + cornerCut,
              qrY - padding + cornerCut,
              dotSize,
              0,
              Math.PI * 2
            );
            ctx.arc(
              qrX - padding + qrSize + padding * 2 - cornerCut,
              qrY - padding + cornerCut,
              dotSize,
              0,
              Math.PI * 2
            );
            ctx.arc(
              qrX - padding + qrSize + padding * 2 - cornerCut,
              qrY - padding + qrSize + padding * 2 - cornerCut,
              dotSize,
              0,
              Math.PI * 2
            );
            ctx.arc(
              qrX - padding + cornerCut,
              qrY - padding + qrSize + padding * 2 - cornerCut,
              dotSize,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else if (selectedTemplate.value === "festive") {
            // 椭圆形背景
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            const radiusX = qrSize / 2 + padding * 1.5;
            const radiusY = qrSize / 2 + padding * 1.5;
            const centerX = qrX + qrSize / 2;
            const centerY = qrY + qrSize / 2;

            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fill();

            // 重置阴影后添加花纹装饰
            ctx.shadowColor = "transparent";
            ctx.strokeStyle = getTemplateAccentColor();
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);

            // 外环装饰
            ctx.beginPath();
            ctx.ellipse(
              centerX,
              centerY,
              radiusX + 10,
              radiusY + 10,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();

            ctx.setLineDash([]);
          } else if (selectedTemplate.value === "modern") {
            // 圆角矩形背景
            const cornerRadius = 15;
            roundRect(
              ctx,
              qrX - padding,
              qrY - padding,
              qrSize + padding * 2,
              qrSize + padding * 2,
              cornerRadius
            );
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            // 添加简洁装饰
            ctx.shadowColor = "transparent";
            ctx.strokeStyle = getTemplateAccentColor();
            ctx.lineWidth = 3;

            // 左上角和右下角的装饰线
            const lineLength = 40;

            // 左上角
            ctx.beginPath();
            ctx.moveTo(qrX - padding, qrY - padding + cornerRadius + 10);
            ctx.lineTo(qrX - padding, qrY - padding + cornerRadius);
            ctx.arcTo(
              qrX - padding,
              qrY - padding,
              qrX - padding + cornerRadius,
              qrY - padding,
              cornerRadius
            );
            ctx.lineTo(qrX - padding + cornerRadius + 10, qrY - padding);
            ctx.stroke();

            // 右下角
            ctx.beginPath();
            ctx.moveTo(
              qrX - padding + qrSize + padding * 2,
              qrY - padding + qrSize + padding * 2 - cornerRadius - 10
            );
            ctx.lineTo(
              qrX - padding + qrSize + padding * 2,
              qrY - padding + qrSize + padding * 2 - cornerRadius
            );
            ctx.arcTo(
              qrX - padding + qrSize + padding * 2,
              qrY - padding + qrSize + padding * 2,
              qrX - padding + qrSize + padding * 2 - cornerRadius,
              qrY - padding + qrSize + padding * 2,
              cornerRadius
            );
            ctx.lineTo(
              qrX - padding + qrSize + padding * 2 - cornerRadius - 10,
              qrY - padding + qrSize + padding * 2
            );
            ctx.stroke();
          } else if (selectedTemplate.value === "dynamic") {
            // 菱形背景旋转45度
            ctx.translate(qrX + qrSize / 2, qrY + qrSize / 2);
            ctx.rotate(Math.PI / 4);

            const diamondSize = qrSize * 0.9;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(
              -diamondSize / 2 - padding,
              -diamondSize / 2 - padding,
              diamondSize + padding * 2,
              diamondSize + padding * 2
            );

            // 重置旋转和平移
            ctx.rotate(-Math.PI / 4);
            ctx.translate(-(qrX + qrSize / 2), -(qrY + qrSize / 2));

            // 添加发光边缘效果
            ctx.shadowColor = "transparent";

            // 创建渐变
            const glowGradient = ctx.createLinearGradient(
              qrX,
              qrY,
              qrX + qrSize,
              qrY + qrSize
            );
            glowGradient.addColorStop(0, getTemplateAccentColor());
            glowGradient.addColorStop(1, getTemplateSecondaryColor());

            ctx.translate(qrX + qrSize / 2, qrY + qrSize / 2);
            ctx.rotate(Math.PI / 4);

            ctx.strokeStyle = glowGradient;
            ctx.lineWidth = 5;
            ctx.strokeRect(
              -diamondSize / 2 - padding - 5,
              -diamondSize / 2 - padding - 5,
              diamondSize + padding * 2 + 10,
              diamondSize + padding * 2 + 10
            );

            // 恢复变换
            ctx.rotate(-Math.PI / 4);
            ctx.translate(-(qrX + qrSize / 2), -(qrY + qrSize / 2));
          } else {
            // 默认方形背景
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(
              qrX - padding,
              qrY - padding,
              qrSize + padding * 2,
              qrSize + padding * 2
            );
          }

          // 重置阴影
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // 绘制二维码
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // 添加二维码中心图案
          const centerSize = 50;
          const centerX = qrX + qrSize / 2 - centerSize / 2;
          const centerY = qrY + qrSize / 2 - centerSize / 2;

          // 清除中心区域的二维码
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(
            qrX + qrSize / 2,
            qrY + qrSize / 2,
            centerSize / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // 绘制中心装饰
          ctx.beginPath();
          ctx.arc(
            qrX + qrSize / 2,
            qrY + qrSize / 2,
            centerSize / 2 - 5,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = getTemplateAccentColor();
          ctx.fill();

          // 如果有图标，可选在中心添加小图标
          if (
            props.lotteryInfo.icon &&
            contentOptions.value.includes("useIcon")
          ) {
            const smallIconImg = new Image();
            smallIconImg.crossOrigin = "Anonymous";
            smallIconImg.src = props.lotteryInfo.icon;

            smallIconImg.onload = () => {
              const smallIconSize = centerSize - 15;
              const smallIconX = qrX + qrSize / 2 - smallIconSize / 2;
              const smallIconY = qrY + qrSize / 2 - smallIconSize / 2;

              // 创建圆形裁剪区域
              ctx.save();
              ctx.beginPath();
              ctx.arc(
                qrX + qrSize / 2,
                qrY + qrSize / 2,
                centerSize / 2 - 10,
                0,
                Math.PI * 2
              );
              ctx.clip();

              // 绘制小图标
              ctx.drawImage(
                smallIconImg,
                smallIconX,
                smallIconY,
                smallIconSize,
                smallIconSize
              );
              ctx.restore();
            };
          } else {
            // 或者在中心添加文本
            const text = "AIsky";
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px 'Microsoft YaHei', Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, qrX + qrSize / 2, qrY + qrSize / 2);
          }

          ctx.restore();

          // 添加二维码说明文字
          ctx.font = "bold 32px 'Microsoft YaHei', Arial";
          ctx.fillStyle = getTemplateTextColor("qrcode");
          ctx.textAlign = "center";
          ctx.fillText(
            "扫码参与活动",
            canvas.width / 2,
            qrY + qrSize + padding + 40
          );

          resolve();
        };
      });

      yPosition += 400; // 二维码高度 + 文字 + 间距

      // 辅助函数 - 绘制圆角矩形
      function roundRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.arcTo(
          x + width,
          y + height,
          x + width - radius,
          y + height,
          radius
        );
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
      }

      // 添加时间（如果需要）
      if (contentOptions.value.includes("time")) {
        // 时间背景
        const timeText = formatDateRange(
          props.lotteryInfo.startTime,
          props.lotteryInfo.endTime
        );
        const timeMetrics = ctx.measureText(timeText);
        const timeWidth = timeMetrics.width + 40;
        const timeHeight = 40;
        const timeX = (canvas.width - timeWidth) / 2;

        // 时间背景
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.roundRect(timeX, yPosition - 30, timeWidth, timeHeight, 20);
        ctx.fill();

        // 时间文本
        ctx.font = "bold 28px 'Microsoft YaHei', Arial";
        ctx.fillStyle = getTemplateTextColor("time");
        ctx.fillText(timeText, canvas.width / 2, yPosition);
        yPosition += 60;
      }

      // 添加品牌水印（如果需要）
      if (contentOptions.value.includes("brand")) {
        ctx.font = "italic 24px 'Microsoft YaHei', Arial";
        ctx.fillStyle = getTemplateTextColor("brand");
        ctx.fillText("Powered by AIsky", canvas.width / 2, canvas.height - 50);
      }

      // 将canvas内容转为图片URL
      posterUrl.value = canvas.toDataURL("image/png");
      emit("posterGenerated", posterUrl.value);
    } catch (error) {
      console.error("二维码生成错误:", error);
      message.error("二维码生成失败");
    }
  } catch (error) {
    console.error("海报生成错误:", error);
    message.error("海报生成失败");
  } finally {
    generating.value = false;
  }
};

// 获取模板背景色
const getTemplateBackground = () => {
  switch (selectedTemplate.value) {
    case "premium":
      return "linear-gradient(135deg, #1c3271 0%, #274685 50%, #1e3c72 100%)";
    case "festive":
      return "linear-gradient(135deg, #ff3040 0%, #ff5a6b 50%, #ff485d 100%)";
    case "modern":
      return "linear-gradient(135deg, #f0f4f9 0%, #dde5f2 50%, #c3cfe2 100%)";
    case "dynamic":
      return "linear-gradient(135deg, #3b5cc9 0%, #6366f1 50%, #a855f7 100%)";
    default:
      return "#ffffff";
  }
};

// 获取模板半透明遮罩
const getTemplateOverlay = () => {
  switch (selectedTemplate.value) {
    case "premium":
      return "rgba(26, 49, 94, 0.85)";
    case "festive":
      return "rgba(207, 34, 50, 0.7)";
    case "modern":
      return "rgba(195, 207, 226, 0.9)";
    case "dynamic":
      return "rgba(67, 76, 178, 0.8)";
    default:
      return "rgba(255, 255, 255, 0.7)";
  }
};

// 获取模板强调色
const getTemplateAccentColor = () => {
  switch (selectedTemplate.value) {
    case "premium":
      return "#ffc107";
    case "festive":
      return "#ffdd33";
    case "modern":
      return "#5e72e4";
    case "dynamic":
      return "#64dfdf";
    default:
      return "#000000";
  }
};

// 获取模板次要色
const getTemplateSecondaryColor = () => {
  switch (selectedTemplate.value) {
    case "premium":
      return "#00a8ff";
    case "festive":
      return "#ff7675";
    case "modern":
      return "#3dd598";
    case "dynamic":
      return "#ff9ff3";
    default:
      return "#555555";
  }
};

// 获取模板文字颜色
const getTemplateTextColor = (element) => {
  if (selectedTemplate.value === "modern") {
    switch (element) {
      case "title":
        return "#2a3a6a";
      case "sponsor":
        return "#4263eb";
      case "description":
        return "#2f3542";
      case "qrcode":
        return "#4263eb";
      case "time":
        return "#2f3542";
      case "brand":
        return "#5352ed";
      default:
        return "#333333";
    }
  } else if (selectedTemplate.value === "premium") {
    switch (element) {
      case "title":
        return "#ffffff";
      case "sponsor":
        return "#ffd43b";
      case "description":
        return "#f8f9fa";
      case "qrcode":
        return "#ffd43b";
      case "time":
        return "#f1f3f5";
      case "brand":
        return "rgba(255, 255, 255, 0.8)";
      default:
        return "#ffffff";
    }
  } else if (selectedTemplate.value === "festive") {
    switch (element) {
      case "title":
        return "#ffffff";
      case "sponsor":
        return "#fff3bf";
      case "description":
        return "#ffffff";
      case "qrcode":
        return "#ffd43b";
      case "time":
        return "#fff8e1";
      case "brand":
        return "rgba(255, 255, 255, 0.85)";
      default:
        return "#ffffff";
    }
  } else if (selectedTemplate.value === "dynamic") {
    switch (element) {
      case "title":
        return "#ffffff";
      case "sponsor":
        return "#80ffdb";
      case "description":
        return "#f8f9fa";
      case "qrcode":
        return "#64dfdf";
      case "time":
        return "#ffffff";
      case "brand":
        return "rgba(255, 255, 255, 0.85)";
      default:
        return "#ffffff";
    }
  }
  return "#000000";
};

// 下载海报
const downloadPoster = () => {
  if (!posterUrl.value) {
    message.error("海报还未生成");
    return;
  }

  const link = document.createElement("a");
  link.download = `${props.lotteryInfo.name || "活动"}_海报.png`;
  link.href = posterUrl.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  message.success("海报下载成功");
};

// 重置海报
const resetPoster = () => {
  posterUrl.value = "";
};

// 为预览模板更新背景和内容处理
watch(
  [
    () => contentOptions.value,
    () => props.lotteryInfo.background,
    () => props.lotteryInfo.icon,
    () => selectedTemplate.value,
  ],
  () => {
    // 延迟执行，确保DOM已更新
    setTimeout(() => {
      // 设置背景图预览
      if (
        contentOptions.value.includes("useBackground") &&
        props.lotteryInfo.background
      ) {
        const previewBg = document.querySelector(".preview-background");
        if (previewBg) {
          previewBg.style.backgroundImage = `url(${props.lotteryInfo.background})`;
        }
      }

      // 确保图标圆形显示
      if (contentOptions.value.includes("useIcon") && props.lotteryInfo.icon) {
        const iconImg = document.querySelector(".preview-icon img");
        if (iconImg) {
          iconImg.style.objectFit = "cover";
          iconImg.style.borderRadius = "50%";
        }
      }

      // 更新二维码样式以匹配最终输出效果
      const qrPlaceholder = document.querySelector(
        ".preview-qrcode-placeholder"
      );
      if (qrPlaceholder) {
        // 清除之前的样式
        qrPlaceholder.style.cssText = "";

        // 根据不同模板设置样式
        if (selectedTemplate.value === "premium") {
          qrPlaceholder.style.borderRadius = "10px";
          qrPlaceholder.style.width = "100px";
          qrPlaceholder.style.height = "100px";
          qrPlaceholder.style.transform = "rotate(45deg)";
          qrPlaceholder.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
          qrPlaceholder.style.border = `2px solid ${getTemplateAccentColor()}`;
        } else if (selectedTemplate.value === "festive") {
          qrPlaceholder.style.borderRadius = "50%";
          qrPlaceholder.style.width = "110px";
          qrPlaceholder.style.height = "110px";
          qrPlaceholder.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
          qrPlaceholder.style.border = `2px dashed ${getTemplateAccentColor()}`;
        } else if (selectedTemplate.value === "modern") {
          qrPlaceholder.style.borderRadius = "12px";
          qrPlaceholder.style.width = "120px";
          qrPlaceholder.style.height = "120px";
          qrPlaceholder.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
          qrPlaceholder.style.borderTop = `3px solid ${getTemplateAccentColor()}`;
          qrPlaceholder.style.borderBottom = `3px solid ${getTemplateSecondaryColor()}`;
        } else if (selectedTemplate.value === "dynamic") {
          qrPlaceholder.style.borderRadius = "8px";
          qrPlaceholder.style.width = "90px";
          qrPlaceholder.style.height = "90px";
          qrPlaceholder.style.transform = "rotate(45deg)";
          qrPlaceholder.style.background =
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%)";
          qrPlaceholder.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
        }
      }
    }, 50);
  },
  { immediate: true }
);

// 监视模板变化
watch(
  () => selectedTemplate.value,
  () => {
    // 当模板变化时，更新内容选项的默认值
    if (selectedTemplate.value === "premium") {
      contentOptions.value = ["sponsor", "time", "useIcon", "brand"];
    } else if (selectedTemplate.value === "festive") {
      contentOptions.value = ["description", "time", "useBackground", "brand"];
    } else if (selectedTemplate.value === "dynamic") {
      contentOptions.value = [
        "sponsor",
        "description",
        "useIcon",
        "useBackground",
        "brand",
      ];
    } else if (selectedTemplate.value === "modern") {
      contentOptions.value = ["sponsor", "description", "time", "brand"];
    }
  }
);

// 监视对话框的可见性变化
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      resetPoster();
    }
  }
);
</script>

<style scoped>
.poster-generator {
  padding: 20px;
}

.poster-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.template-selection,
.content-options {
  margin-bottom: 20px;
}

.template-preview-container {
  border: 1px solid #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  background-color: #fafafa;
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.template-preview {
  width: 300px;
  height: 450px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.template-preview:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.preview-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(0px);
  opacity: 0.9;
  z-index: 1;
}

.preview-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.template-preview.premium {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.template-preview.premium::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 150px;
  height: 150px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 100%
  );
  z-index: 1;
}

.template-preview.premium::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: linear-gradient(
    315deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 100%
  );
  z-index: 1;
}

.template-preview.festive {
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  color: white;
}

.template-preview.festive::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
      circle at 20% 30%,
      rgba(255, 255, 255, 0.15) 2%,
      transparent 2%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 255, 255, 0.15) 2%,
      transparent 2%
    ),
    radial-gradient(
      circle at 40% 70%,
      rgba(255, 255, 255, 0.15) 2%,
      transparent 2%
    ),
    radial-gradient(
      circle at 70% 50%,
      rgba(255, 255, 255, 0.15) 2%,
      transparent 2%
    ),
    radial-gradient(
      circle at 60% 80%,
      rgba(255, 255, 255, 0.15) 2%,
      transparent 2%
    );
  background-size: 300px 300px;
  z-index: 1;
}

.template-preview.modern {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #333;
}

.template-preview.modern::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #5352ed, #2ed573);
  z-index: 1;
}

.template-preview.dynamic {
  background: linear-gradient(135deg, #4568dc 0%, #b06ab3 100%);
  color: white;
  overflow: hidden;
}

.template-preview.dynamic::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 150%;
  height: 150%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 20px,
    rgba(255, 255, 255, 0.05) 20px,
    rgba(255, 255, 255, 0.05) 40px
  );
  z-index: 1;
  animation: moveLines 20s linear infinite;
}

@keyframes moveLines {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.preview-header {
  width: 100%;
  text-align: center;
  margin-bottom: 15px;
  position: relative;
}

.preview-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 10px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
}

.preview-icon::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.preview-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.preview-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.preview-sponsor {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
  position: relative;
  display: inline-block;
  padding: 3px 8px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.template-preview.premium .preview-sponsor {
  background-color: rgba(255, 193, 7, 0.2);
}

.template-preview.festive .preview-sponsor {
  background-color: rgba(255, 211, 42, 0.2);
}

.template-preview.modern .preview-sponsor {
  background-color: rgba(83, 82, 237, 0.1);
}

.template-preview.dynamic .preview-sponsor {
  background-color: rgba(85, 239, 196, 0.2);
}

.preview-description {
  font-size: 14px;
  text-align: center;
  margin: 15px 0;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  backdrop-filter: blur(2px);
}

.template-preview.modern .preview-description {
  background-color: rgba(0, 0, 0, 0.05);
}

.preview-qrcode-placeholder {
  width: 120px;
  height: 120px;
  background-color: rgba(255, 255, 255, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 15px auto;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.template-preview.premium .preview-qrcode-placeholder {
  border-radius: 10px;
  transform: rotate(45deg);
  width: 100px;
  height: 100px;
}

.template-preview.premium .preview-qrcode-placeholder::before {
  transform: rotate(-45deg);
}

.template-preview.festive .preview-qrcode-placeholder {
  border-radius: 50%;
}

.template-preview.modern .preview-qrcode-placeholder {
  border-radius: 12px;
  border-top: 3px solid #5352ed;
  border-bottom: 3px solid #2ed573;
}

.template-preview.dynamic .preview-qrcode-placeholder {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 240, 255, 0.95) 100%
  );
  border-radius: 8px;
  transform: rotate(45deg);
  width: 90px;
  height: 90px;
}

.template-preview.dynamic .preview-qrcode-placeholder::before {
  transform: rotate(-45deg);
}

.preview-qrcode-placeholder::before {
  content: "QR";
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.qrcode-label {
  position: absolute;
  bottom: -25px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
}

.preview-time {
  font-size: 12px;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.15);
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  backdrop-filter: blur(2px);
}

.template-preview.modern .preview-time {
  background: rgba(0, 0, 0, 0.05);
}

.preview-brand {
  position: absolute;
  bottom: 15px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-style: italic;
  opacity: 0.7;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.poster-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.poster-preview {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.poster-preview img {
  max-width: 100%;
  height: auto;
  display: block;
}

.poster-actions {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}
</style>
