<template>
  <div class="admin-management">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon :size="24" class="logo-icon"><User /></el-icon>
          <div class="logo-text">
            <h1 class="logo-title">用户管理</h1>
            <p class="logo-subtitle">User Management</p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip content="返回管理面板" placement="bottom">
            <el-button type="info" plain circle @click="goBack">
              <el-icon><Back /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="刷新数据" placement="bottom">
            <el-button 
              type="primary" 
              circle 
              @click="refresh"
              :loading="loading"
              :disabled="loading"
            >
              <el-icon v-if="!loading"><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card class="management-card" shadow="hover">
        <!-- 用户统计 -->
        <div class="stats-section">
          <h3 class="section-title">
            <el-icon><DataAnalysis /></el-icon>
            用户统计
          </h3>
          <div class="stats-grid">
            <div class="stat-item total-stat">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ userList.length }}</div>
                <div class="stat-label">总用户数</div>
                <div class="stat-subtext">系统注册用户总数</div>
              </div>
            </div>
            
            <div class="stat-item admin-stat">
              <div class="stat-icon">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ adminCount }}</div>
                <div class="stat-label">管理员数</div>
                <div class="stat-subtext">系统管理员数量</div>
              </div>
            </div>
            
            <div class="stat-item user-stat">
              <div class="stat-icon">
                <el-icon><Avatar /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ userCount }}</div>
                <div class="stat-label">普通用户</div>
                <div class="stat-subtext">普通用户数量</div>
              </div>
            </div>
            
            <div class="stat-item ratio-stat">
              <div class="stat-icon">
                <el-icon><PieChart /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ adminRatio }}%</div>
                <div class="stat-label">管理员比例</div>
                <div class="stat-subtext">管理员/总用户</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户表格 -->
        <div class="table-section">
          <h3 class="section-title">
            <el-icon><List /></el-icon>
            用户列表
          </h3>
          <div class="table-container">
            <el-table
              :data="userList"
              v-loading="loading"
              :empty-text="emptyText"
              class="data-table"
              stripe
            >
              <el-table-column prop="id" label="ID" width="80">
                <template #default="{ row }">
                  <span class="user-id">#{{ row.id }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="用户信息" min-width="100">
                <template #default="{ row }">
                  <div class="user-info-cell">
                    <el-avatar :size="36" :style="{ backgroundColor: getAvatarColor(row.id) }">
                      {{ getUsernameInitial(row.username) }}
                    </el-avatar>
                    <div class="user-details">
                      <div class="user-name">{{ row.username }}</div>
                      <div class="user-contact">{{ row.contact || '未设置联系方式' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="角色" width="00">
                <template #default="{ row }">
                  <el-tag 
                    :type="row.role === 'admin' ? 'danger' : 'primary'"
                    size="small"
                    effect="dark"
                    class="role-tag"
                  >
                    {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="注册时间" width="180">
                <template #default="{ row }">
                  <div class="time-cell">
                    <div class="time-text">{{ formatDate(row.createTime) }}</div>
                    <div class="time-subtext">{{ formatTime(row.createTime) }}</div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-tooltip 
                      :content="row.role === 'admin' ? '取消管理员权限' : '设为管理员'" 
                      placement="top"
                    >
                      <el-button
                        :type="row.role === 'admin' ? 'warning' : 'success'"
                        size="small"
                        circle
                        @click="toggleUserRole(row)"
                        class="action-btn"
                      >
                        <el-icon v-if="row.role === 'admin'"><User /></el-icon>
                        <el-icon v-else><Star /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  Setting, 
  Avatar, 
  PieChart, 
  Back, 
  Refresh, 
  DataAnalysis, 
  List,
  Star
} from '@element-plus/icons-vue'
import { getAllUsers, updateUserRole } from '../../api/admin'

const router = useRouter()
const userList = ref([])
const loading = ref(false)

// 计算属性
const adminCount = computed(() => {
  return userList.value.filter(user => user.role === 'admin').length
})

const userCount = computed(() => {
  return userList.value.filter(user => user.role === 'user').length
})

const adminRatio = computed(() => {
  const total = userList.value.length || 1
  const admin = adminCount.value || 0
  return Math.round((admin / total) * 100)
})

const emptyText = computed(() => {
  if (loading.value) return "加载中..."
  return "暂无用户数据"
})

// 辅助方法
const getAvatarColor = (userId) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#8a2be2', '#00bcd4']
  const index = (userId || 0) % colors.length
  return colors[index]
}

const getUsernameInitial = (username) => {
  if (!username) return 'U'
  return username.charAt(0).toUpperCase()
}

const formatDate = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 主要方法
const loadUsers = async () => {
  loading.value = true
  try {
    const data = await getAllUsers()
    userList.value = data || []
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const toggleUserRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const actionText = newRole === 'admin' ? '设为管理员' : '取消管理员权限'
  const confirmText = newRole === 'admin' 
    ? `确定要将用户 "${user.username}" 设为管理员吗？`
    : `确定要取消用户 "${user.username}" 的管理员权限吗？`

  try {
    await ElMessageBox.confirm(confirmText, '操作确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonClass: newRole === 'admin' ? 'confirm-promote-btn' : 'confirm-demote-btn'
    })
    
    await updateUserRole(user.id, newRole)
    ElMessage.success(`${actionText}成功`)
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const refresh = () => {
  loadUsers()
  ElMessage.success('数据已刷新')
}

const goBack = () => {
  router.push('/admin')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-management {
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
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 20px;
}

.management-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.stats-section {
  padding: 24px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
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

.total-stat .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.admin-stat .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-stat .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.ratio-stat .stat-icon {
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
  font-size: 12px;
  color: #a8abb2;
}

.table-section {
  padding: 24px;
}

.table-container {
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  border-radius: 8px;
}

.data-table :deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
}

.data-table :deep(.el-table__header th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.user-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #909399;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.user-contact {
  font-size: 12px;
  color: #909399;
}

.role-tag {
  font-weight: 500;
  padding: 4px 8px;
}

.time-cell {
  display: flex;
  flex-direction: column;
}

.time-text {
  font-weight: 500;
  color: #303133;
}

.time-subtext {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
}

/* 按钮样式 */
:deep(.confirm-promote-btn) {
  background-color: #67c23a;
  border-color: #67c23a;
}

:deep(.confirm-promote-btn:hover) {
  background-color: #85ce61;
  border-color: #85ce61;
}

:deep(.confirm-demote-btn) {
  background-color: #e6a23c;
  border-color: #e6a23c;
}

:deep(.confirm-demote-btn:hover) {
  background-color: #ebb563;
  border-color: #ebb563;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info-cell {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>