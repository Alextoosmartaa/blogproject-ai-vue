<!-- src/views/admin/UserManagement.vue -->
<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showCreateUserDialog">添加用户</el-button>
        </div>
      </template>

      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column label="管理员">
          <template #default="{ row }">
            <el-tag :type="row.isAdmin ? 'success' : 'info'">
              {{ row.isAdmin ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteUserById(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="userDialogVisible" :title="userDialogTitle">
      <el-form :model="userForm" :rules="userRules" ref="userFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="管理员">
          <el-switch v-model="userForm.isAdmin" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {register} from "@/api/user.ts";
import {getUserList,createUser,updateUser,deleteUser} from '@/api/user.ts'

const loading = ref(false)
const users = ref<any[]>([])
const userDialogVisible = ref(false)
const userDialogTitle = ref('')
const isEditUser = ref(false)
const editUserId = ref<number | null>(null)
const userFormRef = ref<FormInstance>()

const userForm = reactive({
  username: '',
  email: '',
  nickname: '',
  isAdmin: false
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' }
  ]
}

onMounted(() => {
  loadUsers()
})

//1.加载用户列表数据
const loadUsers = async () => {
try{
const res:any= await getUserList()
  if(res.code==200){
  users.value=res.data
  }else{
  ElMessage.error('获取失败')}
}
catch (e) {
  console.log('加载用户列表失败',e)
}
}

const showCreateUserDialog = () => {
  userDialogTitle.value = '添加用户'
  isEditUser.value = false
  Object.assign(userForm, { username: '', email: '', nickname: '', isAdmin: false })
  userDialogVisible.value = true
}

const editUser = (user: any) => {
  userDialogTitle.value = '编辑用户'
  isEditUser.value = true
  editUserId.value = user.id
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    isAdmin: user.isAdmin
  })
  userDialogVisible.value = true
}

//2.新增与修改用户
const saveUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
  if(valid){
    try{
      if(isEditUser.value&&editUserId.value){
        const res:any=await updateUser({id: editUserId.value,
          username: userForm.username,
          email: userForm.email,
          nickname: userForm.nickname,
          isAdmin: userForm.isAdmin})
          if(res.code==200){
            ElMessage.success('修改成功')
            loadUsers()
            userDialogVisible.value = false
          }else{
            ElMessage.error('修改失败')
          }
        }
      else{
        const res:any=await createUser({
          username: userForm.username,
          email: userForm.email,
          nickname: userForm.nickname,
          isAdmin: userForm.isAdmin
        })
        if(res.code==200){
          ElMessage.success('添加成功')
          loadUsers()
          userDialogVisible.value = false
        }
        else{
          ElMessage.error('添加失败')
        }

      }
      }

    catch(e){
      console.log(e)
    }
  }
  })
}

//3.删除用户
const deleteUserById = (id: number) => {
ElMessageBox.confirm('确定要删除吗？', '提示', {type:'warning'}).then(async () => {
  try {
    const res:any=await deleteUser(id)
    if (res.code==200){
      ElMessage.success('删除成功')
      loadUsers()
    }else{
      ElMessage.error('删除失败')
    }
  }catch(e){
    console.log('删除失败',e)
  }
}).catch(async ()=>{
  ElMessage.info('取消删除')
})
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
</style>

