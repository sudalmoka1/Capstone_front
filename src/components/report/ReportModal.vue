<template>
  <div
    v-if="article"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
      <!-- 모달 헤더 -->
      <div class="flex justify-between items-start gap-4">
        <div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mr-2">
            {{ article.source }}
          </span>
          <span class="text-xs text-slate-400">{{ article.publisher }}</span>
          <h3 class="font-bold text-slate-900 text-lg mt-1 leading-snug">{{ article.title }}</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 rounded-lg hover:bg-slate-100 leading-none transition"
        >
          ×
        </button>
      </div>

      <!-- AI 신뢰도 요약 박스 -->
      <div class="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-indigo-700">AI 종합 신뢰도 리포트</span>
          <span class="text-sm font-extrabold text-indigo-900">{{ article.score }}점 / 100점</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed">
          {{ article.summary }}
        </p>
      </div>

      <!-- 4대 세부 평가 항목 체크리스트 -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">세부 평가 항목</h4>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <!-- 과장 여부 -->
          <div class="p-3 rounded-xl border flex items-center justify-between" :class="article.report_data?.exaggeration ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-700'">
            <span>과장/낙관 표현</span>
            <span class="font-bold">{{ article.report_data?.exaggeration ? '감지됨 ⚠️' : '없음 🟢' }}</span>
          </div>
          <!-- 투자 근거 -->
          <div class="p-3 rounded-xl border flex items-center justify-between" :class="article.report_data?.investment_basis ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'">
            <span>구체적 근거 제시</span>
            <span class="font-bold">{{ article.report_data?.investment_basis ? '충분 🟢' : '부족 ⚠️' }}</span>
          </div>
          <!-- 데이터 부합 -->
          <div class="p-3 rounded-xl border flex items-center justify-between" :class="article.report_data?.data_based ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'">
            <span>시장 데이터 부합</span>
            <span class="font-bold">{{ article.report_data?.data_based ? '일치 🟢' : '불일치 ⚠️' }}</span>
          </div>
          <!-- 리스크 설명 -->
          <div class="p-3 rounded-xl border flex items-center justify-between" :class="article.report_data?.risk_explanation ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700'">
            <span>손실 리스크 언급</span>
            <span class="font-bold">{{ article.report_data?.risk_explanation ? '포함 🟢' : '미흡 ⚠️' }}</span>
          </div>
        </div>
      </div>

      <!-- 닫기 버튼 -->
      <button
        @click="$emit('close')"
        class="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
      >
        확인 완료
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  article: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);
</script>