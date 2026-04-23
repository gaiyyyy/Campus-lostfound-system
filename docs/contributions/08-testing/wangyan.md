# 软件测试贡献说明

姓名：王琰 

学号：2312190223 

角色：前端

日期：2026-04-23

## 完成的测试工作

### 测试文件（共21个测试文件，178个测试用例全部通过）

#### API 层测试（4个文件）
- `src/__tests__/unit/api/admin.spec.js` - 管理员 API 测试
- `src/__tests__/unit/api/found.spec.js` - 招领 API 测试
- `src/__tests__/unit/api/lost.spec.js` - 失物 API 测试
- `src/__tests__/unit/api/user.spec.js` - 用户 API 测试

#### 组件测试（2个文件）
- `src/__tests__/unit/components/AIMatchButton.spec.js` - AI匹配按钮组件测试
- `src/__tests__/unit/components/HelloWorld.spec.js` - HelloWorld组件测试

#### 页面级测试（13个文件）
- `src/__tests__/unit/views/Login.spec.js` - 登录页面测试
- `src/__tests__/unit/views/Register.spec.js` - 注册页面测试
- `src/__tests__/unit/views/Home.spec.js` - 首页测试
- `src/__tests__/unit/views/Profile.spec.js` - 个人中心测试
- `src/__tests__/unit/views/lost_item/LostItemList.spec.js` - 失物列表测试
- `src/__tests__/unit/views/lost_item/LostItemDetail.spec.js` - 失物详情测试
- `src/__tests__/unit/views/lost_item/LostItemNew.spec.js` - 发布失物测试
- `src/__tests__/unit/views/lost_item/LostItemEdit.spec.js` - 编辑失物测试
- `src/__tests__/unit/views/found/FoundList.spec.js` - 招领列表测试
- `src/__tests__/unit/views/found/FoundDetail.spec.js` - 招领详情测试
- `src/__tests__/unit/views/found/FoundPublish.spec.js` - 发布招领测试
- `src/__tests__/unit/views/admin/AdminDashboard.spec.js` - 管理员仪表盘测试
- `src/__tests__/unit/views/admin/UserManagement.spec.js` - 用户管理测试
- `src/__tests__/unit/views/admin/ItemManagement.spec.js` - 物品管理测试

#### 根组件测试（1个文件）
- `src/__tests__/unit/App.spec.js` - 根组件测试

### 测试清单

#### 正常情况测试（约120个）
- [x] API 成功返回数据时的处理（getAdminStats、getFoundList、getLostItemList等）
- [x] 表单正常提交（登录、注册、发布失物/招领）
- [x] 页面渲染和组件挂载
- [x] 路由跳转功能（goDetail、goNew、goHome、goBack）
- [x] 数据筛选功能（关键词搜索、分类筛选、状态筛选）
- [x] 用户登录状态判断（显示/隐藏发布按钮）
- [x] 辅助函数测试（getCategoryTagType、formatTime、getPublisherInitial等）

#### 边界/异常情况测试（约58个）
- [x] API 请求失败处理（网络错误、500错误、404错误）
- [x] 空数据状态（列表为空时显示提示）
- [x] 加载状态显示
- [x] 表单验证（用户名为空、密码为空、密码不一致）
- [x] 登录失败处理（用户名/密码错误、无token返回）
- [x] 注册失败处理（用户名已存在、网络错误）
- [x] 无权限操作（403错误）
- [x] Token过期（401错误）

#### Mock 使用
- [x] Mock Axios：模拟所有 API 请求，测试成功和失败场景
- [x] Mock localStorage：模拟 token 和用户信息存储
- [x] Mock vue-router：模拟路由跳转
- [x] Mock Element Plus 组件：模拟 ElMessage、ElButton、ElInput 等
- [x] Mock Element Plus Icons：模拟 User、Lock、Phone 等图标
- [x] Mock alert 和 console：避免测试输出干扰

### 覆盖率

测试运行结果：

| File       | % Stmts | % Branch | % Funcs | % Lines |
| :--------- | :------ | :------- | :------ | :------ |
| All files  | 82.97   | 83.67    | 86.84   | 84.44   |
| api        | 78.33   | 40       | 88.88   | 78.33   |
| components | 91.17   | 94.87    | 81.81   | 96.66   |

## 遇到的问题和解决

#### 问题1：Vitest 4 配置兼容性
- **现象**：运行测试时出现 `test.poolOptions was removed` 警告，测试超时
- **解决**：查阅 Vitest 4 迁移文档，将 `poolOptions` 改为顶层选项，用 `maxWorkers` 替代 `maxThreads/maxForks`

#### 问题2：vi.mock 提升导致变量未定义
- **现象**：在测试文件中定义 `mockAxiosPost` 后使用 `vi.mock`，报错 `Cannot access 'mockAxiosPost' before initialization`
- **解决**：将 mock 函数直接定义在 `vi.mock` 工厂函数内部，避免引用外部变量

#### 问题3：Element Plus 组件 stub 配置
- **现象**：测试时 Vue 警告 `Failed to resolve component: User`，图标组件未正确 mock
- **解决**：在 `vi.mock('@element-plus/icons-vue')` 中为所有使用的图标（User、Lock、Phone、Present、Box等）提供 mock 实现

## 心得体会

学会了如何为 Vue 3 组件设计全面的测试用例，包括渲染测试、交互测试、异步操作测试和错误处理测试。掌握了模块 Mock、API Mock、组件 Mock 的技巧，理解了 `vi.mock` 的提升机制和 `vi.hoisted` 的使用场景。深刻认识到自动化测试对保障代码质量的重要性，尤其是在团队协作中。

