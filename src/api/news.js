import api from './index';

/**
 * 수집 및 분석 완료된 뉴스 기사 목록 조회
 * @param {Object} params - { limit(최대 200), offset, source }
 */
export const getArticles = async (params = {}) => {
  return await api.get('/api/articles', { params });
};