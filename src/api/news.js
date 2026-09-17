import api from './index';

/**
 * 수집 및 분석 완료된 뉴스 기사 목록 조회
 * @param {Object} params - { limit, offset, source }
 */
export const getArticles = async (params = {}) => {
  return await api.get('/api/articles', { params });
};

/**
 * 특정 기사의 AI 상세 평가 리포트 조회
 * @param {number|string} articleId 
 */
export const getArticleEvaluation = async (articleId) => {
  return await api.get(`/api/articles/${articleId}/evaluation`);
};