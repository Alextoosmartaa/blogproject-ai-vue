<template>
  <div class="article">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1 class="logo" @click="$router.push('/')">我的博客</h1>
          <div class="nav">
            <el-button
              v-if="isAuthor && !isEditing"
              @click="editArticle"
            >
              编辑文章
            </el-button>
            <el-button
              v-if="isAuthor && isEditing"
              type="primary"
              @click="saveArticle"
              :loading="saving"
            >
              保存
            </el-button>
            <el-button
              v-if="isAuthor && isEditing"
              @click="cancelEdit"
            >
              取消
            </el-button>
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
        <el-card v-if="!isEditing" class="article-card">
          <template #header>
            <h1>{{ article.title }}</h1>
            <div class="article-meta">
              <span>作者: {{ article.nickName||article.userName }}</span>
              <span v-if="article.category">分类: {{ article.category.name }}</span>
              <span>发布时间: {{ formatDate(article.createTime) }}</span>
              <span v-if="article.updateTime && article.updateTime !== article.createTime">
                更新时间: {{ formatDate(article.updateTime) }}
              </span>
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
          </template>
          <div class="article-content" v-html="article.content" ref="articleContent"></div>
        </el-card>

        <el-card v-else class="article-card">
          <el-form :model="editForm" :rules="rules" ref="formRef">
            <el-form-item>
              <el-input
                v-model="editForm.title"
                placeholder="请输入文章标题"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="content">
              <QuillEditor
                v-model="editForm.content"
                :style="{ height: '500px' }"
                :key="editorKey"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 评论区域 -->
        <el-card class="comments-card">
          <template #header>
            <h3>评论 ({{ comments.length }})</h3>
          </template>

          <!-- 发表评论 -->
          <div class="comment-form" v-if="userStore.isLoggedIn">
            <el-input
              v-model="commentContent"
              type="textarea"
              placeholder="请输入您的评论"
              :rows="3"
            />
            <div class="comment-actions">
              <el-button
                type="primary"
                @click="submitComment"
                :loading="commentLoading"
              >
                发表评论
              </el-button>
            </div>
          </div>
          <div class="comment-login-tip" v-else>
            <p>请 <el-button type="primary" link @click="$router.push('/login')">登录</el-button> 后发表评论</p>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <span class="comment-author">{{ comment.nickName|| comment.userName}}</span>
                <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>

            <el-empty v-if="comments.length === 0" description="暂无评论" />
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import QuillEditor from '@/components/QuillEditor.vue'
import 'highlight.js/styles/github.css'
import type { FormInstance } from 'element-plus'
import {getArticleById,updateArticle} from "@/api/article.ts";
import {ElMessage} from "element-plus";
import {getCommentsById} from "@/api/comment.ts";
import {addComment} from "@/api/comment.ts";
import {computed} from "vue";

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()

const article = ref<any>({})
const comments = ref<any[]>([])
const commentContent = ref('')
const commentLoading = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const articleContent = ref<HTMLElement | null>(null)
const editorKey = ref(0) // 用于强制重新渲染编辑器

const editForm = reactive({
  title: '',
  content: ''
})

// 编写是否为文章作者的计算逻辑
const isAuthor = computed(()=>{
  return userStore.isLoggedIn&&article.value.userId === userStore.userInfo?.id
})

// 检查内容是否为空
const isContentEmpty = (content: string) => {
  if (!content || content === '<p><br></p>') return true
  // 移除HTML标签和空白字符后检查是否为空
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '')
  return cleanContent === '' || cleanContent === '<br>' || cleanContent === 'br'
}

const validateContent = (rule: any, value: string, callback: any) => {
  if (isContentEmpty(value)) {
    callback(new Error('请输入文章内容'))
  } else {
    callback()
  }
}

const rules = {
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { validator: validateContent, trigger: 'blur' }
  ]
}

onMounted(() => {
  // 初始化编辑表单内容
  editForm.content = '<p><br></p>'

  const articleId = route.params.id as string
  if (articleId) {
    loadArticle(parseInt(articleId))
    loadComments(parseInt(articleId))
  } else {
    // 初始化编辑表单数据，即使在查看模式下也准备好数据
    editForm.title = ''
    editForm.content = '<p><br></p>'
    // 强制重新渲染编辑器以确保初始状态正确
    editorKey.value++
  }
})

//编写加载文章信息的逻辑代码
const loadArticle = async (id: number) => {
try {
  const res:any=await getArticleById(id)
  if(res.code==200){
    article.value=res.data
    //提前赋值给编辑文章的表单，用于后续修改文章的数据回显
    editForm.title=article.value.title
    editForm.content=article.value.content
  }else{
    ElMessage.error('查询文章信息失败')
  }
}catch (e) {
  console.log('查询文章信息失败',e)
}

}

//编写加载当前文章评论的逻辑代码
const loadComments = async (articleId: number) => {
try{
  const res:any=await getCommentsById(articleId)
  if(res.code==200){
    //ElMessage.success('评论获取成功')
    comments.value=res.data
  }else{
    ElMessage.error('评论获取失败')
  }
}catch (e) {
  console.log('评论获取失败',e)
}
}

// 高亮文章中的代码块


// 提前准备编辑数据


const editArticle = () => {
  isEditing.value = true
  // 数据已经提前准备好，直接切换到编辑模式即可
  nextTick(() => {
    // 确保编辑器已正确渲染内容
  })
}


const saveArticle = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    //编写保存文章的逻辑代码
    if(valid){
      try{
        saving.value=true
        const res:any =await updateArticle({
          id:article.value.id,
          title:editForm.title,
          content:editForm.content,
          userId:userStore.userInfo.id
        })
        console.log(res)
        if(res.code==200){
          ElMessage.success('修改文章成功')
          article.value=res.data
          isEditing.value=false

      }
      }
      catch (e) {
        console.log('修改文章失败',e)
      }finally {
        saving.value=false
      }
    }
  })
}

const cancelEdit = () => {
  isEditing.value = false
  editorKey.value++ // 取消编辑时也重新渲染编辑器
}

//编写发表评论的逻辑代码
async function submitComment () {
  //1.非空数据校验
  if(!commentContent.value.trim()){
    ElMessage.error('评论内容不允许为空')
    return
  }
  try{
    //2.避免重复提交评论
    commentLoading.value=true
    //3.提交评论
    const res:any=await addComment({
      articleId:article.value.id,
      content:commentContent.value,
      userId:userStore.userInfo.id
    })
    console.log(res
    )
    if(res.code==200){
      ElMessage.success('评论发布成功')
      //刷新评论表
      loadComments(article.value.id)
      //清空评论输入框区域
      commentContent.value=''
    }
    else{
      ElMessage.error('评论发布失败')
    }
  }
  catch (e) {
    console.log('评论失败',e)
  }finally {
    commentLoading.value=false
  }



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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>

<style scoped>
.article {
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
  margin-bottom: 20px;
  border-radius: 8px;
}

.article-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

.article-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.tag {
  margin: 0;
}

.article-content {
  line-height: 1.8;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.article-content :deep(p) {
  margin: 10px 0;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin: 16px 0 10px 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 20px;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin: 10px 0;
  color: #666;
}

.article-content :deep(pre) {
  background-color: #f8f8f8;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.45;
  overflow: auto;
  color: #24292e;
}

.comments-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-actions {
  margin-top: 10px;
  text-align: right;
}

.comment-login-tip {
  text-align: center;
  margin-bottom: 20px;
  color: #999;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: bold;
  color: #409eff;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-content {
  line-height: 1.6;
}
</style>

