import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import CreateArticleView from "@/views/CreateArticleView.vue";
import ArticleView from "@/views/ArticleView.vue";
import ProfileView from "@/views/ProfileView.vue";
import AIArticleView from "@/views/AIArticleView.vue";
import AdminLayout from "@/views/admin/AdminLayout.vue";
import UserManagement from "@/views/admin/UserManagement.vue";
import ArticleManagement from "@/views/admin/ArticleManagement.vue";
import CommentManagement from "@/views/admin/CommentManagement.vue";
import {useUserStore} from "@/stores/user.ts";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'home',
      component:HomeView
    },
    {
      path:'/login',
      name:'login',
      component:LoginView
    },
    {
      path:'/register',
      name:'register',
      component:RegisterView
    },{
    path:'/create-article',
      name:'/create-article',
      component:CreateArticleView,
      meta:{
      requiresAuth:true
      }
    },
    {
      path:'/article/:id',
      name:'article',
      component:ArticleView,
      meta:{
        requiresAuth:true
      }
    },{
      path:'/profile',
      name:'/profile',
      component:ProfileView,
      meta:{
        requiresAuth:true
      }
    },{
      path:'/ai-article',
      name:'ai-article',
      component:AIArticleView,
      meta:{
        requiresAuth:true
      }
    },{
      path:'/admin',
      name:'admin',
      component:AdminLayout,
      meta:{
        requiresAuth:true
      },
      children:[
        {
          path:'users',
          name:'admin-users',
          component:UserManagement
        }
        ,
        {
          path:'articles',
          name:'admin-article',
          component:ArticleManagement
        },
        {
          path:'Comments',
          name:'admin-comments',
          component:CommentManagement
        }
      ]
    }
  ],
})
router.beforeEach((to, from, next)=>{
  //从持久化的本地储存中恢复数据
  const userStore = useUserStore();
  userStore.initUserState();

  //检查当前路由是否需要认证
  if (to.meta.requiresAuth){
    //检查认证状态
    if(userStore.isLoggedIn && userStore.token){
      next();
    }else {
      next('/login');
    }
  }else {
    //不需要进行登录认证的状态
    next();
  }

})
export default router
