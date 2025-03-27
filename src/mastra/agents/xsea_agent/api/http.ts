import axios from 'axios';

export
const thttp = (cookie?: string) => {
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
