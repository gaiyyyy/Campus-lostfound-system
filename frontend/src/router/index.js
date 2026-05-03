// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 主界面
import Home from '../views/Home.vue'

// 用户模块
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'

// 失物模块
import LostItemList from '../views/lost_item/LostItemList.vue'
import LostItemNew from '../views/lost_item/LostItemNew.vue'
import LostItemDetail from '../views/lost_item/LostItemDetail.vue'
import LostItemEdit from '../views/lost_item/LostItemEdit.vue'

// 招领模块
import FoundList from '../views/found/FoundList.vue'
import FoundDetail from '../views/found/FoundDetail.vue'
import FoundPublish from '../views/found/FoundPublish.vue'

const routes = [
  // 默认入口
  { path: '/', redirect: '/home' },

  // 主界面
  { path: '/home', name: 'Home', component: Home },

  // 用户模块
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },

  // 失物模块
  {
    path: '/lost_item/list',
    name: 'LostItemList',
    component: LostItemList,
  },
  {
    path: '/lost_item/new',
    name: 'LostItemNew',
    component: LostItemNew,
    meta: { requiresAuth: true },
  },
  {
    path: '/lost_item/:id',
    name: 'LostItemDetail',
    component: LostItemDetail,
  },
  {
    path: '/lost_item/edit/:id',
    name: 'LostItemEdit',
    component: LostItemEdit,
    meta: { requiresAuth: true },
  },

  // 招领模块路由
  {
    path: '/found',
    name: 'Found',
    component: FoundList,
  },
  {
    path: '/found/publish',
    name: 'FoundPublish',
    component: FoundPublish,
    meta: { requiresAuth: true },
  },
  {
    path: '/found/:id',
    name: 'FoundDetail',
    component: FoundDetail,
  },
  {
    path: '/found/edit/:id',
    name: 'FoundEdit',
    component: FoundPublish,  // 使用 FoundPublish 组件，通过 isEdit 参数区分
    meta: { requiresAuth: true },
  },
  // 在路由数组中添加管理员路由
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/lost-items',
    name: 'AdminLostItems',
    component: () => import('../views/admin/ItemManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/found-items',
    name: 'AdminFoundItems',
    component: () => import('../views/admin/ItemManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // 404
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') // USER / ADMIN

  // 需要登录但没登录
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // 需要管理员权限
  if (to.meta.requiresAdmin && role !== 'admin') {
    ElMessage.error('需要管理员权限')
    next('/home')
    return
  }

  next()
})

export default router