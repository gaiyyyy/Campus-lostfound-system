<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon :size="24" class="logo-icon"><Box /></el-icon>
          <div class="logo-text">
            <h1 class="logo-title">失物列表</h1>
            <p class="logo-subtitle">Lost Items</p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip content="返回首页" placement="bottom">
            <el-button type="info" plain circle @click="goHome">
              <el-icon><HomeFilled /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="发布新失物" placement="bottom" v-if="currentUsername">
            <el-button type="primary" circle @click="goNew">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card class="content-card" shadow="hover">
        <!-- 搜索筛选区域 -->
        <div class="filter-section">
          <h3 class="section-title">
            <el-icon><Search /></el-icon>
            搜索筛选
          </h3>
          <div class="filter-container">
            <div class="search-box">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索物品名称、描述或丢失地点..."
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            
            <div class="filter-options">
              <div class="filter-group">
                <span class="filter-label">分类:</span>
                <el-select
                  v-model="filterCategory"
                  placeholder="全部分类"
                  @change="handleSearch"
                  class="filter-select"
                >
                  <el-option label="全部" value=""></el-option>
                  <el-option label="证件" value="证件"></el-option>
                  <el-option label="钱包" value="钱包"></el-option>
                  <el-option label="钥匙" value="钥匙"></el-option>
                  <el-option label="电子产品" value="电子产品"></el-option>
                  <el-option label="个人物品" value="个人物品"></el-option>
                  <el-option label="其他" value="其他"></el-option>
                </el-select>
              </div>
              
              <div class="filter-group">
                <span class="filter-label">状态:</span>
                <el-select
                  v-model="filterStatus"
                  placeholder="全部状态"
                  @change="handleSearch"
                  class="filter-select"
                >
                  <el-option label="全部" value=""></el-option>
                  <el-option label="未找回" :value="0"></el-option>
                  <el-option label="已找回" :value="1"></el-option>
                </el-select>
              </div>
              
              <el-button
                type="default"
                @click="clearFilters"
                :disabled="!hasFilters"
                class="clear-btn"
                plain
              >
                <el-icon><Delete /></el-icon>
                清空筛选
              </el-button>
            </div>
            
            <div class="filter-stats" v-if="!loading && allList.length > 0">
              <span class="stat-text">共 {{ allList.length }} 条失物信息</span>
              <span class="stat-text" v-if="hasFilters">
                ，筛选后显示 {{ filteredList.length }} 条
              </span>
            </div>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-section">
          <div class="table-header">
            <h3 class="section-title">
              <el-icon><List /></el-icon>
              失物信息列表
            </h3>
          </div>
          
          <div class="table-container">
            <el-table
              :data="filteredList"
              v-loading="loading"
              :empty-text="emptyText"
              class="data-table"
              stripe
            >
              <el-table-column prop="title" label="物品名称" min-width="200">
                <template #default="{ row }">
                  <div class="item-title">
                    <div class="item-icon">
                      <el-icon><Box /></el-icon>
                    </div>
                    <div class="item-info">
                      <div class="item-name">{{ row.title }}</div>
                      <div class="item-meta">
                        <el-tag v-if="row.status === 0" size="mini" type="warning">
                          新
                        </el-tag>
                        <span class="item-time">{{ formatTime(row.lostTime) }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="类别" width="100">
                <template #default="{ row }">
                  <el-tag 
                    size="small" 
                    effect="plain" 
                    :type="getCategoryTagType(row.category)"
                  >
                    {{ row.category || '未分类' }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="丢失地点" width="150">
                <template #default="{ row }">
                  <div class="location-cell">
                    <el-icon :size="14" style="margin-right: 4px;"><Location /></el-icon>
                    <span>{{ row.lostLocation || '未填写' }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="发布者" width="130">
                <template #default="{ row }">
                  <div class="publisher-cell">
                    <el-avatar :size="28" :style="{ backgroundColor: getAvatarColor(row.username) }">
                      {{ getPublisherInitial(row.username) }}
                    </el-avatar>
                    <span class="publisher-name">{{ row.username || '匿名' }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === 0 ? 'warning' : 'success'"
                    size="small"
                    effect="dark"
                    class="status-tag"
                  >
                    {{ row.status === 0 ? "未找回" : "已找回" }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-tooltip content="查看详情" placement="top">
                      <el-button
                        type="primary"
                        size="small"
                        circle
                        @click="goDetail(row.id)"
                        class="action-btn"
                      >
                        <el-icon><View /></el-icon>
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
import { 
  Box, HomeFilled, Plus, Search, 
  Delete, List, Location, View 
} from '@element-plus/icons-vue'
import { getLostItemList } from '../../api/lostItem'

const router = useRouter()
const allList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const currentUsername = localStorage.getItem('username')

// 计算属性
const hasFilters = computed(() => {
  return searchKeyword.value || filterCategory.value || filterStatus.value !== ""
})

const emptyText = computed(() => {
  if (loading.value) return "加载中..."
  if (hasFilters.value) return "没有找到匹配的失物信息"
  return "暂无失物信息"
})

// 前端筛选列表
const filteredList = computed(() => {
  if (!allList.value.length) return []
  
  let filtered = [...allList.value]
  
  // 关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(item => 
      (item.title && item.title.toLowerCase().includes(keyword)) ||
      (item.description && item.description.toLowerCase().includes(keyword)) ||
      (item.lostLocation && item.lostLocation.toLowerCase().includes(keyword))
    )
  }
  
  // 分类筛选
  if (filterCategory.value) {
    filtered = filtered.filter(item => item.category === filterCategory.value)
  }
  
  // 状态筛选
  if (filterStatus.value !== "") {
    const status = parseInt(filterStatus.value)
    filtered = filtered.filter(item => item.status === status)
  }
  
  // 按时间倒序排序
  return filtered.sort((a, b) => {
    return new Date(b.lostTime || b.createTime) - new Date(a.lostTime || a.createTime)
  })
})

// 辅助方法
const getCategoryTagType = (category) => {
  const typeMap = {
    '证件': 'primary',
    '钱包': 'warning',
    '钥匙': 'info',
    '电子产品': 'success',
    '个人物品': '',
    '其他': 'info'
  }
  return typeMap[category] || 'info'
}

const getAvatarColor = (username) => {
  if (!username) return '#909399'
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#8a2be2', '#00bcd4']
  const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

const getPublisherInitial = (username) => {
  if (!username || username === '匿名') return '匿'
  return username.charAt(0).toUpperCase()
}

const formatTime = (time) => {
  if (!time) return ""
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 主要方法
const load = async () => {
  loading.value = true
  try {
    const data = await getLostItemList()
    allList.value = data || []
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 前端筛选，不需要重新请求API
}

const clearFilters = () => {
  searchKeyword.value = ""
  filterCategory.value = ""
  filterStatus.value = ""
}

const goDetail = id => router.push(`/lost_item/${id}`)
const goNew = () => router.push('/lost_item/new')
const goHome = () => router.push('/home')

onMounted(load)
</script>

<style scoped>
.page-container {
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

.content-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.filter-section {
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

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  width: 100%;
  max-width: 400px;
}

.search-input {
  border-radius: 8px;
}

.filter-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.filter-select {
  width: 140px;
}

.clear-btn {
  margin-left: 8px;
}

.filter-stats {
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
}

.stat-text {
  font-size: 14px;
  color: #909399;
}

.table-section {
  padding: 0 24px 24px;
}

.table-header {
  margin-bottom: 16px;
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

.item-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.location-cell {
  display: flex;
  align-items: center;
  color: #606266;
}

.publisher-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.publisher-name {
  font-weight: 500;
  color: #303133;
}

.status-tag {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .item-title {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>