<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon
            :size="24"
            class="logo-icon"
          >
            <Setting />
          </el-icon>
          <div class="logo-text">
            <h1 class="logo-title">
              系统管理面板
            </h1>
            <p class="logo-subtitle">
              Administrator Dashboard
            </p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip
            content="返回首页"
            placement="bottom"
          >
            <el-button
              type="info"
              plain
              circle
              @click="goHome"
            >
              <el-icon><HomeFilled /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip
            content="刷新统计数据"
            placement="bottom"
          >
            <el-button 
              type="primary" 
              circle 
              :loading="loading"
              :disabled="loading"
              @click="refreshStats"
            >
              <el-icon v-if="!loading">
                <Refresh />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card
        class="dashboard-card"
        shadow="hover"
      >
        <!-- 系统概览 -->
        <div class="overview-section">
          <h2 class="section-title">
            <el-icon><DataAnalysis /></el-icon>
            系统概览
          </h2>
          <div class="stats-grid">
            <div class="stat-item user-stat">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">
                  {{ stats.totalUsers || 0 }}
                </div>
                <div class="stat-label">
                  总用户数
                </div>
                <div class="stat-subtext">
                  <span class="admin-count">{{ stats.adminUsers || 0 }} 个管理员</span>
                </div>
              </div>
            </div>
            
            <div class="stat-item lost-stat">
              <div class="stat-icon">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">
                  {{ stats.totalLostItems || 0 }}
                </div>
                <div class="stat-label">
                  失物总数
                </div>
                <div class="stat-subtext">
                  <span class="pending">{{ stats.pendingLostItems || 0 }} 未找回</span>
                  <span class="resolved">{{ stats.resolvedLostItems || 0 }} 已找回</span>
                </div>
              </div>
            </div>
            
            <div class="stat-item found-stat">
              <div class="stat-icon">
                <el-icon><Present /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">
                  {{ stats.totalFoundItems || 0 }}
                </div>
                <div class="stat-label">
                  招领总数
                </div>
                <div class="stat-subtext">
                  <span class="pending">{{ stats.pendingFoundItems || 0 }} 待认领</span>
                  <span class="resolved">{{ stats.resolvedFoundItems || 0 }} 已归还</span>
                </div>
              </div>
            </div>
            
            <div class="stat-item system-stat">
              <div class="stat-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">
                  {{ stats.adminUsers || 0 }}
                </div>
                <div class="stat-label">
                  管理员数
                </div>
                <div class="stat-subtext">
                  <span class="ratio">{{ calculateAdminRatio() }}% 管理员比例</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速管理 -->
        <div class="management-section">
          <h2 class="section-title">
            <el-icon><Operation /></el-icon>
            快速管理
          </h2>
          <div class="management-buttons">
            <el-button 
              type="primary" 
              size="large" 
              class="management-btn" 
              @click="goToLostManagement"
            >
              <template #icon>
                <el-icon><Box /></el-icon>
              </template>
              <div class="btn-content">
                <div class="btn-title">
                  失物管理
                </div>
                <div class="btn-subtitle">
                  管理失物信息
                </div>
              </div>
            </el-button>
            
            <el-button 
              type="success" 
              size="large" 
              class="management-btn" 
              @click="goToFoundManagement"
            >
              <template #icon>
                <el-icon><Present /></el-icon>
              </template>
              <div class="btn-content">
                <div class="btn-title">
                  招领管理
                </div>
                <div class="btn-subtitle">
                  管理招领信息
                </div>
              </div>
            </el-button>
            
            <el-button 
              type="info" 
              size="large" 
              class="management-btn" 
              @click="goToUserManagement"
            >
              <template #icon>
                <el-icon><User /></el-icon>
              </template>
              <div class="btn-content">
                <div class="btn-title">
                  用户管理
                </div>
                <div class="btn-subtitle">
                  管理用户信息
                </div>
              </div>
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { 
  User, 
  Box, 
  Present, 
  Setting, 
  HomeFilled, 
  Refresh,
  DataAnalysis,
  Operation,
  Monitor
} from "@element-plus/icons-vue";
import { getAdminStats } from "../../api/admin";

const router = useRouter();
const stats = ref({});
const loading = ref(false);

// 计算管理员比例
const calculateAdminRatio = () => {
  const total = stats.value.totalUsers || 1;
  const admin = stats.value.adminUsers || 0;
  return Math.round((admin / total) * 100);
};

const goHome = () => {
  router.push('/home');
};

const loadStats = async () => {
  loading.value = true;
  try {
    const data = await getAdminStats();
    stats.value = data;
  } catch (error) {
    console.error("加载统计失败:", error);
    ElMessage.error("加载统计信息失败");
  } finally {
    loading.value = false;
  }
};

const refreshStats = async () => {
  loading.value = true;
  try {
    const data = await getAdminStats();
    stats.value = data;
    ElMessage.success('统计数据已刷新');
  } catch (error) {
    console.error('刷新统计失败:', error);
    ElMessage.error('刷新失败');
  } finally {
    loading.value = false;
  }
};

const goToLostManagement = () => {
  router.push("/admin/lost-items");
};

const goToFoundManagement = () => {
  router.push("/admin/found-items");
};

const goToUserManagement = () => {
  router.push("/admin/users");
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.admin-dashboard {
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

.dashboard-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.overview-section,
.management-section {
  padding: 32px;
}

.overview-section {
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title .el-icon {
  color: #409eff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.user-stat .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lost-stat .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.found-stat .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.system-stat .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-subtext {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.stat-subtext span {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.admin-count {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.resolved {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.ratio {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.management-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.management-btn {
  width: 100%;
  height: 100px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.management-btn :deep(.el-icon) {
  font-size: 32px;
  margin-bottom: 12px;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.btn-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .management-buttons {
    grid-template-columns: 1fr;
  }
}
</style>