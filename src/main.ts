import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//导入userstore
import {useUserStore} from "@/stores/user.ts";
import App from './App.vue'
import router from './router'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
//在挂载之前,pinia之后 进行用户数据的恢复
const userStore=useUserStore()
userStore.initUserState()
app.mount('#app')
