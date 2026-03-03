<template>
  <div class="home">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h1 class="logo" @click="$router.push('/')">我的博客</h1>
          <div class="nav">
            <el-button
              type="primary"
              v-if="userStore.isLoggedIn"
              @click="$router.push('/create-article')"
            >
              写文章
            </el-button>
            <el-button
              type="success"
              v-if="userStore.isLoggedIn"
              @click="$router.push('/ai-article')"
              size="large"
            >
              AI 自动生成文章
            </el-button>
            <el-button
              v-if="!userStore.isLoggedIn"
              @click="$router.push('/login')"
            >
              登录
            </el-button>
            <el-button
              v-if="!userStore.isLoggedIn"
              @click="$router.push('/register')"
            >
              注册
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
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <el-button link @click="$router.push('/search')">高级搜索</el-button>
        </div>
        <div class="articles">
          <el-card
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="goToArticle(article.id)"
          >
            <div class="article-content">
              <h2>{{ article.title }}</h2>
              <p class="article-excerpt" v-html="getExcerpt(article.content)"></p>
              <div class="article-meta">
                <span>作者: {{article.nickName||article.userName }}</span>
                <span v-if="article.category">分类: {{ article.category.name }}</span>
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
        </div>

        <el-empty v-if="articles.length === 0" description="暂无文章" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter} from "vue-router";
import { useUserStore} from "@/stores/user.ts";
import {getAllArticle} from "@/api/article.ts";
import {ElMessage} from "element-plus";
import {searchArticles} from "@/api/article.ts";
const userStore = useUserStore()
const router = useRouter()
const articles = ref([])
const searchKeyword = ref('')

onMounted(() => {
  loadArticles()
})

const loadArticles = async () => {
  //编写获取文章数据信息
try{
  const res:any=await  getAllArticle()
  if(res.code==200){
    articles.value=res.data

    ElMessage.success('获取成功')
  }else{
    ElMessage.error('获取失败')
  }
}
catch (error:any){
  ElMessage.error('获取文章数据失败',error)
}

}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    //校验空值为空就不检索
    loadArticles()
    return
  }
  try{
    const res:any=await searchArticles({keywords:searchKeyword.value})
    if(res.code==200){
      articles.value=res.data
      ElMessage.success('查询成功')
    }
    else{
      ElMessage.error('文章查询失败')
    }
  }
  catch (e) {
    console.log('获取文章数据失败', e)
  }

  //根据关键字进行文章的查询

}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

const handleUserCommand = (command: string) => {
  //编辑点击不同的按钮进行不同的操作
  if(command=='profile'){
    router.push('/profile')
  }if(command=='admin'){
    router.push('/admin')
}if(command=='logout'){
    //清空store数据
    userStore.userLogout()
    router.push('/login')
  }
}

const getExcerpt = (content: string) => {
  if (!content) return ''
  // 编辑文章内容进行截取显示
  // 创建一个临时的 div 元素来解析 HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content

  // 获取纯文本内容
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  // 截取前100个字符
  const excerpt = textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent

  return excerpt
}

//日期格式化工具
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style scoped>
.home {
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

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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
  gap: 20px;
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
</style>

