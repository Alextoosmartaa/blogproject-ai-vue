import axios from "axios";
//创建请求的实例化对象，用于发送请求给后端进行数据传输
const  request =axios.create({
  baseURL:'http://localhost:8080',
  timeout:60000,
  headers:{
    'Content-Type': 'application/json;charset=utf-8'
  }
})
//请求拦截器
request.interceptors.request.use(
  config=>{
    //在发送请求前做些什么校验也在这
    return config
  },
  error=>{
    return Promise.reject(error)
  }
)
//响应拦截器
request.interceptors.response.use(
  response=>{
    return response.data
  },
  error=>{
    return Promise.reject(error)
  }
)
export default request
