<template>
  <div class="detail-container">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon :size="24" class="logo-icon"><Box /></el-icon>
          <div class="logo-text">
            <h1 class="logo-title">失物详情</h1>
            <p class="logo-subtitle">Lost Item Details</p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip content="返回失物列表" placement="bottom">
            <el-button type="info" plain circle @click="goList">
              <el-icon><Back /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card class="detail-card" shadow="hover" v-if="item.id">
        <!-- 标题和状态 -->
        <div class="header-section">
          <div class="title-area">
            <div class="title-with-icon">
              <el-icon :size="24" class="title-icon"><Box /></el-icon>
              <h2 class="item-title">{{ item.title }}</h2>
            </div>
            <div class="item-meta">
              <el-tag :type="getCategoryTagType(item.category)" size="small">
                {{ item.category }}
              </el-tag>
              <el-tag
                :type="item.status === 0 ? 'warning' : 'success'"
                size="small"
                effect="dark"
                class="status-tag"
              >
                {{ item.status === 0 ? "未找回" : "已找回" }}
              </el-tag>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-area" v-if="item.isOwner">
            <el-button-group>
              <el-tooltip content="编辑信息" placement="top">
                <el-button type="primary" @click="edit">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip
                v-if="item.status === 0"
                content="标记为已找回"
                placement="top"
              >
                <el-button type="success" @click="markFound">
                  <el-icon><Check /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip content="删除失物" placement="top">
                <el-button type="danger" @click="remove">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </el-button-group>
          </div>
        </div>

        <!-- 信息网格 -->
        <div class="info-section">
          <h3 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            基本信息
          </h3>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">丢失地点</div>
                <div class="info-value">
                  {{ item.lostLocation || "未填写" }}
                </div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">丢失时间</div>
                <div class="info-value">{{ formatTime(item.lostTime) }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">发布者</div>
                <div class="info-value">{{ item.username || "匿名" }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">联系方式</div>
                <div class="info-value">{{ item.contact || "暂无" }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">发布时间</div>
                <div class="info-value">{{ formatTime(item.createTime) }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">物品状态</div>
                <div class="info-value">
                  <el-tag
                    :type="item.status === 0 ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ item.status === 0 ? "等待找回" : "已找回" }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 物品描述 -->
        <div class="description-section">
          <h3 class="section-title">
            <el-icon><Document /></el-icon>
            物品描述
          </h3>
          <div class="description-content">
            {{ item.description || "暂无详细描述" }}
          </div>
        </div>

        <!-- 图片展示 -->
        <div v-if="item.imageUrl" class="image-section">
          <h3 class="section-title">
            <el-icon><Picture /></el-icon>
            物品图片
          </h3>
          <div class="image-container">
            <el-image
              :src="item.imageUrl"
              :preview-src-list="[item.imageUrl]"
              fit="cover"
              class="item-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <p>图片加载失败</p>
                </div>
              </template>
            </el-image>
          </div>
        </div>

        <!-- 时间线 -->
        <div class="timeline-section">
          <h3 class="section-title">
            <el-icon><Clock /></el-icon>
            时间线
          </h3>
          <el-timeline>
            <el-timeline-item
              :timestamp="formatTime(item.createTime)"
              placement="top"
            >
              <el-card>
                <h4>信息发布</h4>
                <p>用户 {{ item.username || "匿名" }} 发布了这条失物信息</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item
              v-if="item.status === 1"
              :timestamp="formatTime(item.updateTime)"
              type="success"
              placement="top"
            >
              <el-card>
                <h4>物品找回</h4>
                <p>物品已成功找回</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item v-else type="warning" placement="top">
              <el-card>
                <h4>等待找回</h4>
                <p>物品仍在等待找回</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <!-- 加载状态 -->
      <div v-else class="loading-container">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import { 
  Box, Back, Loading, Edit, Check, Delete,
  InfoFilled, Location, Clock, UserFilled, 
  Calendar, Document, Picture, Phone  // 添加Phone图标
} from '@element-plus/icons-vue'
import {
  getLostItemDetail,
  updateLostItemStatus,
  deleteLostItem,
} from "../../api/lostItem";

const route = useRoute();
const router = useRouter();
const item = ref({});

// 获取分类标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    证件: "primary",
    钱包: "warning",
    钥匙: "info",
    电子产品: "success",
    个人物品: "",
    其他: "info",
  };
  return typeMap[category] || "info";
};

// 加载失物详情
const load = async () => {
  try {
    const data = await getLostItemDetail(route.params.id);
    item.value = data;
  } catch (error) {
    console.error("加载失败:", error);
    ElMessage.error("加载失败");
  }
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return "未填写";
  const date = new Date(time);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 返回列表
const goList = () => {
  // 优先使用路由查询参数中的redirect
  const redirect = route.query.redirect
  if (redirect) {
    router.push(redirect)
  } else if (route.query.from === 'admin') {
    // 如果是从管理员进入的，返回管理员界面
    router.push('/admin/lost-items')
  } else {
    // 默认返回用户失物列表
    const redirect = route.query.redirect
    if (redirect) {
      router.push(redirect)
    } else {
      router.push('/lost_item/list')
    }
  }
}

// 编辑失物信息
const edit = () => {
  const redirect = `/lost_item/${route.params.id}`;
  router.push({
    path: `/lost_item/edit/${route.params.id}`,
    query: { redirect },
  });
};

// 标记为已找回
const markFound = async () => {
  try {
    await ElMessageBox.confirm("确定标记为已找回吗？", "确认操作", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await updateLostItemStatus(route.params.id, 1);
    ElMessage.success("状态已更新");
    await load();
  } catch (error) {
    if (error !== "cancel") {
      console.error("操作失败:", error);
      ElMessage.error("操作失败");
    }
  }
};

// 删除失物信息
const remove = async () => {
  try {
    await ElMessageBox.confirm(
      "确定删除这条失物信息吗？删除后无法恢复。",
      "确认删除",
      {
        type: "warning",
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        confirmButtonClass: "confirm-delete-btn",
      }
    );

    await deleteLostItem(route.params.id);
    ElMessage.success("删除成功");
    goList();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

onMounted(load);
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.logo-subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.header-tools {
  display: flex;
  gap: 8px;
}

.main-content {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: #409eff;
  margin-bottom: 16px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.detail-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
}

.title-area {
  flex: 1;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.title-icon {
  color: #e6a23c;
}

.item-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.item-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-area .el-button-group {
  display: flex;
  gap: 8px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  color: #409eff;
}

.info-section,
.description-section,
.image-section,
.timeline-section {
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
}

.info-section:last-child,
.description-section:last-child,
.image-section:last-child,
.timeline-section:last-child {
  border-bottom: none;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 20px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.description-content {
  line-height: 1.6;
  color: #606266;
  font-size: 16px;
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  white-space: pre-wrap;
}

.image-container {
  display: flex;
  justify-content: center;
}

.item-image {
  max-width: 400px;
  max-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.timeline-section :deep(.el-timeline) {
  padding-left: 20px;
}

/* 确认删除按钮样式 */
:deep(.confirm-delete-btn) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

:deep(.confirm-delete-btn:hover) {
  background-color: #f78989;
  border-color: #f78989;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
  }

  .action-area .el-button-group {
    width: 100%;
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .item-image {
    max-width: 100%;
  }
}
</style>