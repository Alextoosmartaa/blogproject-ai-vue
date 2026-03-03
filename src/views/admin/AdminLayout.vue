<!-- src/views/admin/AdminLayout.vue -->
<template>
  <div class="admin">
    <el-container class="admin-container">
      <el-aside width="200px" class="admin-aside">
        <div class="admin-logo">
          <h2>博客管理系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="articles">
            <el-icon><Document /></el-icon>
            <span>文章管理</span>
          </el-menu-item>
          <el-menu-item index="comments">
            <el-icon><ChatLineSquare /></el-icon>
            <span>评论管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="admin-header">
          <div class="admin-header-content">
            <el-button @click="goToHome">返回首页</el-button>
            <el-dropdown @command="handleUserCommand">
              <div class="admin-user">
                <el-avatar :size="30" :src="userStore.userInfo?.avatar || ''">
                  {{ userStore.userInfo?.username?.charAt(0) }}
                </el-avatar>
                <span class="admin-user-name">{{ userStore.userInfo?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.userInfo?.isAdmin" command="admin">后台管理</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  User,
  Document,
  ChatLineSquare
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const activeMenu = ref('users')

// 检查是否为管理员
if (!userStore.userInfo?.isAdmin) {
  ElMessage.error('您没有权限访问此页面')
  router.push('/')
}

onMounted(() => {
  // 默认加载第一个菜单项
  handleMenuSelect('users')
})

const handleMenuSelect = (menu: string) => {
  activeMenu.value = menu
  router.push(`/admin/${menu}`)
}

const goToHome = () => {
  router.push('/')
}

const handleUserCommand = (command: string) => {
  //编辑点击不同的按钮进行不同的操作
  if (command === 'profile') {
    //进入个人页面
    router.push('/profile')
  } else if (command === 'admin') {
    //进入管理员后台
    router.push('/admin')
  } else if (command === 'logout') {
    //进行退出登录
    userStore.userLogout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin {
  height: 100vh;
}

.admin-container {
  height: 100%;
}

.admin-aside {
  background-color: #304156;
  color: #fff;
}

.admin-logo {
  text-align: center;
  padding: 20px 0;
  background-color: #253748;
}

.admin-logo h2 {
  color: #fff;
  margin: 0;
}

.admin-menu {
  border-right: none;
  background-color: #304156;
}

.admin-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.admin-menu :deep(.el-menu-item:hover) {
  background-color: #253748;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background-color: #253748;
  color: #409eff;
}

.admin-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.admin-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.admin-user-name {
  font-size: 14px;
}

.admin-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

