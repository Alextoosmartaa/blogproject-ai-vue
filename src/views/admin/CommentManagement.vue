<!-- src/views/admin/CommentManagement.vue -->
<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论管理</span>
        </div>
      </template>

      <el-table :data="comments" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="内容">
          <template #default="{ row }">
            <div class="comment-content">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" />
        <el-table-column prop="articleId" label="文章ID" />
        <el-table-column prop="createTime" label="评论时间">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteCommentById(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAllComments,
  deleteComment
} from '@/api/comment'

const loading = ref(false)
const comments = ref<[]>([])

onMounted(() => {
  loadComments()
})

//1.查看所有评论
const loadComments = async () => {
  loading.value = true
  try {
    const res = await getAllComments()
    comments.value = res.data
  } catch (error) {
    console.log('加载评论数据失败', error)
    ElMessage.error('加载评论数据失败')
  } finally {
    loading.value = false
  }
}

//2，删除评论
const deleteCommentById = (id: number) => {

}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>


