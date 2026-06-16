<template>
  <div class="ai-match-button">
    <el-button 
      :type="type"
      :size="size"
      :loading="loading"
      :icon="MagicStick"
      @click="handleMatch"
    >
      {{ buttonText }}
    </el-button>
    
    <!-- 匹配结果弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="`AI智能匹配结果 - ${itemTitle}`"
      width="500px"
    >
      <div
        v-if="loading"
        class="loading-container"
      >
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>AI正在分析中...</span>
      </div>
      
      <div
        v-else-if="matchResult"
        class="match-result"
      >
        <el-alert
          :title="matchResult.success ? '匹配分析完成' : '匹配失败'"
          :type="matchResult.success ? 'success' : 'error'"
          :closable="false"
        />
        
        <div
          v-if="matchResult.success"
          class="result-content"
        >
          <h4>AI分析结果：</h4>
          <div class="ai-response">
            {{ matchResult.aiResponse }}
          </div>
        </div>
        
        <div
          v-else
          class="error-message"
        >
          {{ matchResult.message }}
        </div>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleMatch"
        >
          重新匹配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref , computed} from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Loading } from '@element-plus/icons-vue'
import axios from 'axios'

// 接收父组件传入的参数
const props = defineProps({
  // 物品类型：'lost' 或 'found'
  itemType: {
    type: String,
    required: true,
    validator: (val) => ['lost', 'found'].includes(val)
  },
  // 物品ID
  itemId: {
    type: Number,
    required: true
  },
  // 物品标题（用于弹窗显示）
  itemTitle: {
    type: String,
    default: '物品'
  },
  // 按钮样式
  type: {
    type: String,
    default: 'primary'
  },
  // 按钮大小
  size: {
    type: String,
    default: 'default'
  }
})

const loading = ref(false)
const dialogVisible = ref(false)
const matchResult = ref(null)

const buttonText = computed(() => {
  return props.itemType === 'lost' ? 'AI匹配招领' : 'AI匹配失主'
})

const handleMatch = async () => {
  // 如果已经在加载中，不重复请求
  if (loading.value) return
  
  loading.value = true
  dialogVisible.value = true
  matchResult.value = null
  
  try {
    // 根据类型调用不同接口
    const url = props.itemType === 'lost' 
      ? `/ai/match-lost/${props.itemId}`
      : `/ai/match-found/${props.itemId}`
    
    const response = await axios.post(url)
    matchResult.value = response.data
  } catch (error) {
    console.error('AI匹配失败:', error)
    matchResult.value = {
      success: false,
      message: error.response?.data?.message || '网络请求失败'
    }
    ElMessage.error('AI匹配失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px;
}

.match-result {
  margin-top: 15px;
}

.result-content {
  margin-top: 15px;
}

.result-content h4 {
  margin-bottom: 10px;
  color: #333;
}

.ai-response {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.error-message {
  color: #f56c6c;
  padding: 15px;
  text-align: center;
}
</style>