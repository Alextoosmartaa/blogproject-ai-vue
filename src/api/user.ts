//用来封装用户相关的api
import request from "@/api/request.ts";
//获取信息
 export async function getUserList(){
  return request({
    url:'/api/users/findAll',
    method:'get'
  })
}
//用户登录的api接口
 export function login(data:{username:string,password:string}){
   return request({
     url:'/api/users/login',
     method:'post',
     data:data

   })
}

export function register(data:{
  username:string,
  password:string,
  email:string
}){
  return request({
    url:'/api/users/register',
    method:'post',
    data:data
})}
export function getUserInfo(id:number){
   return request({
     url:`/api/users/${id}`,
     method:'get',
   })
}
export function updateUserProfile(data:{
  id:number,
  nickname:string,
  email:string,
  bio:string
}){
   return request({
     url:'/api/users/updateUserProfile',
     method:'put',
     data:data
   })
}
 export  function createUser(data:{
   username:string,
   nickname: string,
   email:string,
   isAdmin:boolean

 }){return request({
   url:'/api/users/createUser',
   method:'post',
   data:data
 })
}
export function updateUser(data:{
  id: number,
  username: string,
  nickname: string,
  email: string,
  isAdmin: boolean}){
   return request({
     url: '/api/users/updateUser',
    method: 'PUT',
    data: data})
}
export function deleteUser(id:number){
   return request({
     url:`/api/users/deleteUser/${id}`,
     method:'delete'
   })
}
