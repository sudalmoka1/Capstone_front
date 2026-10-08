<template>
  <div
    @click="$emit('select', article)"
    class="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
  >
    <div>
      <!-- 상단 뱃지 영역 -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          {{ article.publisher }}
        </span>

        <!-- AI 점수 뱃지 -->
        <span
          :class="[
            'text-xs font-bold px-3 py-1 rounded-full border',
            scoreBadgeStyle
          ]"
        >
          AI 점수 {{ article.score }}점
        </span>
      </div>

      <!-- 기사 제목 -->
      <h2 class="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {{ article.title }}
      </h2>

      <!-- AI 분석 요약 (기사 본문은 약관/저작권 문제로 표시하지 않음) -->
      <p v-if="article.analyzed" class="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
        {{ article.summary }}
      </p>
      <p v-else class="text-xs text-slate-400 italic mb-3">AI 분석 대기 중</p>

      <!-- 언급된 종목 (대표 종목 강조) -->
      <div v-if="article.stocks && article.stocks.length" class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="s in article.stocks.slice(0, 3)"
          :key="s.code"
          :class="[
            'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
            s.rank === 0
              ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          ]"
        >
          {{ s.name }}
        </span>
      </div>
    </div>

    <!-- 하단 메타 정보 -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
      <span>{{ article.published_at }}</span>
      <span class="group-hover:text-indigo-500 transition-colors">AI 리포트 보기 →</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
});

defineEmits(['select']);

// 신뢰도 점수에 따른 뱃지 스타일 산출
const scoreBadgeStyle = computed(() => {
  const score = props.article.score || 0;
  if (score >= 75) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-600 border-amber-200';
  return 'bg-rose-50 text-rose-600 border-rose-200';
});
</script>