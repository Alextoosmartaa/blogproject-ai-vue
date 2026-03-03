import request from "@/api/request.ts";
export async function getAllArticle(){
  return request({
    url:'/api/articles/findAll',
    method:'get'
  })
}
export async function searchArticles(params:{keywords?:string}){
  return request({
    url:'/api/articles/searchArticles',
    method:'GET',
    params:params
  })
}
//发布文章api
export async function createArticle(data:{title:string,content:string,userId:number}){
  return request({
    url:'/api/articles/addArticle',
    method:'post',
    data:data
  })
}
export async function getArticleById(id:number){
  return request({
    url:`/api/articles/${id}`,
    method:'get'
  })
}
export async function updateArticle(data:{
  id:number,
  title:string,
  content:string,
  userId:number
}){
  return request({
    url:'/api/articles/updateArticle',
    method:'post',
    data:data
  })

}
export async function getArticlesByUserId(userid:number){
  return request({
    url:'/api/articles/getArticlesByUserId',
    method:'get',
    params:{
      userid:userid
    }
  })
}
export async function generateArtclie(data:{
  userId:number,
  title:string,
  prompt:string
}){
  return request({
    url:'/api/ai/autoblog',
    method:'post',
    data:data
  })
}
export async function deleteArticle(id:number) {
  return request({
    url:'/api/articles/deleteArticle',
    method:'post',
    params:{
      id:id
    }
  })
}
