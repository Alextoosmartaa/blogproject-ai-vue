<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {register} from "@/api/user.ts";

const router=useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)


const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    //编写注册的核心逻辑
    if( valid){
      loading.value=true
      //2.注册操作
      try{
        const res :any= await register({
          username:registerForm.username,
          password:registerForm.password,
          email:registerForm.email

        });

        if(res.code==200){
          ElMessage.success('注册成功')
        router.push('/login')
        }else{
          ElMessage.error('注册失败，用户名重复')
        }

      }catch (e){
        console.log("注册失败",e)
      }finally {
        loading.value=false
      }
    }
  })
}
</script>

<template>
  <div class="register">
    <div class="register-form">
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <h2>用户注册</h2>
          </div>
        </template>
        <el-form
          :model="registerForm"
          :rules="rules"
          ref="formRef"
          label-width="80px"
          class="form-content"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              type="email"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              :loading="loading"
              class="submit-button"
            >
              注册
            </el-button>
          </el-form-item>

          <el-form-item>
            <el-button
              @click="$router.push('/login')"
              class="submit-button"
            >
              已有账号？去登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-form {
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
