<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm sm:min-w-[560px]">
      <thead>
        <tr class="text-xs text-slate-500 border-b border-slate-200">
          <th class="py-2 pr-2 sm:pr-3 text-left font-semibold w-10 sm:w-14" :aria-sort="ariaSort('rank')">
            <button type="button" @click="sortBy('rank')" :class="headerBtn('rank')" title="언급량 기준 순위">
              <span class="hidden sm:inline">언급 </span>순위<span v-if="sortKey === 'rank'">{{ arrow }}</span>
            </button>
          </th>
          <th class="py-2 px-2 sm:px-3 text-left font-semibold">종목</th>
          <th class="py-2 px-2 sm:px-3 text-right font-semibold whitespace-nowrap" :aria-sort="ariaSort('mentions')">
            <button type="button" @click="sortBy('mentions')" :class="headerBtn('mentions')">
              언급<span class="hidden sm:inline"> 기사</span><span v-if="sortKey === 'mentions'">{{ arrow }}</span>
            </button>
          </th>
          <th class="hidden sm:table-cell py-2 px-3 text-right font-semibold" title="기사에서 가장 비중 있게 다뤄진 종목으로 잡힌 횟수">대표 종목</th>
          <th class="hidden sm:table-cell py-2 px-3 text-right font-semibold">분석 완료</th>
          <th class="py-2 pl-2 sm:pl-3 text-right font-semibold whitespace-nowrap" :aria-sort="ariaSort('score')">
            <button type="button" @click="sortBy('score')" :class="headerBtn('score')">
              <span class="hidden sm:inline">평균 </span>신뢰도<span v-if="sortKey === 'score'">{{ arrow }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in sortedRows"
          :key="row.stock_code"
          @click="$emit('select', row)"
          class="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer transition-colors"
        >
          <td class="py-3 pr-2 sm:pr-3">
            <span
              class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              :class="rankStyle(row.rank)"
            >
              {{ row.rank }}
            </span>
          </td>
          <td class="py-3 px-2 sm:px-3">
            <div class="font-semibold text-slate-900">{{ row.stock_name }}</div>
            <div class="text-xs text-slate-400">
              {{ row.stock_code }}
              <span v-if="row.market" class="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{{ row.market }}</span>
            </div>
          </td>
          <td class="py-3 px-2 sm:px-3 text-right font-bold text-slate-800">{{ row.mentions }}</td>
          <td class="hidden sm:table-cell py-3 px-3 text-right text-slate-600">{{ row.headline_mentions }}</td>
          <td class="hidden sm:table-cell py-3 px-3 text-right text-slate-600">{{ row.analyzed }}</td>
          <td class="py-3 pl-2 sm:pl-3 text-right">
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
import { ref, computed } from 'vue';

const props = defineProps({
  rows: { type: Array, required: true },
});

defineEmits(['select']);

// 위 막대그래프가 언급량 순이므로 스코어보드는 기본을 평균 신뢰도 높은 순으로
const sortKey = ref('score'); // 'score' | 'mentions' | 'rank'
const sortDesc = ref(true);

// 열마다 처음 눌렀을 때의 방향 (순위는 1위부터, 나머지는 큰 값부터)
const DEFAULT_DESC = { score: true, mentions: true, rank: false };

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortKey.value = key;
    sortDesc.value = DEFAULT_DESC[key];
  }
};

const arrow = computed(() => (sortDesc.value ? '▼' : '▲'));

const ariaSort = (key) => {
  if (sortKey.value !== key) return 'none';
  return sortDesc.value ? 'descending' : 'ascending';
};

const headerBtn = (key) => [
  'font-semibold whitespace-nowrap hover:text-indigo-600 transition-colors',
  sortKey.value === key ? 'text-indigo-600' : '',
];

const sortedRows = computed(() => {
  const dir = sortDesc.value ? -1 : 1;
  const value = (r) => (sortKey.value === 'score' ? r.avg_score : sortKey.value === 'mentions' ? r.mentions : r.rank);
  return [...props.rows].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    // 분석 전(점수 없음) 종목은 정렬 방향과 상관없이 맨 아래
    const na = va === null || va === undefined;
    const nb = vb === null || vb === undefined;
    if (na !== nb) return na ? 1 : -1;
    if (na) return a.rank - b.rank;
    if (va !== vb) return (va - vb) * dir;
    // 값이 같으면 언급량 순위(rank)로
    return a.rank - b.rank;
  });
});

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
