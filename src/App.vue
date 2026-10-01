<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans">
    <!-- 상단 네비게이션 바 -->
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

        <!-- 실시간 상태 및 새로고침 버튼 -->
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            스케줄러 가동 중
          </span>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 영역 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardView />
    </main>
  </div>
</template>

<script setup>
import DashboardView from './views/DashboardView.vue';
</script>