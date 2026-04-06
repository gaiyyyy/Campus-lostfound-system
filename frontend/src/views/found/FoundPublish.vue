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
            <h1 class="logo-title">{{ isEdit ? '编辑招领信息' : '发布招领信息' }}</h1>
            <p class="logo-subtitle">{{ isEdit ? 'Edit Found Item' : 'Publish Found Item' }}</p>
          </div>
        </div>
        <div class="header-tools">
          <el-tooltip content="返回列表" placement="bottom">
            <el-button type="info" plain circle @click="goBack" class="header-btn">
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
              :rules="rules" 
              label-width="120px" 
              label-position="left"
              class="custom-form"
            >
              <!-- 物品标题 -->
              <div class="form-row">
                <div class="form-label">物品标题</div>
                <div class="form-field">
                  <el-form-item prop="title">
                    <el-input 
                      v-model="form.title" 
                      placeholder="请输入招领物品标题，如：拾到校园卡"
                      maxlength="100"
                      show-word-limit
                      class="form-input"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 物品分类 -->
              <div class="form-row">
                <div class="form-label">物品分类</div>
                <div class="form-field">
                  <el-form-item prop="category">
                    <el-select 
                      v-model="form.category" 
                      placeholder="请选择物品分类"
                      class="form-select"
                    >
                      <el-option label="证件" value="证件"></el-option>
                      <el-option label="钱包" value="钱包"></el-option>
                      <el-option label="钥匙" value="钥匙"></el-option>
                      <el-option label="电子产品" value="电子产品"></el-option>
                      <el-option label="个人物品" value="个人物品"></el-option>
                      <el-option label="其他" value="其他"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>

              <!-- 拾到地点 -->
              <div class="form-row">
                <div class="form-label">拾到地点</div>
                <div class="form-field">
                  <el-form-item prop="foundLocation">
                    <el-input 
                      v-model="form.foundLocation" 
                      placeholder="请输入拾到地点，如：图书馆一楼大厅"
                      maxlength="100"
                      class="form-input"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 拾到时间 -->
              <div class="form-row">
                <div class="form-label">拾到时间</div>
                <div class="form-field">
                  <el-form-item>
                    <el-date-picker
                      v-model="form.foundTime"
                      type="datetime"
                      placeholder="请选择拾到时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
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
                  <el-form-item prop="description">
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

              <!-- 物品图片
              <div class="form-row">
                <div class="form-label">物品图片</div>
                <div class="form-field">
                  <div class="upload-section">
                    <el-upload
                      class="upload-demo"
                      :action="uploadUrl"
                      :on-success="handleUploadSuccess"
                      :on-error="handleUploadError"
                      :show-file-list="false"
                    >
                      <div v-if="form.imageUrl" class="image-preview">
                        <div class="image-wrapper">
                          <el-image
                            :src="form.imageUrl"
                            fit="cover"
                            class="preview-image"
                          />
                          <div class="image-overlay">
                            <el-button type="danger" @click.stop="removeImage" size="small">
                              <el-icon><Delete /></el-icon>
                              删除
                            </el-button>
                          </div>
                        </div>
                      </div>
                      <el-button v-else type="default" class="upload-btn">
                        <el-icon><Upload /></el-icon>
                        点击上传图片
                      </el-button>
                    </el-upload>
                    
                    <div v-if="form.imageUrl" class="image-info">
                      <span class="image-url">图片地址：{{ form.imageUrl }}</span>
                    </div>
                  </div>
                </div>
              </div> -->

              <!-- 操作按钮 -->
              <div class="form-row actions-row">
                <div class="form-label"></div>
                <div class="form-field">
                  <div class="action-buttons">
                    <el-button 
                      type="primary" 
                      @click="handleSubmit"
                      :loading="submitting"
                      class="submit-btn"
                    >
                      <el-icon class="btn-icon">
                        <component :is="isEdit ? 'Check' : 'Plus'"></component>
                      </el-icon>
                      {{ isEdit ? '保存修改' : '发布招领信息' }}
                    </el-button>
                    
                    <el-button 
                      @click="goBack"
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
import dayjs from "dayjs";
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  publishFoundItem,
  updateFoundItem,
  getFoundDetail,
} from "../../api/found";
import { 
  Edit, Plus, List, View, Check, Upload, Delete 
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const submitting = ref(false);
const uploadUrl = ref("");

const isEdit = computed(() => route.name === "FoundEdit" || route.params.id);

// 表单数据
const form = reactive({
  id: null,
  title: "",
  category: "",
  foundLocation: "",
  foundTime: "",
  description: "",
  imageUrl: "",
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: "请输入物品标题", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "标题长度在2到100个字符之间",
      trigger: "blur",
    },
  ],
  category: [{ required: true, message: "请选择物品分类", trigger: "change" }],
  foundLocation: [
    { required: true, message: "请输入拾到地点", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "地点长度在2到100个字符之间",
      trigger: "blur",
    },
  ],
  description: [
    { required: true, message: "请输入物品描述", trigger: "blur" },
    {
      min: 10,
      max: 500,
      message: "描述长度在10到500个字符之间",
      trigger: "blur",
    },
  ],
};

// 加载招领详情（编辑时使用）
const loadFoundDetail = async (id) => {
  try {
    const data = await getFoundDetail(id);
    // 填充表单数据
    form.id = data.id;
    form.title = data.title;
    form.category = data.category;
    form.foundLocation = data.foundLocation;
    form.foundTime = data.foundTime;
    form.description = data.description;
    form.imageUrl = data.imageUrl;
  } catch (error) {
    console.error("加载失败:", error);
    ElMessage.error("加载信息失败");
    router.push("/found");
  }
};

// 处理上传成功
const handleUploadSuccess = (response, file) => {
  // 根据实际的API响应结构调整
  if (response && response.data && response.data.url) {
    form.imageUrl = response.data.url;
    ElMessage.success("图片上传成功");
  } else {
    // 如果后端直接返回URL字符串
    form.imageUrl = response;
    ElMessage.success("图片上传成功");
  }
};

// 处理上传失败
const handleUploadError = (error, file) => {
  console.error("上传失败:", error);
  ElMessage.error("图片上传失败");
};

// 删除图片
const removeImage = () => {
  form.imageUrl = "";
};

// 提交表单
// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    const submitData = {
      ...form,
      userId: parseInt(localStorage.getItem("userId")),
      foundTime: form.foundTime
        ? dayjs(form.foundTime).format("YYYY-MM-DD HH:mm:ss")
        : null,
    };

    console.log("提交数据:", submitData);

    if (isEdit.value) {
      await updateFoundItem(form.id, submitData);
      ElMessage.success("更新成功");
      
      // 判断是从哪里进入编辑页的
      const fromPath = route.query.from; // 通过查询参数获取来源
      
      if (fromPath === 'profile') {
        // 从"我的招领"进入的编辑，返回Profile页面并显示招领标签页
        sessionStorage.setItem('justEditedFound', 'true');
        router.push("/profile");
      } else {
        // 默认从招领详情进入编辑，返回招领详情页
        router.push(`/found/${form.id}`);
      }
    } else {
      await publishFoundItem(submitData);
      ElMessage.success("发布成功");
      // 发布后返回招领列表页
      router.push("/found");
    }
  } catch (error) {
    console.error("提交失败详情:", error.response?.data || error);
    ElMessage.error(error.message || "提交失败");
  }
};

// 返回列表
const goBack = () => {
  router.push("/found");
};

// 查看详情
const goToDetail = () => {
  if (route.params.id) {
    router.push(`/found/${route.params.id}`);
  }
};

// 初始化
onMounted(() => {
  // 如果是编辑模式，加载数据
  if (route.params.id) {
    loadFoundDetail(route.params.id);
  }
});
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

/* 图片上传区域 */
.upload-section {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.image-preview {
  width: 100%;
}

.image-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.upload-btn {
  width: 200px;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.image-info {
  margin-top: 8px;
}

.image-url {
  font-size: 12px;
  color: #909399;
  word-break: break-all;
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
  
  .image-wrapper {
    width: 150px;
    height: 150px;
  }
  
  .upload-btn {
    width: 150px;
    height: 150px;
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
  
  .image-wrapper {
    width: 120px;
    height: 120px;
  }
  
  .upload-btn {
    width: 120px;
    height: 120px;
  }
}
</style>