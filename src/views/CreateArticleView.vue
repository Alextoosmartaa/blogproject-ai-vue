<template>
  <div class="create-article">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1 class="logo" @click="$router.push('/')">我的博客</h1>
          <div class="nav">
            <el-button
              type="primary"
              @click="saveArticle"
              :loading="saving"
            >
              发布文章
            </el-button>
            <el-button @click="$router.push('/')">取消</el-button>

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
        <el-card class="article-card">
          <el-form
            :model="articleForm"
            :rules="rules"
            ref="formRef"
          >
            <el-form-item prop="title">
              <el-input
                v-model="articleForm.title"
                placeholder="请输入文章标题"
                size="large"
              />
            </el-form-item>

            <!-- 分类下拉框 -->

            <!-- 标签下拉框 -->

            <el-form-item prop="content">
              <QuillEditor
                v-model="articleForm.content"
                :style="{ height: '500px' }"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {ElMessage, type FormInstance} from 'element-plus'
import QuillEditor from '@/components/QuillEditor.vue'
import {createArticle} from "@/api/article.ts";


const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const saving = ref(false)


const articleForm = reactive({
  title: '',
  content: '', // 初始化为空内容，将在onMounted中设置默认值
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度应在1-100个字符之间', trigger: 'blur' }
  ],
  content: [
    {
      required: true,
      message: '请输入文章内容',
      trigger: 'blur'
    },
    {
      validator: (rule: any, value: string, callback: any) => {
        // 检查内容是否为空或者仅为默认的空内容标记
        if (!value || value === '<p><br></p>') {
          callback(new Error('请输入文章内容'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}



onMounted(() => {
  // 初始化编辑器内容
  articleForm.content = '<p><br></p>'

  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})

const saveArticle = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    //编写发布文章的前端逻辑代码
if(valid){
  saving.value=true
  try{
    const res:any = await createArticle({
      title:articleForm.title,
      content:articleForm.content,
      userId:userStore.userInfo?.id
    });
    console.log(res.code)
    if(res.code==200){
      ElMessage.success('文章发布成功')
      router.push(`/article/${res.data.id}`)}
    else{
      ElMessage.error('文章发布失败')
    }
  }catch (e) {
    console.log('文章发布失败',e)
  }finally {
    saving.value=false
  }
}
  })
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
.create-article {
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

.article-card {
  border-radius: 8px;
}
</style>


