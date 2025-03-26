import axios from "axios";

const http = axios.create({
  baseURL: "http://10.10.30.103:8081/api",
  headers: {
    cookie: "sys_token=f58dca2b8efa4c83b807ccb14fa0de9d",
  },
});

export default http;
