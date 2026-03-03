<!-- src/views/admin/ArticleManagement.vue -->
<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <el-button type="primary" @click="showCreateArticleDialog">添加文章</el-button>
        </div>
      </template>

      <el-table :data="articles" style="width: 100%" v-loading="loading">
        <!-- ID列 -->
        <el-table-column prop="id" label="ID" width="80" />
        <!-- 文章标题列 -->
        <el-table-column prop="title" label="文章标题" />
        <!-- 作者列 -->
        <el-table-column prop="userName" label="作者" />
        <!-- 发布时间列 -->
        <el-table-column prop="createTime" label="发布时间">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>saw
        <!-- 操作列（仅保留删除） -->
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteArticleById(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 文章添加对话框（无编辑功能） -->
    <el-dialog v-model="articleDialogVisible" title="添加文章">
      <el-form :model="articleForm" :rules="articleRules" ref="articleFormRef">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="articleForm.author" placeholder="请输入作者名称" />
        </el-form-item>
        <!-- 可选：发布时间可由后端自动生成，也可前端选择 -->
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="articleForm.publishTime"
            type="datetime"
            placeholder="选择发布时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArticle">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
// 导入文章相关API（需根据实际后端接口调整路径和方法名）
import {createArticle, deleteArticle, getAllArticle} from "@/api/article.ts";


// 加载状态
const loading = ref(false)
// 文章列表数据
const articles = ref<any[]>([])
// 文章对话框显隐
const articleDialogVisible = ref(false)
// 表单Ref
const articleFormRef = ref<FormInstance>()

// 文章表单数据
const articleForm = reactive({
  title: '',
  author: '',
  publishTime: '' // 若后端自动生成，可移除该字段
})

// 表单校验规则
const articleRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者名称', trigger: 'blur' }
  ]
}

// 页面挂载时加载文章列表
onMounted(() => {
  loadArticles()
})

// 加载文章列表数据
const loadArticles = async () => {
  loading.value = true
  try {
    const res: any = await getAllArticle()
    if (res.code == 200) {
      articles.value = res.data
      console.log(articles.value)
    } else {
      ElMessage.error('获取文章列表失败')
      console.log(res)
    }
  } catch (e) {
    console.error('加载文章列表失败：', e)
    ElMessage.error('获取文章列表异常')
  } finally {
    loading.value = false
  }
}

// 显示添加文章对话框
const showCreateArticleDialog = () => {
  // 重置表单
  Object.assign(articleForm, { title: '', author: '', publishTime: '' })
  articleDialogVisible.value = true
}

// 保存文章（仅新增，无编辑）
const saveArticle = async () => {
  if (!articleFormRef.value) return

  // 表单校验
  await articleFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res: any = await createArticle({
          title: articleForm.title,
          author: articleForm.author,
          // 若后端自动生成，可移除该参数
        })
        if (res.code == 200) {
          ElMessage.success('添加文章成功')
          articleDialogVisible.value = false
          loadArticles() // 重新加载列表
        } else {
          ElMessage.error('添加文章失败：' + (res.msg || '未知错误'))
        }
      } catch (e) {
        console.error('添加文章失败：', e)
        ElMessage.error('添加文章异常')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除文章
const deleteArticleById = (id: number) => {
  ElMessageBox.confirm(
    '确定要删除该文章吗？删除后不可恢复！',
    '删除确认',
    {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    }
  ).then(async () => {
    loading.value = true
    try {
      const res: any = await deleteArticle(id)
      if (res.code == 200) {
        ElMessage.success('删除文章成功')
        loadArticles() // 重新加载列表
      } else {
        ElMessage.error('删除文章失败：' + (res.msg || '未知错误'))
      }
    } catch (e) {
      console.error('删除文章失败：', e)
      ElMessage.error('删除文章异常')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 日期格式化
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch (e) {
    return dateString
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
