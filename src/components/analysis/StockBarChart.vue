<template>
  <div class="space-y-4">
    <!-- 범례 -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      <span class="font-semibold text-slate-600">막대 길이 = 언급 기사 수 · 색 = 평균 신뢰도</span>
      <span class="inline-flex items-center"><i class="w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1.5"></i>75점 이상</span>
      <span class="inline-flex items-center"><i class="w-2.5 h-2.5 rounded-sm bg-amber-400 mr-1.5"></i>50~74점</span>
      <span class="inline-flex items-center"><i class="w-2.5 h-2.5 rounded-sm bg-rose-500 mr-1.5"></i>50점 미만</span>
      <span class="inline-flex items-center"><i class="w-2.5 h-2.5 rounded-sm bg-slate-300 mr-1.5"></i>분석 전</span>
    </div>

    <ul class="space-y-2">
      <li
        v-for="row in rows"
        :key="row.stock_code"
        @click="$emit('select', row)"
        class="group flex items-center gap-3 cursor-pointer"
        :title="`${row.stock_name}: 언급 ${row.mentions}건` + (row.avg_score !== null ? `, 평균 ${row.avg_score}점` : ', 분석 전')"
      >
        <span class="w-6 text-right text-xs font-bold text-slate-400">{{ row.rank }}</span>
        <span class="w-28 sm:w-36 truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
          {{ row.stock_name }}
        </span>

        <div class="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
          <div
            class="h-full rounded-md transition-all duration-500"
            :class="barColor(row.avg_score)"
            :style="{ width: barWidth(row.mentions) }"
          ></div>
        </div>

        <span class="w-10 text-right text-sm font-bold text-slate-700">{{ row.mentions }}</span>
        <span
          class="w-14 text-center text-xs font-bold px-2 py-1 rounded-full border"
          :class="scoreBadge(row.avg_score)"
        >
          {{ row.avg_score !== null ? Math.round(row.avg_score) + '점' : '-' }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rows: { type: Array, required: true },
});

defineEmits(['select']);

const maxMentions = computed(() => Math.max(1, ...props.rows.map((r) => r.mentions)));

const barWidth = (mentions) => `${Math.max(2, (mentions / maxMentions.value) * 100)}%`;

const barColor = (score) => {
  if (score === null || score === undefined) return 'bg-slate-300';
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-rose-500';
};

const scoreBadge = (score) => {
  if (score === null || score === undefined) return 'bg-slate-50 text-slate-400 border-slate-200';
  if (score >= 75) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-600 border-amber-200';
  return 'bg-rose-50 text-rose-600 border-rose-200';
};
</script>
