<template>
  <div class="space-y-6">
    <!-- 컨트롤 패널 -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <span class="text-xs font-bold text-slate-500">집계 기간</span>
        <div class="flex bg-slate-100 p-1 rounded-xl">
          <button
            v-for="opt in periodOptions"
            :key="opt.days"
            @click="days = opt.days"
            :class="[
              'px-4 py-2 text-xs font-bold rounded-lg transition-all',
              days === opt.days ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
        <span class="text-xs font-bold text-slate-500">표시 종목</span>
        <div class="flex bg-slate-100 p-1 rounded-xl">
          <button
            v-for="n in [10, 20]"
            :key="n"
            @click="limit = n"
            :class="[
              'px-4 py-2 text-xs font-bold rounded-lg transition-all',
              limit === n ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            상위 {{ n }}
          </button>
        </div>
        <button
          @click="fetchRanking"
          :disabled="isLoading"
          class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
        >
          🔄 새로고침
        </button>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="text-center py-20 bg-white rounded-2xl border border-slate-200">
      <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-semibold text-slate-500">종목별 언급 데이터를 집계하는 중...</p>
    </div>

    <!-- 연결 실패 -->
    <div v-else-if="errorMessage" class="text-center py-16 bg-rose-50 rounded-2xl border border-rose-200">
      <p class="text-sm font-bold text-rose-600">백엔드 연결 실패</p>
      <p class="text-xs text-rose-500 mt-1">{{ errorMessage }}</p>
      <p class="text-xs text-slate-500 mt-2">http://localhost:8000 에서 서버가 실행 중인지 확인하세요.</p>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="rows.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <p class="text-sm text-slate-500">선택한 기간에 종목이 언급된 기사가 없습니다.</p>
      <p class="text-xs text-slate-400 mt-1">스케줄러가 기사를 수집한 뒤 다시 확인하세요.</p>
    </div>

    <template v-else>
      <!-- 요약 카드 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <p class="text-xs font-semibold text-slate-500">가장 많이 언급된 종목</p>
          <p class="mt-2 text-xl font-extrabold text-slate-900">{{ rows[0].stock_name }}</p>
          <p class="text-xs text-slate-400 mt-0.5">기사 {{ rows[0].mentions }}건</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <p class="text-xs font-semibold text-slate-500">집계된 종목 수</p>
          <p class="mt-2 text-xl font-extrabold text-slate-900">{{ rows.length }}개</p>
          <p class="text-xs text-slate-400 mt-0.5">최근 {{ days }}일, 상위 {{ limit }}개 기준</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <p class="text-xs font-semibold text-slate-500">평균 신뢰도 (분석 완료분)</p>
          <p class="mt-2 text-xl font-extrabold text-slate-900">
            {{ overallScore !== null ? overallScore + '점' : '분석 전' }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">종목별 평균의 평균</p>
        </div>
      </div>

      <!-- 그래프 -->
      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 class="font-bold text-slate-900 mb-4">종목별 언급량 &amp; 신뢰도</h2>
        <StockBarChart :rows="rows" @select="(r) => $emit('select-stock', toFilter(r))" />
      </section>

      <!-- 스코어보드 -->
      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-slate-900">종목 스코어보드</h2>
          <span class="text-xs text-slate-400">행을 클릭하면 해당 종목의 기사를 볼 수 있습니다</span>
        </div>
        <StockScoreboard :rows="rows" @select="(r) => $emit('select-stock', toFilter(r))" />
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import StockBarChart from '@/components/analysis/StockBarChart.vue';
import StockScoreboard from '@/components/analysis/StockScoreboard.vue';
import { getStockRanking } from '@/api/news';

defineEmits(['select-stock']);

const periodOptions = [
  { label: '오늘', days: 1 },
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
];

const days = ref(7);
const limit = ref(10);
const rows = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

const fetchRanking = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const data = await getStockRanking({ days: days.value, limit: limit.value });
    rows.value = Array.isArray(data) ? data : [];
  } catch (err) {
    rows.value = [];
    errorMessage.value = err.message || '알 수 없는 오류';
  } finally {
    isLoading.value = false;
  }
};

// 분석 완료된 종목들의 평균 신뢰도
const overallScore = computed(() => {
  const scored = rows.value.filter((r) => r.avg_score !== null);
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, r) => acc + r.avg_score, 0);
  return Math.round(sum / scored.length);
});

const toFilter = (row) => ({ code: row.stock_code, name: row.stock_name });

watch([days, limit], fetchRanking);
onMounted(fetchRanking);
</script>
