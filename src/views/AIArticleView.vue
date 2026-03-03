<!-- src/views/AiArticleView.vue -->
<template>
  <div class="ai-article">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1 class="logo" @click="$router.push('/')">我的博客</h1>
          <div class="nav">
            <el-button @click="$router.push('/')" type="primary">返回首页</el-button>

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
        <el-card class="ai-card">
          <template #header>
            <h2>AI 自动生成文章</h2>
          </template>

          <div class="ai-content">
            <el-form
              :model="aiForm"
              :rules="rules"
              ref="formRef"
              label-width="100px"
            >
              <el-form-item label="文章标题" prop="title">
                <el-input v-model="aiForm.title" placeholder="请输入文章标题" />
              </el-form-item>
              <el-form-item label="文章主题" prop="prompt">
                <el-input
                  v-model="aiForm.prompt"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您想要生成文章的主题，例如：Java Spring Boot 入门教程"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="generateArticle"
                  :loading="generating"
                  size="large"
                >
                  {{ generating ? '生成中...' : '生成文章' }}
                </el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 进度条 -->
            <div v-if="generating" class="progress-container">
              <el-progress
                :percentage="progress"
                :status="progressStatus"
                :stroke-width="15"
              />
              <p class="progress-text">{{ progressText }}</p>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'
import {generateArtclie} from "@/api/article.ts";
import {ElMessage} from "element-plus";


const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const generating = ref(false)
const progress = ref(0)
const progressStatus = ref('')
const progressText = ref('准备生成...')

// AI文章表单
const aiForm = reactive({
  prompt: '',
  title: ''
})

// 表单验证规则
const rules = {
  prompt: [
    { required: true, message: '请输入文章主题', trigger: 'blur' },
    { min: 5, message: '主题描述至少5个字符', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 5, message: '标题至少5个字符', trigger: 'blur' }
  ]
}

// 生成文章
const generateArticle = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      generating.value = true
      progress.value = 0
      progressStatus.value = ''
      progressText.value = '开始生成...'
      try{
        //1.点击生成文章要显示生成进度
        startProgress()
        const res:any=await generateArtclie({userId:userStore.userInfo?.id,title:aiForm.title,prompt:aiForm.prompt})
        if(res.code==200){
          progress.value=100
          progressText.value='生成完成，正在跳转...'
          progressStatus.value='success'
          //跳转到博客文章详情页面 延时跳转
          setTimeout(()=>{
            router.push(`/article/${res.data.id}`)
          },)
        }else{
          console.log('生成失败',res.massage)
        }
      }catch (e) {
        console.log('生成文章失败',e)
        //超出超时等待时间，提示在后台生成，请间隔一段时间查看
        //伪成功的进度条提示
        progressStatus.value='success'
        progressText.value='等待时间过长，任务切换到后台完成'
        ElMessage.success('任务转到后台继续生成，请稍后刷新查看')
        setTimeout(()=>{
          router.push('/')
        },2000)
      }
    }}
  )
}

// 模拟进度条
const startProgress = () => {
  const timer = setInterval(() => {
    if (progress.value < 90) {
      // 初始阶段快速增加
      if (progress.value < 30) {
        progress.value += Math.floor(Math.random() * 5) + 1
      }
      // 中间阶段中速增加
      else if (progress.value < 70) {
        progress.value += Math.floor(Math.random() * 3) + 1
      }
      // 后期阶段慢速增加
      else {
        progress.value += Math.floor(Math.random() * 2) + 1
      }

      // 更新进度文本
      if (progress.value < 30) {
        progressText.value = '正在分析主题...'
      } else if (progress.value < 60) {
        progressText.value = '正在撰写文章内容...'
      } else if (progress.value < 90) {
        progressText.value = '正在进行最后优化...'
      }
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// 重置表单
const resetForm = () => {
  aiForm.prompt = ''
  generating.value = false
  progress.value = 0
  progressStatus.value = ''
  progressText.value = '准备生成...'
}

// 用户菜单处理
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      userStore.userLogout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.ai-article {
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

.ai-card {
  border-radius: 8px;
}

.progress-container {
  margin-top: 30px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
</style>
