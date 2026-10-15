<template>
  <!-- 열릴 때: 배경 페이드인 + 패널이 아래에서 위로 올라옴 / 닫힐 때: 반대로 -->
  <Transition name="modal" :duration="{ enter: 400, leave: 250 }">
  <div
    v-if="article"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="modal-panel bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
      <!-- 모달 헤더 -->
      <div class="flex justify-between items-start gap-4">
        <div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mr-2">
            {{ article.publisher }}
          </span>
          <span class="text-xs text-slate-400">{{ article.published_at }}</span>
          <a
            v-if="article.url"
            :href="article.url"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-2 text-xs font-semibold text-indigo-600 hover:underline"
          >
            원문 보기 ↗
          </a>
          <h3 class="font-bold text-slate-900 text-lg mt-1 leading-snug">{{ article.title }}</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 rounded-lg hover:bg-slate-100 leading-none transition"
        >
          ×
        </button>
      </div>

      <!-- 관련 종목 주가 차트 -->
      <div v-if="article.stocks && article.stocks.length" class="space-y-2">
        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">주가 차트</h4>
        <StockChart :key="article.id" :stocks="article.stocks" :article-date="article.published_at_raw" />

        <!-- 기사 이후 실제 주가 반응 (대표 종목, 시장 대비) -->
        <div v-if="article.reaction" class="grid grid-cols-2 gap-2">
          <div
            v-for="h in reactionItems"
            :key="h.label"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <p class="text-[11px] font-semibold text-slate-500">기사 {{ h.label }} 주가</p>
            <template v-if="h.ret !== null">
              <p class="text-base font-extrabold" :class="h.ret >= 0 ? 'text-rose-500' : 'text-blue-500'">
                {{ fmtPct(h.ret) }}
              </p>
              <p v-if="h.excess !== null" class="text-[11px]" :class="h.excess >= 0 ? 'text-rose-400' : 'text-blue-400'">
                시장 대비 {{ fmtPoint(h.excess) }}
              </p>
            </template>
            <p v-else class="text-xs text-slate-400 mt-1">아직 {{ h.label.replace(' 후', '') }}이 지나지 않았어요</p>
          </div>
        </div>
      </div>

      <!-- 아직 분석 전인 기사 -->
      <div v-if="!article.analyzed" class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
        <p class="text-sm font-bold text-slate-600">아직 AI 분석 전인 기사입니다</p>
        <p class="text-xs text-slate-400">스케줄러가 순서대로 분석하고 있어요. 잠시 후 새로고침해 보세요.</p>
      </div>

      <template v-else>
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
      </template>

      <!-- 닫기 버튼 -->
      <button
        @click="$emit('close')"
        class="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
      >
        확인 완료
      </button>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import StockChart from '@/components/analysis/StockChart.vue';

const props = defineProps({
  article: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);

const reactionItems = computed(() => {
  const r = props.article?.reaction;
  if (!r) return [];
  return [
    { label: '1거래일 후', ret: r.ret_1d, excess: r.excess_1d },
    { label: '5거래일 후', ret: r.ret_5d, excess: r.excess_5d },
  ];
});

const fmtPct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
const fmtPoint = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%p`;
</script>
<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease, backdrop-filter 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.modal-leave-active .modal-panel {
  transition: transform 0.25s ease-in, opacity 0.2s ease-in;
}
.modal-enter-from .modal-panel {
  transform: translateY(60px) scale(0.98);
  opacity: 0;
}
.modal-leave-to .modal-panel {
  transform: translateY(40px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active .modal-panel,
  .modal-leave-active .modal-panel {
    transition: opacity 0.2s ease;
  }
  .modal-enter-from .modal-panel,
  .modal-leave-to .modal-panel {
    transform: none;
  }
}
</style>
