<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon :size="24" class="logo-icon">
            <component :is="isEdit ? 'Edit' : 'Plus'"></component>
          </el-icon>
          <div class="logo-text">
            <h1 class="logo-title">{{ isEdit ? '编辑失物信息' : '发布失物信息' }}</h1>
            <p class="logo-subtitle">{{ isEdit ? 'Edit Lost Item' : 'Publish Lost Item' }}</p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip content="返回列表" placement="bottom">
            <el-button type="info" plain circle @click="goToList" class="header-btn">
              <el-icon><List /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="查看详情" placement="bottom" v-if="isEdit">
            <el-button type="info" plain circle @click="goToDetail" class="header-btn">
              <el-icon><View /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-card class="content-card" shadow="hover">
        <div class="form-section">
          <div class="form-container">
            <el-form 
              ref="formRef" 
              :model="form" 
              label-width="120px" 
              label-position="left"
              class="custom-form"
            >
              <!-- 物品标题 -->
              <div class="form-row">
                <div class="form-label">物品标题</div>
                <div class="form-field">
                  <el-form-item 
                    prop="title"
                    :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]"
                  >
                    <el-input 
                      v-model="form.title" 
                      placeholder="请输入失物标题，如：丢失校园卡"
                      class="form-input"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 物品类别 -->
              <div class="form-row">
                <div class="form-label">物品类别</div>
                <div class="form-field">
                  <el-form-item>
                    <el-select 
                      v-model="form.category" 
                      placeholder="请选择或输入类别"
                      class="form-select"
                      filterable
                      allow-create
                    >
                      <el-option label="证件" value="证件"></el-option>
                      <el-option label="钱包" value="钱包"></el-option>
                      <el-option label="钥匙" value="钥匙"></el-option>
                      <el-option label="电子产品" value="电子产品"></el-option>
                      <el-option label="个人物品" value="个人物品"></el-option>
                      <el-option label="书包" value="书包"></el-option>
                      <el-option label="水杯" value="水杯"></el-option>
                      <el-option label="雨伞" value="雨伞"></el-option>
                      <el-option label="书籍" value="书籍"></el-option>
                      <el-option label="其他" value="其他"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>

              <!-- 丢失地点 -->
              <div class="form-row">
                <div class="form-label">丢失地点</div>
                <div class="form-field">
                  <el-form-item>
                    <el-input 
                      v-model="form.lostLocation" 
                      placeholder="请输入丢失地点，如：图书馆三楼阅览室"
                      class="form-input"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 丢失时间 -->
              <div class="form-row">
                <div class="form-label">丢失时间</div>
                <div class="form-field">
                  <el-form-item>
                    <el-date-picker
                      v-model="form.lostTime"
                      type="datetime"
                      placeholder="请选择丢失时间"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DD HH:mm"
                      class="form-datepicker"
                      :teleported="false"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 物品描述 -->
              <div class="form-row">
                <div class="form-label">物品描述</div>
                <div class="form-field">
                  <el-form-item>
                    <el-input
                      v-model="form.description"
                      type="textarea"
                      :rows="6"
                      placeholder="请详细描述物品特征、颜色、品牌、新旧程度等识别信息"
                      maxlength="500"
                      show-word-limit
                      resize="none"
                      class="form-textarea"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="form-row actions-row">
                <div class="form-label"></div>
                <div class="form-field">
                  <div class="action-buttons">
                    <el-button 
                      type="primary" 
                      @click="submit"
                      :loading="submitting"
                      class="submit-btn"
                    >
                      <el-icon class="btn-icon">
                        <component :is="isEdit ? 'Check' : 'Plus'"></component>
                      </el-icon>
                      {{ isEdit ? '保存修改' : '发布失物信息' }}
                    </el-button>
                    
                    <el-button 
                      @click="goToList"
                      class="cancel-btn"
                    >
                      取消
                    </el-button>
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createLostItem, updateLostItem, getLostItemDetail } from '../../api/lostItem'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { 
  Edit, Plus, List, View, Check 
} from "@element-plus/icons-vue";

const props = defineProps({
  isEdit: Boolean,
  redirectAfterSubmit: { type: String, default: '' }
})

const router = useRouter()
const route = useRoute()
const formRef = ref()
const submitting = ref(false)

const form = ref({
  title: '',
  category: '',
  lostLocation: '',
  lostTime: null,
  description: ''
})


onMounted(async () => {
  if (props.isEdit) {
    const data = await getLostItemDetail(route.params.id)
    form.value = {
      title: data.title,
      category: data.category,
      lostLocation: data.lostLocation,
      lostTime: data.lostTime ? new Date(data.lostTime) : null,
      description: data.description
    }
  }
})

const submit = async () => {
  try {
    await formRef.value.validate()
  } catch (err) {
    return
  }

  const submitData = {
    ...form.value,
    lostTime: form.value.lostTime
      ? dayjs(form.value.lostTime).format('YYYY-MM-DD HH:mm')
      : null
  }

  try {
    if (props.isEdit) {
      await updateLostItem(route.params.id, submitData)
      ElMessage.success('修改成功')
      // 优先使用 props.redirectAfterSubmit，其次使用路由 query.redirect，最后回 detail
      const redirectTarget = props.redirectAfterSubmit || route.query.redirect || ''
      if (redirectTarget) {
        router.push(redirectTarget)
      } else {
        router.push(`/lost_item/${route.params.id}`)
      }
    } else {
      await createLostItem(submitData)
      ElMessage.success('发布成功')
      router.push('/lost_item/list')
    }
  } catch (err) {
    ElMessage.error('提交失败')
    console.error(err)
  }
}

const goToList = () => {
  router.push('/lost_item/list')
}

const goToDetail = () => {
  if (route.params.id) {
    router.push(`/lost_item/${route.params.id}`)
  }
}
</script>

<style scoped>
/* 页面容器 */
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 头部导航栏 */
.main-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 64px;
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

.header-btn {
  width: 40px;
  height: 40px;
}

/* 主内容区 */
.main-content {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.content-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

/* 表单区域 */
.form-section {
  padding: 32px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 表单行 */
.form-row {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
}

.form-label {
  width: 120px;
  padding-right: 20px;
  text-align: right;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  padding-top: 8px;
  flex-shrink: 0;
}

.form-field {
  flex: 1;
}

/* 表单元素样式 */
.form-input,
.form-select,
.form-datepicker,
.form-textarea {
  width: 100%;
}

.form-input :deep(.el-input__wrapper),
.form-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  box-shadow: none;
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__wrapper:hover),
.form-select :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.form-input :deep(.el-input__wrapper.is-focus),
.form-select :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.form-datepicker :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.form-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-textarea :deep(.el-textarea__inner:hover) {
  border-color: #c0c4cc;
}

.form-textarea :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 操作按钮行 */
.actions-row {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.submit-btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3) !important;
}

.cancel-btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f5f7fa !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.btn-icon {
  margin-right: 8px;
}

/* 表单验证错误样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f56c6c !important;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 0 16px;
    margin: 16px auto;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .form-row {
    flex-direction: column;
    margin-bottom: 20px;
  }
  
  .form-label {
    width: 100%;
    text-align: left;
    padding: 0 0 8px 0;
  }
  
  .form-field {
    width: 100%;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .logo-title {
    font-size: 16px;
  }
  
  .logo-subtitle {
    font-size: 10px;
  }
}
</style>