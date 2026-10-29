<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
    <!-- 상단 헤더 -->
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <img :src="logo" alt="ALL BLUE" class="h-10 sm:h-12 w-auto shrink-0 select-none" draggable="false" />
          <div class="min-w-0">
            <h1 class="font-bold text-slate-900 text-base sm:text-lg leading-tight truncate">증권 뉴스 해체 분석기</h1>
            <p class="text-xs text-slate-500 truncate">Stock News Deconstruction Analyzer</p>
          </div>
        </div>

        <!-- 실시간 상태 (scheduler.py의 생존 신호 기준, 1분마다 갱신) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
          <span v-if="statusDetail" class="hidden md:inline text-xs text-slate-400 whitespace-nowrap">
            {{ statusDetail }}
          </span>
          <!-- 사이트 안내 다시 보기 -->
          <button
            type="button"
            @click="guideOpen = true"
            title="사이트 안내 보기"
            aria-label="사이트 안내 보기"
            class="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-500 text-sm font-bold hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition"
          >
            ?
          </button>
          <span
            :title="statusDetail"
            :class="[
              'inline-flex items-center whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full border',
              schedulerBadge.style
            ]"
          >
            <span :class="['w-1.5 h-1.5 rounded-full mr-1.5', schedulerBadge.dot]"></span>
            <span v-if="schedulerBadge.prefix" class="hidden sm:inline mr-1">{{ schedulerBadge.prefix }}</span>{{ schedulerBadge.label }}
          </span>
        </div>
      </div>
    </header>

    <!-- 메뉴바 -->
    <nav class="sticky top-16 z-20 bg-white border-b border-slate-300 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          :class="[
            'px-5 py-3 text-sm font-bold border-b-2 -mb-px transition-colors',
            currentTab === tab.key
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </nav>

    <!-- 테스트용 시간 고정 안내 (개발 서버 + VITE_TEST_NOW 설정 시에만) -->
    <div v-if="testNow" class="bg-amber-100 border-b border-amber-300 text-amber-800 text-xs font-semibold text-center px-4 py-1.5">
      🧪 테스트 모드: 현재 시각을 {{ testNow.toLocaleString('ko-KR') }}(으)로 고정 중 (.env.development.local)
    </div>

    <!-- 메인 콘텐츠 영역 -->
    <main class="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <KeepAlive>
        <DashboardView
          v-if="currentTab === 'news'"
          :stock-filter="stockFilter"
          @clear-stock="stockFilter = null"
        />
        <AnalysisView v-else @select-stock="goToNews" />
      </KeepAlive>
    </main>

    <!-- 푸터: 프로젝트 안내 및 면책 고지 -->
    <footer class="border-t border-slate-300 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3 text-xs text-slate-500 leading-relaxed break-keep">
        <p class="font-bold text-slate-700">
          서일대학교 졸업작품 · 증권 뉴스 해체 분석기
        </p>
        <ul class="space-y-1">
          <li>본 사이트는 학업 및 연구를 위한 <span class="font-semibold text-slate-600">비영리 목적</span>으로 제작되었으며, 어떠한 상업적 이익도 추구하지 않습니다.</li>
          <li>제공되는 AI 분석 결과, 신뢰도 점수, 주가 정보는 참고용이며 <span class="font-semibold text-slate-600">특정 종목의 매수·매도를 권유하지 않습니다.</span> 분석 결과는 부정확하거나 지연될 수 있습니다.</li>
          <li>모든 투자 판단과 그에 따른 손익의 <span class="font-semibold text-slate-600">책임은 투자자 본인</span>에게 있으며, 제작자는 이 사이트의 정보를 이용해 발생한 손실에 대해 책임지지 않습니다.</li>
          <li>뉴스 기사의 저작권은 각 언론사에 있습니다. 원문은 각 기사의 "원문 보기" 링크에서 확인하세요.</li>
          <li>
            주가 데이터: Yahoo Finance · 차트:
            <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" class="underline hover:text-indigo-600">TradingView</a>
            Lightweight Charts™
          </li>
        </ul>
        <p class="text-slate-400">© {{ new Date().getFullYear() }} 서일대학교 캡스톤 프로젝트</p>
      </div>
    </footer>

    <!-- 첫 방문 안내 -->
    <GuideModal :open="guideOpen" @close="closeGuide" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DashboardView from './views/DashboardView.vue';
import AnalysisView from './views/AnalysisView.vue';
import GuideModal from './components/GuideModal.vue';
import { getSchedulerStatus } from './api/news';
import { now, testNow } from './utils/clock';
import logo from './assets/logo.png';

// ── 스케줄러 상태 ──
const schedulerStatus = ref(null); // { running, mode, last_crawl_at, last_analyze_at, pending }
const statusError = ref(false);
let statusTimer = null;

const fetchSchedulerStatus = async () => {
  try {
    schedulerStatus.value = await getSchedulerStatus();
    statusError.value = false;
  } catch (err) {
    statusError.value = true;
  }
};

const schedulerBadge = computed(() => {
  if (statusError.value) {
    return { label: '서버 연결 안 됨', prefix: '', style: 'text-rose-600 bg-rose-50 border-rose-200', dot: 'bg-rose-500' };
  }
  const s = schedulerStatus.value;
  if (!s) {
    return { label: '확인 중', prefix: '스케줄러', style: 'text-slate-500 bg-slate-50 border-slate-200', dot: 'bg-slate-300' };
  }
  if (!s.running) {
    return { label: '중지됨', prefix: '스케줄러', style: 'text-slate-500 bg-slate-100 border-slate-200', dot: 'bg-slate-400' };
  }
  return {
    label: s.mode === 'analyze-only' ? '분석 중' : '가동 중',
    prefix: '스케줄러',
    style: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500 animate-pulse',
  };
});

const timeAgo = (iso) => {
  if (!iso) return null;
  const min = Math.floor((now() - new Date(iso).getTime()) / 60000);
  if (isNaN(min)) return null;
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  return `${Math.floor(min / (60 * 24))}일 전`;
};

const statusDetail = computed(() => {
  const s = schedulerStatus.value;
  if (!s || statusError.value) return '';
  const parts = [];
  const crawled = timeAgo(s.last_crawl_at);
  if (crawled) parts.push(`수집 ${crawled}`);
  parts.push(s.pending > 0 ? `분석 대기 ${s.pending}건` : '분석 대기 없음');
  return parts.join(' · ');
});

// ── 첫 방문 안내 ──
// 한 번 닫으면 이 브라우저에서는 다시 띄우지 않음 (헤더의 ? 버튼으로는 언제든 열 수 있음)
const GUIDE_KEY = 'guideSeen';
const guideOpen = ref(false);

const closeGuide = () => {
  guideOpen.value = false;
  try {
    localStorage.setItem(GUIDE_KEY, '1');
  } catch {
    // 시크릿 모드 등 저장 불가 시에는 다음 방문 때 다시 보일 뿐 동작에는 문제 없음
  }
};

onMounted(() => {
  try {
    guideOpen.value = !localStorage.getItem(GUIDE_KEY);
  } catch {
    guideOpen.value = true;
  }
  fetchSchedulerStatus();
  statusTimer = setInterval(fetchSchedulerStatus, 60 * 1000);
});
onBeforeUnmount(() => clearInterval(statusTimer));

const tabs = [
  { key: 'news', label: '증권 뉴스' },
  { key: 'analysis', label: '분석' },
];

// 새로고침해도 보던 탭이 유지되도록 URL 해시(#news / #analysis)와 동기화
const initialTab = tabs.some((t) => t.key === window.location.hash.slice(1))
  ? window.location.hash.slice(1)
  : 'news';
const currentTab = ref(initialTab);
watch(currentTab, (tab) => {
  window.location.hash = tab;
});

// 분석 탭에서 종목을 고르면 뉴스 탭으로 이동해 그 종목 기사만 보여줌
const stockFilter = ref(null); // { code, name }
const goToNews = (stock) => {
  stockFilter.value = stock;
  currentTab.value = 'news';
};
</script>
