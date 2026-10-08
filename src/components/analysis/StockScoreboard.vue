<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm min-w-[560px]">
      <thead>
        <tr class="text-xs text-slate-500 border-b border-slate-200">
          <th class="py-2 pr-3 text-left font-semibold w-12">순위</th>
          <th class="py-2 px-3 text-left font-semibold">종목</th>
          <th class="py-2 px-3 text-right font-semibold">언급 기사</th>
          <th class="py-2 px-3 text-right font-semibold" title="기사에서 가장 비중 있게 다뤄진 종목으로 잡힌 횟수">대표 종목</th>
          <th class="py-2 px-3 text-right font-semibold">분석 완료</th>
          <th class="py-2 pl-3 text-right font-semibold">평균 신뢰도</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.stock_code"
          @click="$emit('select', row)"
          class="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer transition-colors"
        >
          <td class="py-3 pr-3">
            <span
              class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              :class="rankStyle(row.rank)"
            >
              {{ row.rank }}
            </span>
          </td>
          <td class="py-3 px-3">
            <div class="font-semibold text-slate-900">{{ row.stock_name }}</div>
            <div class="text-xs text-slate-400">
              {{ row.stock_code }}
              <span v-if="row.market" class="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{{ row.market }}</span>
            </div>
          </td>
          <td class="py-3 px-3 text-right font-bold text-slate-800">{{ row.mentions }}</td>
          <td class="py-3 px-3 text-right text-slate-600">{{ row.headline_mentions }}</td>
          <td class="py-3 px-3 text-right text-slate-600">{{ row.analyzed }}</td>
          <td class="py-3 pl-3 text-right">
            <span
              class="inline-block text-xs font-bold px-2.5 py-1 rounded-full border"
              :class="scoreBadge(row.avg_score)"
            >
              {{ row.avg_score !== null ? row.avg_score + '점' : '분석 전' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
});

defineEmits(['select']);

const rankStyle = (rank) => {
  if (rank === 1) return 'bg-amber-100 text-amber-700';
  if (rank === 2) return 'bg-slate-200 text-slate-600';
  if (rank === 3) return 'bg-orange-100 text-orange-700';
  return 'bg-slate-50 text-slate-400';
};

const scoreBadge = (score) => {
  if (score === null || score === undefined) return 'bg-slate-50 text-slate-400 border-slate-200';
  if (score >= 75) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-600 border-amber-200';
  return 'bg-rose-50 text-rose-600 border-rose-200';
};
</script>
