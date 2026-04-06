<template>
  <el-container class="profile-container">
    <!-- Header -->
    <el-header class="header">
      <div class="logo">校园失物招领平台</div>

      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            {{ username }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="showChangeUsername = true"
                >修改用户名</el-dropdown-item
              >
              <el-dropdown-item @click="showChangePassword = true"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item divided @click="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button class="home-btn" @click="goHome">返回首页</el-button>
      </div>
    </el-header>

    <!-- 修改用户名对话框 -->
    <el-dialog v-model="showChangeUsername" title="修改用户名">
      <el-form>
        <el-form-item label="新用户名">
          <el-input v-model="usernameForm.newUsername" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangeUsername = false">取消</el-button>
        <el-button type="primary" @click="submitChangeUsername">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showChangePassword" title="修改密码">
      <el-form>
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" @click="submitChangePassword">保存</el-button>
      </template>
    </el-dialog>

    <!-- Main -->
    <el-container>
      <!-- Sidebar -->
      <el-aside width="220px" class="aside">
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="lost"> 我发布的失物 </el-menu-item>
          <el-menu-item index="found"> 我发布的招领 </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Content -->
      <el-main class="main">
        <!-- 我发布的失物 -->
        <div v-if="activeMenu === 'lost'">
          <div class="section-header">
            <h2 style="margin: 0">我发布的失物</h2>
            <el-tag type="info" size="small">共 {{ lostList.length }} 条记录</el-tag>
          </div>

          <el-table :data="lostList" border stripe v-loading="loading" class="data-table">
            <el-table-column prop="title" label="物品名称" min-width="180" />
            <el-table-column prop="category" label="类别" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lostLocation" label="丢失地点" width="120" />
            <el-table-column prop="lostTime" label="丢失时间" width="150" />

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'warning' : 'success'" size="small">
                  {{ row.status === 0 ? "未找回" : "已找回" }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    v-if="row.isOwner"
                    size="small"
                    type="primary"
                    @click="editLost(row.id)"
                  >
                    编辑
                  </el-button>

                  <el-button
                    v-if="row.isOwner"
                    size="small"
                    type="danger"
                    @click="deleteLost(row.id)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-empty
            v-if="!loading && lostList.length === 0"
            description="暂无失物信息"
          />
        </div>

        <!-- 我发布的招领 -->
        <div v-else>
          <div class="section-header">
            <h2 style="margin: 0">我发布的招领</h2>
            <el-tag type="info" size="small">共 {{ foundList.length }} 条记录</el-tag>
          </div>

          <el-table :data="foundList" border stripe v-loading="foundLoading" class="data-table">
            <el-table-column prop="title" label="物品名称" min-width="180" />
            <el-table-column prop="category" label="类别" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="foundLocation" label="拾到地点" width="120" />
            <el-table-column prop="foundTime" label="拾到时间" width="150" />

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'warning' : 'success'" size="small">
                  {{ row.status === 0 ? "待认领" : "已归还" }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                   
                    size="small" type="primary" @click="editFound(row.id)" > 编辑
                  </el-button>

                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteFound(row.id)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-empty
            v-if="!foundLoading && foundList.length === 0"
            description="暂无招领信息"
          />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import { getMyLostItems, deleteLostItem } from "../api/lostItem";
import { updateUsername, updatePassword } from "../api/user";
import { getMyFoundItems, deleteFoundItem } from '../api/found';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();

/* 基础状态 */
const activeMenu = ref("lost");
const username = ref("");
const userId = localStorage.getItem("userId");
const showChangeUsername = ref(false);
const showChangePassword = ref(false);

const usernameForm = ref({ newUsername: "" });
const passwordForm = ref({ oldPassword: "", newPassword: "" });

/* 失物列表 */
const lostList = ref([]);
const loading = ref(false);

onMounted(() => {
  username.value = localStorage.getItem("username") || "未登录用户";
  
  // 检查是否有刚刚编辑招领的标记
  const justEditedFound = sessionStorage.getItem('justEditedFound') === 'true';
  
  if (justEditedFound) {
    activeMenu.value = 'found';
    fetchMyFoundItems();
    // 清除标记，只生效一次
    sessionStorage.removeItem('justEditedFound');
  } else {
    activeMenu.value = 'lost';
    fetchMyLostItems();
  }
});

/* 获取当前用户发布的失物 */
const fetchMyLostItems = async () => {
  loading.value = true;
  try {
    const res = await getMyLostItems();
    // 只显示当前用户自己的
    lostList.value = res.filter((item) => item.isOwner);
    console.log("我的失物列表:", lostList.value);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

/* 编辑失物（复用已有页面） */
const editLost = (id) => {
  router.push({
    path: `/lost_item/edit/${id}`,
    query: { redirect: "/profile" },
  });
};

/* 删除失物 */
const deleteLost = async (id) => {
  try {
    await ElMessageBox.confirm("确认删除该失物信息吗？删除后不可恢复", "提示", {
      type: "warning",
    });

    await deleteLostItem(id);
    ElMessage.success("删除成功");
    fetchMyLostItems();
  } catch (err) {
    // 取消或失败都不需要处理
  }
};

/* 招领相关状态 */
const foundList = ref([]);
const foundLoading = ref(false);

/* 获取我发布的招领 */
const fetchMyFoundItems = async () => {
  foundLoading.value = true;
  try {
    // TODO: 确保这个API存在，如果没有先创建
    const res = await getMyFoundItems(); // 假设有这个API
    
    // 前端过滤：只显示当前用户的（如果API返回所有用户的）
    const currentUserId = parseInt(localStorage.getItem('userId') || '0');
    foundList.value = (res || []).filter(item => 
      item.userId === currentUserId || item.isOwner
    );
    
    console.log("我的招领列表:", foundList.value);
  } catch (err) {
    console.error('获取招领列表失败:', err);
    ElMessage.error('加载招领失败');
  } finally {
    foundLoading.value = false;
  }
};

/* 招领相关操作 */
const editFound = (id) => {
  router.push({
    path: `/found/edit/${id}`,
    query: { from: 'profile' }  // 标记从profile页面进入
  });
};

const deleteFound = async (id) => {
  try {
    await ElMessageBox.confirm("确认删除该招领信息吗？删除后不可恢复", "提示", {
      type: "warning",
    });

    // TODO: 确保这个API存在
    await deleteFoundItem(id);
    ElMessage.success("删除成功");
    fetchMyFoundItems();
  } catch (err) {
    // 取消或失败都不需要处理
  }
};

const goToPublishFound = () => {
  router.push('/found/publish');
};

/* 修改用户名 */
const submitChangeUsername = async () => {
  if (!usernameForm.value.newUsername) {
    ElMessage.error("用户名不能为空");
    return;
  }

  try {
    const res = await updateUsername(usernameForm.value.newUsername);
    if (!res || res.message !== "修改成功") {
      ElMessage.error(res?.message || "修改失败");
      return;
    }
    ElMessage.success("修改成功");
    // 更新本地显示
    username.value = usernameForm.value.newUsername;
    localStorage.setItem("username", usernameForm.value.newUsername);
    showChangeUsername.value = false;
    usernameForm.value.newUsername = "";
  } catch (err) {
    // axios 拦截器会显示错误信息
  }
};

/* 修改密码 */
const submitChangePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.error("请填写旧密码和新密码");
    return;
  }

  try {
    const res = await updatePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    );
    if (!res || res.message !== "修改成功") {
      ElMessage.error(res?.message || "修改失败");
      return;
    }
    ElMessage.success("修改成功");
    showChangePassword.value = false;
    passwordForm.value.oldPassword = "";
    passwordForm.value.newPassword = "";
  } catch (err) {
    // 错误由拦截器显示
  }
};

/* 菜单切换 */
const handleMenuSelect = (index) => {
  activeMenu.value = index
  
  // 清空另一个列表的数据，避免显示混乱
  if (index === 'lost') {
    foundList.value = []  // 清空招领列表
    fetchMyLostItems()    // 加载失物
  } else if (index === 'found') {
    lostList.value = []   // 清空失物列表
    fetchMyFoundItems()   // 加载招领
  }
}

// 返回首页
const goHome = () => {
  router.push("/home");
};

/* 退出登录 */
const logout = () => {
  localStorage.clear();
  router.push("/login");
};
</script>

<style scoped>
/* 整体容器 */
.profile-container {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 18px;
  font-weight: 700;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #ffffff;
  transform: translateY(-1px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-btn {
  padding: 6px 16px !important;
  background-color: rgba(255, 255, 255, 0.9) !important;
  color: #667eea !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease !important;
}

.home-btn:hover {
  background-color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2) !important;
}

/* 侧边栏 */
.aside {
  background: white;
  border-right: 1px solid #ebeef5;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.aside .el-menu {
  border-right: none;
  padding-top: 20px;
}

.aside .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.aside .el-menu-item.is-active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.aside .el-menu-item:not(.is-active):hover {
  background: #f5f7fa;
  color: #667eea;
}

/* 主内容区 */
.main {
  padding: 24px;
  background: transparent;
}

/* 内容卡片 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #ebeef5;
}

.section-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

/* 表格样式 */
.data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.data-table :deep(.el-table__header-wrapper) {
  background-color: #f8f9fa;
}

.data-table :deep(.el-table__header th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #303133;
}

.data-table :deep(.el-table__row:hover) {
  background: #f5f7fa !important;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .el-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 空状态 */
:deep(.el-empty) {
  margin-top: 40px;
}

:deep(.el-empty__description) {
  color: #909399;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    flex-wrap: wrap;
  }
  
  .logo {
    font-size: 16px;
  }
  
  .header-right {
    gap: 8px;
  }
  
  .aside {
    width: 180px !important;
  }
  
  .main {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>