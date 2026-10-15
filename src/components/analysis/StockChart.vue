<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <!-- 종목 선택 (기사에 여러 종목이 연결된 경우) -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in stocks"
          :key="s.code"
          @click="selectedCode = s.code"
          :class="[
            'text-[11px] font-semibold px-2 py-0.5 rounded-md border transition',
            selectedCode === s.code
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300'
          ]"
        >
          {{ s.name }}
        </button>
      </div>

      <!-- 기간 선택 -->
      <div class="flex gap-1">
        <button
          v-for="p in periods"
          :key="p.value"
          @click="period = p.value"
          :class="[
            'text-[11px] font-bold px-2 py-0.5 rounded-md transition',
            period === p.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
          ]"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- 현재가 요약 -->
    <div v-if="summary" class="flex items-baseline gap-2">
      <span class="text-lg font-extrabold text-slate-900">{{ summary.close.toLocaleString() }}원</span>
      <span :class="['text-xs font-bold', summary.diff >= 0 ? 'text-rose-500' : 'text-blue-500']">
        {{ summary.diff >= 0 ? '▲' : '▼' }} {{ Math.abs(summary.diff).toLocaleString() }}
        ({{ summary.rate >= 0 ? '+' : '' }}{{ summary.rate.toFixed(2) }}%)
      </span>
      <span class="text-[11px] text-slate-400">{{ summary.time }} 종가</span>
    </div>

    <div class="relative h-64 rounded-xl border border-slate-200 overflow-hidden">
      <div ref="container" class="absolute inset-0"></div>
      <div
        v-if="isLoading || errorMessage"
        class="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-semibold"
        :class="errorMessage ? 'text-rose-500' : 'text-slate-500'"
      >
        {{ errorMessage || '주가 데이터를 불러오는 중...' }}
      </div>
    </div>
    <p v-if="articleDate" class="text-[11px] text-slate-400">▼ 표시는 기사가 발행된 날입니다.</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { createChart, CandlestickSeries, HistogramSeries, createSeriesMarkers } from 'lightweight-charts';
import { getStockChart } from '@/api/news';

const props = defineProps({
  // [{ code, name, rank }] — 대표 종목(rank 0)이 먼저 오도록 정렬된 목록
  stocks: { type: Array, required: true },
  // 기사 발행 시각 (ISO 문자열) — 차트에 마커로 표시
  articleDate: { type: String, default: null },
});

const periods = [
  { value: '1mo', label: '1개월' },
  { value: '3mo', label: '3개월' },
  { value: '6mo', label: '6개월' },
  { value: '1y', label: '1년' },
];

const container = ref(null);
const selectedCode = ref(props.stocks[0]?.code ?? null);
const period = ref('3mo');
const candles = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

let chart = null;
let candleSeries = null;
let volumeSeries = null;
let markers = null;
let requestSeq = 0; // 빠르게 탭을 바꿀 때 늦게 도착한 이전 응답 무시

const summary = computed(() => {
  const n = candles.value.length;
  if (n === 0) return null;
  const last = candles.value[n - 1];
  const prev = n > 1 ? candles.value[n - 2].close : last.open;
  const diff = last.close - prev;
  return { close: last.close, diff, rate: prev ? (diff / prev) * 100 : 0, time: last.time };
});

// 기사 발행일 → 차트에 있는 첫 거래일 (주말/휴일 기사는 다음 거래일에 표시)
const articleCandleTime = (data) => {
  if (!props.articleDate) return null;
  const d = new Date(props.articleDate);
  if (isNaN(d.getTime())) return null;
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return data.find(c => c.time >= day)?.time ?? null;
};

const render = (data) => {
  candleSeries.setData(data.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
  volumeSeries.setData(data.map(c => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? 'rgba(244,63,94,0.35)' : 'rgba(59,130,246,0.35)',
  })));

  const markTime = articleCandleTime(data);
  markers.setMarkers(markTime
    ? [{ time: markTime, position: 'aboveBar', color: '#4f46e5', shape: 'arrowDown', text: '기사' }]
    : []);
  chart.timeScale().fitContent();
};

const load = async () => {
  if (!selectedCode.value || !chart) return;
  const seq = ++requestSeq;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const data = await getStockChart(selectedCode.value, { period: period.value });
    if (seq !== requestSeq) return;
    candles.value = data.candles;
    render(data.candles);
  } catch (err) {
    if (seq !== requestSeq) return;
    candles.value = [];
    render([]);
    errorMessage.value = err.response?.status === 404
      ? '이 종목의 주가 데이터를 찾을 수 없습니다.'
      : '주가 데이터를 불러오지 못했습니다.';
  } finally {
    if (seq === requestSeq) isLoading.value = false;
  }
};

onMounted(() => {
  chart = createChart(container.value, {
    autoSize: true,
    // 차트 위 TradingView 로고는 끄고, 라이선스상 필요한 출처 표기는 푸터(App.vue)에 링크로 넣음
    layout: { background: { color: '#ffffff' }, textColor: '#64748b', fontSize: 11, attributionLogo: false },
    grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
    rightPriceScale: { borderColor: '#e2e8f0' },
    timeScale: { borderColor: '#e2e8f0' },
    localization: { priceFormatter: (p) => Math.round(p).toLocaleString() },
  });
  // 국내 관례: 상승 빨강 / 하락 파랑
  candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#f43f5e', downColor: '#3b82f6',
    borderUpColor: '#f43f5e', borderDownColor: '#3b82f6',
    wickUpColor: '#f43f5e', wickDownColor: '#3b82f6',
  });
  volumeSeries = chart.addSeries(HistogramSeries, { priceScaleId: 'volume', priceFormat: { type: 'volume' } });
  chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
  markers = createSeriesMarkers(candleSeries, []);
  load();
});

onBeforeUnmount(() => {
  chart?.remove();
  chart = null;
});

watch([selectedCode, period], load);
watch(() => props.stocks, (list) => { selectedCode.value = list[0]?.code ?? null; });
</script>
