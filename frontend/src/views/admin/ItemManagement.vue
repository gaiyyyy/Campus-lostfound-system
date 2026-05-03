<template>
  <div class="admin-management">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon
            :size="24"
            class="logo-icon"
          >
            <Box v-if="isLost" />
            <Present v-else />
          </el-icon>
          <div class="logo-text">
            <h1 class="logo-title">
              {{ title }}管理
            </h1>
            <p class="logo-subtitle">
              {{ isLost ? 'Lost Items Management' : 'Found Items Management' }}
            </p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip
            content="返回管理面板"
            placement="bottom"
          >
            <el-button
              type="info"
              plain
              circle
              @click="goBack"
            >
              <el-icon><Back /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip
            content="刷新数据"
            placement="bottom"
          >
            <el-button 
              type="primary" 
              circle 
              :loading="loading"
              :disabled="loading"
              @click="refresh"
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
        class="management-card"
        shadow="hover"
      >
        <!-- 筛选区域 -->
        <div class="filter-section">
          <h3 class="section-title">
            <el-icon><Filter /></el-icon>
            筛选条件
          </h3>
          <div class="filter-container">
            <div class="search-box">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索物品名称、描述或地点..."
                clearable
                class="search-input"
                @input="handleSearch"
                @clear="handleSearch"
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
                  class="filter-select"
                  @change="handleSearch"
                >
                  <el-option
                    label="全部"
                    value=""
                  />
                  <el-option
                    v-for="cat in categories"
                    :key="cat"
                    :label="cat"
                    :value="cat"
                  />
                </el-select>
              </div>
              
              <div class="filter-group">
                <span class="filter-label">状态:</span>
                <el-select
                  v-model="filterStatus"
                  placeholder="全部状态"
                  class="filter-select"
                  @change="handleSearch"
                >
                  <el-option
                    label="全部"
                    value=""
                  />
                  <el-option
                    :label="statusLabels.pending"
                    :value="0"
                  />
                  <el-option
                    :label="statusLabels.resolved"
                    :value="1"
                  />
                </el-select>
              </div>
              
              <div class="filter-group">
                <span class="filter-label">发布者:</span>
                <el-input
                  v-model="filterPublisher"
                  placeholder="搜索发布者"
                  clearable
                  class="publisher-input"
                  @input="handleSearch"
                  @clear="handleSearch"
                />
              </div>
              
              <el-button
                type="default"
                :disabled="!hasFilters"
                class="clear-btn"
                plain
                @click="clearFilters"
              >
                <el-icon><Delete /></el-icon>
                清空筛选
              </el-button>
            </div>
            
            <div
              v-if="originalList.length > 0"
              class="filter-stats"
            >
              <span class="stat-text">共 {{ originalList.length }} 条记录</span>
              <span
                v-if="hasFilters"
                class="stat-text"
              >
                ，筛选后显示 {{ filteredList.length }} 条
              </span>
            </div>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-section">
          <div class="table-container">
            <el-table
              v-loading="loading"
              :data="filteredList"
              :empty-text="emptyText"
              class="data-table"
              stripe
            >
              <el-table-column
                prop="title"
                label="物品名称"
                min-width="180"
              >
                <template #default="{ row }">
                  <div class="item-title">
                    <span class="title-text">{{ row.title }}</span>
                    <el-tag
                      v-if="row.status === 0"
                      size="small"
                      type="warning"
                      class="status-tag"
                    >
                      新
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="category"
                label="类别"
                width="100"
              >
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
              
              <el-table-column
                label="地点"
                width="150"
              >
                <template #default="{ row }">
                  <div class="location-cell">
                    <el-icon
                      :size="14"
                      style="margin-right: 4px;"
                    >
                      <Location />
                    </el-icon>
                    <span>{{ getLocation(row) || '未填写' }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column
                label="发布者"
                width="130"
              >
                <template #default="{ row }">
                  <div class="publisher-cell">
                    <el-avatar
                      :size="24"
                      :style="{ backgroundColor: getAvatarColor(row.userId) }"
                    >
                      {{ getPublisherInitial(row) }}
                    </el-avatar>
                    <span class="publisher-name">{{ getPublisherName(row) }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column
                label="状态"
                width="100"
              >
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === 0 ? 'warning' : 'success'"
                    size="small"
                    effect="dark"
                  >
                    {{ row.status === 0 ? statusLabels.pending : statusLabels.resolved }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column
                label="发布时间"
                width="180"
              >
                <template #default="{ row }">
                  <div class="time-cell">
                    <div class="time-text">
                      {{ formatDate(row.createTime) }}
                    </div>
                    <div class="time-subtext">
                      {{ formatTime(row.createTime) }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column
                label="操作"
                width="150"
                fixed="right"
              >
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-tooltip
                      content="查看详情"
                      placement="top"
                    >
                      <el-button
                        type="primary"
                        size="small"
                        circle
                        class="action-btn"
                        @click="viewDetail(row.id)"
                      >
                        <el-icon><View /></el-icon>
                      </el-button>
                    </el-tooltip>
                    
                    <el-tooltip
                      content="删除记录"
                      placement="top"
                    >
                      <el-button
                        type="danger"
                        size="small"
                        circle
                        class="action-btn"
                        @click="deleteItem(row.id)"
                      >
                        <el-icon><Delete /></el-icon>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Back, 
  Refresh, 
  Filter, 
  Delete, 
  View,
  Box, 
  Present,
  Location
} from '@element-plus/icons-vue'
import { getAllLostItems, getAllFoundItems, adminDeleteLostItem, adminDeleteFoundItem } from '../../api/admin'

const route = useRoute()
const router = useRouter()

// 数据
const originalList = ref([])
const loading = ref(false)

// 筛选条件
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterPublisher = ref('')

// 计算属性
const isLost = computed(() => route.path.includes('lost-items'))
const title = computed(() => isLost.value ? '失物' : '招领')
const statusLabels = computed(() => {
  return isLost.value 
    ? { pending: '未找回', resolved: '已找回' }
    : { pending: '待认领', resolved: '已归还' }
})

const hasFilters = computed(() => {
  return searchKeyword.value || filterCategory.value || filterStatus.value !== '' || filterPublisher.value
})

const emptyText = computed(() => {
  if (loading.value) return "加载中..."
  if (hasFilters.value) return "没有找到匹配的记录"
  return "暂无数据"
})

// 分类选项
const categories = computed(() => {
  const cats = new Set()
  originalList.value.forEach(item => {
    if (item.category) {
      cats.add(item.category)
    }
  })
  return Array.from(cats)
})

// 辅助方法
const getLocation = (item) => {
  return isLost.value ? (item.lostLocation || item.location) : (item.foundLocation || item.location)
}

const getPublisherName = (item) => {
  if (item.username && item.username.trim()) {
    return item.username
  }
  if (item.userId) {
    return `用户${item.userId}`
  }
  return '未知用户'
}

const getPublisherInitial = (item) => {
  const name = getPublisherName(item)
  if (name.includes('用户')) {
    return 'U'
  }
  return name.charAt(0).toUpperCase()
}

const getAvatarColor = (userId) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#8a2be2', '#00bcd4']
  const index = (userId || 0) % colors.length
  return colors[index]
}

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

// 前端筛选逻辑
const filteredList = computed(() => {
  let list = [...originalList.value]
  
  // 1. 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(item => {
      const title = item.title || ''
      const description = item.description || ''
      const location = getLocation(item) || ''
      
      return (
        title.toLowerCase().includes(keyword) ||
        description.toLowerCase().includes(keyword) ||
        location.toLowerCase().includes(keyword)
      )
    })
  }
  
  // 2. 分类筛选
  if (filterCategory.value) {
    list = list.filter(item => item.category === filterCategory.value)
  }
  
  // 3. 状态筛选
  if (filterStatus.value !== '') {
    const status = parseInt(filterStatus.value)
    list = list.filter(item => item.status === status)
  }
  
  // 4. 发布者筛选
  if (filterPublisher.value) {
    const keyword = filterPublisher.value.toLowerCase()
    list = list.filter(item => {
      const username = item.username || ''
      const userId = item.userId ? item.userId.toString() : ''
      
      return (
        username.toLowerCase().includes(keyword) ||
        userId.includes(keyword)
      )
    })
  }
  
  // 按时间倒序排序
  return list.sort((a, b) => {
    const timeA = a.createTime || 0
    const timeB = b.createTime || 0
    return new Date(timeB) - new Date(timeA)
  })
})

// 主要方法
const loadItems = async () => {
  loading.value = true
  try {
    const data = isLost.value 
      ? await getAllLostItems()
      : await getAllFoundItems()
    
    originalList.value = data || []
    console.log(`加载${title.value}数据成功:`, originalList.value.length, '条')
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const clearFilters = () => {
  searchKeyword.value = ''
  filterCategory.value = ''
  filterStatus.value = ''
  filterPublisher.value = ''
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

const viewDetail = (id) => {
  // 构建返回参数
  const returnPath = isLost.value ? '/admin/lost-items' : '/admin/found-items'
  
  if (isLost.value) {
    // 跳转到失物详情，并传递返回路径
    router.push({ 
      path: `/lost_item/${id}`,
      query: { 
        redirect: returnPath,
        from: 'admin'
      }
    })
  } else {
    // 跳转到招领详情，并传递返回路径
    router.push({ 
      path: `/found/${id}`,
      query: { 
        redirect: returnPath,
        from: 'admin'
      }
    })
  }
}

const deleteItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除这条记录吗？删除后将无法恢复。', '确认删除', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'confirm-delete-btn'
    })
    
    if (isLost.value) {
      await adminDeleteLostItem(id)
    } else {
      await adminDeleteFoundItem(id)
    }
    
    ElMessage.success('删除成功')
    await loadItems()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const refresh = () => {
  loadItems()
  ElMessage.success('数据已刷新')
}

const goBack = () => {
  // 直接返回管理员面板
  router.push("/admin");
};

onMounted(() => {
  loadItems()
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

.filter-select,
.publisher-input {
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
  gap: 8px;
}

.title-text {
  font-weight: 500;
}

.status-tag {
  height: 18px;
  line-height: 16px;
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
}

.action-btn {
  width: 32px;
  height: 32px;
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
  
  .filter-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filter-select,
  .publisher-input {
    width: 100%;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>