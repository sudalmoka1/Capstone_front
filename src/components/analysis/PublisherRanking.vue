<template>
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
    <div>
      <h2 class="font-bold text-slate-900">언론사별 기사 신뢰도</h2>
      <p class="text-xs text-slate-500 mt-1 break-keep">
        최근 {{ DAYS }}일 동안 AI가 분석한 주식 기사를 언론사별로 모았습니다. 순위는 참고용이며 <b>개별 기사 점수에는 반영하지 않습니다.</b>
      </p>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-xs font-semibold text-slate-500">언론사별 판정을 집계하는 중...</div>
    <div v-else-if="errorMessage" class="text-center py-10 text-xs font-semibold text-rose-500">{{ errorMessage }}</div>
    <div v-else-if="!data || data.ranked.length === 0" class="text-center py-10 text-xs text-slate-500 break-keep">
      기사가 {{ data?.min_articles ?? 30 }}건 이상 분석된 언론사가 아직 없습니다.
    </div>

    <template v-else>
      <!-- 항목 범례 -->
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <span v-for="m in metrics" :key="m.key" class="whitespace-nowrap">
          <span class="font-semibold text-slate-600">{{ m.label }}</span> {{ m.desc }}
        </span>
      </div>

      <ol class="divide-y divide-slate-100 border-y border-slate-100">
        <li v-for="p in data.ranked" :key="p.name" class="py-3 flex items-start gap-3">
          <span
            class="mt-0.5 inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full text-xs font-bold"
            :class="rankStyle(p.rank)"
          >
            {{ p.rank }}
          </span>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p class="font-semibold text-slate-900 truncate">
                {{ p.name }}
                <span class="ml-1 text-xs font-normal text-slate-400">{{ p.analyzed }}건</span>
              </p>
              <span class="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border" :class="scoreBadge(p.avg_score)">
                {{ p.avg_score }}점
              </span>
            </div>

            <!-- 항목별 비율 -->
            <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
              <div v-for="m in metrics" :key="m.key" class="min-w-0">
                <div class="flex justify-between text-[11px] leading-tight">
                  <span class="text-slate-500">{{ m.label }}</span>
                  <span class="font-semibold" :class="m.bad ? 'text-rose-500' : 'text-slate-700'">{{ p[m.key] }}%</span>
                </div>
                <div class="mt-0.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" :class="m.bad ? 'bg-rose-400' : 'bg-indigo-400'" :style="{ width: `${p[m.key]}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ol>

      <p v-if="data.insufficient.length" class="text-[11px] text-slate-400 leading-relaxed break-keep">
        <span class="font-semibold text-slate-500">기사 수 부족 ({{ data.min_articles }}건 미만, 순위 제외):</span>
        {{ data.insufficient.map((p) => `${p.name} ${p.analyzed}건`).join(' · ') }}
      </p>

      <div class="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed break-keep space-y-1">
        <p class="font-bold">해석 시 주의</p>
        <p>언론사의 품질이 아니라 <b>수집된 기사들에 대한 AI 판정</b>을 모은 결과입니다. AI 판정은 사람과 완전히 일치하지 않습니다(아래 'AI 판정, 얼마나 믿을 수 있나' 참고).</p>
        <p>속보·시황 기사가 많은 언론사는 기사 성격상 리스크 설명이나 근거가 짧아 점수가 낮게 나올 수 있습니다.</p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPublisherRanking } from '@/api/news';

// 주가 반응 카드와 같은 기간 (위 '집계 기간' 버튼과 별개)
const DAYS = 90;

// bad: 높을수록 나쁜 항목 (빨간색)
const metrics = [
  { key: 'exaggeration_pct', label: '과장', desc: '과장 표현 감지', bad: true },
  { key: 'basis_pct', label: '근거', desc: '구체적 근거 제시', bad: false },
  { key: 'data_pct', label: '데이터', desc: '시장 데이터 부합', bad: false },
  { key: 'risk_pct', label: '리스크', desc: '리스크 언급', bad: false },
];

const data = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

const fetchRanking = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    data.value = await getPublisherRanking({ days: DAYS });
  } catch (err) {
    data.value = null;
    errorMessage.value = '언론사별 데이터를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const rankStyle = (rank) => {
  if (rank === 1) return 'bg-amber-100 text-amber-700';
  if (rank === 2) return 'bg-slate-200 text-slate-600';
  if (rank === 3) return 'bg-orange-100 text-orange-700';
  return 'bg-slate-50 text-slate-400';
};

const scoreBadge = (score) => {
  if (score >= 75) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-600 border-amber-200';
  return 'bg-rose-50 text-rose-600 border-rose-200';
};

onMounted(fetchRanking);
</script>
