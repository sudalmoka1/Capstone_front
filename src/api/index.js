import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI 백엔드 주소
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 (에러 처리 공통화)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API 통신 오류:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;