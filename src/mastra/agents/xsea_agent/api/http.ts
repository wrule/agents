import axios from 'axios';

const threadMap: Record<string, string> = { };

export const ThreadMap = threadMap;

export
const thttp = (threadId?: string) => {
  let cookie = '';
  if (threadId) {
    cookie = ThreadMap[threadId] || cookie;
    if (cookie) {
      console.log(threadId, '使用Cookie', cookie);
    }
  }
  const http = axios.create({
    baseURL: 'http://10.10.30.103:8081/api',
    headers: { cookie },
  });
  http.interceptors.response.use((response) => {
    const { data } = response;
    if (data.success === false) {
      throw new Error(data.message ?? '未知原因');
    }
    return response;
  });
  return http;
};
