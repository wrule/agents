import axios from 'axios';

const http = axios.create({
  baseURL: 'http://10.10.30.103:8081/api',
  headers: {
    // AccessKey: "8508f519a2544277a4f17862e5950dfb",
    // AccessKeySecret: "6fe076d4dec0446784d03cd5e54a7d64",
    cookie: 'sys_env_id=822313712173449216; sys_env_code=Init; sys_token=d97ae0862d6445a18a5549db65668954',
  },
});

http.interceptors.response.use((response) => {
  const { data } = response;
  if (data.success === false) {
    throw new Error(data.message ?? '未知原因');
  }
  return response;
});

export default http;
