import request from "@/api/request.ts";
//根据文章的id 获取所有评论信息
 export async function getCommentsById(articleId:number){
   return request({
     url:`/api/comments/article/${articleId}`,
     method:'get'
   })
 }
 export async function addComment(data:{articleId:number,content:string,userId:number}){
   return request({
     url:'/api/comments/addComment',
     method:'post',
     data:data
   })
 }
 export async function getAllComments(){
   return request({
     url:'/api/comments/getAllComments',
     method:'get'
   })
 }
 export async function deleteComment(id:number){
   return request({
     url:'/api/comments/deleteComment',
     method:'post',
     params:{
       id:id
     }
   })
 }
