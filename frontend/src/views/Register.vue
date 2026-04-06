<template>
  <div class="auth-container">
    <!-- 背景装饰 -->
    <div class="auth-background">
      <div class="auth-gradient"></div>
      <div class="auth-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="auth-content">
      <div class="auth-card-wrapper">
        <el-card class="auth-card" shadow="always">
          <div class="card-header">
            <div class="logo-section">
              <el-icon :size="32" class="logo-icon"><User /></el-icon>
              <div class="logo-text">
                <h1 class="logo-title">创建账户</h1>
                <p class="logo-subtitle">Create Account</p>
              </div>
            </div>
            <p class="card-description">加入校园失物招领平台</p>
          </div>

          <el-form 
            :model="registerForm" 
            ref="registerFormRef"
            class="auth-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
                class="form-input"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                class="form-input"
              />
            </el-form-item>

            <el-form-item prop="contact">
              <el-input
                v-model="registerForm.contact"
                placeholder="请输入联系方式"
                size="large"
                :prefix-icon="Phone"
                class="form-input"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handleRegister"
                size="large"
                class="submit-btn"
                :loading="loading"
              >
                注册
              </el-button>
            </el-form-item>

            <div class="auth-footer">
              <span class="footer-text">已有账号？</span>
              <el-button 
                type="text" 
                @click="$router.push('/login')"
                class="switch-btn"
              >
                立即登录
              </el-button>
            </div>
          </el-form>

          <!-- 错误提示 -->
          <el-alert
            v-if="errorMessage"
            type="error"
            :title="errorMessage"
            show-icon
            class="error-alert"
            :closable="true"
            @close="errorMessage = ''"
          />
          
          <!-- 成功提示 -->
          <el-alert
            v-if="successMessage"
            type="success"
            :title="successMessage"
            show-icon
            class="success-alert"
            :closable="false"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'
import axios from '../api/axios'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()

    const registerForm = reactive({
      username: '',
      password: '',
      contact: ''
    })

    const registerFormRef = ref(null)
    const errorMessage = ref('')
    const successMessage = ref('')
    const loading = ref(false)

    const handleRegister = async () => {
      errorMessage.value = ''
      successMessage.value = ''
      
      if (!registerForm.username || !registerForm.password) {
        errorMessage.value = '用户名或密码不能为空'
        return
      }

      loading.value = true
      try {
        const res = await axios.post('/api/register', registerForm)

        if (res === '注册成功') {
          successMessage.value = '注册成功，即将跳转登录页'
          setTimeout(() => {
            router.push('/login')
          }, 1000)
        } else {
          errorMessage.value = res
        }
      } catch (err) {
        errorMessage.value = '注册失败'
      } finally {
        loading.value = false
      }
    }

    return { 
      registerForm, 
      registerFormRef, 
      handleRegister, 
      errorMessage, 
      successMessage,
      loading,
      User,
      Lock,
      Phone
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.auth-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
}

.auth-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 10s;
}

.auth-content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card-wrapper {
  max-width: 440px;
  width: 100%;
}

.auth-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.logo-subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
  letter-spacing: 1px;
}

.card-description {
  margin: 0;
  color: #606266;
  font-size: 15px;
  opacity: 0.8;
}

.auth-form {
  margin: 0;
}

.form-input {
  width: 100%;
}

.form-input :deep(.el-input__inner) {
  border-radius: 10px;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input :deep(.el-input__inner:hover),
.form-input :deep(.el-input__inner:focus) {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-input :deep(.el-input__prefix) {
  color: #909399;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  height: 48px;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-text {
  color: #606266;
  font-size: 14px;
}

.switch-btn {
  color: #667eea;
  font-weight: 600;
  padding: 4px 8px;
}

.switch-btn:hover {
  color: #764ba2;
}

.error-alert,
.success-alert {
  margin-top: 20px;
  border-radius: 10px;
  border: none;
}

.error-alert :deep(.el-alert__title),
.success-alert :deep(.el-alert__title) {
  font-size: 14px;
  font-weight: 500;
}

.success-alert {
  animation: slideIn 0.5s ease;
}

/* 动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(10px) translateX(-20px);
  }
  75% {
    transform: translateY(-10px) translateX(20px);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-card {
  animation: fadeIn 0.6s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 20px;
  }
  
  .auth-card {
    background: white;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }
  
  .auth-card-wrapper {
    max-width: 100%;
  }
  
  .logo-title {
    font-size: 24px;
  }
  
  .card-description {
    font-size: 14px;
  }
  
  .form-input :deep(.el-input__inner) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .auth-content {
    padding: 10px;
  }
  
  .auth-card {
    padding: 20px;
  }
  
  .logo-title {
    font-size: 22px;
  }
  
  .logo-subtitle {
    font-size: 12px;
  }
}

/* 加载状态样式 */
:deep(.el-loading-spinner) {
  color: #667eea;
}

:deep(.el-loading-spinner .el-loading-text) {
  color: #667eea;
  margin-top: 8px;
}
</style>