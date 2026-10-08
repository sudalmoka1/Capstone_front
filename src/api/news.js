import api from './index';

/**
 * 수집 및 분석 완료된 뉴스 기사 목록 조회
 * @param {Object} params - { limit, publisher, stock_code }
 */
export const getArticles = async (params = {}) => {
  return await api.get('/api/articles', { params });
};

/**
 * 수집 대상 언론사 목록과 저장된 기사 수 (필터 탭용)
 */
export const getPublishers = async () => {
  return await api.get('/api/publishers');
};

/**
 * 종목별 언급 순위 (스코어보드/그래프)
 * @param {Object} params - { days, limit }
 */
export const getStockRanking = async (params = {}) => {
  return await api.get('/api/stocks/ranking', { params });
};
