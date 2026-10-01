<template>
  <div class="space-y-6">
    <!-- 컨트롤 패널 (출처 필터 & 검색/옵션) -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <!-- 출처 필터 탭 -->
      <div class="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
        <button
          v-for="tab in ['전체', '네이버금융', '한국경제']"
          :key="tab"
          @click="selectedSource = tab"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-all w-full sm:w-auto',
            selectedSource === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- 과장 의심 기사 필터 & 새로고침 -->
      <div class="flex items-center space-x-4 w-full sm:w-auto justify-end">
        <label class="flex items-center cursor-pointer text-xs font-medium text-slate-600">
          <input type="checkbox" v-model="onlyLowScore" class="sr-only peer" />
          <div class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500 relative"></div>
          <span class="ml-2">과장 의심 기사만 보기</span>
        </label>

        <button
          @click="fetchNewsArticles"
          :disabled="isLoading"
          class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1"
        >
          <span>🔄 새로고침</span>
        </button>
      </div>
    </div>

    <!-- 로딩 스피너 -->
    <div v-if="isLoading" class="text-center py-20 bg-white rounded-2xl border border-slate-200">
      <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-semibold text-slate-500">FastAPI 서버에서 뉴스와 AI 분석 데이터를 불러오는 중...</p>
    </div>

    <!-- 뉴스 기사 카드 그리드 -->
    <div v-else-if="filteredArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <NewsCard
        v-for="article in filteredArticles"
        :key="article.id"
        :article="article"
        @select="openReportModal"
      />
    </div>

    <!-- 연결 실패 -->
    <div v-else-if="errorMessage" class="text-center py-16 bg-rose-50 rounded-2xl border border-rose-200">
      <p class="text-sm font-bold text-rose-600">백엔드 연결 실패</p>
      <p class="text-xs text-rose-500 mt-1">{{ errorMessage }}</p>
      <p class="text-xs text-slate-500 mt-2">http://localhost:8000 에서 uvicorn 서버가 실행 중인지 확인하세요.</p>
    </div>

    <!-- 데이터 없음 -->
    <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <p class="text-sm text-slate-500">조건에 부합하는 분석 완료 기사 데이터가 없습니다.</p>
    </div>

    <!-- AI 리포트 모달 -->
    <ReportModal
      :article="selectedArticle"
      @close="selectedArticle = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NewsCard from '@/components/news/NewsCard.vue';
import ReportModal from '@/components/report/ReportModal.vue';
import { getArticles } from '@/api/news';

// 상태 관리
const articles = ref([]);
const isLoading = ref(false);
const selectedSource = ref('전체');
const onlyLowScore = ref(false);
const selectedArticle = ref(null);
const errorMessage = ref('');

// 백엔드 데이터 수집 함수
const fetchNewsArticles = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const data = await getArticles({ limit: 100 });
    
    if (!Array.isArray(data)) {
      console.warn("응답 데이터가 배열 형식이 아닙니다:", data);
      articles.value = [];
      return;
    }

    console.log("백엔드 수신 데이터 100건:", data);

    articles.value = data.map(item => {
      let reportData = {};
      if (item.evaluation && item.evaluation.report) {
        try {
          reportData = typeof item.evaluation.report === 'string'
            ? JSON.parse(item.evaluation.report)
            : item.evaluation.report;
        } catch (e) {
          reportData = { summary: String(item.evaluation.report) };
        }
      }

      // 소문자 변환 후 공백 제거
      const rawSrc = item.source ? String(item.source).trim().toLowerCase() : '';
      const rawPub = item.publisher ? String(item.publisher).trim().toLowerCase() : '';

      let displaySource = '네이버금융';

      // 💡 [핵심 수정] 1순위: rawSrc가 'hankyung', '한국경제', 또는 코드 '015'인 경우
      // (crawlers/hankyung_crawler.py에서 명시한 source="한국경제" 기준)
      if (rawSrc === '한국경제' || rawSrc.includes('hankyung') || rawSrc === '015') {
        displaySource = '한국경제';
      } 
      // 💡 2순위: rawSrc가 'naver', '네이버금융' 등 네이버 관련 출처인 경우
      else if (rawSrc.includes('naver') || rawSrc.includes('네이버')) {
        displaySource = '네이버금융';
      }
      // 💡 3순위: rawSrc 판별이 불명확할 때 publisher 체크
      else if (rawPub.includes('한국경제')) {
        displaySource = '한국경제';
      } else {
        displaySource = '네이버금융';
      }

      return {
        id: item.id,
        title: item.title || '제목 없음',
        content: item.content || '본문 내용이 없습니다.',
        source: displaySource,
        publisher: item.publisher || '언론사 미지정',
        published_at: formatDate(item.published_at),
        score: item.evaluation?.score ?? 0,
        summary: reportData.summary || '상세 요약 정보가 없습니다.',
        report_data: reportData
      };
    });
  } catch (err) {
    console.error('뉴스 데이터 로딩 실패:', err);
    articles.value = [];
    errorMessage.value = err.message || '알 수 없는 오류';
  } finally {
    isLoading.value = false;
  }
};

// 날짜 포맷팅 헬퍼
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}.${day} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
};

// 필터링 계산 속성 보완
const filteredArticles = computed(() => {
  return articles.value.filter(article => {
    // 탭 이름('전체', '네이버금융', '한국경제')과 정확히 match
    const matchSource = selectedSource.value === '전체' || article.source === selectedSource.value;
    const matchScore = !onlyLowScore.value || article.score < 50;
    return matchSource && matchScore;
  });
});

const openReportModal = (article) => {
  selectedArticle.value = article;
};

onMounted(() => {
  fetchNewsArticles();
});
</script>