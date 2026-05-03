<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon
            :size="24"
            class="logo-icon"
          >
            <Box />
          </el-icon>
          <div class="logo-text">
            <h1 class="logo-title">
              校园失物招领平台
            </h1>
            <p class="logo-subtitle">
              Lost & Found Campus Platform
            </p>
          </div>
        </div>
        <div class="user-section">
          <el-dropdown
            trigger="click"
            placement="bottom-end"
          >
            <div class="user-profile">
              <div class="user-avatar">
                <el-icon :size="20">
                  <UserFilled />
                </el-icon>
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ usernameDisplay }}
                </div>
                <div
                  class="user-role"
                  :class="{ 'admin-role': isAdmin }"
                >
                  {{ isAdmin ? '管理员' : '普通用户' }}
                </div>
              </div>
              <el-icon class="dropdown-icon">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  class="dropdown-item"
                  @click="goProfile"
                >
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item 
                  v-if="isAdmin" 
                  class="dropdown-item admin-item" 
                  @click="goAdmin"
                >
                  <el-icon><Setting /></el-icon>
                  <span>系统管理</span>
                </el-dropdown-item>
                <el-dropdown-menu divided>
                  <el-dropdown-item
                    class="dropdown-item logout-item"
                    @click="logout"
                  >
                    <el-icon><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card
        class="welcome-card"
        shadow="hover"
      >
        <div class="welcome-content">
          <div class="welcome-header">
            <div class="welcome-icon">
              <el-icon :size="48">
                <Bell />
              </el-icon>
            </div>
            <div class="welcome-text">
              <h2 class="welcome-title">
                欢迎回来，{{ usernameDisplay.split('(')[0].trim() }}！
              </h2>
              <p class="welcome-subtitle">
                快速访问失物与招领信息，让物品尽快找到主人
              </p>
            </div>
          </div>

          <div class="action-section">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                class="action-btn" 
                @click="goLostList"
              >
                <template #icon>
                  <el-icon><Search /></el-icon>
                </template>
                <div class="btn-content">
                  <div class="btn-title">
                    查看失物信息
                  </div>
                  <div class="btn-subtitle">
                    寻找丢失物品
                  </div>
                </div>
              </el-button>
              
              <el-button 
                type="success" 
                size="large" 
                class="action-btn" 
                @click="goFoundList"
              >
                <template #icon>
                  <el-icon><View /></el-icon>
                </template>
                <div class="btn-content">
                  <div class="btn-title">
                    查看招领信息
                  </div>
                  <div class="btn-subtitle">
                    认领拾到物品
                  </div>
                </div>
              </el-button>
              
              <el-button 
                v-if="isAdmin" 
                type="warning" 
                size="large" 
                class="action-btn" 
                @click="goAdmin"
              >
                <template #icon>
                  <el-icon><Setting /></el-icon>
                </template>
                <div class="btn-content">
                  <div class="btn-title">
                    系统管理
                  </div>
                  <div class="btn-subtitle">
                    管理员入口
                  </div>
                </div>
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { 
  ArrowDown, 
  UserFilled, 
  User, 
  Setting, 
  SwitchButton, 
  Bell,
  Box, 
  Search, 
  View 
} from "@element-plus/icons-vue";
 
const router = useRouter();

const isAdmin = computed(() => {
  const role = localStorage.getItem('role');
  return role === 'admin';
});

const usernameDisplay = computed(() => {
  const username = localStorage.getItem("username") || "访客";
  return username;
});

const goLostList = () => {
  router.push("/lost_item/list");
};

const goFoundList = () => {
  router.push("/found");
};

const goProfile = () => {
  router.push("/profile");
};

const goAdmin = () => {
  router.push("/admin");
};

const logout = () => {
  localStorage.clear();
  router.push("/login");
};

onMounted(() => {
  console.log('Home页面加载完成');
});
</script>

<style scoped>
.home-container {
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

.user-section {
  margin-right: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.user-info {
  display: flex;
  flex-direction: column;
  color: white;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
}

.admin-role {
  color: #ffd04b;
  font-weight: 600;
}

.dropdown-icon {
  color: white;
  font-size: 12px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}

.admin-item {
  color: #e6a23c;
}

.logout-item {
  color: #f56c6c;
}

.main-content {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.welcome-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.welcome-content {
  padding: 32px;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.welcome-subtitle {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.action-section {
  text-align: center;
}

.action-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.action-btn {
  width: 220px;
  height: 100px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.action-btn :deep(.el-icon) {
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
  
  .welcome-header {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>