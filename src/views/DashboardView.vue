<template>
  <div class="space-y-6">
    <!-- 종목 필터 표시 (분석 탭에서 종목을 선택해서 넘어온 경우) -->
    <div
      v-if="stockFilter"
      class="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3"
    >
      <p class="text-sm text-indigo-800">
        <span class="font-bold">{{ stockFilter.name }}</span> 종목이 언급된 기사만 보는 중
      </p>
      <button
        @click="$emit('clear-stock')"
        class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
      >
        필터 해제 ✕
      </button>
    </div>

    <!-- 언론사 필터 탭 (전체 + 언론사별) -->
    <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <div class="flex gap-1 min-w-max">
        <button
          v-for="tab in publisherTabs"
          :key="tab.name"
          @click="selectedPublisher = tab.name"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap',
            selectedPublisher === tab.name
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          ]"
        >
          {{ tab.name }}
          <span
            v-if="tab.count !== null"
            :class="['ml-1 font-semibold', selectedPublisher === tab.name ? 'text-indigo-200' : 'text-slate-400']"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- 컨트롤 패널 (과장 의심 필터 & 새로고침) -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-end items-center gap-4">
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
import { ref, computed, watch, onMounted } from 'vue';
import NewsCard from '@/components/news/NewsCard.vue';
import ReportModal from '@/components/report/ReportModal.vue';
import { getArticles, getPublishers } from '@/api/news';

const props = defineProps({
  // { code, name } — 지정되면 해당 종목이 언급된 기사만 조회
  stockFilter: { type: Object, default: null },
});
defineEmits(['clear-stock']);

// 상태 관리
const articles = ref([]);
const isLoading = ref(false);
const selectedPublisher = ref('전체');
const publishers = ref([]); // [{ name, count }]
const onlyLowScore = ref(false);
const selectedArticle = ref(null);
const errorMessage = ref('');

// 탭 목록: 전체 + 수집 대상 언론사
const publisherTabs = computed(() => [
  { name: '전체', count: null },
  ...publishers.value,
]);

const fetchPublishers = async () => {
  try {
    const data = await getPublishers();
    publishers.value = Array.isArray(data) ? data : [];
  } catch (err) {
    // 언론사 목록을 못 받아도 '전체' 탭으로 계속 사용 가능
    publishers.value = [];
  }
};

// 백엔드 데이터 수집 함수
const fetchNewsArticles = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const params = { limit: 100 };
    if (props.stockFilter) params.stock_code = props.stockFilter.code;
    if (selectedPublisher.value !== '전체') params.publisher = selectedPublisher.value;
    const data = await getArticles(params);
    
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

      return {
        id: item.id,
        title: item.title || '제목 없음',
        url: item.url,
        analyzed: item.evaluation?.status === 'COMPLETED',
        publisher: item.publisher || '언론사 미지정',
        published_at: formatDate(item.published_at),
        stocks: item.stocks || [],
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

// 언론사 필터는 서버에서 처리하므로 여기서는 점수 필터만 적용
const filteredArticles = computed(() => {
  return articles.value.filter(article => !onlyLowScore.value || article.score < 50);
});

const openReportModal = (article) => {
  selectedArticle.value = article;
};

// 종목/언론사 필터가 바뀌면 서버에서 다시 조회
watch([() => props.stockFilter?.code, selectedPublisher], fetchNewsArticles);

onMounted(() => {
  fetchPublishers();
  fetchNewsArticles();
});
</script>