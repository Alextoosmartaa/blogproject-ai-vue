//封装用户数据的持久化储存使用pinia
import {defineStore} from "pinia";
import {ref} from "vue";
import { login } from "@/api/user";
export const useUserStore=defineStore('user',()=>{
  //定义需要存的数据
  let userInfo=ref()
  let token=ref()
  //是否已经登录
  let isLoggedIn=ref(false)
  //创建对应的cation函数
  async function userLogin(loginData:{username:string,password:string}){
    try{
      //调用登录接口获取信息
      const res:any=await login(loginData)
      //解析返回的res
      if(res.code==200){
      userInfo.value=res.data
        console.log(res)
      token.value=res.data.token
        isLoggedIn.value=true
      if(userInfo.value){
        localStorage.setItem('user',JSON.stringify(userInfo.value))
      }
      if(token.value){
        localStorage.setItem('token',token.value)
      }}
      return res
    }
    catch (error) {
      console.log('用户登录失败',error)
    }
  }
  // 推出登录
  async function userLogout(){
    //清除当前登录数据
    userInfo.value=null
    token.value=null
    isLoggedIn.value=false
    //清除本地化保存
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
  //恢复用户的登录信息
  function initUserState(){
    //1.从本地储存中拿到需要的数据
    const userStored=localStorage.getItem('user')
    const tokenStored=localStorage.getItem('token')
    //2.非空校验 如果不为空 则进行引用
    if(userStored&&tokenStored){
      userInfo.value=JSON.parse(userStored)//parse 将json字符串转换成字符串
      token.value=tokenStored
      isLoggedIn.value=true
    }
  }
  return {userLogin,isLoggedIn,userInfo,token,userLogout,initUserState}
})
