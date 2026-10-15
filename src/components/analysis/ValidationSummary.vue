<template>
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
    <div>
      <h2 class="font-bold text-slate-900">AI 판정, 얼마나 믿을 수 있나</h2>
      <p class="text-xs text-slate-500 mt-1 break-keep">
        사람 {{ study.raters }}명이 기사 {{ study.articles }}건을 직접 판정한 결과와 AI 판정을 비교했습니다.
        <b>AI 막대가 '사람끼리' 막대에 가까울수록</b> AI가 사람 한 명만큼 판단한다는 뜻입니다.
      </p>
    </div>

    <!-- 종합 점수 -->
    <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p class="text-xs font-semibold text-indigo-700">종합 신뢰도 점수 일치도 (상관계수)</p>
        <p class="text-sm text-indigo-900 mt-0.5 break-keep">
          AI 점수는 <b>사람끼리 점수가 맞는 정도와 비슷하게</b> 사람 점수와 맞습니다.
        </p>
      </div>
      <div class="flex gap-4 shrink-0">
        <div class="text-right">
          <p class="text-[11px] text-slate-500">사람끼리</p>
          <p class="text-xl font-extrabold text-slate-700">{{ study.score.human.toFixed(2) }}</p>
        </div>
        <div class="text-right">
          <p class="text-[11px] text-indigo-600">AI</p>
          <p class="text-xl font-extrabold text-indigo-700">{{ study.score.ai.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- 항목별 일치도 -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-500">항목별 일치도 (Cohen's κ, 1에 가까울수록 일치)</h3>
        <div class="flex items-center gap-3 text-[11px] text-slate-500">
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-slate-300"></span>사람끼리</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>AI</span>
        </div>
      </div>

      <ul class="space-y-3">
        <li v-for="item in study.items" :key="item.key" class="flex items-center gap-3">
          <div class="w-24 sm:w-28 shrink-0">
            <p class="text-sm font-semibold text-slate-800">{{ item.label }}</p>
            <span :class="['inline-block mt-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded border', verdicts[item.verdict].style]">
              {{ verdicts[item.verdict].label }}
            </span>
          </div>
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-slate-300 rounded-full" :style="{ width: barWidth(item.human) }"></div>
              </div>
              <span class="w-9 text-right text-xs font-semibold text-slate-500">{{ item.human.toFixed(2) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full" :style="{ width: barWidth(item.ai) }"></div>
              </div>
              <span class="w-9 text-right text-xs font-bold text-indigo-700">{{ item.ai.toFixed(2) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 해석과 한계 -->
    <ul class="text-xs text-slate-500 space-y-1.5 leading-relaxed break-keep border-t border-slate-100 pt-4">
      <li>
        <b class="text-slate-700">과장 표현</b>은 AI(7B 로컬 모델)가 대부분 놓쳐서(κ {{ study.exaggeration.before.toFixed(2) }})
        자극적 표현 사전으로 제목을 한 번 더 검사합니다. 사전을 만들 때 참고하지 않은
        <b>새 기사 {{ study.holdout.articles }}건</b>에서도 {{ study.holdout.before.toFixed(2) }} → {{ study.holdout.after.toFixed(2) }}로
        개선됐습니다 (사람끼리 {{ study.holdout.human.toFixed(2) }}).
      </li>
      <li>
        <b class="text-slate-700">데이터 부합</b>은 사람끼리도 판단이 크게 엇갈립니다(κ {{ itemOf('data_based').human.toFixed(2) }}).
        AI보다 항목 기준 자체를 더 명확히 해야 하는 부분입니다.
      </li>
      <li class="text-slate-400">
        검증: {{ study.date }} · 라벨러 {{ study.raters }}명 · 표본이 작아 수치는 ±0.1 정도 흔들릴 수 있습니다.
      </li>
    </ul>
  </section>
</template>

<script setup>
// 검증 결과 (Capstone_back/evaluation 으로 계산한 값, 판정 기준을 바꾸면 다시 계산해서 갱신)
// - 사람 4명 × 기사 100건 (result_4인_규칙적용.md), 과장 사전 검증은 새 기사 50건 (result_new50_rule_title.md)
const study = {
  date: '2026-10-15',
  raters: 4,
  articles: 100,
  score: { human: 0.39, ai: 0.43 },
  items: [
    { key: 'exaggeration', label: '과장 표현', human: 0.55, ai: 0.58, verdict: 'human' },
    { key: 'investment_basis', label: '투자 근거', human: 0.33, ai: 0.38, verdict: 'human' },
    { key: 'data_based', label: '데이터 부합', human: 0.21, ai: 0.19, verdict: 'unclear' },
    { key: 'risk_explanation', label: '리스크 설명', human: 0.62, ai: 0.51, verdict: 'lower' },
  ],
  exaggeration: { before: 0.29 },
  holdout: { articles: 50, human: 0.2, before: 0.0, after: 0.25 },
};

const verdicts = {
  human: { label: '사람 수준', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  lower: { label: '사람보다 낮음', style: 'bg-amber-50 text-amber-600 border-amber-200' },
  unclear: { label: '기준 모호', style: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const barWidth = (k) => `${Math.max(2, Math.min(1, k) * 100)}%`;
const itemOf = (key) => study.items.find((i) => i.key === key);
</script>
