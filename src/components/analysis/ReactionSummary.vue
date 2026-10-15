<template>
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div>
        <h2 class="font-bold text-slate-900">AI 점수 vs 실제 주가 반응</h2>
        <p class="text-xs text-slate-500 mt-1 break-keep">
          기사가 나온 뒤 대표 종목 주가가 <b>시장(코스피·코스닥 지수)보다</b> 얼마나 더 오르거나 내렸는지 비교합니다.
        </p>
      </div>
      <!-- 기간 선택 -->
      <div class="flex bg-slate-100 p-1 rounded-xl self-start shrink-0">
        <button
          v-for="opt in horizons"
          :key="opt.value"
          @click="horizon = opt.value"
          :class="[
            'px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap',
            horizon === opt.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-xs font-semibold text-slate-500">주가 반응을 집계하는 중...</div>
    <div v-else-if="errorMessage" class="text-center py-10 text-xs font-semibold text-rose-500">{{ errorMessage }}</div>
    <div v-else-if="!summary || summary.total === 0" class="text-center py-10 text-xs text-slate-500 break-keep">
      아직 계산된 주가 반응이 없습니다. 스케줄러가 분석 완료 기사의 주가를 계산하면 표시됩니다.
    </div>

    <template v-else>
      <!-- 그룹별 비교 -->
      <div v-for="block in blocks" :key="block.title" class="space-y-2">
        <h3 class="text-xs font-bold text-slate-500">{{ block.title }}</h3>
        <ul class="space-y-2">
          <li v-for="g in block.groups" :key="g.key" class="flex items-center gap-2 sm:gap-3">
            <span class="w-24 sm:w-28 shrink-0 text-sm font-semibold text-slate-800 break-keep leading-tight">
              {{ g.label }}
              <!-- 모바일: 오른쪽 상세 칸이 숨겨지므로 표본 수를 라벨 아래에 -->
              <span class="block sm:hidden text-[11px] font-normal" :class="isSmall(g) ? 'text-amber-600' : 'text-slate-400'">
                {{ countOf(g) }}건<template v-if="isSmall(g) && countOf(g) > 0"> · 표본 적음</template>
              </span>
            </span>

            <!-- 0을 가운데 둔 막대: 오른쪽(빨강) = 시장보다 상승, 왼쪽(파랑) = 시장보다 하락 -->
            <div class="flex-1 min-w-0 h-7 bg-slate-100 rounded-md relative overflow-hidden">
              <div class="absolute inset-y-0 left-1/2 w-px bg-slate-300"></div>
              <div
                v-if="excessOf(g) !== null"
                class="absolute inset-y-1 rounded-sm transition-all duration-500"
                :class="[excessOf(g) >= 0 ? 'bg-rose-500' : 'bg-blue-500', isSmall(g) && 'opacity-35']"
                :style="barStyle(excessOf(g))"
              ></div>
              <span v-else class="absolute inset-0 flex items-center justify-center"><span class="relative bg-slate-100 px-1.5 text-[11px] text-slate-400">표본 없음</span></span>
            </div>

            <span
              class="w-16 sm:w-20 shrink-0 text-right text-sm font-bold"
              :class="colorOf(excessOf(g))"
            >
              {{ fmtPoint(excessOf(g)) }}
            </span>
            <span class="hidden sm:block w-44 shrink-0 text-right text-[11px] text-slate-400 leading-tight whitespace-nowrap">
              <template v-if="countOf(g) > 0">
                <span :class="isSmall(g) && 'text-amber-600 font-semibold'">{{ countOf(g) }}건{{ isSmall(g) ? ' (표본 적음)' : '' }}</span><span v-if="horizon === '5d' && g.up_ratio_5d !== null"> · 시장 상회 {{ g.up_ratio_5d }}%</span><br />
                주가 자체 {{ fmtPct(retOf(g)) }}
              </template>
            </span>
          </li>
        </ul>
      </div>

      <!-- 상관계수 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p class="text-xs font-semibold text-slate-500">AI 점수 ↔ 5일 초과 수익률 상관계수</p>
          <p class="mt-1 text-xl font-extrabold text-slate-900">
            {{ summary.correlation_5d !== null ? summary.correlation_5d.toFixed(2) : '–' }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5 break-keep">{{ correlationText }}</p>
        </div>
        <div class="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed break-keep space-y-1">
          <p class="font-bold">해석 시 주의</p>
          <p>표본 {{ totalCount }}건 기준이며, 기사 {{ MIN_SAMPLE }}건 미만인 구간(흐린 막대)은 우연에 크게 좌우됩니다.</p>
          <p>주가는 뉴스 외에도 수많은 요인으로 움직이므로, 이 결과는 상관관계일 뿐 인과관계가 아닙니다.</p>
        </div>
      </div>

      <p class="text-[11px] text-slate-400 leading-relaxed break-keep">
        계산 방법: 기사 발행 직전 종가(15:30 이후 발행이면 당일 종가)를 기준으로 1·5거래일 뒤 종가 수익률을 구하고,
        같은 기간 시장지수 수익률을 뺀 값(초과 수익률, %p)을 평균했습니다. 기사에 여러 종목이 있으면 대표 종목 기준입니다.
      </p>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getReactionSummary } from '@/api/news';

const horizons = [
  { value: '1d', label: '1일 후' },
  { value: '5d', label: '5일 후' },
];

const horizon = ref('5d');
const summary = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

const fetchSummary = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    summary.value = await getReactionSummary({ days: 90 });
  } catch (err) {
    summary.value = null;
    errorMessage.value = '주가 반응 데이터를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const blocks = computed(() => (summary.value ? [
  { title: 'AI 신뢰도 점수별', groups: summary.value.by_score },
  { title: '과장 표현 판정별', groups: summary.value.by_exaggeration },
] : []));

const excessOf = (g) => (horizon.value === '5d' ? g.avg_excess_5d : g.avg_excess_1d);
const retOf = (g) => (horizon.value === '5d' ? g.avg_ret_5d : g.avg_ret_1d);
const countOf = (g) => (horizon.value === '5d' ? g.n_5d : g.n_1d);

// 기사 수가 이보다 적은 그룹은 평균이 우연에 크게 흔들리므로 흐리게 표시
const MIN_SAMPLE = 10;
const isSmall = (g) => countOf(g) < MIN_SAMPLE;

const totalCount = computed(() => (summary.value
  ? summary.value.by_score.reduce((acc, g) => acc + countOf(g), 0)
  : 0));

// 막대 길이는 현재 보이는 값 중 절댓값 최대를 기준으로 (최소 스케일 1%p)
const maxAbs = computed(() => {
  const vals = blocks.value.flatMap((b) => b.groups.map(excessOf)).filter((v) => v !== null);
  return Math.max(1, ...vals.map(Math.abs));
});

const barStyle = (v) => {
  const width = `${Math.max(1, (Math.abs(v) / maxAbs.value) * 50)}%`;
  return v >= 0 ? { left: '50%', width } : { right: '50%', width };
};

// 국내 관례: 상승 빨강 / 하락 파랑
const colorOf = (v) => (v === null ? 'text-slate-300' : v >= 0 ? 'text-rose-500' : 'text-blue-500');
const fmtPoint = (v) => (v === null ? '–' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%p`);
const fmtPct = (v) => (v === null ? '–' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`);

const correlationText = computed(() => {
  const r = summary.value?.correlation_5d;
  if (r === null || r === undefined) return '5일 수익률이 확정된 기사가 10건 이상 모이면 계산됩니다.';
  const a = Math.abs(r);
  if (a < 0.1) return 'AI 점수와 이후 주가 흐름은 거의 관계가 없습니다.';
  const strength = a < 0.3 ? '약한' : a < 0.5 ? '중간 정도의' : '강한';
  const direction = r > 0 ? '더 오르는' : '덜 오르는';
  return `점수가 높을수록 주가가 시장보다 ${direction} ${strength} 경향이 있습니다.`;
});

onMounted(fetchSummary);
</script>
