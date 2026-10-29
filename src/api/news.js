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
 * 언론사별 AI 판정 집계 (평균 신뢰도 순위, 항목별 비율)
 * @param {Object} params - { days }
 */
export const getPublisherRanking = async (params = {}) => {
  return await api.get('/api/publishers/ranking', { params });
};

/**
 * 종목별 언급 순위 (스코어보드/그래프)
 * @param {Object} params - { days, limit }
 */
export const getStockRanking = async (params = {}) => {
  return await api.get('/api/stocks/ranking', { params });
};

/**
 * 종목 일봉(OHLCV) 데이터 (기사 클릭 시 주가 차트)
 * @param {string} stockCode - 종목코드 (예: 005930)
 * @param {Object} params - { period: '1mo' | '3mo' | '6mo' | '1y' }
 */
export const getStockChart = async (stockCode, params = {}) => {
  return await api.get(`/api/stocks/${stockCode}/chart`, { params });
};

/**
 * 스케줄러 가동 여부, 마지막 수집/분석 시각, 분석 대기 건수 (헤더 상태 표시)
 */
export const getSchedulerStatus = async () => {
  return await api.get('/api/status');
};

/**
 * AI 점수 구간별 / 과장 판정별 기사 발행 후 주가 반응 집계
 * @param {Object} params - { days }
 */
export const getReactionSummary = async (params = {}) => {
  return await api.get('/api/reactions/summary', { params });
};
