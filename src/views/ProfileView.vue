<template>
  <div class="profile">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1 class="logo" @click="$router.push('/')">我的博客</h1>
          <div class="nav">
            <el-button @click="$router.push('/')" type="primary">返回首页</el-button>
            <el-button
              v-if="!userStore.isLoggedIn"
              @click="$router.push('/login')"
            >
              登录
            </el-button>
            <el-dropdown v-if="userStore.isLoggedIn" @command="handleUserCommand">
              <el-avatar :size="40" :src="userStore.userInfo?.avatar || ''">
                {{ userStore.userInfo?.username?.charAt(0) }}
              </el-avatar>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.userInfo?.isAdmin" command="admin">后台管理</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main class="main">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="profile-card">
              <div class="profile-header">
                <el-avatar :size="80" :src="userStore.userInfo?.avatar || ''">
                  {{ userStore.userInfo?.username?.charAt(0) }}
                </el-avatar>
                <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
                <p>{{ userStore.userInfo?.email }}</p>
                <p v-if="userStore.userInfo?.bio" class="user-bio">{{ userStore.userInfo?.bio }}</p>
              </div>
              <div class="profile-stats">
                <div class="stat-item">
                  <div class="stat-number">{{ userArticles.length }}</div>
                  <div class="stat-label">文章数</div>
                </div>
              </div>
              <div class="profile-actions">
                <el-button type="primary" @click="activeTab = 'info'" icon="Edit" block>编辑资料</el-button>
              </div>
            </el-card>
          </el-col>

          <el-col :span="18">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="我的文章" name="articles">
                <div class="articles">
                  <el-card
                    v-for="article in userArticles"
                    :key="article.id"
                    class="article-card"
                    @click="goToArticle(article.id)"
                  >
                    <div class="article-content">
                      <h2>{{ article.title }}</h2>
                      <p class="article-excerpt" v-html="getExcerpt(article.content)"></p>
                      <div class="article-meta">
                        <span>发布时间: {{ formatDate(article.createTime) }}</span>
                      </div>
                      <div class="article-tags" v-if="article.tags && article.tags.length > 0">
                        <el-tag
                          v-for="tag in article.tags"
                          :key="tag.id"
                          size="small"
                          class="tag"
                        >
                          {{ tag.name }}
                        </el-tag>
                      </div>
                    </div>
                  </el-card>

                  <el-empty v-if="userArticles.length === 0" description="暂无文章" />
                </div>
              </el-tab-pane>

              <el-tab-pane label="个人信息" name="info">
                <el-card class="info-card">
                  <el-form
                    :model="profileForm"
                    :rules="rules"
                    ref="formRef"
                    label-width="80px"
                  >
                    <!-- 在头像显示区域添加上传功能 -->
                    <el-form-item label="头像">
                      <div class="avatar-container">
                        <el-upload
                          class="avatar-uploader"
                          :show-file-list="false"
                          :http-request="toUploadAvatar"
                          :before-upload="beforeAvatarUpload"
                        >
                          <el-avatar
                            :size="80"
                            :src="profileForm.avatar ? '/src/images/' + profileForm.avatar : ''"
                            class="avatar-display"
                          >
                            {{ (profileForm.username || userStore.userInfo?.username)?.charAt(0) }}
                          </el-avatar>
                        </el-upload>
                        <el-button size="small" @click="removeAvatar" v-if="profileForm.avatar">移除头像</el-button>
                      </div>
                    </el-form-item>

                    <el-form-item label="用户名">
                      <el-input v-model="profileForm.username" disabled />
                    </el-form-item>

                    <el-form-item label="昵称" prop="nickname">
                      <el-input v-model="profileForm.nickname" />
                    </el-form-item>

                    <el-form-item label="邮箱">
                      <el-input v-model="profileForm.email"  />
                    </el-form-item>

                    <el-form-item label="个人简介">
                      <el-input
                        v-model="profileForm.bio"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入个人简介"
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
                      <el-button @click="resetForm">取消</el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {getArticlesByUserId} from "@/api/article.ts";
import {ElMessage} from "element-plus";
import {getUserInfo} from "@/api/user.ts";
import {updateUserProfile} from "@/api/user.ts";
const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('articles')
const userArticles = ref<any[]>([])
const formRef = ref()
const  saving=ref(false)
// 初始化表单数据
const profileForm = reactive({
  username: '',
  email: '',
  avatar: '',
  nickname: '',
  bio: ''
})
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' }
  ]
}
onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  // 加载用户最新数据
  loadUserData()
  loadUserArticles()
})

// 加载用户最新数据 用于回显
async function loadUserData () {
  try{
    const res: any = await getUserInfo(userStore.userInfo?.id)
    if(res.code==200){
      profileForm.username=res.data.username
      profileForm.email=res.data.email
      profileForm.nickname=res.data.nickname
      profileForm.avatar=res.data.avatar
      profileForm.bio=res.data.bio
    }else{
      ElMessage.error('加载用户信息失败')
    }
  }catch (e) {
    console.log('加载用户信息失败',e)
  }
}
async function loadUserArticles () {
  try{
    const res:any=await getArticlesByUserId(userStore.userInfo?.id)
    if(res.code==200){
      userArticles.value=res.data
    }else{
      ElMessage.error('获取用户文章数据失败')
    }
  }
  catch (e) {
    console.log('加载文章信息失败',e)
  }
}
function goToArticle (id: number) {
  router.push(`/article/${id}`)
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
const getExcerpt = (content: string) => {
  if (!content) return ''

  // 创建一个临时的 div 元素来解析 HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content

  // 获取纯文本内容
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  // 截取前100个字符
  const excerpt = textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent

  return excerpt
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 保存个人资料
const saveProfile = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    // 保存个人资料
    if(valid){
      try{
        saving.value=true
        const res:any=await updateUserProfile({
          id:userStore.userInfo.id,
          nickname:profileForm.nickname,
          email:profileForm.email,
          bio:profileForm.bio
        })
        if(res.code==200){
          userStore.userInfo.nickname=res.data.nickname
          userStore.userInfo.email=res.data.email
          userStore.userInfo.bio=res.data.bio
          ElMessage.success('修改个人信息成功')
          localStorage.setItem('user',JSON.stringify(userStore.userInfo))//stringify把string转换成json
        }else{
          ElMessage.error('修改个人信息失败')
        }
      }
      catch (e) {
        console.log('修改个人信息失败',e)
      }finally {
        saving.value=false
      }
    }
  })
}

// 取消编辑，重置表单
const resetForm = () => {
  loadUserData()
  activeTab.value = 'articles'
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.logo {
  margin: 0;
  color: #409eff;
  cursor: pointer;
  font-size: 24px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.profile-card {
  text-align: center;
  border-radius: 8px;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-header h3 {
  margin: 10px 0 5px 0;
}

.user-bio {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
}

.profile-stats {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 0 15px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.profile-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.articles {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
  border-radius: 8px;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-content h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.article-excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.article-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  margin: 0;
}

.info-card {
  border-radius: 8px;
}

/* 添加头像上传相关样式 */
.avatar-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-uploader {
  cursor: pointer;
}

.avatar-display {
  border: 2px solid #409eff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.avatar-uploader:hover .avatar-display {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: scale(1.05);
}
</style>

