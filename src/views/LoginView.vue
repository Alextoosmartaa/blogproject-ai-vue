<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import {useUserStore} from "@/stores/user.ts";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
const userStore = useUserStore()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

async function handleLogin () {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    //编写登录的前端逻辑代码
  if(valid){
    loading.value=true
    try{
      const res:any = await userStore.userLogin({
        username:loginForm.username,
        password:loginForm.password
      });
      if(res.code==200){
      ElMessage.success('登录成功')
      router.push('/')}
      else{

        ElMessage.error('登录失败')

      }
    }catch (e) {
      console.log('登录失败')

    }finally {
      loading.value=false
    }
  }

  })
}
</script>

<template>
  <div class="login">
    <div class="login-form">
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <h2>用户登录</h2>
          </div>
        </template>
        <el-form
          :model="loginForm"
          :rules="rules"
          ref="formRef"
          label-width="80px"
          class="form-content"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              class="submit-button"
            >
              登录
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button
              @click="$router.push('/register')"
              class="submit-button"
            >
              还没有账号？去注册
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.form-card {
  border-radius: 8px;
}

.card-header {
  text-align: center;
}

.form-content {
  padding: 20px;
}

.submit-button {
  width: 100%;
}
</style>
