<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans">
    <!-- 상단 헤더 -->
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            캡스톤 프로젝트
          </div>
          <div>
            <h1 class="font-bold text-slate-900 text-lg leading-tight">증권 뉴스 신뢰도 분석기</h1>
            <p class="text-xs text-slate-500">FastAPI & LLM powered Analyzer</p>
          </div>
        </div>

        <!-- 실시간 상태 -->
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            스케줄러 가동 중
          </span>
        </div>
      </div>
    </header>

    <!-- 메뉴바 -->
    <nav class="sticky top-16 z-20 bg-white border-b border-slate-200">
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

    <!-- 메인 콘텐츠 영역 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <KeepAlive>
        <DashboardView
          v-if="currentTab === 'news'"
          :stock-filter="stockFilter"
          @clear-stock="stockFilter = null"
        />
        <AnalysisView v-else @select-stock="goToNews" />
      </KeepAlive>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DashboardView from './views/DashboardView.vue';
import AnalysisView from './views/AnalysisView.vue';

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
